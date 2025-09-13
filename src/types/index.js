/**
 * Type definitions and constants for the project generator
 */

export const FRAMEWORKS = {
    NEXTJS: 'nextjs',
    VITE_REACT: 'vite-react',
    EXPRESS: 'express',
    FASTIFY: 'fastify'
};

export const CSS_FRAMEWORKS = {
    TAILWIND: 'tailwind',
    BOOTSTRAP: 'bootstrap',
    MUI: 'mui',
    CHAKRA: 'chakra',
    SHADCN: 'shadcn',
    MANTINE: 'mantine',
    STYLED_COMPONENTS: 'styled-components',
    VANILLA: 'vanilla'
};

export const PROJECT_STRUCTURES = {
    FEATURE_BASED: 'feature-based',
    SIMPLE: 'simple',
    DOMAIN_DRIVEN: 'domain-driven'
};

export const SETUP_TYPES = {
    DEFAULT: 'default',
    CUSTOMIZE: 'customize'
};

export const FEATURES = {
    // State Management
    REDUX: 'redux',
    ZUSTAND: 'zustand',
    MOBX: 'mobx',
    RECOIL: 'recoil',

    // Data Fetching
    TANSTACK_QUERY: 'tanstack-query',
    AXIOS: 'axios',
    AXIOS_INTERCEPTOR: 'axios-interceptor',

    // Forms
    HOOK_FORM: 'hook-form',
    FORMIK: 'formik',

    // Animations
    FRAMER_MOTION: 'framer-motion',
    REACT_SPRING: 'react-spring',
    REACT_TRANSITION_GROUP: 'react-transition-group',

    // UI Libraries
    ANT_DESIGN: 'ant-design',
    BOOTSTRAP_UI: 'bootstrap',
    MUI_UI: 'mui',
    CHAKRA_UI: 'chakra',
    SHADCN_UI: 'shadcn',
    MANTINE_UI: 'mantine',

    // Utilities
    REACT_ICONS: 'react-icons',
    REACT_TOASTIFY: 'react-toastify',
    REACT_TABLE: 'react-table',
    REACT_SELECT: 'react-select',
    REACT_HELMET: 'react-helmet',
    REACT_I18NEXT: 'react-i18next',
    STORYBOOK: 'storybook',

    // Backend Features
    PRISMA: 'prisma',
    NEXTAUTH: 'nextauth',
    TRPC: 'trpc',
    MONGOOSE: 'mongoose',
    SEQUELIZE: 'sequelize',
    JWT: 'jwt',
    BCRYPT: 'bcrypt',
    CORS: 'cors',
    HELMET: 'helmet',
    MORGAN: 'morgan',
    WINSTON: 'winston',
    DOTENV: 'dotenv',
    EXPRESS_VALIDATOR: 'express-validator',
    SWAGGER: 'swagger',

    // Authentication
    CLERK: 'clerk',
    AUTH0: 'auth0',
    FIREBASE_AUTH: 'firebase-auth'
};

export const PACKAGE_MANAGERS = {
    NPM: 'npm',
    YARN: 'yarn',
    PNPM: 'pnpm'
};

export const DATABASES = {
    MONGODB: 'mongodb',
    POSTGRESQL: 'postgresql',
    MYSQL: 'mysql',
    SQLITE: 'sqlite'
};

export const AUTH_STRATEGIES = {
    JWT: 'jwt',
    SESSION: 'session',
    OAUTH: 'oauth',
    PASSPORT: 'passport',
    CLERK: 'clerk'
};
