/**
 * Centralized error handling for the project generator
 */

import chalk from 'chalk';
import { logger } from './logger.js';
import { validateProjectName as secureValidateProjectName } from '../utils/path-security.js';

export class ProjectGeneratorError extends Error {
    constructor(message, code = 'GENERATOR_ERROR', details = null) {
        super(message);
        this.name = 'ProjectGeneratorError';
        this.code = code;
        this.details = details;
    }
}

export class ValidationError extends ProjectGeneratorError {
    constructor(message, field = null) {
        super(message, 'VALIDATION_ERROR', { field });
        this.name = 'ValidationError';
    }
}

export class FileSystemError extends ProjectGeneratorError {
    constructor(message, path = null) {
        super(message, 'FILE_SYSTEM_ERROR', { path });
        this.name = 'FileSystemError';
    }
}

export class DependencyError extends ProjectGeneratorError {
    constructor(message, packageName = null) {
        super(message, 'DEPENDENCY_ERROR', { packageName });
        this.name = 'DependencyError';
    }
}

export function handleError(error, context = '') {
    logger.stopSpinner(false);

    if (error instanceof ProjectGeneratorError) {
        logger.error(`${context} ${error.message}`);
        if (error.details) {
            console.log(chalk.dim(JSON.stringify(error.details, null, 2)));
        }
    } else {
        logger.error(`${context} ${error.message}`);
        if (process.env.NODE_ENV === 'development') {
            console.error(error.stack);
        }
    }

    // Don't exit in test environment
    if (process.env.NODE_ENV !== 'test') {
        process.exit(1);
    } else {
        throw error; // Re-throw for tests to handle
    }
}

export function validateProjectName(name) {
    try {
        secureValidateProjectName(name);
        return true;
    } catch (error) {
        throw new ValidationError(error.message, 'projectName');
    }
}

export function validateFramework(framework) {
    const validFrameworks = ['nextjs', 'vite-react', 'express', 'fastify'];
    if (!validFrameworks.includes(framework)) {
        throw new ValidationError(
            `Invalid framework. Must be one of: ${validFrameworks.join(', ')}`,
            'framework'
        );
    }
    return true;
}
