import fs from 'fs-extra';
import path from 'path';
import { generatePackageJson } from '../package-json-generator.js';
import { generateViteConfig } from './vite-config-generator.js';
import { generateTailwindConfig } from './tailwind-config-generator.js';
import { generateProjectFiles } from './file-generator.js';
import { generateESLintConfig } from './eslint-config-generator.js';
import { generatePrettierConfig } from './prettier-config-generator.js';
import { generateCreditsSection, generateReactCreditsComponent } from '../../utils/credits.js';

export async function generateViteProject(projectPath, answers) {
  // Generate package.json
  const packageJson = generatePackageJson(answers);
  await fs.writeJSON(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });

  // Generate Vite config
  const viteConfig = generateViteConfig(answers);
  const viteConfigPath = answers.typescript ? 'vite.config.ts' : 'vite.config.js';
  await fs.writeFile(path.join(projectPath, viteConfigPath), viteConfig);

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

  // Generate project files based on structure
  await generateProjectFiles(projectPath, answers);

  // Generate Clerk authentication if selected
  if (answers.authStrategy === 'clerk') {
    await generateClerkAuth(projectPath, answers);
  }

  // Generate additional config files
  await generateGitignore(projectPath);
  await generateReadme(projectPath, answers);

  // Generate credits component
  await generateCreditsComponent(projectPath, answers);
}

async function generateGitignore(projectPath) {
  const gitignore = `# Dependencies
node_modules/
.pnp
.pnp.js

# Production
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
`;

  await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore);
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

This project uses a ${answers.projectStructure} structure for better organization and maintainability.

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

  // Generate .env.example with security warnings
  const envExample = `# Clerk Authentication
# WARNING: Replace with your actual Clerk API keys from https://clerk.com
# Never commit real API keys to version control!
VITE_CLERK_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_CLERK_SECRET_KEY=sk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Generate secure keys at: https://clerk.com/docs/references/nodejs/available-methods#generate-api-keys
`;

  await fs.writeFile(path.join(projectPath, '.env.example'), envExample);
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