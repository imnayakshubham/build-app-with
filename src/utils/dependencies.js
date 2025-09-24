import { execa } from 'execa';
import { logger } from '../core/logger.js';
import { secureExec } from './secure-exec.js';

export async function installDependencies(projectPath, answers) {
  if (!Array.isArray(answers.postSetup) || !answers.postSetup.includes('install')) {
    return;
  }

  logger.startSpinner('Installing dependencies...');

  try {
    logger.debug(`Installing dependencies in ${projectPath}`);
    // Install dependencies
    await secureExec('npm', ['install'], {
      cwd: projectPath,
      stdio: 'pipe',
      timeout: 600000 // 10 minutes for dependency installation
    });

    logger.stopSpinner(true, 'Dependencies installed successfully!');
  } catch (error) {
    logger.stopSpinner(false, 'Failed to install dependencies');
    logger.error(`Dependency installation error: ${error.message}`);
    throw error;
  }
}