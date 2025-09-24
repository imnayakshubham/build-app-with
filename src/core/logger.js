/**
 * Centralized logging utility for the project generator
 */

import chalk from 'chalk';
import ora from 'ora';
import { sanitizeSensitiveData } from '../utils/security.js';

class Logger {
    constructor() {
        this.spinner = null;
        this.isDevelopment = process.env.NODE_ENV === 'development';
        this.isQuiet = process.env.QUIET === 'true' || process.argv.includes('--quiet');
    }

    debug(message) {
        if (this.isDevelopment && !this.isQuiet) {
            const sanitizedMessage = sanitizeSensitiveData(message);
            console.log(chalk.gray('🔍'), chalk.dim(sanitizedMessage));
        }
    }

    info(message) {
        if (!this.isQuiet) {
            const sanitizedMessage = sanitizeSensitiveData(message);
            console.log(chalk.blue('ℹ'), sanitizedMessage);
        }
    }

    success(message) {
        if (!this.isQuiet) {
            const sanitizedMessage = sanitizeSensitiveData(message);
            console.log(chalk.green('✓'), sanitizedMessage);
        }
    }

    warning(message) {
        if (!this.isQuiet) {
            const sanitizedMessage = sanitizeSensitiveData(message);
            console.log(chalk.yellow('⚠'), sanitizedMessage);
        }
    }

    error(message) {
        // Always show errors, even in quiet mode, but sanitize sensitive data
        const sanitizedMessage = sanitizeSensitiveData(message);
        console.error(chalk.red('✗'), sanitizedMessage);
    }

    startSpinner(message) {
        if (!this.isQuiet) {
            this.spinner = ora({
                text: message, discardStdin: false
            }).start();
        } else if (this.isDevelopment) {
            this.debug(`Starting: ${message}`);
        }
        return this.spinner;
    }

    stopSpinner(success = true, message = null) {
        if (this.spinner && !this.isQuiet) {
            if (success) {
                this.spinner.succeed(message);
            } else {
                this.spinner.fail(message);
            }
            this.spinner = null;
        } else if (this.isDevelopment && message) {
            if (success) {
                this.debug(`Completed: ${message}`);
            } else {
                this.debug(`Failed: ${message}`);
            }
        }
    }

    logStep(step, total, message) {
        if (!this.isQuiet) {
            const sanitizedMessage = sanitizeSensitiveData(message);
            console.log(chalk.cyan(`[${step}/${total}]`), sanitizedMessage);
        } else if (this.isDevelopment) {
            this.debug(`Step ${step}/${total}: ${message}`);
        }
    }

    logCommand(command) {
        if (this.isDevelopment && !this.isQuiet) {
            const gray = chalk.gray ?? ((str) => str);
            const dim = chalk.dim ?? ((str) => str);
            const sanitizedCommand = sanitizeSensitiveData(command);
            console.log(gray('$'), dim(sanitizedCommand));
        }
    }
}

export const logger = new Logger();
