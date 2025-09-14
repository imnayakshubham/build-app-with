/**
 * Tests for logger utility
 */

import { logger } from '../../core/logger.js';

describe('Logger', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('info', () => {
        it('should log info message', () => {
            logger.info('Test info message');
            expect(console.log).toHaveBeenCalledWith('ℹ', 'Test info message');
        });
    });

    describe('success', () => {
        it('should log success message', () => {
            logger.success('Test success message');
            expect(console.log).toHaveBeenCalledWith('✓', 'Test success message');
        });
    });

    describe('warning', () => {
        it('should log warning message', () => {
            logger.warning('Test warning message');
            expect(console.log).toHaveBeenCalledWith('⚠', 'Test warning message');
        });
    });

    describe('error', () => {
        it('should log error message', () => {
            logger.error('Test error message');
            expect(console.error).toHaveBeenCalledWith('✗', 'Test error message');
        });
    });

    describe('startSpinner', () => {
        it('should start spinner with message', () => {
            const spinner = logger.startSpinner('Test spinner');
            expect(spinner).toBeDefined();
        });
    });

    describe('stopSpinner', () => {
        it('should stop spinner with success', () => {
            logger.startSpinner('Test spinner');
            logger.stopSpinner(true, 'Success message');
            // Spinner methods are mocked, so we just verify they don't throw
        });

        it('should stop spinner with failure', () => {
            logger.startSpinner('Test spinner');
            logger.stopSpinner(false, 'Error message');
            // Spinner methods are mocked, so we just verify they don't throw
        });
    });

    describe('logStep', () => {
        it('should log step with progress', () => {
            logger.logStep(1, 3, 'Test step');
            expect(console.log).toHaveBeenCalledWith('[1/3]', 'Test step');
        });
    });

    describe('logCommand', () => {
        it('should log command when isDevelopment is true', () => {
            // Mock the logger's isDevelopment property
            logger.isDevelopment = true;
            logger.isQuiet = false;

            logger.logCommand('npm install');

            // Check for chalk styled output
            expect(console.log).toHaveBeenCalledWith('$', 'npm install');
        });

        it('should not log command when not in development', () => {
            jest.clearAllMocks();

            // Mock the logger's isDevelopment property
            logger.isDevelopment = false;
            logger.isQuiet = false;

            logger.logCommand('npm install');

            // Should not have been called
            expect(console.log).not.toHaveBeenCalled();
        });
    });
});
