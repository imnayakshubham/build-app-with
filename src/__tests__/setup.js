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
process.exit = jest.fn();

// Restore process.exit after each test
afterEach(() => {
    process.exit = originalExit;
});

// Mock fs-extra
jest.mock('fs-extra', () => ({
    ensureDir: jest.fn(),
    writeFile: jest.fn(),
    writeJSON: jest.fn(),
    readFile: jest.fn(),
    readJSON: jest.fn(),
    pathExists: jest.fn(),
    existsSync: jest.fn()
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
