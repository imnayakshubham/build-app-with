import fs from 'fs-extra';
import path from 'path';
import { getOverlayDependencies } from '../package-json-generator.js';
import { generateTailwindConfig } from '../vite/tailwind-config-generator.js';
import { generateProjectFiles } from '../vite/file-generator.js';
import { generateESLintConfig } from '../vite/eslint-config-generator.js';
import { generatePrettierConfig } from '../vite/prettier-config-generator.js';
import { generateCreditsSection, generateReactCreditsComponent } from '../../utils/credits.js';
import { secureExec, sanitizeRsbuildArgs } from '../../utils/secure-exec.js';
import { logger } from '../../core/logger.js';

/**
 * Create the base Rsbuild project using create-rsbuild CLI
 */
export async function createRsbuildBase(projectPath, answers) {
  logger.debug('Creating base Rsbuild project...');

  try {
    const sanitizedArgs = sanitizeRsbuildArgs(answers.projectName, {
      typescript: true // Rsbuild always uses TypeScript
    });

    await secureExec('npx', sanitizedArgs, {
      stdio: 'pipe',
      cwd: process.cwd(),
      timeout: 300000 // 5 minutes
    });

    logger.debug('Base Rsbuild project created');
  } catch (error) {
    throw new Error(`Failed to create Rsbuild project: ${error.message}`);
  }
}

/**
 * Overlay customizations onto a scaffolded Rsbuild project.
 * Assumes create-rsbuild has already run and created the base project.
 * Reuses Vite file generators since the React code is build-tool agnostic.
 */
export async function generateRsbuildProject(projectPath, answers) {
  // Merge overlay dependencies into the scaffold's package.json
  await mergeOverlayDependencies(projectPath, answers);

  // Generate rsbuild.config.ts (always TypeScript)
  await generateRsbuildConfig(projectPath, answers);

  // Generate Tailwind config if needed
  if (answers.cssFramework === 'tailwind') {
    const tailwindConfig = generateTailwindConfig(answers);
    await fs.writeFile(path.join(projectPath, 'tailwind.config.js'), tailwindConfig);
  }

  // Generate ESLint config if requested
  if (answers.eslint) {
    const eslintConfig = generateESLintConfig(answers);
    await fs.writeJSON(path.join(projectPath, '.eslintrc.json'), eslintConfig, { spaces: 2 });
  }

  // Generate Prettier config if requested
  if (answers.prettier) {
    const prettierConfig = generatePrettierConfig();
    await fs.writeJSON(path.join(projectPath, '.prettierrc'), prettierConfig, { spaces: 2 });
  }

  // Remove default create-rsbuild assets we'll replace
  await removeDefaultAssets(projectPath);

  // Generate project files (overlay mode - reuses Vite file generators)
  await generateProjectFiles(projectPath, answers, { overlay: true });

  // Generate Clerk authentication if selected
  if (answers.authStrategy === 'clerk') {
    await generateClerkAuth(projectPath, answers);
  }

  // Generate .env.example (Rsbuild uses PUBLIC_ prefix)
  await generateEnvExample(projectPath, answers);

  // Generate README (Rsbuild-specific)
  await generateReadme(projectPath, answers);

  // Generate credits component
  await generateCreditsComponent(projectPath, answers);
}

/**
 * Read the scaffold's package.json and merge in overlay dependencies
 */
async function mergeOverlayDependencies(projectPath, answers) {
  const pkgPath = path.join(projectPath, 'package.json');
  const existingPkg = await fs.readJSON(pkgPath);
  const overlay = getOverlayDependencies(answers);

  existingPkg.dependencies = {
    ...(existingPkg.dependencies || {}),
    ...overlay.dependencies
  };

  existingPkg.devDependencies = {
    ...(existingPkg.devDependencies || {}),
    ...overlay.devDependencies
  };

  await fs.writeJSON(pkgPath, existingPkg, { spaces: 2 });
}

/**
 * Generate rsbuild.config.ts with project settings
 */
async function generateRsbuildConfig(projectPath, answers) {
  const config = `import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './src/main.tsx'
    }
  },
  server: {
    port: 3000,
    open: true
  },
  output: {
    sourceMap: true
  }
});
`;

  await fs.writeFile(path.join(projectPath, 'rsbuild.config.ts'), config);
}

/**
 * Remove default create-rsbuild assets that we'll replace with our own
 */
async function removeDefaultAssets(projectPath) {
  const filesToRemove = [
    path.join(projectPath, 'src', 'index.tsx'),
    path.join(projectPath, 'src', 'App.css'),
    path.join(projectPath, 'src', 'App.tsx')
  ];

  for (const filePath of filesToRemove) {
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }
  }
}

