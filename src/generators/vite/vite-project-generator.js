import fs from 'fs-extra';
import path from 'path';
import { generatePackageJson, getOverlayDependencies } from '../package-json-generator.js';
import { generateTailwindConfig } from './tailwind-config-generator.js';
import { generateProjectFiles } from './file-generator.js';
import { generateESLintConfig } from './eslint-config-generator.js';
import { generatePrettierConfig } from './prettier-config-generator.js';
import { generateCreditsSection, generateReactCreditsComponent } from '../../utils/credits.js';
import { secureExec, sanitizeViteArgs } from '../../utils/secure-exec.js';
import { logger } from '../../core/logger.js';

/**
 * Create the base Vite project using create-vite CLI
 */
export async function createViteBase(projectPath, answers) {
  logger.debug('Creating base Vite project...');

  try {
    const sanitizedArgs = sanitizeViteArgs(answers.projectName, {
      typescript: answers.typescript !== false // default to true
    });

    await secureExec('npx', sanitizedArgs, {
      stdio: 'pipe',
      cwd: process.cwd(),
      timeout: 300000 // 5 minutes
    });

    logger.debug('Base Vite project created');
  } catch (error) {
    throw new Error(`Failed to create Vite project: ${error.message}`);
  }
}

/**
 * Overlay customizations onto a scaffolded Vite project.
 * Assumes create-vite has already run and created the base project.
 */
export async function generateViteProject(projectPath, answers) {
  // Merge overlay dependencies into the scaffold's package.json
  await mergeOverlayDependencies(projectPath, answers);

  // Generate Tailwind config if needed
  if (answers.cssFramework === 'tailwind') {
    const tailwindConfig = generateTailwindConfig(answers);
    await fs.writeFile(path.join(projectPath, 'tailwind.config.js'), tailwindConfig);
  }

  // Generate ESLint config if requested (ignored per user, leave gate)
  if (answers.eslint) {
    const eslintConfig = generateESLintConfig(answers);
    await fs.writeJSON(path.join(projectPath, '.eslintrc.json'), eslintConfig, { spaces: 2 });
  }

  // Generate Prettier config if requested (ignored per user)
  if (answers.prettier) {
    const prettierConfig = generatePrettierConfig();
    await fs.writeJSON(path.join(projectPath, '.prettierrc'), prettierConfig, { spaces: 2 });
  }

  // Remove default create-vite assets we'll replace
  await removeDefaultAssets(projectPath);

  // Generate project files (overlay mode - skips public files)
  await generateProjectFiles(projectPath, answers, { overlay: true });

  // Generate Clerk authentication if selected
  if (answers.authStrategy === 'clerk') {
    await generateClerkAuth(projectPath, answers);
  }

  // Generate .env.example with API URL placeholder
  await generateEnvExample(projectPath, answers);

  // Generate README (replaces create-vite's default)
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

  // Merge dependencies
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
 * Remove default create-vite assets that we'll replace with our own
 */
async function removeDefaultAssets(projectPath) {
  const filesToRemove = [
    path.join(projectPath, 'src', 'App.css'),
    path.join(projectPath, 'src', 'assets', 'react.svg')
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

  const credits = generateCreditsSection('vite-react', allFeatures);

  const readme = `# ${answers.projectName}

A React application built with Vite and ${answers.cssFramework === 'vanilla' ? 'vanilla CSS' : answers.cssFramework}.

## Features

- ⚡️ Vite for fast development and building
- ⚛️ React ${answers.typescript ? '+ TypeScript' : ''}
- 🎨 ${answers.cssFramework === 'vanilla' ? 'Vanilla CSS' : answers.cssFramework}
${answers.authStrategy && answers.authStrategy !== 'none' ? `- 🔐 ${answers.authStrategy === 'clerk' ? 'Clerk Authentication' : answers.authStrategy}` : ''}
${selectedFeatures.length > 0 ? `- 📦 Additional packages: ${selectedFeatures.join(', ')}` : ''}

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
## 🔐 Clerk Authentication Setup

1. Sign up at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your API keys to \`.env.local\`:
   \`\`\`bash
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXX
   VITE_CLERK_SECRET_KEY=sk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXX
   \`\`\`

   ⚠️  **Security Warning**: Never commit real API keys to version control!
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

  // Generate Clerk provider
  const clerkProvider = `import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

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
VITE_API_URL=http://localhost:3000/api
`;

  if (answers.authStrategy === 'clerk') {
    envContent += `
# Clerk Authentication
# WARNING: Replace with your actual Clerk API keys from https://clerk.com
# Never commit real API keys to version control!
VITE_CLERK_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_CLERK_SECRET_KEY=sk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXX
`;
  } else if (answers.authStrategy === 'auth0') {
    envContent += `
# Auth0 Configuration
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
`;
  } else if (answers.authStrategy === 'firebase-auth') {
    envContent += `
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
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

  const creditsComponent = generateReactCreditsComponent('vite-react', allFeatures);
  await fs.writeFile(path.join(srcDir, 'components', 'Credits.jsx'), creditsComponent);
}
