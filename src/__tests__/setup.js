/**
 * Jest setup file
 */

// Mock console methods to avoid noise in tests
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
};

// Mock process.exit to prevent tests from exiting
const originalExit = process.exit;
process.exit = jest.fn((code) => {
    throw new Error(`process.exit called with "${code}"`);
});

// Restore process.exit after each test
afterEach(() => {
    process.exit = originalExit;
});

// Mock fs-extra
jest.mock('fs-extra', () => ({
    ensureDir: jest.fn(() => Promise.resolve()),
    writeFile: jest.fn(() => Promise.resolve()),
    writeJSON: jest.fn(() => Promise.resolve()),
    readFile: jest.fn(() => Promise.resolve('')),
    readJSON: jest.fn((filePath) => {
        if (filePath.includes('package.json')) {
            // Extract project name from path
            const pathParts = filePath.split('/');
            const projectDir = pathParts[pathParts.length - 2];
            return Promise.resolve({
                name: projectDir,
                version: '1.0.0',
                dependencies: {
                    'react': '^18.0.0',
                    'react-dom': '^18.0.0',
                    'express': '^4.18.0',
                    'fastify': '^4.0.0',
                    '@reduxjs/toolkit': '^1.9.0',
                    'react-router-dom': '^6.0.0',
                    'react-hook-form': '^7.0.0',
                    'antd': '^5.0.0',
                    'react-icons': '^4.0.0',
                    'react-toastify': '^9.0.0'
                },
                devDependencies: {
                    'vite': '^4.0.0',
                    'typescript': '^5.0.0',
                    '@types/react': '^18.0.0',
                    '@types/node': '^18.0.0'
                },
                scripts: {
                    'start': 'node server.js',
                    'dev': 'vite',
                    'build': 'vite build'
                }
            });
        } else if (filePath.includes('tsconfig.json')) {
            return Promise.resolve({
                compilerOptions: {
                    target: 'ES2020',
                    jsx: 'react-jsx',
                    module: 'ESNext'
                }
            });
        }
        return Promise.resolve({});
    }),
    pathExists: jest.fn(() => Promise.resolve(true)),
    existsSync: jest.fn(() => true),
    remove: jest.fn(() => Promise.resolve())
}));

// Mock execa
jest.mock('execa', () => ({
    execa: jest.fn()
}));

// Mock inquirer
jest.mock('inquirer', () => ({
    prompt: jest.fn()
}));

// Mock ora
jest.mock('ora', () => {
    const mockOra = jest.fn(() => ({
        start: jest.fn().mockReturnThis(),
        succeed: jest.fn().mockReturnThis(),
        fail: jest.fn().mockReturnThis(),
        stop: jest.fn().mockReturnThis()
    }));

    mockOra.stop = jest.fn();
    return mockOra;
});

// Mock chalk
jest.mock('chalk', () => ({
    red: jest.fn((text) => text),
    green: jest.fn((text) => text),
    yellow: jest.fn((text) => text),
    blue: jest.fn((text) => text),
    cyan: jest.fn((text) => text),
    dim: jest.fn((text) => text)
}));

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
