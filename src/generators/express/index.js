/**
 * Express.js project generator
 */


import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import { logger } from '../../core/logger.js';
import { handleError, validateProjectName, validateFramework } from '../../core/error-handler.js';
import { generateSimpleExpressProject } from './simple-generator.js';
import { getExpressPrompts } from './prompts.js';
import { FRAMEWORKS } from '../../types/index.js';

export async function generateExpressApp(projectPath, rawAnswers) {
    try {
        logger.debug('generateExpressApp started');
        validateProjectName(rawAnswers.projectName);
        validateFramework('express');

        // Get additional Express-specific prompts
        logger.debug('Getting Express prompts...');
        const expressPrompts = getExpressPrompts(rawAnswers);
        logger.debug('Prompting user for Express options...');
        const expressAnswers = await inquirer.prompt(expressPrompts);
        logger.debug('Express prompts completed');

        // Merge answers asynchronously
        const answers = { ...rawAnswers, ...expressAnswers };
        logger.debug('Answers merged successfully');

        // Create project directory
        logger.debug('Creating project directory...');
        await fs.ensureDir(projectPath);
        logger.debug('Project directory created');

        // Generate Express project structure
        const spinner = logger.startSpinner('Generating Express.js project structure...');
        await generateSimpleExpressProject(projectPath, answers);
        logger.stopSpinner(true, 'Express project generated successfully!');

        // Post-setup instructions
        logger.success(`Your Express.js project "${answers.projectName}" is ready!`);
        logger.info('Next steps:');
        logger.info(`  cd ${path.basename(projectPath)}`);
        logger.info('  npm install');
        logger.info('  npm run dev');

    } catch (error) {
        handleError(error, 'Failed to create Express.js project:');
    }
}
