import fs from 'fs-extra';
import path from 'path';
import { execa } from 'execa';
import ora from 'ora';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { getFeaturePrompts, getPrompts, postSetupPrompts, finalizeAnswers } from '../../prompts/index.js';
import { creditString } from '../../constants/index.js';
import { generateCreditsSection, generateReactCreditsComponent } from '../../utils/credits.js';

// Centralized feature to npm package mapping for dependencies and devDependencies
const featurePackageMap = {
  'nextauth': { deps: ['next-auth'] },
  'clerk': { deps: ['@clerk/nextjs'] },
  'auth0': { deps: ['@auth0/nextjs-auth0'] },
  'firebase-auth': { deps: ['firebase'] },
  'prisma': { deps: ['@prisma/client'], devDeps: ['prisma'] },
  'trpc': { deps: ['@trpc/client', '@trpc/server', '@trpc/react-query', '@trpc/next'] },
  'zustand': { deps: ['zustand'] },
  'hook-form': { deps: ['react-hook-form'] },
  'axios': { deps: ['axios'] },
  'tanstack-query': { deps: ['@tanstack/react-query'] },
  'react-query': { deps: ['@tanstack/react-query'] },
  'framer-motion': { deps: ['framer-motion'] },
  'react-icons': { deps: ['react-icons'] },
  // Add other feature mappings as needed
};

// CSS framework dependencies mapping
const cssFrameworkPackages = {
  'styled-components': { deps: ['styled-components'], devDepsForTS: ['@types/styled-components'] },
  'sass': { devDeps: ['sass'] },
  'shadcn': {
    devDeps: ['tailwindcss'],
    deps: ['class-variance-authority', 'clsx', 'tailwind-merge', 'lucide-react', '@radix-ui/react-slot'],
  },
  'tailwind': { devDeps: ['tailwindcss'] },
};

// Entry function to generate and customize Next.js project
export async function generateNextJSProject(projectPath, rawAnswers) {
  const spinner = ora({
    text: 'Setting up Next.js project...',
    discardStdin: false
  }).start();

  try {
    let answers = finalizeAnswers(rawAnswers);

    const createNextAppArgs = ['create-next-app@latest', answers.projectName];

    if (answers.setupType === 'default') {
      answers.cssFramework = answers.cssFramework || 'tailwind';
      createNextAppArgs.push('--yes');
    }

    if (answers.setupType !== 'default' && answers.typescript) {
      createNextAppArgs.push('--typescript');
    }

    spinner.stop();

    // Ask about additional features
    const { allowCustomFeatures } = await inquirer.prompt({
      type: 'confirm',
      name: 'allowCustomFeatures',
      message: 'Would you like to add additional features?',
      default: false,
    });
    answers.allowCustomFeatures = allowCustomFeatures;
    answers.selectedFeatures = [];

    if (allowCustomFeatures) {
      const featurePrompts = getFeaturePrompts(answers);
      if (featurePrompts.length > 0) {
        const featureAnswers = await inquirer.prompt(featurePrompts, answers);
        for (const value of Object.values(featureAnswers)) {
          if (Array.isArray(value)) {
            answers.selectedFeatures.push(...value);
          } else if (typeof value === 'string' && value) {
            answers.selectedFeatures.push(value);
          }
        }
      }
    }

    // Ask to enable next-themes for supported CSS frameworks
    if (['tailwind', 'shadcn'].includes(answers.cssFramework)) {
      const { enableNextThemes } = await inquirer.prompt({
        type: 'confirm',
        name: 'enableNextThemes',
        message: 'Enable theme switching with next-themes?',
        default: true,
      });
      answers.nextThemes = enableNextThemes;
    }

    const customizingSpinner = ora({
      text: 'Customizing Next.js project...',
      discardStdin: false
    }).start();


    console.log('Running create-next-app with arguments:', createNextAppArgs.join(' '));

    await customizeNextJSProject(createNextAppArgs, projectPath, answers);

    customizingSpinner.succeed('Next.js project created and customized!');
    // Stop spinner before prompting
    ora().stop();

    // Post setup prompt
    const postSetup = postSetupPrompts(answers);
    const postSetupResult = await inquirer.prompt(postSetup, answers);
    answers.postSetup = postSetupResult.postSetup || [];
  } catch (error) {
    ora().fail('Failed to create Next.js project');
    console.error(chalk.red('Error:'), error);
    throw error;
  }
}

