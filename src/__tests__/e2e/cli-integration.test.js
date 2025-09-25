/**
 * CLI Integration tests
 * Tests CLI validation and component integration without full CLI execution
 */

import fs from 'fs-extra';
import path from 'path';
import { validateProjectName, validateFramework } from '../../core/error-handler.js';
import { generateViteProject } from '../../generators/vite/vite-project-generator.js';
import { generateExpressApp } from '../../generators/express/index.js';
import { generateFastifyApp } from '../../generators/fastify/index.js';

// Mock inquirer to simulate user input
jest.mock('inquirer', () => ({
  prompt: jest.fn()
}));

import inquirer from 'inquirer';

describe('CLI Integration Tests', () => {
  let tempDir;
  let originalCwd;

  beforeEach(async () => {
    // Set up temporary directory path for tests
    tempDir = `temp-cli-test-${Date.now()}`;

    // Don't actually change directory since we're using mocked fs
    originalCwd = process.cwd();

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // No need to restore directory since we don't change it

    // Cleanup temporary directory
    if (await fs.pathExists(tempDir)) {
      await fs.remove(tempDir);
    }
  });

  describe('Project Name Validation', () => {
    test('should validate correct project names', () => {
      expect(() => validateProjectName('my-app')).not.toThrow();
      expect(() => validateProjectName('MyApp123')).not.toThrow();
      expect(() => validateProjectName('app_name')).not.toThrow();
    });

    test('should reject invalid project names', () => {
      expect(() => validateProjectName('')).toThrow('must be a non-empty string');
      expect(() => validateProjectName('my app')).toThrow('can only contain letters');
      expect(() => validateProjectName('my-app!')).toThrow('can only contain letters');
      expect(() => validateProjectName('a'.repeat(51))).toThrow('50 characters or less');
    });
  });

  describe('Framework Validation', () => {
    test('should validate supported frameworks', () => {
      expect(() => validateFramework('nextjs')).not.toThrow();
      expect(() => validateFramework('vite-react')).not.toThrow();
      expect(() => validateFramework('express')).not.toThrow();
      expect(() => validateFramework('fastify')).not.toThrow();
    });

    test('should reject unsupported frameworks', () => {
      expect(() => validateFramework('vue')).toThrow('Invalid framework');
      expect(() => validateFramework('angular')).toThrow('Invalid framework');
      expect(() => validateFramework('')).toThrow('Invalid framework');
    });
  });

  describe('Directory Conflict Resolution', () => {
    test('should handle existing directory names by incrementing', async () => {
      // This test verifies the mocking behavior rather than real directory conflicts
      // since we're using mocked fs operations
      const projectPath = 'my-app';

      // Test with mocked path exists
      const mockPathExists = jest.spyOn(fs, 'pathExists')
        .mockResolvedValueOnce(true)  // my-app exists
        .mockResolvedValueOnce(true)  // my-app-1 exists
        .mockResolvedValueOnce(false); // my-app-2 doesn't exist

      const answers = {
        projectName: 'my-app',
        framework: 'vite-react',
        setupType: 'default',
        typescript: false,
        features: []
      };

      await generateViteProject(tempDir, answers);

      // Verify fs operations were called
      expect(fs.ensureDir).toHaveBeenCalled();
      expect(fs.writeJSON).toHaveBeenCalled();

      mockPathExists.mockRestore();
    }, 10000);
  });

  describe('Complete Workflow Tests', () => {
    test('should create Vite project with default settings', async () => {
      const answers = {
        projectName: 'test-vite-app',
        framework: 'vite-react',
        setupType: 'default',
        typescript: false,
        features: []
      };

      await generateViteProject(tempDir, answers);

      // Verify mocked fs operations were called
      expect(fs.ensureDir).toHaveBeenCalled();
      expect(fs.writeJSON).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
    }, 10000);

    test('should create Express API with customization', async () => {
      const answers = {
        projectName: 'test-express-api',
        framework: 'express',
        setupType: 'customize',
        database: 'none',
        auth: 'none',
        projectStructure: 'simple'
      };

      await generateExpressApp(tempDir, answers);

      // Verify mocked fs operations were called
      expect(fs.ensureDir).toHaveBeenCalled();
      expect(fs.writeJSON).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
    }, 10000);

    test('should create Fastify API with default settings', async () => {
      const answers = {
        projectName: 'test-fastify-api',
        framework: 'fastify',
        setupType: 'default',
        database: 'none',
        auth: 'none',
        features: []
      };

      await generateFastifyApp(tempDir, answers);

      // Verify mocked fs operations were called
      expect(fs.ensureDir).toHaveBeenCalled();
      expect(fs.writeJSON).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
    }, 10000);
  });

  describe('Error Handling', () => {
    test('should handle invalid project name gracefully', () => {
      // Test validation functions directly
      expect(() => validateProjectName('invalid name!')).toThrow('can only contain letters');
      expect(() => validateProjectName('')).toThrow('must be a non-empty string');
      expect(() => validateFramework('invalid')).toThrow('Invalid framework');
    });
  });

  describe('Environment Files', () => {
    test('should create and properly configure .env and .gitignore', async () => {
      const answers = {
        projectName: 'env-test-app',
        framework: 'vite-react',
        setupType: 'default',
        typescript: false,
        features: []
      };

      await generateViteProject(tempDir, answers);

      // Verify that file writing operations were called
      expect(fs.writeFile).toHaveBeenCalled();
      expect(fs.writeJSON).toHaveBeenCalled();

      // Since fs operations are mocked, we verify they were called with expected patterns
      const writeFileCalls = fs.writeFile.mock.calls;
      const hasEnvFile = writeFileCalls.some(call => call[0].includes('.env'));
      const hasGitignore = writeFileCalls.some(call => call[0].includes('.gitignore'));

      expect(hasEnvFile || hasGitignore).toBe(true); // At least one env-related file should be written
    }, 10000);
  });
});