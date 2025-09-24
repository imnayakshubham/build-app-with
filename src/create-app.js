import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs-extra';
import { getPrompts, finalizeAnswers } from './prompts/index.js';
import { generateViteProject } from './generators/vite/vite-project-generator.js';
import { generateNextJSProject } from './generators/nextjs/nextjs-generator.js';
import { generateExpressApp } from './generators/express/index.js';
import { generateFastifyApp } from './generators/fastify/index.js';
import { installDependencies } from './utils/dependencies.js';
import { successMessage } from './utils/messages.js';
import { logger } from './core/logger.js';
import { generateUniqueProjectPath, safePathJoin, safeCreateDirectory } from './utils/path-security.js';

export async function createApp() {
  try {
    // Get user preferences through prompts
    const answers = finalizeAnswers(await inquirer.prompt(getPrompts()));

    // Safely compute a unique project name/path
    const { path: projectPath, name: uniqueName } = await generateUniqueProjectPath(answers.projectName);

    // Update answers with the validated project name
    answers.projectName = uniqueName;

    const isNext = answers.framework === 'nextjs';

    // Create project directory only when we manage files ourselves
    if (!isNext) {
      logger.debug(`Creating project directory: ${projectPath}`);
      await safeCreateDirectory(projectPath, process.cwd());
      logger.debug("Project directory created successfully");
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

    logger.success('Project structure created successfully!');

    // Ensure .gitignore exists and includes env files
    const gitignorePath = safePathJoin(projectPath, '.gitignore');
    let gitignoreContent = '';
    if (await fs.pathExists(gitignorePath)) {
      gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
    } else {
      gitignoreContent = '# Node\nnode_modules/\n\n# Build\ndist/\nbuild/\n';
    }
    const envIgnores = ['.env', '.env.local', '.env.development.local', '.env.test.local', '.env.production.local'];
    const updatedGitignore = `${gitignoreContent
      .split('\n')
      .concat(envIgnores.filter((e) => !gitignoreContent.includes(e)))
      .join('\n')
      .trim()}\n`;
    await fs.writeFile(gitignorePath, updatedGitignore);

    // Ensure .env exists
    const envPath = safePathJoin(projectPath, '.env');
    if (!(await fs.pathExists(envPath))) {
      await fs.writeFile(envPath, '');
    }

    // Install dependencies
    await installDependencies(projectPath, answers);

    // Success message with next steps
    successMessage(answers.projectName);

  } catch (error) {
    logger.error(`Error creating project: ${error.message}`);
    if (logger.isDevelopment) {
      logger.debug('Full error stack:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}