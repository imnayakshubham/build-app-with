/**
 * Security utilities for secure secret generation and validation
 */

import crypto from 'crypto';
import { logger } from '../core/logger.js';

/**
 * Generate a cryptographically secure random string
 * @param {number} length - Length of the generated string (default: 64)
 * @param {string} encoding - Encoding format (default: 'base64url')
 * @returns {string} Secure random string
 */
export function generateSecureSecret(length = 64, encoding = 'base64url') {
    try {
        // Generate cryptographically secure random bytes
        const buffer = crypto.randomBytes(Math.ceil(length * 3 / 4));

        if (encoding === 'base64url') {
            return buffer.toString('base64url').substring(0, length);
        } else if (encoding === 'hex') {
            return buffer.toString('hex').substring(0, length);
        } else {
            throw new Error(`Unsupported encoding: ${encoding}`);
        }
    } catch (error) {
        logger.error(`Failed to generate secure secret: ${error.message}`);
        throw new Error('Failed to generate secure secret');
    }
}

/**
 * Generate a secure JWT secret key
 * @returns {string} JWT secret key (64 characters, base64url encoded)
 */
export function generateJwtSecret() {
    return generateSecureSecret(64, 'base64url');
}

/**
 * Generate a secure database password
 * @returns {string} Database password (32 characters, base64url encoded)
 */
export function generateDatabasePassword() {
    return generateSecureSecret(32, 'base64url');
}

/**
 * Generate a secure API key
 * @returns {string} API key (48 characters, base64url encoded)
 */
export function generateApiKey() {
    return generateSecureSecret(48, 'base64url');
}

/**
 * Validate that a secret meets minimum security requirements
 * @param {string} secret - The secret to validate
 * @param {number} minLength - Minimum required length (default: 32)
 * @returns {boolean} True if secret is secure enough
 */
export function validateSecretStrength(secret, minLength = 32) {
    if (!secret || typeof secret !== 'string') {
        return false;
    }

    // Check minimum length
    if (secret.length < minLength) {
        return false;
    }

    // Check for common weak patterns
    const weakPatterns = [
        /^(.)\1+$/, // All same character
        /^(password|secret|key|123|abc)/i, // Common weak starts
        /^[0-9]+$/, // All numbers
        /^[a-z]+$/i // All letters
    ];

    for (const pattern of weakPatterns) {
        if (pattern.test(secret)) {
            return false;
        }
    }

    return true;
}

/**
 * Sanitize sensitive data from strings (for logging)
 * @param {string} input - Input string that may contain sensitive data
 * @returns {string} Sanitized string with secrets redacted
 */
export function sanitizeSensitiveData(input) {
    if (!input || typeof input !== 'string') {
        return input;
    }

    // Patterns to redact
    const sensitivePatterns = [
        {
            pattern: /(password|pwd|secret|key|token|auth)[=:]\s*['"]?([^'"\s,}]+)/gi,
            replacement: '$1=***REDACTED***'
        },
        {
            pattern: /(mongodb|postgresql|mysql):\/\/[^:]+:([^@]+)@/gi,
            replacement: '$1://***:***REDACTED***@'
        },
        {
            pattern: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi,
            replacement: 'Bearer ***REDACTED***'
        }
    ];

    let sanitized = input;
    for (const { pattern, replacement } of sensitivePatterns) {
        sanitized = sanitized.replace(pattern, replacement);
    }

    return sanitized;
}

/**
 * Generate secure environment template with placeholder warnings
 * @param {Object} config - Configuration object with required environment variables
 * @returns {string} Environment file content with secure defaults
 */
export function generateSecureEnvTemplate(config = {}) {
    const lines = [
        '# Environment Variables',
        '# IMPORTANT: Change all default values before deploying to production!',
        '# Generate secure values using: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64url\'))"',
        '',
        '# Application Configuration',
        `NODE_ENV=${config.nodeEnv || 'development'}`,
        `PORT=${config.port || 3000}`,
        ''
    ];

    if (config.database) {
        lines.push(
            '# Database Configuration',
            '# WARNING: Change these default credentials immediately!',
            `DB_HOST=${config.database.host || 'localhost'}`,
            `DB_PORT=${config.database.port || 5432}`,
            `DB_NAME=${config.database.name || 'myapp'}`,
            `DB_USER=${config.database.user || 'dbuser'}`,
            `DB_PASSWORD=${generateDatabasePassword()}`,
            ''
        );
    }

    if (config.jwt) {
        lines.push(
            '# JWT Configuration',
            '# WARNING: This is a generated secret - keep it secure!',
            `JWT_SECRET=${generateJwtSecret()}`,
            `JWT_EXPIRES_IN=${config.jwt.expiresIn || '7d'}`,
            ''
        );
    }

    if (config.additionalVars) {
        lines.push('# Additional Configuration');
        Object.entries(config.additionalVars).forEach(([key, value]) => {
            lines.push(`${key}=${value}`);
        });
        lines.push('');
    }

    return lines.join('\n');
}