/**
 * Centralized package mappings for different frameworks and features
 */

import { FRAMEWORKS, CSS_FRAMEWORKS, FEATURES } from '../types/index.js';

// Feature to npm package mapping for dependencies and devDependencies
export const featurePackageMap = {
    // State Management
    [FEATURES.REDUX]: {
        deps: ['@reduxjs/toolkit', 'react-redux'],
        devDeps: ['@types/react-redux']
    },
    [FEATURES.ZUSTAND]: { deps: ['zustand'] },
    [FEATURES.MOBX]: { deps: ['mobx', 'mobx-react-lite'] },
    [FEATURES.RECOIL]: { deps: ['recoil'] },

    // Data Fetching
    [FEATURES.TANSTACK_QUERY]: { deps: ['@tanstack/react-query'] },
    [FEATURES.AXIOS]: { deps: ['axios'] },
    [FEATURES.AXIOS_INTERCEPTOR]: { deps: ['axios'] },

    // Forms
    [FEATURES.HOOK_FORM]: { deps: ['react-hook-form'] },
    [FEATURES.FORMIK]: { deps: ['formik', 'yup'] },

    // Animations
    [FEATURES.FRAMER_MOTION]: { deps: ['framer-motion'] },
    [FEATURES.REACT_SPRING]: { deps: ['react-spring'] },
    [FEATURES.REACT_TRANSITION_GROUP]: { deps: ['react-transition-group'] },

    // UI Libraries
    [FEATURES.ANT_DESIGN]: { deps: ['antd'] },
    [FEATURES.BOOTSTRAP_UI]: { deps: ['bootstrap', 'react-bootstrap'] },
    [FEATURES.MUI_UI]: { deps: ['@mui/material', '@emotion/react', '@emotion/styled'] },
    [FEATURES.CHAKRA_UI]: { deps: ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'] },
    [FEATURES.SHADCN_UI]: {
        devDeps: ['tailwindcss'],
        deps: ['class-variance-authority', 'clsx', 'tailwind-merge', 'lucide-react', '@radix-ui/react-slot']
    },
    [FEATURES.MANTINE_UI]: { deps: ['@mantine/core', '@mantine/hooks', '@mantine/form'] },

    // Utilities
    [FEATURES.REACT_ICONS]: { deps: ['react-icons'] },
    [FEATURES.REACT_TOASTIFY]: { deps: ['react-toastify'] },
    [FEATURES.REACT_TABLE]: { deps: ['@tanstack/react-table'] },
    [FEATURES.REACT_SELECT]: { deps: ['react-select'] },
    [FEATURES.REACT_HELMET]: { deps: ['react-helmet-async'] },
    [FEATURES.REACT_I18NEXT]: { deps: ['react-i18next', 'i18next'] },
    [FEATURES.STORYBOOK]: { devDeps: ['@storybook/react', '@storybook/react-vite'] },

    // Backend Features
    [FEATURES.PRISMA]: { deps: ['@prisma/client'], devDeps: ['prisma'] },
    [FEATURES.NEXTAUTH]: { deps: ['next-auth'] },
    [FEATURES.TRPC]: { deps: ['@trpc/client', '@trpc/server', '@trpc/react-query', '@trpc/next'] },
    [FEATURES.MONGOOSE]: { deps: ['mongoose'] },
    [FEATURES.SEQUELIZE]: { deps: ['sequelize'] },
    [FEATURES.JWT]: { deps: ['jsonwebtoken'] },
    [FEATURES.BCRYPT]: { deps: ['bcryptjs'] },
    [FEATURES.CORS]: { deps: ['cors'] },
    [FEATURES.HELMET]: { deps: ['helmet'] },
    [FEATURES.MORGAN]: { deps: ['morgan'] },
    [FEATURES.WINSTON]: { deps: ['winston'] },
    [FEATURES.DOTENV]: { deps: ['dotenv'] },
    [FEATURES.EXPRESS_VALIDATOR]: { deps: ['express-validator'] },
    [FEATURES.SWAGGER]: { deps: ['swagger-ui-express', 'swagger-jsdoc'] },

    // Authentication
    [FEATURES.CLERK]: { deps: ['@clerk/nextjs'] },
    [FEATURES.AUTH0]: { deps: ['@auth0/nextjs-auth0'] },
    [FEATURES.FIREBASE_AUTH]: { deps: ['firebase'] }
};

// CSS framework dependencies mapping
export const cssFrameworkPackages = {
    [CSS_FRAMEWORKS.TAILWIND]: { devDeps: ['tailwindcss', 'autoprefixer', 'postcss'] },
    [CSS_FRAMEWORKS.BOOTSTRAP]: { deps: ['bootstrap'] },
    [CSS_FRAMEWORKS.MUI]: { deps: ['@mui/material', '@emotion/react', '@emotion/styled'] },
    [CSS_FRAMEWORKS.CHAKRA]: { deps: ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'] },
    [CSS_FRAMEWORKS.SHADCN]: {
        devDeps: ['tailwindcss', 'autoprefixer', 'postcss'],
        deps: ['class-variance-authority', 'clsx', 'tailwind-merge', 'lucide-react', '@radix-ui/react-slot']
    },
    [CSS_FRAMEWORKS.MANTINE]: { deps: ['@mantine/core', '@mantine/hooks', '@mantine/form'] },
    [CSS_FRAMEWORKS.STYLED_COMPONENTS]: {
        deps: ['styled-components'],
        devDepsForTS: ['@types/styled-components']
    },
    [CSS_FRAMEWORKS.SASS]: { devDeps: ['sass'] }
};

// Framework-specific base dependencies
export const frameworkBasePackages = {
    [FRAMEWORKS.NEXTJS]: {
        deps: ['next', 'react', 'react-dom'],
        devDeps: ['@types/react', '@types/react-dom', '@types/node', 'eslint', 'eslint-config-next']
    },
    [FRAMEWORKS.VITE_REACT]: {
        deps: ['react', 'react-dom'],
        devDeps: ['@vitejs/plugin-react', 'vite', '@types/react', '@types/react-dom']
    },
    [FRAMEWORKS.EXPRESS]: {
        deps: ['express'],
        devDeps: ['@types/express', '@types/node', 'nodemon', 'typescript', 'ts-node']
    },
    [FRAMEWORKS.FASTIFY]: {
        deps: ['fastify'],
        devDeps: ['@types/node', 'nodemon', 'typescript', 'ts-node']
    }
};
