import fs from 'fs-extra';
import path from 'path';
import { generatePackageJson } from './package-json-generator.js';
import { generateViteConfig } from './vite-config-generator.js';
import { generateTailwindConfig } from './tailwind-config-generator.js';
import { generateProjectFiles } from './file-generator.js';
import { generateESLintConfig } from './eslint-config-generator.js';
import { generatePrettierConfig } from './prettier-config-generator.js';

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

  // Generate additional config files
  await generateGitignore(projectPath);
  await generateReadme(projectPath, answers);
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
  const readme = `# ${answers.projectName}

A React application built with Vite and ${answers.cssFramework === 'vanilla' ? 'vanilla CSS' : answers.cssFramework}.

## Features

- ⚡️ Vite for fast development and building
- ⚛️ React ${answers.typescript ? '+ TypeScript' : ''}
- 🎨 ${answers.cssFramework === 'vanilla' ? 'Vanilla CSS' : answers.cssFramework}
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

## License

MIT
`;

  await fs.writeFile(path.join(projectPath, 'README.md'), readme);
}