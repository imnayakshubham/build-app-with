import fs from 'fs-extra';
import path from 'path';
import { generateAppComponent } from '../components/app-component.js';
import { generateMainFile } from '../components/main-file.js';
import { generateIndexCSS } from '../styles/index-css.js';

export async function generateFeatureBasedStructure(projectPath, answers) {
  const srcPath = path.join(projectPath, 'src');
  await fs.ensureDir(srcPath);

  // Generate main entry file
  const mainFile = generateMainFile(answers);
  const mainExtension = answers.typescript ? 'tsx' : 'jsx';
  await fs.writeFile(path.join(srcPath, `main.${mainExtension}`), mainFile);

  // Generate App component
  const appComponent = generateAppComponent(answers);
  const appExtension = answers.typescript ? 'tsx' : 'jsx';
  await fs.writeFile(path.join(srcPath, `App.${appExtension}`), appComponent);

  // Generate CSS file
  const indexCSS = generateIndexCSS(answers);
  await fs.writeFile(path.join(srcPath, 'index.css'), indexCSS);

  // Create feature-based directories
  const directories = [
    'components/common',
    'features/auth',
    'features/dashboard',
    'hooks',
    'services',
    'utils',
    'types'
  ];

  for (const dir of directories) {
    await fs.ensureDir(path.join(srcPath, dir));
  }

  // Generate sample files for each feature
  await generateAuthFeature(srcPath, answers);
  await generateDashboardFeature(srcPath, answers);
  await generateCommonComponents(srcPath, answers);
  await generateHooks(srcPath, answers);
  await generateServices(srcPath, answers);
  await generateUtils(srcPath, answers);
  
  if (answers.typescript) {
    await generateTypes(srcPath);
  }
}

async function generateAuthFeature(srcPath, answers) {
  const authPath = path.join(srcPath, 'features/auth');
  const ext = answers.typescript ? 'tsx' : 'jsx';
  
  const loginComponent = answers.typescript ? `import React from 'react';

const Login: React.FC = () => {
  return (
    <div className="login">
      <h2>Login</h2>
      <form>
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
` : `import React from 'react';

const Login = () => {
  return (
    <div className="login">
      <h2>Login</h2>
      <form>
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
`;

  await fs.writeFile(path.join(authPath, `Login.${ext}`), loginComponent);
}

async function generateDashboardFeature(srcPath, answers) {
  const dashboardPath = path.join(srcPath, 'features/dashboard');
  const ext = answers.typescript ? 'tsx' : 'jsx';
  
  const dashboardComponent = answers.typescript ? `import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
    </div>
  );
};

export default Dashboard;
` : `import React from 'react';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
    </div>
  );
};

export default Dashboard;
`;

  await fs.writeFile(path.join(dashboardPath, `Dashboard.${ext}`), dashboardComponent);
}

async function generateCommonComponents(srcPath, answers) {
  const commonPath = path.join(srcPath, 'components/common');
  const ext = answers.typescript ? 'tsx' : 'jsx';
  
  const headerComponent = answers.typescript ? `import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="header">
      <h1>My App</h1>
      <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
      </nav>
    </header>
  );
};

export default Header;
` : `import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <h1>My App</h1>
      <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
      </nav>
    </header>
  );
};

export default Header;
`;

  await fs.writeFile(path.join(commonPath, `Header.${ext}`), headerComponent);
}

async function generateHooks(srcPath, answers) {
  const hooksPath = path.join(srcPath, 'hooks');
  const ext = answers.typescript ? 'ts' : 'js';
  
  const useLocalStorage = answers.typescript ? `import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
` : `import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}
`;

  await fs.writeFile(path.join(hooksPath, `useLocalStorage.${ext}`), useLocalStorage);
}

async function generateServices(srcPath, answers) {
  const servicesPath = path.join(srcPath, 'services');
  const ext = answers.typescript ? 'ts' : 'js';
  
  const apiService = answers.typescript ? `const API_BASE_URL = 'https://api.example.com';

export class ApiService {
  static async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(\`\${API_BASE_URL}\${endpoint}\`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  }

  static async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(\`\${API_BASE_URL}\${endpoint}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  }
}
` : `const API_BASE_URL = 'https://api.example.com';

export class ApiService {
  static async get(endpoint) {
    const response = await fetch(\`\${API_BASE_URL}\${endpoint}\`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  }

  static async post(endpoint, data) {
    const response = await fetch(\`\${API_BASE_URL}\${endpoint}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  }
}
`;

  await fs.writeFile(path.join(servicesPath, `api.${ext}`), apiService);
}

async function generateUtils(srcPath, answers) {
  const utilsPath = path.join(srcPath, 'utils');
  const ext = answers.typescript ? 'ts' : 'js';
  
  const helpers = answers.typescript ? `export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
` : `export const formatDate = (date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
`;

  await fs.writeFile(path.join(utilsPath, `helpers.${ext}`), helpers);
}

async function generateTypes(srcPath) {
  const typesPath = path.join(srcPath, 'types');
  
  const indexTypes = `export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
`;

  await fs.writeFile(path.join(typesPath, 'index.ts'), indexTypes);
}