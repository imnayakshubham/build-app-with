import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import { execa } from 'execa';
import { getPrompts, finalizeAnswers } from './prompts/index.js';
import { generateViteProject } from './generators/vite/vite-project-generator.js';
import { generateNextJSProject } from './generators/nextjs/nextjs-project-generator.js';
import { generateExpressApp } from './generators/express/index.js';
import { generateFastifyApp } from './generators/fastify/index.js';
import { installDependencies } from './utils/dependencies.js';
import { successMessage } from './utils/messages.js';

export async function createApp() {
  try {
    // Get user preferences through prompts
    const answers = finalizeAnswers(await inquirer.prompt(getPrompts()));

    // Compute a unique project name/path
    let baseName = answers.projectName;
    let uniqueName = baseName;
    let projectPath = path.resolve(process.cwd(), uniqueName);
    let counter = 1;
    while (fs.existsSync(projectPath)) {
      uniqueName = `${baseName}-${counter++}`;
      projectPath = path.resolve(process.cwd(), uniqueName);
    }
    if (uniqueName !== answers.projectName) {
      console.log(chalk.yellow(`⚠️  Directory ${answers.projectName} already exists. Using ${uniqueName} instead.`));
      answers.projectName = uniqueName;
    }

    const isNext = answers.framework === 'nextjs';
    const isBackend = ['express', 'fastify'].includes(answers.framework);

    // Create project directory only when we manage files ourselves
    if (!isNext) {
      console.log("Creating project directory:", projectPath);
      await fs.ensureDir(projectPath);
      console.log("Project directory created successfully");
    }

    // Generate project files based on framework choice
    if (answers.framework === 'vite-react') {
      await generateViteProject(projectPath, answers);
    } else if (answers.framework === 'nextjs') {
      await generateNextJSProject(projectPath, answers);
    } else if (answers.framework === 'express') {
      await generateExpressApp(projectPath, answers);
    } else if (answers.framework === 'fastify') {
      await generateFastifyApp(projectPath, answers);
    }

    console.log('Project structure created successfully!');

    // Ensure .gitignore exists and includes env files
    const gitignorePath = path.join(projectPath, '.gitignore');
    let gitignoreContent = '';
    if (await fs.pathExists(gitignorePath)) {
      gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
    } else {
      gitignoreContent = '# Node\nnode_modules/\n\n# Build\ndist/\nbuild/\n';
    }
    const envIgnores = ['.env', '.env.local', '.env.development.local', '.env.test.local', '.env.production.local'];
    const updatedGitignore = gitignoreContent
      .split('\n')
      .concat(envIgnores.filter((e) => !gitignoreContent.includes(e)))
      .join('\n')
      .trim() + '\n';
    await fs.writeFile(gitignorePath, updatedGitignore);

    // Ensure .env exists
    const envPath = path.join(projectPath, '.env');
    if (!(await fs.pathExists(envPath))) {
      await fs.writeFile(envPath, '');
    }

    // Install dependencies
    await installDependencies(projectPath, answers);

    // Success message with next steps
    successMessage(answers.projectName);

  } catch (error) {
    console.error(chalk.red('❌ Error creating project:'), error.message);
    process.exit(1);
  }
}