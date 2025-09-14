/**
 * Package mappings for Next.js project features and dependencies
 */

// Centralized feature to npm package mapping for dependencies and devDependencies
export const featurePackageMap = {
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
  'react-icons': { deps: ['react-icons'] }
};

// CSS framework dependencies mapping
export const cssFrameworkPackages = {
  'styled-components': {
    deps: ['styled-components'],
    devDepsForTS: ['@types/styled-components']
  },
  'sass': { devDeps: ['sass'] },
  'shadcn': {
    devDeps: ['tailwindcss'],
    deps: [
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      'lucide-react',
      '@radix-ui/react-slot'
    ]
  },
  'tailwind': { devDeps: ['tailwindcss'] }
};

// Base Next.js dependencies
export const nextjsBasePackages = {
  deps: ['next', 'react', 'react-dom'],
  devDeps: ['eslint', 'eslint-config-next']
};

// TypeScript specific packages
export const typescriptPackages = {
  devDeps: ['typescript', '@types/node', '@types/react', '@types/react-dom']
};