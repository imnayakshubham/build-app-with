import { FEATURES, DEPENDENCY_VERSIONS } from '../constants/vite-features.js';
import { addFeatureDependencies } from '../utils/dependency-helpers.js';

export function generatePackageJson(answers) {
  // Skip package.json generation for Next.js as create-next-app handles it
  if (answers.framework === 'nextjs') {
    return null;
  }

  const packageJson = {
    name: answers.projectName,
    private: true,
    version: '0.0.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: answers.typescript ? 'tsc && vite build' : 'vite build',
      preview: 'vite preview'
    },
    dependencies: {
      react: '^18.2.0',
      'react-dom': '^18.2.0'
    },
    devDependencies: {
      '@types/react': '^18.2.43',
      '@types/react-dom': '^18.2.17',
      '@vitejs/plugin-react': '^4.2.1',
      vite: '^5.0.8'
    }
  };

  // Add TypeScript if selected
  if (answers.typescript) {
    packageJson.devDependencies.typescript = '^5.2.2';
  }

  // Add CSS framework dependencies
  switch (answers.cssFramework) {
    case 'tailwind':
      // Tailwind CSS v4 (no PostCSS/autoprefixer required)
      packageJson.devDependencies.tailwindcss = '^4.0.0';
      break;
    case 'bootstrap':
      packageJson.dependencies.bootstrap = '^5.3.2';
      break;
    case 'mui':
      packageJson.dependencies['@mui/material'] = '^5.15.0';
      packageJson.dependencies['@emotion/react'] = '^11.11.1';
      packageJson.dependencies['@emotion/styled'] = '^11.11.0';
      break;
    case 'chakra':
      packageJson.dependencies['@chakra-ui/react'] = '^2.8.2';
      packageJson.dependencies['@emotion/react'] = '^11.11.1';
      packageJson.dependencies['@emotion/styled'] = '^11.11.0';
      packageJson.dependencies['framer-motion'] = '^10.16.16';
      break;
    case 'styled-components':
      packageJson.dependencies['styled-components'] = '^6.1.6';
      if (answers.typescript) {
        packageJson.devDependencies['@types/styled-components'] = '^5.1.34';
      }
      break;
  }

  // Add authentication dependencies
  if (answers.authStrategy && answers.authStrategy !== 'none') {
    switch (answers.authStrategy) {
      case 'clerk':
        packageJson.dependencies['@clerk/clerk-react'] = '^4.29.0';
        break;
      case 'auth0':
        packageJson.dependencies['@auth0/auth0-react'] = '^2.2.4';
        break;
      case 'firebase-auth':
        packageJson.dependencies['firebase'] = '^10.7.1';
        break;
    }
  }

  // Automatically add TanStack Query and Axios for React-based apps
  if (answers.framework === 'vite-react' || answers.framework === 'nextjs') {
    packageJson.dependencies['@tanstack/react-query'] = '^5.14.2';
    packageJson.dependencies['axios'] = '^1.6.2';
    packageJson.devDependencies['@tanstack/react-query-devtools'] = '^5.14.2';
  }

  // Add routing dependencies
  if (Array.isArray(answers.routing) && answers.routing.includes(FEATURES.REACT_ROUTER)) {
    addFeatureDependencies(packageJson, FEATURES.REACT_ROUTER);
  }

  // Add state management dependencies
  if (answers.stateMgmt) {
    addFeatureDependencies(packageJson, answers.stateMgmt);
  }

  // Add forms dependencies
  if (Array.isArray(answers.forms)) {
    answers.forms.forEach(form => {
      addFeatureDependencies(packageJson, form);
    });
  }

  // Add animations dependencies
  if (Array.isArray(answers.animations)) {
    answers.animations.forEach(animation => {
      addFeatureDependencies(packageJson, animation);
    });
  }

  // Add drag & drop dependencies
  if (Array.isArray(answers.dragDrop)) {
    answers.dragDrop.forEach(dragDrop => {
      addFeatureDependencies(packageJson, dragDrop);
    });
  }

  // Add UI library dependencies
  if (Array.isArray(answers.uiLibs)) {
    answers.uiLibs.forEach(uiLib => {
      addFeatureDependencies(packageJson, uiLib);
    });
  }

  // Add utilities dependencies
  if (Array.isArray(answers.utilities)) {
    answers.utilities.forEach(utility => {
      addFeatureDependencies(packageJson, utility);
    });
  }

  // Omit ESLint and Prettier per request

  return packageJson;
}

/**
 * Returns ONLY the additional dependencies beyond what create-vite provides.
 * Used in overlay mode where we merge into the scaffold's existing package.json.
 * create-vite already provides: react, react-dom, @vitejs/plugin-react, vite, @types/react, @types/react-dom
 */