// Fetch npm package latest version or fallback to "latest"
async function getLatestVersion(pkg) {
  try {
    const { stdout } = await execa('npm', ['view', pkg, 'version']);
    return stdout.trim();
  } catch {
    console.warn(chalk.yellow(`Warning: Could not fetch version for ${pkg}, using "latest" tag instead.`));
    return 'latest';
  }
}

// Customize project after initial create-next-app run
export async function customizeNextJSProject(createNextAppArgs, projectPath, answers) {
  const pkgPath = path.join(projectPath, 'package.json');

  // Run create-next-app command (wait fully)
  await execa('npx', createNextAppArgs, {
    cwd: path.dirname(projectPath),
    stdio: 'inherit',
  });

  if (!(await fs.pathExists(pkgPath))) {
    throw new Error('package.json not found after create-next-app execution');
  }

  const pkgJson = await fs.readJSON(pkgPath);

  const additionalDeps = {};
  const additionalDevDeps = {};

  const depsToFetch = new Set();
  const devDepsToFetch = new Set();

  for (const feature of answers.selectedFeatures || []) {
    const pkgInfo = featurePackageMap[feature];
    if (pkgInfo?.deps) pkgInfo.deps.forEach(dep => depsToFetch.add(dep));
    if (pkgInfo?.devDeps) pkgInfo.devDeps.forEach(devDep => devDepsToFetch.add(devDep));
  }

  const cssPkgInfo = cssFrameworkPackages[answers.cssFramework];
  if (cssPkgInfo?.deps) cssPkgInfo.deps.forEach(dep => depsToFetch.add(dep));
  if (cssPkgInfo?.devDeps) cssPkgInfo.devDeps.forEach(devDep => devDepsToFetch.add(devDep));
  if (answers.typescript && cssPkgInfo?.devDepsForTS) {
    cssPkgInfo.devDepsForTS.forEach(devDep => devDepsToFetch.add(devDep));
  }

  if (answers.nextThemes) {
    depsToFetch.add('next-themes');
  }

  // Fetch all versions in parallel
  const fetchVersions = async (pkgs) => {
    const results = await Promise.all(
      Array.from(pkgs).map(async (pkg) => [pkg, `^${await getLatestVersion(pkg)}`])
    );
    return Object.fromEntries(results);
  };

  Object.assign(additionalDeps, await fetchVersions(depsToFetch));
  Object.assign(additionalDevDeps, await fetchVersions(devDepsToFetch));

  pkgJson.dependencies = { ...pkgJson.dependencies, ...additionalDeps };
  pkgJson.devDependencies = { ...pkgJson.devDependencies, ...additionalDevDeps };

  await fs.writeJSON(pkgPath, pkgJson, { spaces: 2 });

  // Install dependencies with spinner
  const spinner = ora({
    text: 'Installing dependencies...',
    discardStdin: false
  }).start();
  try {
    await execa('npm', ['install'], { cwd: projectPath, stdio: 'inherit' });
    spinner.succeed('Dependencies installed successfully!');
  } catch (err) {
    spinner.fail('Failed to install dependencies');
    console.error(chalk.red('Error during npm install:'), err.message);
    throw err;
  }

  // Setup selected features
  await setupFeatureIntegrations(projectPath, answers);

  // Setup authentication if selected
  if (answers.authStrategy && answers.authStrategy !== 'none') {
    await setupAuthentication(projectPath, answers);
  }

  // Customize main page
  await customizeMainPage(projectPath, answers);

  // Generate credits component
  await generateCreditsComponent(projectPath, answers);

  // Update README with credits
  await updateReadmeWithCredits(projectPath, answers);

  // Add extra feature-specific config/files
  await addNextJSFeatures(projectPath, answers);

  // Stop any spinner before prompts
  ora().stop();

  // Post-setup prompt handled in generateNextJSProject
}

