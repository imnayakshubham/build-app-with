/**
 * Tests for error handler utility
 */

import {
    ProjectGeneratorError,
    ValidationError,
    FileSystemError,
    DependencyError,
    validateProjectName,
    validateFramework
} from '../../core/error-handler.js';

describe('Error Handler', () => {
    describe('ProjectGeneratorError', () => {
        it('should create error with message and code', () => {
            const error = new ProjectGeneratorError('Test error', 'TEST_ERROR');
            expect(error.message).toBe('Test error');
            expect(error.code).toBe('TEST_ERROR');
            expect(error.name).toBe('ProjectGeneratorError');
        });

        it('should create error with details', () => {
            const error = new ProjectGeneratorError('Test error', 'TEST_ERROR', { field: 'test' });
            expect(error.details).toEqual({ field: 'test' });
        });
    });

    describe('ValidationError', () => {
        it('should create validation error', () => {
            const error = new ValidationError('Invalid input', 'projectName');
            expect(error.message).toBe('Invalid input');
            expect(error.code).toBe('VALIDATION_ERROR');
            expect(error.name).toBe('ValidationError');
            expect(error.details).toEqual({ field: 'projectName' });
        });
    });

    describe('FileSystemError', () => {
        it('should create file system error', () => {
            const error = new FileSystemError('File not found', '/path/to/file');
            expect(error.message).toBe('File not found');
            expect(error.code).toBe('FILE_SYSTEM_ERROR');
            expect(error.name).toBe('FileSystemError');
            expect(error.details).toEqual({ path: '/path/to/file' });
        });
    });

    describe('DependencyError', () => {
        it('should create dependency error', () => {
            const error = new DependencyError('Package not found', 'react');
            expect(error.message).toBe('Package not found');
            expect(error.code).toBe('DEPENDENCY_ERROR');
            expect(error.name).toBe('DependencyError');
            expect(error.details).toEqual({ packageName: 'react' });
        });
    });

    describe('validateProjectName', () => {
        it('should validate valid project name', () => {
            expect(() => validateProjectName('my-app')).not.toThrow();
            expect(() => validateProjectName('my_app')).not.toThrow();
            expect(() => validateProjectName('my-app-123')).not.toThrow();
        });

        it('should throw error for invalid project name', () => {
            expect(() => validateProjectName('')).toThrow(ValidationError);
            expect(() => validateProjectName('my app')).toThrow(ValidationError);
            expect(() => validateProjectName('my@app')).toThrow(ValidationError);
            expect(() => validateProjectName('my.app')).toThrow(ValidationError);
        });

        it('should throw error for too long project name', () => {
            const longName = 'a'.repeat(51);
            expect(() => validateProjectName(longName)).toThrow(ValidationError);
        });

        it('should throw error for non-string input', () => {
            expect(() => validateProjectName(null)).toThrow(ValidationError);
            expect(() => validateProjectName(undefined)).toThrow(ValidationError);
            expect(() => validateProjectName(123)).toThrow(ValidationError);
        });
    });

    describe('validateFramework', () => {
        it('should validate valid framework', () => {
            expect(() => validateFramework('nextjs')).not.toThrow();
            expect(() => validateFramework('vite-react')).not.toThrow();
            expect(() => validateFramework('express')).not.toThrow();
            expect(() => validateFramework('fastify')).not.toThrow();
        });

        it('should throw error for invalid framework', () => {
            expect(() => validateFramework('invalid')).toThrow(ValidationError);
            expect(() => validateFramework('')).toThrow(ValidationError);
            expect(() => validateFramework(null)).toThrow(ValidationError);
        });
    });
});
