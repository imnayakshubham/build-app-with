/**
 * Credit and attribution utilities for generated projects
 */

import { APP_NAME, NPM_URL, GITHUB_URL } from '../constants/index.js';

export function generateCreditsSection(framework, selectedFeatures = []) {
    const features = selectedFeatures.filter(feature => feature && feature !== 'none');

    let credits = `## 🙏 Credits & How This App Was Created

This project was generated using **[${APP_NAME}](${NPM_URL})** - a production-grade CLI tool for creating modern web applications.

### 🚀 Generated With

- **Framework**: ${getFrameworkName(framework)}
- **Generator**: [${APP_NAME}](${NPM_URL}) v2.0.0
- **Features**: ${features.length > 0 ? features.join(', ') : 'Default configuration'}

### 📦 Install the Generator

\`\`\`bash
# Install globally
npm install -g ${APP_NAME}

# Or use with npx
npx ${APP_NAME} my-awesome-app
\`\`\`

### 🌟 What You Get

- ⚡ **Production-ready** boilerplate code
- 🔒 **Security** best practices built-in
- 🧪 **Testing** framework configured
- 📚 **Documentation** and examples
- 🐳 **Docker** support
- 🔧 **TypeScript** support
- 📱 **Responsive** design patterns
- 🎨 **Modern** UI components`;

    if (features.length > 0) {
        credits += `\n\n### 🛠️ Selected Features\n\n`;
        features.forEach(feature => {
            credits += `- **${getFeatureName(feature)}** - ${getFeatureDescription(feature)}\n`;
        });
    }

    credits += `\n### 🔗 Links

- **NPM Package**: [${NPM_URL}](${NPM_URL})
- **GitHub Repository**: [${GITHUB_URL}](${GITHUB_URL})
- **Documentation**: [${GITHUB_URL}#readme](${GITHUB_URL}#readme)

---

**Generated with ❤️ by [${APP_NAME}](${NPM_URL})**

*Create production-ready applications in seconds, not hours.*`;

    return credits;
}

export function generateReactCreditsComponent(framework, selectedFeatures = []) {
    const features = selectedFeatures.filter(feature => feature && feature !== 'none');

    return `import React from 'react';
${framework === 'nextjs' ? "import Link from 'next/link';" : ''}

const Credits = () => {
  return (
    <div style={{
      fontFamily: 'sans-serif',
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: 'inherit',
      margin: '1rem',
    }}>
      <div style={{
        marginBottom: '0.5em',
        border: '1px solid #ccc',
        padding: '1rem',
        borderRadius: '8px',
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '0.5em' }}>
          Start building something amazing!{' '}
          <span style={{ fontSize: '1.2em' }}>🚀</span>
        </h2>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          This project was generated using <strong>${APP_NAME}</strong> - a production-grade CLI tool.
        </p>
        <div style={{ marginBottom: '1rem' }}>
          <p><strong>Framework:</strong> ${getFrameworkName(framework)}</p>
          <p><strong>Features:</strong> ${features.length > 0 ? features.join(', ') : 'Default configuration'}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          ${framework === 'nextjs'
            ? `<Link href="${NPM_URL}" target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3', textDecoration: 'none' }}>
                Install via npm: <strong>${APP_NAME}</strong>
              </Link>`
            : `<a href="${NPM_URL}" target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3', textDecoration: 'none' }}>
                Install via npm: <strong>${APP_NAME}</strong>
              </a>`
        }
          <a href="${GITHUB_URL}" target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3', textDecoration: 'none' }}>
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
};

export default Credits;`;
}

function getFrameworkName(framework) {
    const frameworks = {
        'nextjs': 'Next.js (React Full-stack)',
        'vite-react': 'Vite + React (Frontend)',
        'express': 'Express.js (Node.js Backend)',
        'fastify': 'Fastify (Node.js Backend)'
    };
    return frameworks[framework] || framework;
}

function getFeatureName(feature) {
    const features = {
        'clerk': 'Clerk Authentication',
        'nextauth': 'NextAuth.js',
        'auth0': 'Auth0',
        'firebase-auth': 'Firebase Authentication',
        'tailwind': 'Tailwind CSS',
        'bootstrap': 'Bootstrap',
        'mui': 'Material-UI',
        'chakra': 'Chakra UI',
        'shadcn': 'shadcn/ui',
        'mantine': 'Mantine',
        'redux': 'Redux Toolkit',
        'zustand': 'Zustand',
        'mobx': 'MobX',
        'recoil': 'Recoil',
        'tanstack-query': 'TanStack Query',
        'axios': 'Axios',
        'hook-form': 'React Hook Form',
        'formik': 'Formik',
        'framer-motion': 'Framer Motion',
        'react-spring': 'React Spring',
        'ant-design': 'Ant Design',
        'react-icons': 'React Icons',
        'react-toastify': 'React Toastify',
        'typescript': 'TypeScript',
        'jest': 'Jest Testing',
        'docker': 'Docker Support'
    };
    return features[feature] || feature;
}

function getFeatureDescription(feature) {
    const descriptions = {
        'clerk': 'Modern authentication and user management',
        'nextauth': 'Complete authentication solution for Next.js',
        'auth0': 'Identity and access management platform',
        'firebase-auth': 'Google Firebase authentication',
        'tailwind': 'Utility-first CSS framework',
        'bootstrap': 'Popular CSS framework',
        'mui': 'React component library',
        'chakra': 'Simple and modular component library',
        'shadcn': 'Beautifully designed components',
        'mantine': 'Full-featured React components library',
        'redux': 'Predictable state container',
        'zustand': 'Small, fast and scalable state management',
        'mobx': 'Simple, scalable state management',
        'recoil': 'Experimental state management library',
        'tanstack-query': 'Powerful data synchronization',
        'axios': 'Promise-based HTTP client',
        'hook-form': 'Performant forms with easy validation',
        'formik': 'Build forms in React without tears',
        'framer-motion': 'Production-ready motion library',
        'react-spring': 'Spring-physics based animation',
        'ant-design': 'Enterprise-class UI design language',
        'react-icons': 'Popular icons as React components',
        'react-toastify': 'Toast notifications',
        'typescript': 'Typed superset of JavaScript',
        'jest': 'Delightful JavaScript testing',
        'docker': 'Containerization platform'
    };
    return descriptions[feature] || 'Additional feature';
}
