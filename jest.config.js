/** @type {import('jest').Config} */
export default {
    // Test environment
    testEnvironment: 'node',

    // File extensions to consider
    moduleFileExtensions: ['js', 'json', 'ts'],

    // Transform files
    transform: {
        '^.+\\.(js|ts)$': 'babel-jest',
    },

    // Test file patterns
    testMatch: [
        '**/__tests__/**/*.(js|ts)',
        '**/*.(test|spec).(js|ts)'
    ],

    // Coverage configuration
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],

    // Files to include in coverage
    collectCoverageFrom: [
        'src/**/*.{js,ts}',
        '!src/**/*.d.ts',
        '!src/**/*.test.{js,ts}',
        '!src/**/*.spec.{js,ts}',
        '!src/**/__tests__/**',
        '!src/**/node_modules/**'
    ],

    // Coverage thresholds
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },

    // Setup files
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],

    // Module name mapping
    moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },

    // Clear mocks between tests
    clearMocks: true,

    // Restore mocks after each test
    restoreMocks: true,

    // Verbose output
    verbose: true,

    // Test timeout
    testTimeout: 10000,

    // Ignore patterns
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/build/'
    ],

    // Transform ignore patterns
    transformIgnorePatterns: [
        'node_modules/(?!(chalk|ora|inquirer|execa|fs-extra)/)'
    ]
};
