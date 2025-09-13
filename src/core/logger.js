/**
 * Centralized logging utility for the project generator
 */

import chalk from 'chalk';
import ora from 'ora';

class Logger {
    constructor() {
        this.spinner = null;
    }

    info(message) {
        console.log(chalk.blue('ℹ'), message);
    }

    success(message) {
        console.log(chalk.green('✓'), message);
    }

    warning(message) {
        console.log(chalk.yellow('⚠'), message);
    }

    error(message) {
        console.log(chalk.red('✗'), message);
    }

    startSpinner(message) {
        this.spinner = ora(message).start();
        return this.spinner;
    }

    stopSpinner(success = true, message = null) {
        if (this.spinner) {
            if (success) {
                this.spinner.succeed(message);
            } else {
                this.spinner.fail(message);
            }
            this.spinner = null;
        }
    }

    logStep(step, total, message) {
        console.log(chalk.cyan(`[${step}/${total}]`), message);
    }

    logCommand(command) {
        console.log(chalk.gray('$'), chalk.dim(command));
    }
}

export const logger = new Logger();
