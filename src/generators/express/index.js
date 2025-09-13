/**
 * Express.js project generator
 */

import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import { logger } from '../../core/logger.js';
import { handleError, validateProjectName, validateFramework } from '../../core/error-handler.js';
import { packageManager } from '../../core/package-manager.js';
import { generateSimpleExpressProject } from './simple-generator.js';
import { getExpressPrompts } from './prompts.js';
import { FRAMEWORKS } from '../../types/index.js';

export async function generateExpressApp(projectPath, rawAnswers) {
    try {
        console.log('generateExpressApp started');
        validateProjectName(rawAnswers.projectName);
        validateFramework(FRAMEWORKS.EXPRESS);

        // Get additional Express-specific prompts
        console.log('Getting Express prompts...');
        const expressPrompts = getExpressPrompts(rawAnswers);
        console.log('Prompting user for Express options...');
        const expressAnswers = await inquirer.prompt(expressPrompts);
        console.log('Express prompts completed');

        // Merge answers asynchronously
        const answers = { ...rawAnswers, ...expressAnswers };
        console.log('Answers merged successfully');

        // Create project directory
        console.log('Creating project directory...');
        await fs.ensureDir(projectPath);
        console.log('Project directory created');

        // Generate Express project structure
        console.log('Generating Express project structure...');
        await generateSimpleExpressProject(projectPath, answers);
        console.log('Express project generated successfully!');

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
