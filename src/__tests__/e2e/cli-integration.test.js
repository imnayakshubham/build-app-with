/**
 * CLI Integration tests
 * Tests the complete CLI workflow including prompts and project generation
 */

import fs from 'fs-extra';
import path from 'path';
import { createApp } from '../../create-app.js';
import { validateProjectName, validateFramework } from '../../core/error-handler.js';

// Mock inquirer to simulate user input
jest.mock('inquirer', () => ({
  prompt: jest.fn()
}));

import inquirer from 'inquirer';

describe('CLI Integration Tests', () => {
  let tempDir;
  let originalCwd;

  beforeEach(async () => {
    // Create temporary directory for each test
    tempDir = path.join(process.cwd(), `temp-cli-test-${Date.now()}`);
    await fs.ensureDir(tempDir);

    // Change working directory to temp dir
    originalCwd = process.cwd();
    process.chdir(tempDir);

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Restore working directory
    process.chdir(originalCwd);

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
      expect(() => validateProjectName('')).toThrow('Project name is required');
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
      // Create existing directories
      await fs.ensureDir('my-app');
      await fs.ensureDir('my-app-1');

      // Mock user input
      inquirer.prompt.mockResolvedValueOnce({
        framework: 'vite-react',
        setupType: 'default',
        projectName: 'my-app'
      });

      await createApp();

      // Should create my-app-2 since my-app and my-app-1 exist
      expect(await fs.pathExists('my-app-2')).toBe(true);
      expect(await fs.pathExists('my-app-2/package.json')).toBe(true);

      const packageJson = await fs.readJSON('my-app-2/package.json');
      expect(packageJson.name).toBe('my-app-2');
    }, 30000);
  });

  describe('Complete Workflow Tests', () => {
    test('should create Vite project with default settings', async () => {
      inquirer.prompt.mockResolvedValueOnce({
        framework: 'vite-react',
        setupType: 'default',
        projectName: 'test-vite-app'
      });

      await createApp();

      // Verify project was created
      expect(await fs.pathExists('test-vite-app')).toBe(true);
      expect(await fs.pathExists('test-vite-app/package.json')).toBe(true);
      expect(await fs.pathExists('test-vite-app/src/App.jsx')).toBe(true);
      expect(await fs.pathExists('test-vite-app/.env')).toBe(true);
      expect(await fs.pathExists('test-vite-app/.gitignore')).toBe(true);

      // Verify .gitignore includes .env files
      const gitignore = await fs.readFile('test-vite-app/.gitignore', 'utf8');
      expect(gitignore).toContain('.env');
      expect(gitignore).toContain('node_modules/');
    }, 30000);

    test('should create Express API with customization', async () => {
      // Mock main framework selection
      inquirer.prompt.mockResolvedValueOnce({
        framework: 'express',
        setupType: 'customize',
        projectName: 'test-express-api'
      });

      // Mock Express-specific prompts
      inquirer.prompt.mockResolvedValueOnce({
        database: 'none',
        auth: 'none',
        projectStructure: 'simple'
      });

      await createApp();

      // Verify Express project was created
      expect(await fs.pathExists('test-express-api')).toBe(true);
      expect(await fs.pathExists('test-express-api/package.json')).toBe(true);
      expect(await fs.pathExists('test-express-api/src/app.js')).toBe(true);
      expect(await fs.pathExists('test-express-api/src/server.js')).toBe(true);

      const packageJson = await fs.readJSON('test-express-api/package.json');
      expect(packageJson.dependencies).toHaveProperty('express');
      expect(packageJson.scripts).toHaveProperty('dev');
    }, 30000);

    test('should create Fastify API with default settings', async () => {
      // Mock main framework selection
      inquirer.prompt.mockResolvedValueOnce({
        framework: 'fastify',
        setupType: 'default',
        projectName: 'test-fastify-api'
      });

      // Mock Fastify-specific prompts
      inquirer.prompt.mockResolvedValueOnce({
        database: 'none',
        auth: 'none'
      });

      await createApp();

      // Verify Fastify project was created
      expect(await fs.pathExists('test-fastify-api')).toBe(true);
      expect(await fs.pathExists('test-fastify-api/package.json')).toBe(true);
      expect(await fs.pathExists('test-fastify-api/src/app.js')).toBe(true);

      const packageJson = await fs.readJSON('test-fastify-api/package.json');
      expect(packageJson.dependencies).toHaveProperty('fastify');
    }, 30000);
  });

  describe('Error Handling', () => {
    test('should handle invalid project name gracefully', async () => {
      inquirer.prompt.mockResolvedValueOnce({
        framework: 'vite-react',
        setupType: 'default',
        projectName: 'invalid name!' // Invalid characters
      });

      // This should be caught by validation in the prompts
      // The actual validation happens in the prompt validation function
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      await expect(createApp()).rejects.toThrow();

      mockExit.mockRestore();
    });
  });

  describe('Environment Files', () => {
    test('should create and properly configure .env and .gitignore', async () => {
      inquirer.prompt.mockResolvedValueOnce({
        framework: 'vite-react',
        setupType: 'default',
        projectName: 'env-test-app'
      });

      await createApp();

      // Verify .env file exists (empty by default)
      expect(await fs.pathExists('env-test-app/.env')).toBe(true);
      const envContent = await fs.readFile('env-test-app/.env', 'utf8');
      expect(envContent).toBe('');

      // Verify .gitignore includes all env variants
      const gitignore = await fs.readFile('env-test-app/.gitignore', 'utf8');
      expect(gitignore).toContain('.env');
      expect(gitignore).toContain('.env.local');
      expect(gitignore).toContain('.env.development.local');
      expect(gitignore).toContain('.env.test.local');
      expect(gitignore).toContain('.env.production.local');
    }, 30000);
  });
});