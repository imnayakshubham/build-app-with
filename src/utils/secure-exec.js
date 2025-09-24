/**
 * Secure command execution utilities to prevent command injection
 */

import { execa } from 'execa';
import { logger } from '../core/logger.js';
import { sanitizeSensitiveData } from './security.js';

/**
 * Allowed commands and their acceptable argument patterns
 */
const ALLOWED_COMMANDS = {
    npm: {
        allowedCommands: ['install', 'list', 'view', 'version'],
        allowedFlags: [
            '--save-dev',
            '--global',
            '--save',
            '--no-save',
            '--production',
            '--no-audit',
            '--no-fund',
            '--silent',
            '--quiet'
        ]
    },
    yarn: {
        allowedCommands: ['install', 'add', 'remove', 'info', 'list'],
        allowedFlags: [
            '--dev',
            '--global',
            '--save',
            '--production',
            '--silent',
            '--no-lockfile'
        ]
    },
    pnpm: {
        allowedCommands: ['install', 'add', 'remove', 'info', 'list'],
        allowedFlags: [
            '--save-dev',
            '--global',
            '--save',
            '--production',
            '--silent'
        ]
    },
    npx: {
        allowedCommands: [],
        allowedFlags: ['--version', '--help']
    },
    node: {
        allowedCommands: [],
        allowedFlags: ['--version', '--help']
    }
};

/**
 * Validate package name format to prevent injection
 * @param {string} packageName - Package name to validate
 * @returns {boolean} True if package name is valid
 */
export function validatePackageName(packageName) {
    if (!packageName || typeof packageName !== 'string') {
        return false;
    }

    // npm package name rules:
    // - can contain lowercase letters, numbers, hyphens, underscores, periods, and forward slashes
    // - must be less than 214 characters
    // - cannot start with . or _
    // - scoped packages: @scope/package-name
    const validNamePattern = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/i;

    if (!validNamePattern.test(packageName)) {
        return false;
    }

    // Check length
    if (packageName.length > 214) {
        return false;
    }

    // Prevent malicious patterns
    const maliciousPatterns = [
        /[;&|`$(){}[\]<>]/,    // Shell metacharacters
        /\s/,                  // Whitespace
        /\.\./,                // Directory traversal
        /^-/,                  // Starts with dash (could be interpreted as flag)
        /__proto__|prototype|constructor/i // Prototype pollution attempts
    ];

    for (const pattern of maliciousPatterns) {
        if (pattern.test(packageName)) {
            return false;
        }
    }

    return true;
}

/**
 * Validate command arguments to prevent injection
 * @param {string} command - The base command (npm, yarn, etc.)
 * @param {string[]} args - Array of arguments
 * @returns {boolean} True if arguments are safe
 */
export function validateCommandArgs(command, args) {
    const config = ALLOWED_COMMANDS[command];
    if (!config) {
        logger.error(`Command "${command}" is not in the allowlist`);
        return false;
    }

    for (const arg of args) {
        if (!arg || typeof arg !== 'string') {
            return false;
        }

        // Check for shell metacharacters
        if (/[;&|`$(){}[\]<>\\]/.test(arg)) {
            logger.error(`Argument contains shell metacharacters: ${arg}`);
            return false;
        }

        // Validate package names (for install/add commands)
        if (['install', 'add'].includes(args[0]) && arg !== args[0] && !config.allowedFlags.includes(arg)) {
            if (!validatePackageName(arg.split('@')[0])) { // Remove version specifier
                logger.error(`Invalid package name: ${arg}`);
                return false;
            }
        }

        // Validate flags
        if (arg.startsWith('-') && !config.allowedFlags.includes(arg)) {
            logger.error(`Flag not in allowlist: ${arg}`);
            return false;
        }
    }

    return true;
}

/**
 * Sanitize project name for safe filesystem operations
 * @param {string} projectName - Project name to sanitize
 * @returns {string} Sanitized project name
 */
export function sanitizeProjectName(projectName) {
    if (!projectName || typeof projectName !== 'string') {
        throw new Error('Project name must be a non-empty string');
    }

    // Remove any characters that aren't alphanumeric, hyphens, or underscores
    let sanitized = projectName.replace(/[^a-zA-Z0-9-_]/g, '');

    // Ensure it doesn't start with a dot or hyphen
    sanitized = sanitized.replace(/^[.-]+/, '');

    // Ensure it's not empty after sanitization
    if (!sanitized) {
        throw new Error('Project name contains no valid characters');
    }

    // Limit length
    if (sanitized.length > 50) {
        sanitized = sanitized.substring(0, 50);
    }

    return sanitized;
}

/**
 * Securely execute a command with validation
 * @param {string} command - Command to execute
 * @param {string[]} args - Arguments array
 * @param {Object} options - Execution options
 * @returns {Promise} Execution promise
 */
export async function secureExec(command, args = [], options = {}) {
    // Validate command and arguments
    if (!validateCommandArgs(command, args)) {
        throw new Error(`Invalid or unsafe command: ${command} ${args.join(' ')}`);
    }

    // Set secure defaults
    const secureOptions = {
        timeout: options.timeout || 300000, // 5 minute timeout
        stdio: options.stdio || 'pipe',
        env: {
            ...process.env,
            // Remove potentially dangerous env vars
            NODE_OPTIONS: undefined,
            npm_config_script: undefined,
            npm_config_user_config: undefined,
            // Set safe defaults
            CI: 'true', // Prevent interactive prompts
            NODE_ENV: options.nodeEnv || 'production',
            ...options.env
        },
        cwd: options.cwd,
        windowsHide: true // Hide child process window on Windows
    };

    // Log the sanitized command (without sensitive data)
    const sanitizedCommand = `${command} ${args.map(arg =>
        validatePackageName(arg) ? arg : sanitizeSensitiveData(arg)
    ).join(' ')}`;

    logger.debug(`Executing secure command: ${sanitizedCommand}`);

    try {
        const result = await execa(command, args, secureOptions);

        // Sanitize output before logging
        if (result.stdout) {
            logger.debug(`Command output: ${sanitizeSensitiveData(result.stdout)}`);
        }

        return result;
    } catch (error) {
        // Sanitize error messages
        const sanitizedError = new Error(sanitizeSensitiveData(error.message));
        sanitizedError.code = error.code;
        sanitizedError.exitCode = error.exitCode;

        logger.error(`Secure command failed: ${sanitizedCommand}`);
        logger.error(`Error: ${sanitizeSensitiveData(error.message)}`);

        throw sanitizedError;
    }
}

/**
 * Validate and sanitize Next.js project creation arguments
 * @param {string} projectName - Project name
 * @param {Object} options - Next.js options
 * @returns {string[]} Sanitized arguments array
 */
export function sanitizeNextJSArgs(projectName, options = {}) {
    const sanitizedName = sanitizeProjectName(projectName);

    const args = ['create-next-app@latest', sanitizedName];

    // Add only validated flags
    const validFlags = {
        '--app': options.useAppRouter === true,
        '--src-dir': options.useSrcDir === true,
        '--typescript': options.typescript === true,
        '--js': options.typescript === false,
        '--tailwind': options.tailwind === true,
        '--no-tailwind': options.tailwind === false,
        '--eslint': options.eslint === true,
        '--no-eslint': options.eslint === false,
        '--import-alias': options.importAlias
    };

    for (const [flag, condition] of Object.entries(validFlags)) {
        if (condition === true) {
            args.push(flag);
        } else if (typeof condition === 'string' && condition) {
            args.push(flag, condition);
        }
    }

    return args;
}