async function generateReadme(projectPath, answers) {
  const selectedFeatures = Array.isArray(answers.features) ? answers.features : [];
  const allFeatures = [...selectedFeatures];
  if (answers.authStrategy && answers.authStrategy !== 'none') {
    allFeatures.push(answers.authStrategy);
  }
  if (answers.typescript) {
    allFeatures.push('typescript');
  }

  const credits = generateCreditsSection('rsbuild-react', allFeatures);

  const readme = `# ${answers.projectName}

A React application built with Rsbuild and ${answers.cssFramework === 'vanilla' ? 'vanilla CSS' : answers.cssFramework}.

## Features

- \u26A1\uFE0F Rsbuild (Rspack) for fast development and building
- \u269B\uFE0F React + TypeScript
- \uD83C\uDFA8 ${answers.cssFramework === 'vanilla' ? 'Vanilla CSS' : answers.cssFramework}
${answers.authStrategy && answers.authStrategy !== 'none' ? `- \uD83D\uDD10 ${answers.authStrategy === 'clerk' ? 'Clerk Authentication' : answers.authStrategy}` : ''}
${selectedFeatures.length > 0 ? `- \uD83D\uDCE6 Additional packages: ${selectedFeatures.join(', ')}` : ''}

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Build for production:
   \`\`\`bash
   npm run build
   \`\`\`

## Project Structure

This project uses a ${answers.projectStructure || 'simple'} structure for better organization and maintainability.

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build

${answers.authStrategy === 'clerk' ? `
## \uD83D\uDD10 Clerk Authentication Setup

1. Sign up at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your API keys to \`.env.local\`:
   \`\`\`bash
   PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXX
   \`\`\`

   \u26A0\uFE0F  **Security Warning**: Never commit real API keys to version control!
4. Configure your authentication settings in the Clerk dashboard
` : ''}

## License

MIT

${credits}
`;

  await fs.writeFile(path.join(projectPath, 'README.md'), readme);
}

async function generateClerkAuth(projectPath, answers) {
  const srcDir = path.join(projectPath, 'src');
  await fs.ensureDir(srcDir);

  // Generate Clerk provider (uses PUBLIC_ prefix for Rsbuild)
  const clerkProvider = `import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';

const CLERK_PUBLISHABLE_KEY = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

export function ClerkProviderWrapper({ children }) {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      {children}
    </ClerkProvider>
  );
}
`;

  await fs.ensureDir(path.join(srcDir, 'components'));
  await fs.writeFile(path.join(srcDir, 'components', 'ClerkProvider.jsx'), clerkProvider);

  // Generate auth components
  const signInComponent = `import React from 'react';
import { SignIn } from '@clerk/clerk-react';

export function SignInForm() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn />
    </div>
  );
}
`;

  const signUpComponent = `import React from 'react';
import { SignUp } from '@clerk/clerk-react';

export function SignUpForm() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp />
    </div>
  );
}
`;

  const userButtonComponent = `import React from 'react';
import { UserButton } from '@clerk/clerk-react';

export function UserProfile() {
  return (
    <div className="flex items-center gap-4">
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}
`;

  await fs.writeFile(path.join(srcDir, 'components', 'SignInForm.jsx'), signInComponent);
  await fs.writeFile(path.join(srcDir, 'components', 'SignUpForm.jsx'), signUpComponent);
  await fs.writeFile(path.join(srcDir, 'components', 'UserProfile.jsx'), userButtonComponent);
}

async function generateEnvExample(projectPath, answers) {
  let envContent = `# API Configuration
PUBLIC_API_URL=http://localhost:3000/api
`;

  if (answers.authStrategy === 'clerk') {
    envContent += `
# Clerk Authentication
# WARNING: Replace with your actual Clerk API keys from https://clerk.com
# Never commit real API keys to version control!
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXX
`;
  } else if (answers.authStrategy === 'auth0') {
    envContent += `
# Auth0 Configuration
PUBLIC_AUTH0_DOMAIN=your-tenant.auth0.com
PUBLIC_AUTH0_CLIENT_ID=your-client-id
`;
  } else if (answers.authStrategy === 'firebase-auth') {
    envContent += `
# Firebase Configuration
PUBLIC_FIREBASE_API_KEY=your-api-key
PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your-project-id
`;
  }

  await fs.writeFile(path.join(projectPath, '.env.example'), envContent);
}

async function generateCreditsComponent(projectPath, answers) {
  const srcDir = path.join(projectPath, 'src');
  await fs.ensureDir(path.join(srcDir, 'components'));

  const selectedFeatures = Array.isArray(answers.features) ? answers.features : [];
  const allFeatures = [...selectedFeatures];
  if (answers.authStrategy && answers.authStrategy !== 'none') {
    allFeatures.push(answers.authStrategy);
  }
  if (answers.typescript) {
    allFeatures.push('typescript');
  }

  const creditsComponent = generateReactCreditsComponent('rsbuild-react', allFeatures);
  await fs.writeFile(path.join(srcDir, 'components', 'Credits.jsx'), creditsComponent);
}
