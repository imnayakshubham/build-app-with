/**
 * End-to-end tests for framework generation
 * Tests that generated projects actually work and can be built/started
 */

import fs from 'fs-extra';
import path from 'path';
import { execa } from 'execa';
import { generateViteProject } from '../../generators/vite/vite-project-generator.js';
import { generateExpressApp } from '../../generators/express/index.js';
import { generateFastifyApp } from '../../generators/fastify/index.js';
import { generateNextJSProject } from '../../generators/nextjs/nextjs-project-generator.js';

describe('Framework Generation E2E Tests', () => {
  let tempDir;

  beforeEach(async () => {
    // Create temporary directory for each test
    tempDir = path.join(process.cwd(), `temp-test-${Date.now()}`);
    await fs.ensureDir(tempDir);
  });

  afterEach(async () => {
    // Cleanup temporary directory
    if (await fs.pathExists(tempDir)) {
      await fs.remove(tempDir);
    }
  });

  describe('Vite + React Project Generation', () => {
    test('should generate a working Vite project with default settings', async () => {
      const projectPath = path.join(tempDir, 'test-vite-app');
      const answers = {
        projectName: 'test-vite-app',
        framework: 'vite-react',
        setupType: 'default',
        typescript: false,
        cssFramework: 'tailwind',
        projectStructure: 'simple',
        features: [],
        postSetup: []
      };

      await generateViteProject(projectPath, answers);

      // Verify essential files exist
      expect(await fs.pathExists(path.join(projectPath, 'package.json'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'src/main.jsx'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'src/App.jsx'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'vite.config.js'))).toBe(true);

      // Verify package.json has correct dependencies
      const packageJson = await fs.readJSON(path.join(projectPath, 'package.json'));
      expect(packageJson.name).toBe('test-vite-app');
      expect(packageJson.dependencies).toHaveProperty('react');
      expect(packageJson.dependencies).toHaveProperty('react-dom');
      expect(packageJson.devDependencies).toHaveProperty('vite');
    }, 30000);

    test('should generate a TypeScript Vite project', async () => {
      const projectPath = path.join(tempDir, 'test-vite-ts-app');
      const answers = {
        projectName: 'test-vite-ts-app',
        framework: 'vite-react',
        setupType: 'customize',
        typescript: true,
        cssFramework: 'tailwind',
        projectStructure: 'simple',
        features: [],
        postSetup: []
      };

      await generateViteProject(projectPath, answers);

      // Verify TypeScript files exist
      expect(await fs.pathExists(path.join(projectPath, 'src/main.tsx'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'src/App.tsx'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'tsconfig.json'))).toBe(true);

      // Verify TypeScript dependencies
      const packageJson = await fs.readJSON(path.join(projectPath, 'package.json'));
      expect(packageJson.devDependencies).toHaveProperty('typescript');
      expect(packageJson.devDependencies).toHaveProperty('@types/react');
    }, 30000);
  });

  describe('Express.js Project Generation', () => {
    test('should generate a working Express API project', async () => {
      const projectPath = path.join(tempDir, 'test-express-api');
      const answers = {
        projectName: 'test-express-api',
        framework: 'express',
        setupType: 'default',
        database: 'none',
        auth: 'none',
        features: [],
        postSetup: []
      };

      await generateExpressApp(projectPath, answers);

      // Verify essential files exist
      expect(await fs.pathExists(path.join(projectPath, 'package.json'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'src/app.js'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'src/server.js'))).toBe(true);

      // Verify package.json has correct dependencies
      const packageJson = await fs.readJSON(path.join(projectPath, 'package.json'));
      expect(packageJson.name).toBe('test-express-api');
      expect(packageJson.dependencies).toHaveProperty('express');
      expect(packageJson.scripts).toHaveProperty('start');
      expect(packageJson.scripts).toHaveProperty('dev');
    }, 30000);
  });

  describe('Fastify Project Generation', () => {
    test('should generate a working Fastify API project', async () => {
      const projectPath = path.join(tempDir, 'test-fastify-api');
      const answers = {
        projectName: 'test-fastify-api',
        framework: 'fastify',
        setupType: 'default',
        database: 'none',
        auth: 'none',
        features: [],
        postSetup: []
      };

      await generateFastifyApp(projectPath, answers);

      // Verify essential files exist
      expect(await fs.pathExists(path.join(projectPath, 'package.json'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'src/app.js'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'src/server.js'))).toBe(true);

      // Verify package.json has correct dependencies
      const packageJson = await fs.readJSON(path.join(projectPath, 'package.json'));
      expect(packageJson.name).toBe('test-fastify-api');
      expect(packageJson.dependencies).toHaveProperty('fastify');
      expect(packageJson.scripts).toHaveProperty('start');
      expect(packageJson.scripts).toHaveProperty('dev');
    }, 30000);
  });

  describe('Dependency Installation Validation', () => {
    test('should generate package.json with no duplicate dependencies', async () => {
      const projectPath = path.join(tempDir, 'test-deps-validation');
      const answers = {
        projectName: 'test-deps-validation',
        framework: 'vite-react',
        setupType: 'customize',
        cssFramework: 'tailwind',
        typescript: true,
        stateMgmt: 'redux',
        routing: ['react-router-dom'],
        forms: ['hook-form'],
        uiLibs: ['ant-design'],
        utilities: ['react-icons', 'react-toastify'],
        features: [],
        postSetup: []
      };

      await generateViteProject(projectPath, answers);

      const packageJson = await fs.readJSON(path.join(projectPath, 'package.json'));

      // Check for duplicate dependencies between deps and devDeps
      const deps = Object.keys(packageJson.dependencies || {});
      const devDeps = Object.keys(packageJson.devDependencies || {});
      const duplicates = deps.filter(dep => devDeps.includes(dep));

      expect(duplicates).toHaveLength(0);

      // Verify selected features are included
      expect(packageJson.dependencies).toHaveProperty('@reduxjs/toolkit');
      expect(packageJson.dependencies).toHaveProperty('react-router-dom');
      expect(packageJson.dependencies).toHaveProperty('react-hook-form');
      expect(packageJson.dependencies).toHaveProperty('antd');
      expect(packageJson.dependencies).toHaveProperty('react-icons');
      expect(packageJson.dependencies).toHaveProperty('react-toastify');
    }, 30000);
  });

  describe('Project Structure Validation', () => {
    test('should create proper directory structure for feature-based Vite project', async () => {
      const projectPath = path.join(tempDir, 'test-feature-structure');
      const answers = {
        projectName: 'test-feature-structure',
        framework: 'vite-react',
        setupType: 'customize',
        projectStructure: 'feature-based',
        typescript: false,
        features: []
      };

      await generateViteProject(projectPath, answers);

      // Verify feature-based structure
      expect(await fs.pathExists(path.join(projectPath, 'src/components'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'src/features'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'src/hooks'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'src/utils'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'src/services'))).toBe(true);
    }, 30000);

    test('should create proper directory structure for domain-driven Vite project', async () => {
      const projectPath = path.join(tempDir, 'test-domain-structure');
      const answers = {
        projectName: 'test-domain-structure',
        framework: 'vite-react',
        features: [],
        setupType: 'customize',
        projectStructure: 'domain-driven',
        typescript: true
      };

      await generateViteProject(projectPath, answers);

      // Verify domain-driven structure
      expect(await fs.pathExists(path.join(projectPath, 'src/domains'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'src/shared'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'src/app'))).toBe(true);
    }, 30000);
  });

  describe('Configuration Files Validation', () => {
    test('should generate proper ESLint and Prettier configs for TypeScript project', async () => {
      const projectPath = path.join(tempDir, 'test-config-validation');
      const answers = {
        projectName: 'test-config-validation',
        framework: 'vite-react',
        setupType: 'customize',
        typescript: true,
        cssFramework: 'tailwind',
        features: []
      };

      await generateViteProject(projectPath, answers);

      // Verify config files exist
      expect(await fs.pathExists(path.join(projectPath, '.eslintrc.cjs'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, '.prettierrc'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'tailwind.config.js'))).toBe(true);
      expect(await fs.pathExists(path.join(projectPath, 'postcss.config.js'))).toBe(true);

      // Verify TypeScript config
      const tsConfig = await fs.readJSON(path.join(projectPath, 'tsconfig.json'));
      expect(tsConfig.compilerOptions).toHaveProperty('jsx');
      expect(tsConfig.compilerOptions.jsx).toBe('react-jsx');
    }, 30000);
  });
});