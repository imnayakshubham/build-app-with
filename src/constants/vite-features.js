/**
 * Feature definitions and configurations for Vite + React projects
 * Centralized to avoid hardcoding throughout the codebase
 */

// Vite Preset Configurations
export const VITE_PRESETS = {
    STARTER: 'starter',
    STANDARD: 'standard',
    FULL: 'full',
    CUSTOM: 'custom'
};

// Preset Definitions with their included features
export const PRESET_FEATURES = {
    [VITE_PRESETS.STARTER]: {
        routing: [],
        stateMgmt: null,
        forms: [],
        animations: [],
        utilities: []
    },
    [VITE_PRESETS.STANDARD]: {
        routing: ['react-router-dom'],
        stateMgmt: 'zustand',
        forms: ['hook-form'],
        animations: [],
        utilities: ['react-icons', 'react-toastify']
    },
    [VITE_PRESETS.FULL]: {
        routing: ['react-router-dom'],
        stateMgmt: 'zustand',
        forms: ['hook-form'],
        animations: ['framer-motion'],
        utilities: ['react-icons', 'react-toastify', 'react-table', 'react-helmet', 'react-i18next']
    },
    [VITE_PRESETS.CUSTOM]: {
        // User selects everything manually
        routing: [],
        stateMgmt: null,
        forms: [],
        animations: [],
        utilities: []
    }
};

// Feature Categories
export const FEATURE_CATEGORIES = {
    ROUTING: 'routing',
    STATE_MGMT: 'stateMgmt',
    FORMS: 'forms',
    ANIMATIONS: 'animations',
    DRAG_DROP: 'dragDrop',
    UI_LIBS: 'uiLibs',
    UTILITIES: 'utilities'
};

// Available Features
export const FEATURES = {
    // Routing
    REACT_ROUTER: 'react-router-dom',

    // State Management
    REDUX: 'redux',
    ZUSTAND: 'zustand',
    MOBX: 'mobx',
    RECOIL: 'recoil',

    // Forms
    HOOK_FORM: 'hook-form',
    FORMIK: 'formik',

    // Animations
    FRAMER_MOTION: 'framer-motion',
    REACT_SPRING: 'react-spring',
    REACT_TRANSITION_GROUP: 'react-transition-group',

    // Drag & Drop
    REACT_DND: 'react-dnd',
    REACT_BEAUTIFUL_DND: 'react-beautiful-dnd',

    // UI Libraries
    ANT_DESIGN: 'ant-design',
    MANTINE: 'mantine',
    SHADCN: 'shadcn',

    // Utilities
    REACT_ICONS: 'react-icons',
    REACT_TOASTIFY: 'react-toastify',
    REACT_TABLE: 'react-table',
    REACT_SELECT: 'react-select',
    REACT_HELMET: 'react-helmet',
    REACT_I18NEXT: 'react-i18next',
    STORYBOOK: 'storybook'
};

// Dependency Versions (centralized for easy updates)
export const DEPENDENCY_VERSIONS = {
    // Routing
    'react-router-dom': '^6.20.1',

    // State Management
    '@reduxjs/toolkit': '^2.0.1',
    'react-redux': '^9.0.4',
    'zustand': '^4.4.7',
    'mobx': '^6.12.0',
    'mobx-react-lite': '^4.0.5',
    'recoil': '^0.7.7',

    // Forms
    'react-hook-form': '^7.48.2',
    'formik': '^2.4.5',

    // Animations
    'framer-motion': '^10.16.16',
    'react-spring': '^9.7.3',
    'react-transition-group': '^4.4.5',

    // Drag & Drop
    'react-dnd': '^16.0.1',
    'react-dnd-html5-backend': '^16.0.1',
    'react-beautiful-dnd': '^13.1.1',

    // UI Libraries
    'antd': '^5.12.2',
    '@mantine/core': '^7.3.2',
    '@mantine/hooks': '^7.3.2',
    'class-variance-authority': '^0.7.0',
    'clsx': '^2.0.0',
    'tailwind-merge': '^2.1.0',

    // Utilities
    'react-icons': '^4.12.0',
    'react-toastify': '^9.1.3',
    '@tanstack/react-table': '^8.11.2',
    'react-select': '^5.8.0',
    'react-helmet-async': '^2.0.4',
    'react-i18next': '^14.0.0',
    'i18next': '^23.7.11',
    '@storybook/react': '^7.6.3',
    '@storybook/react-vite': '^7.6.3'
};

// Feature to Package Mapping
export const FEATURE_PACKAGES = {
    // Routing
    [FEATURES.REACT_ROUTER]: ['react-router-dom'],

    // State Management
    [FEATURES.REDUX]: ['@reduxjs/toolkit', 'react-redux'],
    [FEATURES.ZUSTAND]: ['zustand'],
    [FEATURES.MOBX]: ['mobx', 'mobx-react-lite'],
    [FEATURES.RECOIL]: ['recoil'],

    // Forms
    [FEATURES.HOOK_FORM]: ['react-hook-form'],
    [FEATURES.FORMIK]: ['formik'],

    // Animations
    [FEATURES.FRAMER_MOTION]: ['framer-motion'],
    [FEATURES.REACT_SPRING]: ['react-spring'],
    [FEATURES.REACT_TRANSITION_GROUP]: ['react-transition-group'],

    // Drag & Drop
    [FEATURES.REACT_DND]: ['react-dnd', 'react-dnd-html5-backend'],
    [FEATURES.REACT_BEAUTIFUL_DND]: ['react-beautiful-dnd'],

    // UI Libraries
    [FEATURES.ANT_DESIGN]: ['antd'],
    [FEATURES.MANTINE]: ['@mantine/core', '@mantine/hooks'],
    [FEATURES.SHADCN]: ['class-variance-authority', 'clsx', 'tailwind-merge'],

    // Utilities
    [FEATURES.REACT_ICONS]: ['react-icons'],
    [FEATURES.REACT_TOASTIFY]: ['react-toastify'],
    [FEATURES.REACT_TABLE]: ['@tanstack/react-table'],
    [FEATURES.REACT_SELECT]: ['react-select'],
    [FEATURES.REACT_HELMET]: ['react-helmet-async'],
    [FEATURES.REACT_I18NEXT]: ['react-i18next', 'i18next'],
    [FEATURES.STORYBOOK]: ['@storybook/react', '@storybook/react-vite']
};

// Dev Dependencies (packages that should be installed as devDependencies)
export const DEV_DEPENDENCIES = new Set([
    '@storybook/react',
    '@storybook/react-vite'
]);
