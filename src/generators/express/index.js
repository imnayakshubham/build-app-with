/**
 * Express.js project generator
 */

import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import { logger } from '../../core/logger.js';
import { handleError, validateProjectName, validateFramework } from '../../core/error-handler.js';
import { packageManager } from '../../core/package-manager.js';
import { generateExpressProject } from './project-generator.js';
import { getExpressPrompts } from './prompts.js';
import { FRAMEWORKS } from '../../types/index.js';

export async function generateExpressApp(projectPath, rawAnswers) {
    try {
        validateProjectName(rawAnswers.projectName);
        validateFramework(FRAMEWORKS.EXPRESS);

        const spinner = logger.startSpinner('Setting up Express.js project...');

        // Get additional Express-specific prompts
        const expressPrompts = getExpressPrompts(rawAnswers);
        const expressAnswers = await inquirer.prompt(expressPrompts);

        const answers = { ...rawAnswers, ...expressAnswers };

        // Create project directory
        await fs.ensureDir(projectPath);

        // Generate Express project structure
        await generateExpressProject(projectPath, answers);

        spinner.succeed('Express.js project created successfully!');

        // Post-setup instructions
        logger.success(`\n🎉 Your Express.js project "${answers.projectName}" is ready!`);
        logger.info('\nNext steps:');
        logger.info(`  cd ${path.basename(projectPath)}`);
        logger.info('  npm install');
        logger.info('  npm run dev');

    } catch (error) {
        handleError(error, 'Failed to create Express.js project:');
    }
}
