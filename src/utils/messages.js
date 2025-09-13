import chalk from 'chalk';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { version } = require('../../package.json');

export function welcomeMessage() {
  console.log(chalk.blue.bold('🚀 New React App CLI'));
  console.log(chalk.gray(`v${version}\n`));
  console.log('Create a modern React application with Vite/Next.js and your choice of features.\n');
}

export function successMessage(projectName) {
  console.log(chalk.green.bold('\n🎉 Project created successfully!\n'));

  console.log('Next steps:');
  console.log(chalk.cyan(`  cd ${projectName}`));
  console.log(chalk.cyan('  npm install  # Install additional dependencies'));
  console.log(chalk.cyan('  npm run dev  # Start development server'));

  console.log('\nOther available commands:');
  console.log(chalk.gray('  npm run build    # Build for production'));
  console.log(chalk.gray('  npm run start    # Start production server (Next.js)'));
  console.log(chalk.gray('  npm run preview  # Preview production build (Vite)'));

  console.log(chalk.green.bold('\nHappy coding! 🎨✨'));
}