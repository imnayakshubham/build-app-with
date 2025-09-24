/**
 * Path security utilities to prevent directory traversal and path injection attacks
 */

import path from 'path';
import fs from 'fs-extra';
import { logger } from '../core/logger.js';

/**
 * Validate and sanitize a project name for safe filesystem operations
 * @param {string} projectName - The project name to validate
 * @returns {string} Sanitized project name
 * @throws {Error} If project name is invalid or unsafe
 */
export function validateProjectName(projectName) {
    if (!projectName || typeof projectName !== 'string') {
        throw new Error('Project name must be a non-empty string');
    }

    // Remove leading/trailing whitespace
    const trimmed = projectName.trim();

    if (!trimmed) {
        throw new Error('Project name cannot be empty or only whitespace');
    }

    // Check for directory traversal patterns
    if (trimmed.includes('..') || trimmed.includes('./') || trimmed.includes('.\\')) {
        throw new Error('Project name cannot contain directory traversal patterns (.. ./ .\\)');
    }

    // Check for absolute path patterns
    if (path.isAbsolute(trimmed)) {
        throw new Error('Project name cannot be an absolute path');
    }

    // Check for reserved names (Windows and Unix)
    const reservedNames = [
        'CON', 'PRN', 'AUX', 'NUL',
        'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
        'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
    ];

    if (reservedNames.includes(trimmed.toUpperCase())) {
        throw new Error(`Project name cannot be a reserved system name: ${trimmed}`);
    }

    // Check for invalid characters (Windows filesystem restrictions + additional security)
    const invalidChars = /[<>:"|?*\x00-\x1F\x80-\x9F]/;
    if (invalidChars.test(trimmed)) {
        throw new Error('Project name contains invalid characters');
    }

    // Only allow alphanumeric, hyphens, underscores, and dots
    // Dots are allowed for extensions but not at start/end
    const validPattern = /^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/;
    if (!validPattern.test(trimmed)) {
        throw new Error('Project name can only contain letters, numbers, hyphens, underscores, and dots (not at start/end)');
    }

    // Length restrictions
    if (trimmed.length > 214) {
        throw new Error('Project name must be 214 characters or less');
    }

    if (trimmed.length < 1) {
        throw new Error('Project name must be at least 1 character long');
    }

    // Check for hidden files (starting with dot)
    if (trimmed.startsWith('.')) {
        throw new Error('Project name cannot start with a dot (hidden file)');
    }

    return trimmed;
}

/**
 * Safely resolve a project path within the current working directory
 * @param {string} projectName - Validated project name
 * @param {string} basePath - Base directory (defaults to process.cwd())
 * @returns {string} Safe absolute path
 * @throws {Error} If path resolution would escape the base directory
 */
export function safeResolveProjectPath(projectName, basePath = process.cwd()) {
    // Validate inputs
    const validatedName = validateProjectName(projectName);

    if (!basePath || typeof basePath !== 'string') {
        throw new Error('Base path must be a non-empty string');
    }

    // Ensure base path is absolute
    const absoluteBase = path.resolve(basePath);

    // Resolve the project path
    const projectPath = path.resolve(absoluteBase, validatedName);

    // Ensure the resolved path is within the base directory
    if (!projectPath.startsWith(absoluteBase + path.sep) && projectPath !== absoluteBase) {
        throw new Error('Project path would escape the base directory');
    }

    return projectPath;
}

/**
 * Generate a unique project path that doesn't conflict with existing directories
 * @param {string} projectName - Base project name
 * @param {string} basePath - Base directory (defaults to process.cwd())
 * @returns {Promise<{path: string, name: string}>} Unique path and name
 */
export async function generateUniqueProjectPath(projectName, basePath = process.cwd()) {
    const validatedName = validateProjectName(projectName);
    let uniqueName = validatedName;
    let projectPath = safeResolveProjectPath(uniqueName, basePath);
    let counter = 1;

    // Find a unique name
    while (await fs.pathExists(projectPath)) {
        if (counter > 1000) {
            throw new Error('Unable to generate unique project name after 1000 attempts');
        }

        uniqueName = `${validatedName}-${counter++}`;
        projectPath = safeResolveProjectPath(uniqueName, basePath);
    }

    if (uniqueName !== validatedName) {
        logger.warning(`Directory ${validatedName} already exists. Using ${uniqueName} instead.`);
    }

    return {
        path: projectPath,
        name: uniqueName
    };
}

/**
 * Safely join path segments, preventing directory traversal
 * @param {string} basePath - Base path (must be absolute)
 * @param {...string} segments - Path segments to join
 * @returns {string} Safely joined path
 * @throws {Error} If resulting path would escape the base directory
 */
export function safePathJoin(basePath, ...segments) {
    if (!basePath || typeof basePath !== 'string') {
        throw new Error('Base path must be a non-empty string');
    }

    if (!path.isAbsolute(basePath)) {
        throw new Error('Base path must be absolute');
    }

    // Validate each segment
    for (const segment of segments) {
        if (!segment || typeof segment !== 'string') {
            throw new Error('All path segments must be non-empty strings');
        }

        // Check for directory traversal patterns
        if (segment.includes('..') || segment.includes('./') || segment.includes('.\\')) {
            throw new Error(`Path segment contains traversal patterns: ${segment}`);
        }

        // Check for absolute path patterns
        if (path.isAbsolute(segment)) {
            throw new Error(`Path segment cannot be absolute: ${segment}`);
        }

        // Check for invalid characters
        const invalidChars = /[<>:"|?*\x00-\x1F\x80-\x9F]/;
        if (invalidChars.test(segment)) {
            throw new Error(`Path segment contains invalid characters: ${segment}`);
        }
    }

    // Join the paths
    const joinedPath = path.join(basePath, ...segments);
    const resolvedPath = path.resolve(joinedPath);

    // Ensure the resolved path is within the base directory
    if (!resolvedPath.startsWith(basePath + path.sep) && resolvedPath !== basePath) {
        throw new Error('Resolved path would escape the base directory');
    }

    return resolvedPath;
}

/**
 * Validate that a path is within allowed boundaries
 * @param {string} targetPath - Path to validate
 * @param {string} basePath - Base directory boundary
 * @returns {boolean} True if path is safe
 */
export function isPathWithinBoundary(targetPath, basePath) {
    try {
        if (!targetPath || !basePath) {
            return false;
        }

        const resolvedTarget = path.resolve(targetPath);
        const resolvedBase = path.resolve(basePath);

        return resolvedTarget.startsWith(resolvedBase + path.sep) || resolvedTarget === resolvedBase;
    } catch {
        return false;
    }
}

/**
 * Create a directory safely with proper validation
 * @param {string} dirPath - Directory path to create
 * @param {string} basePath - Base directory boundary (optional)
 * @returns {Promise<void>}
 */
export async function safeCreateDirectory(dirPath, basePath = null) {
    if (!dirPath || typeof dirPath !== 'string') {
        throw new Error('Directory path must be a non-empty string');
    }

    const resolvedPath = path.resolve(dirPath);

    // If base path is provided, ensure we're within boundaries
    if (basePath && !isPathWithinBoundary(resolvedPath, basePath)) {
        throw new Error('Directory path is outside allowed boundaries');
    }

    try {
        await fs.ensureDir(resolvedPath);
        logger.debug(`Safely created directory: ${resolvedPath}`);
    } catch (error) {
        throw new Error(`Failed to create directory ${resolvedPath}: ${error.message}`);
    }
}