// Customize main page based on router type
async function customizeMainPage(projectPath, answers) {
  const candidates = [
    path.join(projectPath, 'app', 'page.tsx'),
    path.join(projectPath, 'app', 'page.jsx'),
    path.join(projectPath, 'src', 'app', 'page.tsx'),
    path.join(projectPath, 'src', 'app', 'page.jsx'),
    path.join(projectPath, 'src', 'pages', 'index.tsx'),
    path.join(projectPath, 'src', 'pages', 'index.jsx'),
    path.join(projectPath, 'pages', 'index.tsx'),
    path.join(projectPath, 'pages', 'index.jsx'),
  ];
  let mainPagePath = '';
  for (const f of candidates) {
    if (await fs.pathExists(f)) {
      mainPagePath = f;
      break;
    }
  }
  if (!mainPagePath) {
    const ext = answers.typescript ? 'tsx' : 'jsx';
    mainPagePath = path.join(projectPath, 'app', `page.${ext}`);
    await fs.ensureDir(path.dirname(mainPagePath));
  }

  const useAppRouter = mainPagePath.includes(`${path.sep}app${path.sep}`);
  const content = useAppRouter
    ? generateAppRouterPage(answers)
    : generatePagesRouterPage(answers);

  await fs.writeFile(mainPagePath, content, 'utf8');
}

function generateAppRouterPage(answers) {
  const featuresGrid = (answers.selectedFeatures || []).map(f => `
    <div className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
      <div className="text-3xl mb-3">🔧</div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">${f}</h3>
      <p className="text-gray-600">Additional feature</p>
    </div>`).join('');

  return `import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to ${answers.projectName}
          </h1>
          <p className="text-xl text-gray-600">Built with Next.js</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Next.js</h3>
            <p className="text-gray-600">Full-stack React framework</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">${answers.cssFramework}</h3>
            <p className="text-gray-600">Styling solution</p>
          </div>
          ${featuresGrid}
        </div>
        <div className="text-center mt-8">
          <p className="text-gray-600">${creditString('nextjs')}</p>
        </div>
      </div>
    </main>
  );
}
`;
}

function generatePagesRouterPage(answers) {
  const featuresGrid = (answers.selectedFeatures || []).map(f => `
    <div className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
      <div className="text-3xl mb-3">🔧</div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">${f}</h3>
      <p className="text-gray-600">Additional feature</p>
    </div>`).join('');

  return `import React from 'react';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>${answers.projectName}</title>
        <meta name="description" content="Generated by create-app-with" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Welcome to ${answers.projectName}
            </h1>
            <p className="text-xl text-gray-600">Built with Next.js (Pages Router)</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Next.js</h3>
              <p className="text-gray-600">Full-stack React framework</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">${answers.cssFramework}</h3>
              <p className="text-gray-600">Styling solution</p>
            </div>
            ${featuresGrid}
          </div>
          <div className="text-center mt-8">
            <p className="text-gray-600">Start building something amazing! 🚀</p>
          </div>
        </div>
      </main>
    </>
  );
}
`;
}

// Add feature specific config and scaffolding
async function addNextJSFeatures(projectPath, answers) {
  if ((answers.selectedFeatures || []).includes('prisma')) {
    await generatePrismaConfig(projectPath);
  }
  if ((answers.selectedFeatures || []).includes('nextauth')) {
    await generateNextAuthConfig(projectPath, answers.typescript);
  }
  if ((answers.selectedFeatures || []).includes('trpc')) {
    await generateTRPCConfig(projectPath, answers.typescript);
  }
}

async function generatePrismaConfig(projectPath) {
  const prismaDir = path.join(projectPath, 'prisma');
  await fs.ensureDir(prismaDir);
  const schema = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema
generator client {
  provider = "prisma-client-js"
}
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}
model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int
}
`;
  await fs.writeFile(path.join(prismaDir, 'schema.prisma'), schema);
  const envPath = path.join(projectPath, '.env.local');
  const envContent = `# Database
DATABASE_URL="file:./dev.db"
`;
  await fs.writeFile(envPath, envContent);
}

async function generateNextAuthConfig(projectPath, useTS) {
  const ext = useTS ? 'ts' : 'js';
  const authConfig = `import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
  ],
});
`;
  const authDir = path.join(projectPath, 'pages', 'api', 'auth');
  await fs.ensureDir(authDir);
  await fs.writeFile(path.join(authDir, `[...nextauth].${ext}`), authConfig);
}

async function generateTRPCConfig(projectPath, useTS) {
  const ext = useTS ? 'ts' : 'js';
  const serverDir = path.join(projectPath, 'server');
  await fs.ensureDir(serverDir);
  const trpcRouter = `import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

