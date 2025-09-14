/**
 * Template generators for Next.js project files
 */

/**
 * Generate package.json template
 */
export function generatePackageJsonTemplate(answers, dependencies, devDependencies) {
  return {
    name: answers.projectName,
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
      ...(answers.prisma && { "db:push": "prisma db push" })
    },
    dependencies,
    devDependencies,
    engines: {
      node: ">=18.0.0",
      npm: ">=8.0.0"
    }
  };
}

/**
 * Generate tsconfig.json template
 */
export function generateTsConfigTemplate() {
  return {
    compilerOptions: {
      target: "es5",
      lib: ["dom", "dom.iterable", "es6"],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      forceConsistentCasingInFileNames: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "preserve",
      incremental: true,
      plugins: [
        {
          name: "next"
        }
      ],
      paths: {
        "@/*": ["./src/*"]
      }
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    exclude: ["node_modules"]
  };
}

/**
 * Generate Tailwind CSS configuration
 */
export function generateTailwindConfigTemplate() {
  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}`;
}

/**
 * Generate PostCSS configuration
 */
export function generatePostCssConfigTemplate() {
  return `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
}

/**
 * Generate global CSS for Tailwind
 */
export function generateGlobalsCssTemplate() {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}`;
}

/**
 * Generate environment variables template
 */
export function generateEnvTemplate(answers) {
  let envContent = `# Environment variables for ${answers.projectName}
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

`;

  if (answers.authStrategy === 'clerk') {
    envContent += `# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

`;
  }

  if (answers.authStrategy === 'auth0') {
    envContent += `# Auth0 Configuration
AUTH0_SECRET=your-auth0-secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=your-auth0-domain
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret

`;
  }

  if (answers.database) {
    envContent += `# Database Configuration
DATABASE_URL="your-database-connection-string"

`;
  }

  return envContent.trim();
}

/**
 * Generate .gitignore template
 */
export function generateGitignoreTemplate() {
  return `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# prisma
/prisma/migrations
`;
}

/**
 * Generate README template
 */
export function generateReadmeTemplate(answers) {
  return `# ${answers.projectName}

This is a [Next.js](https://nextjs.org/) project bootstrapped with [\`build-app-with\`](https://github.com/imnayakshubham/build-app-with).

## Getting Started

First, install the dependencies:

\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

Then, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying \`src/app/page.${answers.typescript ? 'tsx' : 'js'}\`. The page auto-updates as you edit the file.

## Features Included

${answers.authStrategy !== 'none' ? `- **Authentication**: ${answers.authStrategy}` : ''}
${answers.database ? `- **Database**: ${answers.database}` : ''}
${answers.cssFramework !== 'vanilla' ? `- **Styling**: ${answers.cssFramework}` : ''}
- **TypeScript**: ${answers.typescript ? 'Yes' : 'No'}

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
`;
}