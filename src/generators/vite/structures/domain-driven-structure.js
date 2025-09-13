import fs from 'fs-extra';
import path from 'path';
import { generateAppComponent } from '../components/app-component.js';
import { generateMainFile } from '../components/main-file.js';
import { generateIndexCSS } from '../styles/index-css.js';

export async function generateDomainDrivenStructure(projectPath, answers) {
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

  // Create domain-driven directories
  const directories = [
    'shared/components',
    'shared/hooks',
    'shared/utils',
    'shared/types',
    'shared/services',
    'domains/user/components',
    'domains/user/services',
    'domains/user/types',
    'domains/user/hooks',
    'domains/product/components',
    'domains/product/services',
    'domains/product/types',
    'domains/product/hooks',
    'app/store',
    'app/routes',
    'infrastructure/http',
    'infrastructure/storage'
  ];

  for (const dir of directories) {
    await fs.ensureDir(path.join(srcPath, dir));
  }

  // Generate domain-specific files
  await generateSharedModule(srcPath, answers);
  await generateUserDomain(srcPath, answers);
  await generateProductDomain(srcPath, answers);
  await generateAppModule(srcPath, answers);
  await generateInfrastructure(srcPath, answers);
}

async function generateSharedModule(srcPath, answers) {
  const ext = answers.typescript ? 'tsx' : 'jsx';
  const tsExt = answers.typescript ? 'ts' : 'js';

  // Shared Button component
  const buttonComponent = answers.typescript ? `import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={\`btn btn--\${variant}\`}
    >
      {children}
    </button>
  );
};

export default Button;
` : `import React from 'react';

const Button = ({ children, onClick, variant = 'primary', disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={\`btn btn--\${variant}\`}
    >
      {children}
    </button>
  );
};

export default Button;
`;

  await fs.writeFile(path.join(srcPath, `shared/components/Button.${ext}`), buttonComponent);

  // Shared types
  if (answers.typescript) {
    const sharedTypes = `export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
`;

    await fs.writeFile(path.join(srcPath, 'shared/types/index.ts'), sharedTypes);
  }
}

async function generateUserDomain(srcPath, answers) {
  const ext = answers.typescript ? 'tsx' : 'jsx';
  const tsExt = answers.typescript ? 'ts' : 'js';

  // User types
  if (answers.typescript) {
    const userTypes = `import { BaseEntity } from '../../shared/types';

export interface User extends BaseEntity {
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator'
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}
`;

    await fs.writeFile(path.join(srcPath, 'domains/user/types/index.ts'), userTypes);
  }

  // User service
  const userService = answers.typescript ? `import { User, CreateUserRequest } from '../types';
import { httpClient } from '../../../infrastructure/http';

export class UserService {
  static async getUsers(): Promise<User[]> {
    const response = await httpClient.get<User[]>('/users');
    return response.data;
  }

  static async getUserById(id: string): Promise<User> {
    const response = await httpClient.get<User>(\`/users/\${id}\`);
    return response.data;
  }

  static async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await httpClient.post<User>('/users', userData);
    return response.data;
  }
}
` : `import { httpClient } from '../../../infrastructure/http';

export class UserService {
  static async getUsers() {
    const response = await httpClient.get('/users');
    return response.data;
  }

  static async getUserById(id) {
    const response = await httpClient.get(\`/users/\${id}\`);
    return response.data;
  }

  static async createUser(userData) {
    const response = await httpClient.post('/users', userData);
    return response.data;
  }
}
`;

  await fs.writeFile(path.join(srcPath, `domains/user/services/UserService.${tsExt}`), userService);
}

async function generateProductDomain(srcPath, answers) {
  const tsExt = answers.typescript ? 'ts' : 'js';

  // Product types
  if (answers.typescript) {
    const productTypes = `import { BaseEntity } from '../../shared/types';

export interface Product extends BaseEntity {
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  category: string;
}
`;

    await fs.writeFile(path.join(srcPath, 'domains/product/types/index.ts'), productTypes);
  }

  // Product service
  const productService = answers.typescript ? `import { Product, CreateProductRequest } from '../types';
import { httpClient } from '../../../infrastructure/http';

export class ProductService {
  static async getProducts(): Promise<Product[]> {
    const response = await httpClient.get<Product[]>('/products');
    return response.data;
  }

  static async getProductById(id: string): Promise<Product> {
    const response = await httpClient.get<Product>(\`/products/\${id}\`);
    return response.data;
  }

  static async createProduct(productData: CreateProductRequest): Promise<Product> {
    const response = await httpClient.post<Product>('/products', productData);
    return response.data;
  }
}
` : `import { httpClient } from '../../../infrastructure/http';

export class ProductService {
  static async getProducts() {
    const response = await httpClient.get('/products');
    return response.data;
  }

  static async getProductById(id) {
    const response = await httpClient.get(\`/products/\${id}\`);
    return response.data;
  }

  static async createProduct(productData) {
    const response = await httpClient.post('/products', productData);
    return response.data;
  }
}
`;

  await fs.writeFile(path.join(srcPath, `domains/product/services/ProductService.${tsExt}`), productService);
}

async function generateAppModule(srcPath, answers) {
  const tsExt = answers.typescript ? 'ts' : 'js';

  // App routes
  const routes = answers.typescript ? `export const ROUTES = {
  HOME: '/',
  USERS: '/users',
  PRODUCTS: '/products',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
} as const;

export type RouteKey = keyof typeof ROUTES;
` : `export const ROUTES = {
  HOME: '/',
  USERS: '/users',
  PRODUCTS: '/products',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
};
`;

  await fs.writeFile(path.join(srcPath, `app/routes/index.${tsExt}`), routes);
}

async function generateInfrastructure(srcPath, answers) {
  const tsExt = answers.typescript ? 'ts' : 'js';

  // HTTP client
  const httpClient = answers.typescript ? `interface HttpResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

class HttpClient {
  private baseURL: string;

  constructor(baseURL: string = 'https://api.example.com') {
    this.baseURL = baseURL;
  }

  async get<T>(endpoint: string): Promise<HttpResponse<T>> {
    const response = await fetch(\`\${this.baseURL}\${endpoint}\`);
    const data = await response.json();
    
    return {
      data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  async post<T>(endpoint: string, body: any): Promise<HttpResponse<T>> {
    const response = await fetch(\`\${this.baseURL}\${endpoint}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    return {
      data,
      status: response.status,
      statusText: response.statusText,
    };
  }
}

export const httpClient = new HttpClient();
` : `class HttpClient {
  constructor(baseURL = 'https://api.example.com') {
    this.baseURL = baseURL;
  }

  async get(endpoint) {
    const response = await fetch(\`\${this.baseURL}\${endpoint}\`);
    const data = await response.json();
    
    return {
      data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  async post(endpoint, body) {
    const response = await fetch(\`\${this.baseURL}\${endpoint}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    return {
      data,
      status: response.status,
      statusText: response.statusText,
    };
  }
}

export const httpClient = new HttpClient();
`;

  await fs.writeFile(path.join(srcPath, `infrastructure/http/index.${tsExt}`), httpClient);

  // Storage service
  const storageService = answers.typescript ? `export class StorageService {
  static setItem(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  static getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}
` : `export class StorageService {
  static setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  static getItem(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  static removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  static clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}
`;

  await fs.writeFile(path.join(srcPath, `infrastructure/storage/index.${tsExt}`), storageService);
}