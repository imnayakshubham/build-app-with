/**
 * Dependency management utilities
 * Handles package installation and version resolution
 */

import { DEPENDENCY_VERSIONS, FEATURE_PACKAGES, DEV_DEPENDENCIES } from '../constants/vite-features.js';

/**
 * Gets packages for a given feature
 * @param {string} feature - Feature identifier
 * @returns {Array<string>} Array of package names
 */
export function getFeaturePackages(feature) {
    return FEATURE_PACKAGES[feature] || [];
}

/**
 * Gets version for a package
 * @param {string} packageName - Package name
 * @returns {string} Package version
 */
export function getPackageVersion(packageName) {
    return DEPENDENCY_VERSIONS[packageName] || 'latest';
}

/**
 * Checks if package should be a dev dependency
 * @param {string} packageName - Package name
 * @returns {boolean} True if should be dev dependency
 */
export function isDevDependency(packageName) {
    return DEV_DEPENDENCIES.has(packageName);
}

/**
 * Adds packages to packageJson dependencies
 * @param {Object} packageJson - Package.json object
 * @param {Array<string>} packages - Array of package names
 */
export function addDependencies(packageJson, packages) {
    packages.forEach(pkg => {
        const version = getPackageVersion(pkg);
        if (isDevDependency(pkg)) {
            packageJson.devDependencies[pkg] = version;
        } else {
            packageJson.dependencies[pkg] = version;
        }
    });
}

/**
 * Adds feature dependencies to packageJson
 * @param {Object} packageJson - Package.json object
 * @param {string} feature - Feature identifier
 */
export function addFeatureDependencies(packageJson, feature) {
    const packages = getFeaturePackages(feature);
    addDependencies(packageJson, packages);
}