export function getOverlayDependencies(answers) {
  const dependencies = {};
  const devDependencies = {};

  // CSS framework dependencies
  switch (answers.cssFramework) {
    case 'tailwind':
      devDependencies.tailwindcss = '^4.0.0';
      break;
    case 'bootstrap':
      dependencies.bootstrap = '^5.3.2';
      break;
    case 'mui':
      dependencies['@mui/material'] = '^5.15.0';
      dependencies['@emotion/react'] = '^11.11.1';
      dependencies['@emotion/styled'] = '^11.11.0';
      break;
    case 'chakra':
      dependencies['@chakra-ui/react'] = '^2.8.2';
      dependencies['@emotion/react'] = '^11.11.1';
      dependencies['@emotion/styled'] = '^11.11.0';
      dependencies['framer-motion'] = '^10.16.16';
      break;
    case 'styled-components':
      dependencies['styled-components'] = '^6.1.6';
      if (answers.typescript) {
        devDependencies['@types/styled-components'] = '^5.1.34';
      }
      break;
  }

  // Authentication dependencies
  if (answers.authStrategy && answers.authStrategy !== 'none') {
    switch (answers.authStrategy) {
      case 'clerk':
        dependencies['@clerk/clerk-react'] = '^4.29.0';
        break;
      case 'auth0':
        dependencies['@auth0/auth0-react'] = '^2.2.4';
        break;
      case 'firebase-auth':
        dependencies['firebase'] = '^10.7.1';
        break;
    }
  }

  // TanStack Query and Axios (auto-included for React apps)
  dependencies['@tanstack/react-query'] = '^5.14.2';
  dependencies['axios'] = '^1.6.2';
  devDependencies['@tanstack/react-query-devtools'] = '^5.14.2';

  // Routing
  if (Array.isArray(answers.routing) && answers.routing.includes(FEATURES.REACT_ROUTER)) {
    dependencies['react-router-dom'] = DEPENDENCY_VERSIONS['react-router-dom'] || 'latest';
  }

  // State management
  if (answers.stateMgmt) {
    const statePkgMap = {
      'redux': ['@reduxjs/toolkit', 'react-redux'],
      'zustand': ['zustand'],
      'mobx': ['mobx', 'mobx-react-lite'],
      'recoil': ['recoil']
    };
    const pkgs = statePkgMap[answers.stateMgmt] || [];
    pkgs.forEach(pkg => {
      dependencies[pkg] = DEPENDENCY_VERSIONS[pkg] || 'latest';
    });
  }

  // Forms
  if (Array.isArray(answers.forms)) {
    const formPkgMap = { 'hook-form': ['react-hook-form'], 'formik': ['formik'] };
    answers.forms.forEach(form => {
      const pkgs = formPkgMap[form] || [];
      pkgs.forEach(pkg => {
        dependencies[pkg] = DEPENDENCY_VERSIONS[pkg] || 'latest';
      });
    });
  }

  // Animations
  if (Array.isArray(answers.animations)) {
    const animPkgMap = {
      'framer-motion': ['framer-motion'],
      'react-spring': ['react-spring'],
      'react-transition-group': ['react-transition-group']
    };
    answers.animations.forEach(anim => {
      const pkgs = animPkgMap[anim] || [];
      pkgs.forEach(pkg => {
        dependencies[pkg] = DEPENDENCY_VERSIONS[pkg] || 'latest';
      });
    });
  }

  // Drag & Drop
  if (Array.isArray(answers.dragDrop)) {
    const dndPkgMap = {
      'react-dnd': ['react-dnd', 'react-dnd-html5-backend'],
      'react-beautiful-dnd': ['react-beautiful-dnd']
    };
    answers.dragDrop.forEach(dnd => {
      const pkgs = dndPkgMap[dnd] || [];
      pkgs.forEach(pkg => {
        dependencies[pkg] = DEPENDENCY_VERSIONS[pkg] || 'latest';
      });
    });
  }

  // UI Libraries
  if (Array.isArray(answers.uiLibs)) {
    const uiPkgMap = {
      'ant-design': ['antd'],
      'mantine': ['@mantine/core', '@mantine/hooks'],
      'shadcn': ['class-variance-authority', 'clsx', 'tailwind-merge']
    };
    answers.uiLibs.forEach(uiLib => {
      const pkgs = uiPkgMap[uiLib] || [];
      pkgs.forEach(pkg => {
        dependencies[pkg] = DEPENDENCY_VERSIONS[pkg] || 'latest';
      });
    });
  }

  // Utilities
  if (Array.isArray(answers.utilities)) {
    const utilPkgMap = {
      'react-icons': ['react-icons'],
      'react-toastify': ['react-toastify'],
      'react-table': ['@tanstack/react-table'],
      'react-select': ['react-select'],
      'react-helmet': ['react-helmet-async'],
      'react-i18next': ['react-i18next', 'i18next'],
      'storybook': ['@storybook/react', '@storybook/react-vite']
    };
    answers.utilities.forEach(util => {
      const pkgs = utilPkgMap[util] || [];
      pkgs.forEach(pkg => {
        const version = DEPENDENCY_VERSIONS[pkg] || 'latest';
        // Storybook packages are dev dependencies
        if (pkg.startsWith('@storybook/')) {
          devDependencies[pkg] = version;
        } else {
          dependencies[pkg] = version;
        }
      });
    });
  }

  return { dependencies, devDependencies };
}