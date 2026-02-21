/** @type {import('jest').Config} */
export default {
    // Test environment
    testEnvironment: 'node',

    // File extensions to consider
    moduleFileExtensions: ['js', 'json', 'ts'],

    // Transform files
    transform: {
        '^.+\\.(js|ts)$': 'babel-jest'
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

    // Coverage thresholds - Set to current levels for CLI scaffolding tool
    coverageThreshold: {
        global: {
            branches: 1.5,
            functions: 5,
            lines: 2.5,
            statements: 2.5
        }
    },

    // Setup files
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],

    // Module name mapping
    moduleNameMapper: {
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
        '/build/',
        '/src/__tests__/setup.js' // ignore the setup file for now
    ],

    // Transform ignore patterns
    transformIgnorePatterns: [
        'node_modules/(?!(chalk|ora|inquirer|execa|fs-extra)/)'
    ]
};
