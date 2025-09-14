/**
 * Streamlined Next.js project generator
 * Broken down from the original 896-line file into manageable modules
 */

import { execa } from 'execa';
import { logger } from '../../core/logger.js';
import { handleError } from '../../core/error-handler.js';
import { calculateDependencies, validatePackageCompatibility } from './dependency-manager.js';
import {
  generatePackageJson,
  generateTypeScriptConfig,
  generateTailwindConfig,
  generateGlobalStyles,
  generateEnvironmentFiles,
  generateGitignore,
  generateReadme,
  generateAppLayout,
  generateAppPage
} from './file-generator.js';

/**
 * Main Next.js project generation function
 */
export async function generateNextJSProject(projectPath, answers) {
  const spinner = logger.startSpinner('Setting up Next.js project...');

  try {
    logger.debug('Starting Next.js project generation');

    // Step 1: Create Next.js project with create-next-app
    await createNextAppBase(projectPath, answers);

    // Step 2: Calculate and validate dependencies
    const { dependencies, devDependencies } = calculateDependencies(answers);
    const incompatibilities = validatePackageCompatibility({ ...dependencies, ...devDependencies });

    if (incompatibilities.length > 0) {
      logger.warning('Potential package incompatibilities detected:');
      incompatibilities.forEach(warning => logger.warning(`  - ${warning}`));
    }

    // Step 3: Generate configuration files
    await generateProjectFiles(projectPath, answers, dependencies, devDependencies);

    // Step 4: Install additional dependencies if needed
    await installAdditionalDependencies(projectPath, dependencies, devDependencies);

    logger.stopSpinner(true, 'Next.js project generated successfully!');

    // Success message
    logger.success(`Your Next.js project "${answers.projectName}" is ready!`);
    logger.info('Next steps:');
    logger.info(`  cd ${answers.projectName}`);
    logger.info('  npm run dev');

  } catch (error) {
    logger.stopSpinner(false, 'Failed to generate Next.js project');
    handleError(error, 'Next.js project generation failed:');
  }
}

/**
 * Create the base Next.js project using create-next-app
 */
async function createNextAppBase(projectPath, answers) {
  logger.debug('Creating base Next.js project...');

  const createNextAppArgs = [
    'create-next-app@latest',
    answers.projectName,
    '--app',
    '--src-dir',
    '--import-alias', '@/*'
  ];

  // Add TypeScript flag if enabled
  if (answers.typescript) {
    createNextAppArgs.push('--typescript');
  } else {
    createNextAppArgs.push('--js');
  }

  // Add Tailwind flag if selected
  if (answers.cssFramework === 'tailwind' || answers.cssFramework === 'shadcn') {
    createNextAppArgs.push('--tailwind');
  } else {
    createNextAppArgs.push('--no-tailwind');
  }

  // Add ESLint flag (always include)
  createNextAppArgs.push('--eslint');

  try {
    await execa('npx', createNextAppArgs, {
      stdio: 'pipe',
      cwd: process.cwd()
    });

    logger.debug('Base Next.js project created');
  } catch (error) {
    throw new Error(`Failed to create Next.js project: ${error.message}`);
  }
}

/**
 * Generate all project configuration files
 */
async function generateProjectFiles(projectPath, answers, dependencies, devDependencies) {
  logger.debug('Generating project configuration files...');

  // Generate core files
  await generatePackageJson(projectPath, answers, dependencies, devDependencies);
  await generateTypeScriptConfig(projectPath, answers);
  await generateTailwindConfig(projectPath, answers);
  await generateGlobalStyles(projectPath, answers);

  // Generate app files
  await generateAppLayout(projectPath, answers);
  await generateAppPage(projectPath, answers);

  // Generate environment and config files
  await generateEnvironmentFiles(projectPath, answers);
  await generateGitignore(projectPath);
  await generateReadme(projectPath, answers);

  logger.debug('Project files generated');
}

/**
 * Install additional dependencies not included in create-next-app
 */
async function installAdditionalDependencies(projectPath, dependencies, devDependencies) {
  // Get the base packages that create-next-app already installs
  const basePackages = ['next', 'react', 'react-dom', 'eslint', 'eslint-config-next'];
  const baseTsPackages = ['typescript', '@types/node', '@types/react', '@types/react-dom'];
  const baseTailwindPackages = ['tailwindcss', 'postcss', 'autoprefixer'];

  // Filter out packages that are already installed
  const additionalDeps = Object.keys(dependencies).filter(
    pkg => !basePackages.includes(pkg) && !baseTailwindPackages.includes(pkg)
  );

  const additionalDevDeps = Object.keys(devDependencies).filter(
    pkg => !basePackages.includes(pkg) && !baseTsPackages.includes(pkg) && !baseTailwindPackages.includes(pkg)
  );

  if (additionalDeps.length === 0 && additionalDevDeps.length === 0) {
    logger.debug('No additional dependencies to install');
    return;
  }

  logger.debug('Installing additional dependencies...');

  try {
    // Install additional regular dependencies
    if (additionalDeps.length > 0) {
      await execa('npm', ['install', ...additionalDeps], {
        stdio: 'pipe',
        cwd: projectPath
      });
      logger.debug(`Installed dependencies: ${additionalDeps.join(', ')}`);
    }

    // Install additional dev dependencies
    if (additionalDevDeps.length > 0) {
      await execa('npm', ['install', '--save-dev', ...additionalDevDeps], {
        stdio: 'pipe',
        cwd: projectPath
      });
      logger.debug(`Installed dev dependencies: ${additionalDevDeps.join(', ')}`);
    }
  } catch (error) {
    logger.warning(`Failed to install some additional dependencies: ${error.message}`);
    logger.info('You may need to install them manually later');
  }
}