/**
 * File generation utilities for Next.js projects
 */

import fs from 'fs-extra';
import path from 'path';
import { logger } from '../../core/logger.js';
import {
  generatePackageJsonTemplate,
  generateTsConfigTemplate,
  generateTailwindConfigTemplate,
  generatePostCssConfigTemplate,
  generateGlobalsCssTemplate,
  generateEnvTemplate,
  generateGitignoreTemplate,
  generateReadmeTemplate
} from './templates.js';

/**
 * Generate package.json file
 */
export async function generatePackageJson(projectPath, answers, dependencies, devDependencies) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJsonContent = generatePackageJsonTemplate(answers, dependencies, devDependencies);

  await fs.writeJSON(packageJsonPath, packageJsonContent, { spaces: 2 });
  logger.debug('Generated package.json');
}

/**
 * Generate TypeScript configuration
 */
export async function generateTypeScriptConfig(projectPath, answers) {
  if (!answers.typescript) return;

  const tsConfigPath = path.join(projectPath, 'tsconfig.json');
  const tsConfigContent = generateTsConfigTemplate();

  await fs.writeJSON(tsConfigPath, tsConfigContent, { spaces: 2 });
  logger.debug('Generated tsconfig.json');
}

/**
 * Generate Tailwind CSS configuration
 */
export async function generateTailwindConfig(projectPath, answers) {
  if (answers.cssFramework !== 'tailwind' && answers.cssFramework !== 'shadcn') return;

  const tailwindConfigPath = path.join(projectPath, 'tailwind.config.js');
  const tailwindConfigContent = generateTailwindConfigTemplate();

  await fs.writeFile(tailwindConfigPath, tailwindConfigContent);
  logger.debug('Generated tailwind.config.js');

  // Also generate PostCSS config
  const postCssConfigPath = path.join(projectPath, 'postcss.config.js');
  const postCssConfigContent = generatePostCssConfigTemplate();

  await fs.writeFile(postCssConfigPath, postCssConfigContent);
  logger.debug('Generated postcss.config.js');
}

/**
 * Generate global styles
 */
export async function generateGlobalStyles(projectPath, answers) {
  const stylesDir = path.join(projectPath, 'src', 'app');
  await fs.ensureDir(stylesDir);

  if (answers.cssFramework === 'tailwind' || answers.cssFramework === 'shadcn') {
    const globalsCssPath = path.join(stylesDir, 'globals.css');
    const globalsCssContent = generateGlobalsCssTemplate();
    await fs.writeFile(globalsCssPath, globalsCssContent);
    logger.debug('Generated globals.css with Tailwind imports');
  } else {
    // Generate basic global styles
    const globalsCssPath = path.join(stylesDir, 'globals.css');
    const basicGlobalsCss = `html,
body {
  padding: 0;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

* {
  box-sizing: border-box;
}

@media (prefers-color-scheme: dark) {
  html {
    color-scheme: dark;
  }

  body {
    color: white;
    background: black;
  }
}`;
    await fs.writeFile(globalsCssPath, basicGlobalsCss);
    logger.debug('Generated basic globals.css');
  }
}

/**
 * Generate environment files
 */
export async function generateEnvironmentFiles(projectPath, answers) {
  // Generate .env.local
  const envPath = path.join(projectPath, '.env.local');
  const envContent = generateEnvTemplate(answers);
  await fs.writeFile(envPath, envContent);
  logger.debug('Generated .env.local');

  // Generate .env.example
  const envExamplePath = path.join(projectPath, '.env.example');
  const envExampleContent = envContent.replace(/=.+$/gm, '=');
  await fs.writeFile(envExamplePath, envExampleContent);
  logger.debug('Generated .env.example');
}

/**
 * Generate .gitignore file
 */
export async function generateGitignore(projectPath) {
  const gitignorePath = path.join(projectPath, '.gitignore');

  // Check if .gitignore already exists (from create-next-app)
  if (await fs.pathExists(gitignorePath)) {
    logger.debug('.gitignore already exists, skipping generation');
    return;
  }

  const gitignoreContent = generateGitignoreTemplate();
  await fs.writeFile(gitignorePath, gitignoreContent);
  logger.debug('Generated .gitignore');
}

/**
 * Generate README file
 */
export async function generateReadme(projectPath, answers) {
  const readmePath = path.join(projectPath, 'README.md');
  const readmeContent = generateReadmeTemplate(answers);

  await fs.writeFile(readmePath, readmeContent);
  logger.debug('Generated README.md');
}

/**
 * Generate app layout file
 */
export async function generateAppLayout(projectPath, answers) {
  const appDir = path.join(projectPath, 'src', 'app');
  await fs.ensureDir(appDir);

  const layoutPath = path.join(appDir, `layout.${answers.typescript ? 'tsx' : 'js'}`);

  const layoutContent = `${answers.typescript ? "import type { Metadata } from 'next'" : ''}
import './globals.css'

${answers.typescript ? `
export const metadata: Metadata = {
  title: '${answers.projectName}',
  description: 'Generated with build-app-with',
}
` : ''}

export default function RootLayout({
  children,
}${answers.typescript ? ': { children: React.ReactNode }' : ''}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`;

  await fs.writeFile(layoutPath, layoutContent);
  logger.debug(`Generated app/layout.${answers.typescript ? 'tsx' : 'js'}`);
}

/**
 * Generate app page file
 */
export async function generateAppPage(projectPath, answers) {
  const appDir = path.join(projectPath, 'src', 'app');
  await fs.ensureDir(appDir);

  const pagePath = path.join(appDir, `page.${answers.typescript ? 'tsx' : 'js'}`);

  const pageContent = `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold text-center">
          Welcome to ${answers.projectName}
        </h1>
      </div>

      <div className="relative flex place-items-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">🎉 Your Next.js app is ready!</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Generated with build-app-with
          </p>
        </div>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <a
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Docs{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Find in-depth information about Next.js features and API.
          </p>
        </a>

        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Learn{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Learn about Next.js in an interactive course with&nbsp;quizzes!
          </p>
        </a>
      </div>
    </main>
  )
}`;

  await fs.writeFile(pagePath, pageContent);
  logger.debug(`Generated app/page.${answers.typescript ? 'tsx' : 'js'}`);
}