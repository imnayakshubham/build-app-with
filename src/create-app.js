import inquirer from 'inquirer';
import fs from 'fs-extra';
import { getInitialPrompts, getCustomizationPrompts, finalizeAnswers } from './prompts/index.js';
import { generateViteProject, createViteBase } from './generators/vite/vite-project-generator.js';
import { createRsbuildBase, generateRsbuildProject } from './generators/rsbuild/rsbuild-project-generator.js';
import { generateNextJSProject } from './generators/nextjs/nextjs-generator.js';
import { generateExpressApp } from './generators/express/index.js';
import { generateFastifyApp } from './generators/fastify/index.js';
import { installDependencies } from './utils/dependencies.js';
import { successMessage } from './utils/messages.js';
import { logger } from './core/logger.js';
import { generateUniqueProjectPath, safePathJoin, safeCreateDirectory } from './utils/path-security.js';
import { presetToSetupType } from './utils/answer-helpers.js';

export async function createApp(cliProjectName = null) {
  try {
    // === Stage 1: Initial prompts (framework, preset, project name, TypeScript) ===
    const initialPrompts = getInitialPrompts(cliProjectName);
    const initialAnswers = await inquirer.prompt(initialPrompts);

    // Use CLI project name if provided, otherwise use prompt response
    const projectName = cliProjectName || initialAnswers.projectName;

    // Safely compute a unique project name/path
    const { path: projectPath, name: uniqueName } = await generateUniqueProjectPath(projectName);

    // Update answers with the validated project name
    initialAnswers.projectName = uniqueName;

    const isNext = initialAnswers.framework === 'nextjs';
    const isVite = initialAnswers.framework === 'vite-react';
    const isRsbuild = initialAnswers.framework === 'rsbuild-react';

    // === Stage 2: Run official scaffold for frameworks that use CLI tools ===
    if (isVite) {
      // Finalize TypeScript setting before scaffold (defaults to true if not set)
      if (initialAnswers.typescript === undefined) {
        initialAnswers.typescript = true;
      }

      const spinner = logger.startSpinner('Creating Vite project...');
      try {
        await createViteBase(projectPath, initialAnswers);
        logger.stopSpinner(true, 'Vite project scaffold created!');
      } catch (error) {
        logger.stopSpinner(false, 'Failed to create Vite project');
        throw error;
      }
    } else if (isRsbuild) {
      if (initialAnswers.typescript === undefined) {
        initialAnswers.typescript = true;
      }

      const spinner = logger.startSpinner('Creating Rsbuild project...');
      try {
        await createRsbuildBase(projectPath, initialAnswers);
        logger.stopSpinner(true, 'Rsbuild project scaffold created!');
      } catch (error) {
        logger.stopSpinner(false, 'Failed to create Rsbuild project');
        throw error;
      }
    } else if (!isNext) {
      // For Express/Fastify, create directory ourselves
      logger.debug(`Creating project directory: ${projectPath}`);
      await safeCreateDirectory(projectPath, process.cwd());
      logger.debug("Project directory created successfully");
    }
    // Next.js: directory creation is handled by create-next-app inside generateNextJSProject

    // Derive setupType from vitePreset so customization prompts can gate on it
    if ((isVite || isRsbuild) && initialAnswers.vitePreset) {
      initialAnswers.setupType = presetToSetupType(initialAnswers.vitePreset);
    }

    // === Stage 3: Customization prompts (CSS, auth, features, structure) ===
    const customizationPrompts = getCustomizationPrompts(initialAnswers);
    const customizationAnswers = await inquirer.prompt(customizationPrompts);

    // Merge all answers
    const mergedAnswers = { ...initialAnswers, ...customizationAnswers };
    const answers = finalizeAnswers(mergedAnswers);

    // === Stage 4: Generate/overlay project files ===
    if (isVite) {
      const spinner = logger.startSpinner('Customizing project...');
      try {
        await generateViteProject(projectPath, answers);
        logger.stopSpinner(true, 'Project customized successfully!');
      } catch (error) {
        logger.stopSpinner(false, 'Failed to customize project');
        throw error;
      }
    } else if (isRsbuild) {
      const spinner = logger.startSpinner('Customizing project...');
      try {
        await generateRsbuildProject(projectPath, answers);
        logger.stopSpinner(true, 'Project customized successfully!');
      } catch (error) {
        logger.stopSpinner(false, 'Failed to customize project');
        throw error;
      }
    } else if (isNext) {
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
