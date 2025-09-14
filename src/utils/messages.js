import chalk from 'chalk';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { version } = require('../../package.json');

export function welcomeMessage() {
  console.log(chalk.blue.bold('🚀 Build App With - Interactive Project Creator'));
  console.log(chalk.gray(`Version ${version}\n`));
  console.log('Quickly create modern web applications with your choice of:');
  console.log(chalk.cyan('  • React Apps: Next.js or Vite'));
  console.log(chalk.cyan('  • Backend APIs: Express or Fastify'));
  console.log(chalk.gray('  • Plus: TypeScript, authentication, databases, and more\n'));
}

export function successMessage(projectName) {
  console.log(chalk.green.bold(`\n🎉 Project “${projectName}” created successfully!\n`));

  console.log("What's next: ");
  console.log(chalk.cyan(`  cd ${projectName}`));
  console.log(chalk.cyan('  npm install     # Install project dependencies'));
  console.log(chalk.cyan('  npm run dev     # Start the development server'));

  console.log('\nOther useful commands:');
  console.log(chalk.gray('  npm run build     # Build for production'));
  console.log(chalk.gray('  npm start         # Start server in production mode (Next.js)'));
  console.log(chalk.gray('  npm run preview   # Preview production build (Vite)'));

  console.log(chalk.green.bold('\nHappy coding! 🚀'));
}