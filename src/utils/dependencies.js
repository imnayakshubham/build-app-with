import ora from 'ora';
import { execa } from 'execa';
import chalk from 'chalk';

export async function installDependencies(projectPath, answers) {
  if (!Array.isArray(answers.postSetup) || !answers.postSetup.includes('install')) {
    return;
  }

  const spinner = ora('Installing dependencies...').start();

  try {
    // Install dependencies
    await execa('npm', ['install'], {
      cwd: projectPath,
      stdio: 'pipe'
    });

    spinner.succeed('Dependencies installed successfully!');
  } catch (error) {
    spinner.fail('Failed to install dependencies');
    console.error(chalk.red('Error:'), error.message);
    throw error;
  }
}