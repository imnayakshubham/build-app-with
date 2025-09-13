import chalk from 'chalk';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { version } = require('../../package.json');

export function welcomeMessage() {
  console.log(chalk.blue.bold('🚀 Building something cool'));
  console.log(chalk.gray(`Version ${version}\n`));
  console.log('Create modern web apps with Next.js, Vite, Express, or Fastify + your choice of features.\n');
}

export function successMessage(projectName) {
  console.log(chalk.green.bold('\n🎉 Project “' + projectName + '” created successfully!\n'));

  console.log('What’s next:');
  console.log(chalk.cyan(`  cd ${projectName}`));
  console.log(chalk.cyan('  npm install     # Install project dependencies'));
  console.log(chalk.cyan('  npm run dev     # Start the development server'));

  console.log('\nOther useful commands:');
  console.log(chalk.gray('  npm run build     # Build for production'));
  console.log(chalk.gray('  npm start         # Start server in production mode (Next.js)'));
  console.log(chalk.gray('  npm run preview   # Preview production build (Vite)'));

  console.log(chalk.green.bold('\nHappy coding! 🚀'));
}