export const appRouter = t.router({
  hello: t.procedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: \`Hello \${input.text}\`,
      };
    }),
});

export type AppRouter = typeof appRouter;
`;
  await fs.writeFile(path.join(serverDir, `index.${ext}`), trpcRouter);
}

// Feature integration - react-query, axios interceptor, shadcn, next-themes
async function setupFeatureIntegrations(projectPath, answers) {
  const isAppRouter = await detectAppRouter(projectPath);

  if ((answers.selectedFeatures || []).some(f => ['tanstack-query', 'react-query'].includes(f))) {
    await setupReactQuery(projectPath, answers, isAppRouter);
    await setupAxiosInterceptor(projectPath, answers);
  }
  if (answers.selectedFeatures.includes('shadcn')) {
    await setupShadcn(projectPath, answers, isAppRouter);
  }
  if (answers.nextThemes) {
    await setupNextThemes(projectPath, answers, isAppRouter);
  }
}

/** Detect if app router is enabled */
async function detectAppRouter(projectPath) {
  return (await fs.pathExists(path.join(projectPath, 'app'))) || (await fs.pathExists(path.join(projectPath, 'src', 'app')));
}

async function setupReactQuery(projectPath, answers, isAppRouter) {
  const ext = answers.typescript ? 'tsx' : 'jsx';

  if (isAppRouter) {
    const appDir = await getAppDirectory(projectPath);
    const providersPath = path.join(appDir, `providers.${ext}`);

    if (!(await fs.pathExists(providersPath))) {
      const content = `"use client";
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
`;
      await fs.writeFile(providersPath, content);
    }

    const layoutPath = path.join(appDir, `layout.${ext}`);
    if (await fs.pathExists(layoutPath)) {
      let layoutContent = await fs.readFile(layoutPath, 'utf8');
      if (!layoutContent.includes("from './providers'")) {
        layoutContent = layoutContent.replace(/(^import .*\n)/, `$1import Providers from './providers'\n`);
      }
      if (layoutContent.includes('{children}') && !layoutContent.includes('<Providers>')) {
        layoutContent = layoutContent.replace('{children}', '<Providers>{children}</Providers>');
      }
      await fs.writeFile(layoutPath, layoutContent);
    }
  } else {
    // pages router
    const pagesDir = (await fs.pathExists(path.join(projectPath, 'src', 'pages'))) ? path.join(projectPath, 'src', 'pages') : path.join(projectPath, 'pages');
    const appPath = path.join(pagesDir, `_app.${ext}`);

    const content = `import React from 'react';
import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}
`;
    await fs.writeFile(appPath, content);
  }
}

async function setupAxiosInterceptor(projectPath, answers) {
  const ext = answers.typescript ? 'ts' : 'js';
  const libDir = path.join(projectPath, "src", 'lib');
  await fs.ensureDir(libDir);
  const file = path.join(libDir, `axios.${ext}`);

  const content = `import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  // Add auth token here if needed
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    return Promise.reject(error);
  }
);

export default api;
`;

  await fs.writeFile(file, content);
}

async function setupShadcn(projectPath, answers, isAppRouter) {
  const spinner = ora('Initializing shadcn UI...').start();
  try {
    await execa('npx', ['shadcn@latest', 'init'], {
      cwd: projectPath,
      stdio: 'inherit',
    });

    spinner.succeed('shadcn UI initialized successfully!');
  } catch (error) {
    spinner.fail('Failed to initialize shadcn UI');
    console.error(chalk.red('Error setting up shadcn UI:'), error);
    throw error;
  }
}

async function setupNextThemes(projectPath, answers, isAppRouter) {
  const ext = answers.typescript ? 'tsx' : 'jsx';

  if (isAppRouter) {
    const appDir = await getAppDirectory(projectPath);
    const themeDir = path.join(appDir, 'components', 'Theme');
    await fs.ensureDir(themeDir);

    // Providers component
    const providersPath = path.join(themeDir, `Providers.${ext}`);
    if (await fs.pathExists(providersPath)) {
      let content = await fs.readFile(providersPath, 'utf8');
      if (!content.includes('next-themes')) {
        content = content.replace(/(^import .*\n)/, `$1import { ThemeProvider } from 'next-themes'\n`);
      }
      if (content.includes('{children}') && !content.includes('ThemeProvider')) {
        content = content.replace(
          '{children}',
          '<ThemeProvider attribute="class" defaultTheme="system" enableSystem>{children}</ThemeProvider>'
        );
      }
      await fs.writeFile(providersPath, content);
    } else {
      const newContent = `"use client";
import React from 'react';
import { ThemeProvider } from 'next-themes';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
`;
      await fs.writeFile(providersPath, newContent);
    }

    // ThemeToggle component
    const themeTogglePath = path.join(themeDir, `ThemeToggle.${ext}`);
    const themeToggleContent = `"use client";
import React from 'react';
import { useTheme } from 'next-themes';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
      aria-label="Toggle theme"
    >
      Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
    </button>
  );
}
`;
    await fs.writeFile(themeTogglePath, themeToggleContent);

    // Modify layout to use Providers
    const layoutPath = path.join(appDir, `layout.${ext}`);
    if (await fs.pathExists(layoutPath)) {
      let layoutContent = await fs.readFile(layoutPath, 'utf8');
      if (!layoutContent.includes("from './components/Theme/Providers'")) {
        layoutContent = layoutContent.replace(/(^import .*\n)/, `$1import Providers from './components/Theme/Providers'\n`);
      }
      if (layoutContent.includes('{children}') && !layoutContent.includes('<Providers>')) {
        layoutContent = layoutContent.replace('{children}', '<Providers>{children}</Providers>');
      }
      await fs.writeFile(layoutPath, layoutContent);
    }
  } else {
    // pages router _app.{tsx,jsx}
    const pagesDir = (await fs.pathExists(path.join(projectPath, 'src', 'pages'))) ? path.join(projectPath, 'src', 'pages') : path.join(projectPath, 'pages');
    const appPath = path.join(pagesDir, `_app.${ext}`);
    let content = '';
    if (await fs.pathExists(appPath)) {
      content = await fs.readFile(appPath, 'utf8');
      if (!content.includes('next-themes')) {
        content = content.replace(/^import .*\n/, (str) => str + 'import { ThemeProvider } from \'next-themes\'\n');
      }
      if (content.includes('<Component') && !content.includes('ThemeProvider')) {
        content = content.replace(
          '<Component',
          '<ThemeProvider attribute="class" defaultTheme="system" enableSystem>\n      <Component'
        );
        content = content.replace(
          '/>\n    </QueryClientProvider>',
          '/>\n    </ThemeProvider>\n    </QueryClientProvider>'
        );
        content = content.replace(
          '/>\n  );',
          '/>\n    </ThemeProvider>\n  );'
        );
      }
    } else {
      content = `import '../styles/globals.css';
import { ThemeProvider } from 'next-themes';

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
`;
    }
    await fs.writeFile(appPath, content);
  }
}

async function getAppDirectory(projectPath) {
  const candidates = [path.join(projectPath, 'app'), path.join(projectPath, 'src', 'app')];
  for (const candidate of candidates) {
    if (await fs.pathExists(candidate)) {
      return candidate;
    }
  }
  throw new Error('App directory not found');
}

// Setup authentication based on selected strategy
async function setupAuthentication(projectPath, answers) {
  const isAppRouter = await locateAppDirectory(projectPath);

  if (answers.authStrategy === 'clerk') {
    await setupClerkAuth(projectPath, answers, isAppRouter);
  } else if (answers.authStrategy === 'nextauth') {
    await setupNextAuth(projectPath, answers, isAppRouter);
  } else if (answers.authStrategy === 'auth0') {
    await setupAuth0(projectPath, answers, isAppRouter);
  }
}

// Setup Clerk authentication
async function setupClerkAuth(projectPath, answers, isAppRouter) {
  const appDir = isAppRouter ? 'app' : 'pages';
  const srcAppDir = path.join(projectPath, 'src', appDir);
  const appDirPath = path.join(projectPath, appDir);
  const targetDir = await fs.pathExists(srcAppDir) ? srcAppDir : appDirPath;

  // Create middleware for Clerk
  const middleware = `import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({
  publicRoutes: ["/", "/api/webhooks(.*)"],
});
 
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
`;

  await fs.writeFile(path.join(projectPath, 'middleware.ts'), middleware);

  // Create layout with Clerk provider
  const layoutPath = path.join(targetDir, 'layout.tsx');
  const existingLayout = await fs.readFile(layoutPath, 'utf8');

  const updatedLayout = existingLayout.replace(
    'import type { Metadata } from "next";',
    `import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';`
  ).replace(
    '<html lang="en">',
    `<ClerkProvider>
    <html lang="en">`
  ).replace(
    '</body>\n</html>',
    `</body>
    </html>
  </ClerkProvider>`
  );

  await fs.writeFile(layoutPath, updatedLayout);

  // Create auth components
  const componentsDir = path.join(projectPath, 'components');
  await fs.ensureDir(componentsDir);

  const signInComponent = `import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn />
    </div>
  );
}
`;

  const signUpComponent = `import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp />
    </div>
  );
}
`;

  const userButtonComponent = `import { UserButton } from '@clerk/nextjs';

export function UserProfile() {
  return (
    <div className="flex items-center gap-4">
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}
`;

  await fs.writeFile(path.join(componentsDir, 'SignInForm.tsx'), signInComponent);
  await fs.writeFile(path.join(componentsDir, 'SignUpForm.tsx'), signUpComponent);
  await fs.writeFile(path.join(componentsDir, 'UserProfile.tsx'), userButtonComponent);

  // Create auth pages
  const signInPage = path.join(targetDir, 'sign-in', 'page.tsx');
  const signUpPage = path.join(targetDir, 'sign-up', 'page.tsx');

  await fs.ensureDir(path.dirname(signInPage));
  await fs.ensureDir(path.dirname(signUpPage));

  await fs.writeFile(signInPage, signInComponent);
  await fs.writeFile(signUpPage, signUpComponent);

  // Create .env.local example
  const envExample = `# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
CLERK_SECRET_KEY=your_secret_key_here
`;

  await fs.writeFile(path.join(projectPath, '.env.local.example'), envExample);
}

// Setup NextAuth.js authentication
async function setupNextAuth(projectPath, answers, isAppRouter) {
  // NextAuth setup would go here
  console.log('Setting up NextAuth.js...');
}

// Setup Auth0 authentication
async function setupAuth0(projectPath, answers, isAppRouter) {
  // Auth0 setup would go here
  console.log('Setting up Auth0...');
}

// Generate credits component
async function generateCreditsComponent(projectPath, answers) {
  const componentsDir = path.join(projectPath, 'components');
  await fs.ensureDir(componentsDir);

  const selectedFeatures = Array.isArray(answers.selectedFeatures) ? answers.selectedFeatures : [];
  const allFeatures = [...selectedFeatures];
  if (answers.authStrategy && answers.authStrategy !== 'none') {
    allFeatures.push(answers.authStrategy);
  }
  if (answers.typescript) {
    allFeatures.push('typescript');
  }
  if (answers.cssFramework) {
    allFeatures.push(answers.cssFramework);
  }

  const creditsComponent = generateReactCreditsComponent('nextjs', allFeatures);
  await fs.writeFile(path.join(componentsDir, 'Credits.tsx'), creditsComponent);
}

// Update README with credits
async function updateReadmeWithCredits(projectPath, answers) {
  const readmePath = path.join(projectPath, 'README.md');

  if (await fs.pathExists(readmePath)) {
    let readmeContent = await fs.readFile(readmePath, 'utf8');

    // Check if credits are already added
    if (!readmeContent.includes('## 🙏 Credits & How This App Was Created')) {
      const selectedFeatures = Array.isArray(answers.selectedFeatures) ? answers.selectedFeatures : [];
      const allFeatures = [...selectedFeatures];
      if (answers.authStrategy && answers.authStrategy !== 'none') {
        allFeatures.push(answers.authStrategy);
      }
      if (answers.typescript) {
        allFeatures.push('typescript');
      }
      if (answers.cssFramework) {
        allFeatures.push(answers.cssFramework);
      }

      const credits = generateCreditsSection('nextjs', allFeatures);

      // Add credits before the last line
      readmeContent = readmeContent.trim() + '\n\n' + credits;

      await fs.writeFile(readmePath, readmeContent);
    }
  }
}

async function locateGlobalsCss(projectPath, isAppRouter) {
  if (isAppRouter) {
    const candidates = [
      path.join(projectPath, 'app', 'globals.css'),
      path.join(projectPath, 'src', 'app', 'globals.css'),
    ];
    for (const c of candidates) {
      if (await fs.pathExists(c)) return c;
    }
    return candidates[0];
  } else {
    const candidates = [
      path.join(projectPath, 'src', 'styles', 'globals.css'),
      path.join(projectPath, 'styles', 'globals.css'),
    ];
    for (const c of candidates) {
      if (await fs.pathExists(c)) return c;
    }
    return candidates[0];
  }
}
