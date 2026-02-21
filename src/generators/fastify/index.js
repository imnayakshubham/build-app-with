/**
 * Fastify project generator
 */

import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import { logger } from '../../core/logger.js';
import { handleError, validateProjectName, validateFramework } from '../../core/error-handler.js';
import { packageManager } from '../../core/package-manager.js';
import { generateFastifyProject } from './project-generator.js';
import { getFastifyPrompts } from './prompts.js';
import { FRAMEWORKS } from '../../types/index.js';

export async function generateFastifyApp(projectPath, rawAnswers) {
    try {
        validateProjectName(rawAnswers.projectName);
        validateFramework(FRAMEWORKS.FASTIFY);

        const spinner = logger.startSpinner('Setting up Fastify project...');

        // Get additional Fastify-specific prompts
        const fastifyPrompts = getFastifyPrompts(rawAnswers);
        const fastifyAnswers = await inquirer.prompt(fastifyPrompts);

        // Merge answers with defaults for missing fields
        const answers = {
            features: [],
            authStrategy: 'none',
            database: 'none',
            projectStructure: 'simple',
            includeTests: false,
            includeDocker: false,
            ...rawAnswers,
            ...fastifyAnswers
        };

        // Create project directory
        await fs.ensureDir(projectPath);

        // Generate Fastify project structure
        await generateFastifyProject(projectPath, answers);

        spinner.succeed('Fastify project created successfully!');

        // Post-setup instructions
        logger.success(`\n🎉 Your Fastify project "${answers.projectName}" is ready!`);
        logger.info('\nNext steps:');
        logger.info(`  cd ${path.basename(projectPath)}`);
        logger.info('  npm install');
        logger.info('  npm run dev');

    } catch (error) {
        handleError(error, 'Failed to create Fastify project:');
    }
}
