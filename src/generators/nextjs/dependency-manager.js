/**
 * Dependency management utilities for Next.js projects
 */

import { featurePackageMap, cssFrameworkPackages, nextjsBasePackages, typescriptPackages } from './package-mappings.js';

/**
 * Calculate dependencies and devDependencies based on selected features
 */
export function calculateDependencies(answers) {
  let dependencies = { ...nextjsBasePackages.deps.reduce((acc, pkg) => ({ ...acc, [pkg]: 'latest' }), {}) };
  let devDependencies = { ...nextjsBasePackages.devDeps.reduce((acc, pkg) => ({ ...acc, [pkg]: 'latest' }), {}) };

  // Add TypeScript dependencies if enabled
  if (answers.typescript) {
    typescriptPackages.devDeps.forEach(pkg => {
      devDependencies[pkg] = 'latest';
    });
  }

  // Add CSS framework dependencies
  if (answers.cssFramework && cssFrameworkPackages[answers.cssFramework]) {
    const cssFramework = cssFrameworkPackages[answers.cssFramework];

    if (cssFramework.deps) {
      cssFramework.deps.forEach(pkg => {
        dependencies[pkg] = 'latest';
      });
    }

    if (cssFramework.devDeps) {
      cssFramework.devDeps.forEach(pkg => {
        devDependencies[pkg] = 'latest';
      });
    }

    // Add TypeScript-specific dev dependencies for CSS frameworks
    if (answers.typescript && cssFramework.devDepsForTS) {
      cssFramework.devDepsForTS.forEach(pkg => {
        devDependencies[pkg] = 'latest';
      });
    }
  }

  // Add feature-based dependencies
  const features = [
    answers.authStrategy,
    answers.database,
    answers.stateMgmt,
    ...(Array.isArray(answers.dataFetching) ? answers.dataFetching : []),
    ...(Array.isArray(answers.forms) ? answers.forms : []),
    ...(Array.isArray(answers.animations) ? answers.animations : []),
    ...(Array.isArray(answers.utilities) ? answers.utilities : [])
  ].filter(Boolean);

  features.forEach(feature => {
    if (featurePackageMap[feature]) {
      const featurePackages = featurePackageMap[feature];

      if (featurePackages.deps) {
        featurePackages.deps.forEach(pkg => {
          dependencies[pkg] = 'latest';
        });
      }

      if (featurePackages.devDeps) {
        featurePackages.devDeps.forEach(pkg => {
          devDependencies[pkg] = 'latest';
        });
      }
    }
  });

  return { dependencies, devDependencies };
}

/**
 * Get package versions - using latest stable for all packages
 * This ensures users always get the most current stable releases
 */
export function getPackageVersion() {
  // Always use latest stable version for all packages
  // This ensures compatibility and up-to-date features
  return 'latest';
}

/**
 * Validate package compatibility
 */
export function validatePackageCompatibility(dependencies) {
  const incompatibilities = [];

  // Check for known incompatibilities
  if (dependencies['styled-components'] && dependencies['tailwindcss']) {
    incompatibilities.push('styled-components and tailwindcss may conflict in styling approach');
  }

  return incompatibilities;
}