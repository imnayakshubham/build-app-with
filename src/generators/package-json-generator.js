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

  // Add feature dependencies
  (answers.features || []).forEach(feature => {
    switch (feature) {
      case 'router':
        packageJson.dependencies['react-router-dom'] = '^6.20.1';
        break;
      case 'redux':
        packageJson.dependencies['@reduxjs/toolkit'] = '^2.0.1';
        packageJson.dependencies['react-redux'] = '^9.0.4';
        break;
      case 'hook-form':
        packageJson.dependencies['react-hook-form'] = '^7.48.2';
        break;
      case 'axios':
        packageJson.dependencies.axios = '^1.6.2';
        break;
      case 'react-query':
        packageJson.dependencies['@tanstack/react-query'] = '^5.14.2';
        break;
      case 'framer-motion':
        if (!packageJson.dependencies['framer-motion']) {
          packageJson.dependencies['framer-motion'] = '^10.16.16';
        }
        break;
      case 'react-icons':
        packageJson.dependencies['react-icons'] = '^4.12.0';
        break;
    }
  });

  // Omit ESLint and Prettier per request

  return packageJson;
}