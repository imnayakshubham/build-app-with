import fs from 'fs-extra';
import path from 'path';
import { generateSimpleStructure } from './structures/simple-structure.js';
import { generateFeatureBasedStructure } from './structures/feature-based-structure.js';
import { generateDomainDrivenStructure } from './structures/domain-driven-structure.js';

export async function generateProjectFiles(projectPath, answers, options = {}) {
  // Skip public file generation in overlay mode (create-vite already provides index.html and vite.svg)
  if (!options.overlay) {
    await generatePublicFiles(projectPath, answers);
  }

  // Generate API library files for React-based apps
  await generateApiLibraryFiles(projectPath, answers);

  // Generate project structure based on user choice
  switch (answers.projectStructure) {
    case 'simple':
      await generateSimpleStructure(projectPath, answers);
      break;
    case 'feature-based':
      await generateFeatureBasedStructure(projectPath, answers);
      break;
    case 'domain-driven':
      await generateDomainDrivenStructure(projectPath, answers);
      break;
  }
}

async function generatePublicFiles(projectPath, answers) {
  const publicPath = path.join(projectPath, 'public');
  await fs.ensureDir(publicPath);

  const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${answers.projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.${answers.typescript ? 'tsx' : 'jsx'}"></script>
  </body>
</html>
`;

  await fs.writeFile(path.join(publicPath, 'index.html'), indexHtml);

  // Create basic vite.svg
  const viteSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%" stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFEA83"></stop><stop offset="8.333%" stop-color="#FFDD35"></stop><stop offset="100%" stop-color="#FFA800"></stop></linearGradient></defs><path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path><path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>`;

  await fs.writeFile(path.join(publicPath, 'vite.svg'), viteSvg);
}

async function generateApiLibraryFiles(projectPath, answers) {
  // Only generate for React-based apps
  if (answers.framework !== 'vite-react' && answers.framework !== 'nextjs') {
    return;
  }

  const libPath = path.join(projectPath, 'src', 'lib');
  await fs.ensureDir(libPath);

  // Helper function to generate TypeScript or JavaScript based on preference
  const generateTemplate = (tsTemplate, jsTemplate) => {
    return answers.typescript ? tsTemplate : jsTemplate;
  };

  // Generate Axios configuration
  const axiosConfigTS = `/**
   * Production-grade Axios configuration with interceptors
   * Automatically included in all React-based projects
   */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = \`Bearer \${token}\`;
    }

    // Add request timestamp for debugging
    (config as any).metadata = { startTime: new Date() };

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(\`🚀 API Request: \${config.method?.toUpperCase()} \${config.url}\`, {
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Calculate request duration
    const duration = new Date() - (response.config as any).metadata?.startTime;
    
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(\`✅ API Response: \${response.config.method?.toUpperCase()} \${response.config.url}\`, {
        status: response.status,
        duration: \`\${duration}ms\`,
        data: response.data,
      });
    }

    return response;
  },
  (error: AxiosError) => {
    const duration = new Date() - (error.config as any)?.metadata?.startTime;
    
    // Log error in development
    if (import.meta.env.DEV) {
      console.error(\`❌ API Error: \${error.config?.method?.toUpperCase()} \${error.config?.url}\`, {
        status: error.response?.status,
        duration: \`\${duration}ms\`,
        message: error.message,
        data: error.response?.data,
      });
    }

    // Handle common error cases
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden:', data?.message || 'You do not have permission to access this resource');
          break;
        case 404:
          // Not found
          console.error('Resource not found:', data?.message || 'The requested resource was not found');
          break;
        case 422:
          // Validation error
          console.error('Validation error:', data?.message || 'Please check your input');
          break;
        case 429:
          // Rate limited
          console.error('Rate limited:', data?.message || 'Too many requests, please try again later');
          break;
        case 500:
          // Server error
          console.error('Server error:', data?.message || 'Something went wrong on our end');
          break;
        default:
          console.error('API Error:', data?.message || 'An unexpected error occurred');
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', 'Unable to connect to the server. Please check your internet connection.');
    } else {
      // Other error
      console.error('Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Utility functions for common HTTP methods
export const api = {
  get: (url: string, config: AxiosRequestConfig = {}) => apiClient.get(url, config),
  post: (url: string, data: any, config: AxiosRequestConfig = {}) => apiClient.post(url, data, config),
  put: (url: string, data: any, config: AxiosRequestConfig = {}) => apiClient.put(url, data, config),
  patch: (url: string, data: any, config: AxiosRequestConfig = {}) => apiClient.patch(url, data, config),
  delete: (url: string, config: AxiosRequestConfig = {}) => apiClient.delete(url, config),
};

// Export the configured axios instance
export default apiClient;

// Export types for TypeScript projects
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: any;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}`;

  const axiosConfigJS = `/**
   * Production-grade Axios configuration with interceptors
   * Automatically included in all React-based projects
   */

import axios from 'axios';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(\`🚀 API Request: \${config.method?.toUpperCase()} \${config.url}\`, {
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = new Date() - response.config.metadata?.startTime;
    
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(\`✅ API Response: \${response.config.method?.toUpperCase()} \${response.config.url}\`, {
        status: response.status,
        duration: \`\${duration}ms\`,
        data: response.data,
      });
    }

    return response;
  },
  (error) => {
    const duration = new Date() - error.config?.metadata?.startTime;
    
    // Log error in development
    if (import.meta.env.DEV) {
      console.error(\`❌ API Error: \${error.config?.method?.toUpperCase()} \${error.config?.url}\`, {
        status: error.response?.status,
        duration: \`\${duration}ms\`,
        message: error.message,
        data: error.response?.data,
      });
    }

    // Handle common error cases
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden:', data?.message || 'You do not have permission to access this resource');
          break;
        case 404:
          // Not found
          console.error('Resource not found:', data?.message || 'The requested resource was not found');
          break;
        case 422:
          // Validation error
          console.error('Validation error:', data?.message || 'Please check your input');
          break;
        case 429:
          // Rate limited
          console.error('Rate limited:', data?.message || 'Too many requests, please try again later');
          break;
        case 500:
          // Server error
          console.error('Server error:', data?.message || 'Something went wrong on our end');
          break;
        default:
          console.error('API Error:', data?.message || 'An unexpected error occurred');
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', 'Unable to connect to the server. Please check your internet connection.');
    } else {
      // Other error
      console.error('Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Utility functions for common HTTP methods
export const api = {
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data, config = {}) => apiClient.post(url, data, config),
  put: (url, data, config = {}) => apiClient.put(url, data, config),
  patch: (url, data, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),
};

// Export the configured axios instance
export default apiClient;`;

  const axiosConfig = generateTemplate(axiosConfigTS, axiosConfigJS);

  const axiosExt = answers.typescript ? 'ts' : 'js';
  await fs.writeFile(path.join(libPath, `axios-config.${axiosExt}`), axiosConfig);

  // Generate TanStack Query configuration
  const queryClientTS = `/**
   * TanStack Query configuration
   * Automatically included in all React-based projects
   */

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create a client
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // Time in milliseconds that data remains fresh
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Time in milliseconds that unused/inactive cache data remains in memory
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      // Retry failed requests
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry failed mutations
      retry: 1,
    },
  },
});

// Query Client Provider Component
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Add React Query Devtools in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

// Export the query client for direct use
export const queryClient = createQueryClient();

// Common query keys factory
export const queryKeys = {
  all: ['api'] as const,
  lists: () => [...queryKeys.all, 'list'] as const,
  list: (filters: string) => [...queryKeys.lists(), { filters }] as const,
  details: () => [...queryKeys.all, 'detail'] as const,
  detail: (id: string) => [...queryKeys.details(), id] as const,
};

// Utility functions for common query patterns
export const queryUtils = {
  // Invalidate all queries
  invalidateAll: () => queryClient.invalidateQueries(),
  
  // Invalidate specific query
  invalidateQuery: (queryKey: any[]) => queryClient.invalidateQueries({ queryKey }),
  
  // Set query data
  setQueryData: (queryKey: any[], data: any) => queryClient.setQueryData(queryKey, data),
  
  // Get query data
  getQueryData: (queryKey: any[]) => queryClient.getQueryData(queryKey),
  
  // Prefetch query
  prefetchQuery: (queryKey: any[], queryFn: any, options: any = {}) => 
    queryClient.prefetchQuery({ queryKey, queryFn, ...options }),
};

export default QueryProvider;`;

  const queryClientJS = `/**
   * TanStack Query configuration
   * Automatically included in all React-based projects
   */

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create a client
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // Time in milliseconds that data remains fresh
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Time in milliseconds that unused/inactive cache data remains in memory
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      // Retry failed requests
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry failed mutations
      retry: 1,
    },
  },
});

// Query Client Provider Component
export function QueryProvider({ children }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Add React Query Devtools in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

// Export the query client for direct use
export const queryClient = createQueryClient();

// Common query keys factory
export const queryKeys = {
  all: ['api'],
  lists: () => [...queryKeys.all, 'list'],
  list: (filters) => [...queryKeys.lists(), { filters }],
  details: () => [...queryKeys.all, 'detail'],
  detail: (id) => [...queryKeys.details(), id],
};

// Utility functions for common query patterns
export const queryUtils = {
  // Invalidate all queries
  invalidateAll: () => queryClient.invalidateQueries(),

  // Invalidate specific query
  invalidateQuery: (queryKey) => queryClient.invalidateQueries({ queryKey }),

  // Set query data
  setQueryData: (queryKey, data) => queryClient.setQueryData(queryKey, data),

  // Get query data
  getQueryData: (queryKey) => queryClient.getQueryData(queryKey),

  // Prefetch query
  prefetchQuery: (queryKey, queryFn, options = {}) =>
    queryClient.prefetchQuery({ queryKey, queryFn, ...options }),
};

export default QueryProvider;`;

  const queryClient = generateTemplate(queryClientTS, queryClientJS);

  const queryExt = answers.typescript ? 'ts' : 'js';
  await fs.writeFile(path.join(libPath, `query-client.${queryExt}`), queryClient);

  // Generate custom hooks for API calls
  const useApiTS = `/**
   * Custom hooks for API calls with TanStack Query
   * Automatically included in all React-based projects
   */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { api } from './axios-config';

// Generic hook for GET requests
export function useApiQuery(key: any[], url: string, options: any = {}) {
  return useQuery({
    queryKey: key,
    queryFn: () => api.get(url).then(res => res.data),
    ...options,
  });
}

// Generic hook for POST requests
export function useApiMutation(mutationFn: any, options: any = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn,
    onSuccess: (data: any, variables: any, context: any) => {
      // Invalidate and refetch queries after successful mutation
      queryClient.invalidateQueries();
      options.onSuccess?.(data, variables, context);
    },
    onError: (error: any, variables: any, context: any) => {
      console.error('Mutation error:', error);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
}

// Specific hooks for common operations
export function useCreateItem(url: string, options: any = {}) {
  return useApiMutation(
    (data: any) => api.post(url, data).then(res => res.data),
    options
  );
}

export function useUpdateItem(url: string, options: any = {}) {
  return useApiMutation(
    ({ id, data }: { id: string; data: any }) => api.put(\`\${url}/\${id}\`, data).then(res => res.data),
    options
  );
}

export function useDeleteItem(url: string, options: any = {}) {
  return useApiMutation(
    (id: string) => api.delete(\`\${url}/\${id}\`).then(res => res.data),
    options
  );
}

// Hook for paginated data
export function usePaginatedQuery(key: any[], url: string, page: number = 1, limit: number = 10, options: any = {}) {
  return useApiQuery(
    [...key, { page, limit }],
    \`\${url}?page=\${page}&limit=\${limit}\`,
    {
      keepPreviousData: true,
      ...options,
    }
  );
}

// Hook for infinite scroll data
export function useInfiniteApiQuery(key: any[], url: string, options: any = {}) {
  return useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) => 
      api.get(\`\${url}?page=\${pageParam}\`).then(res => res.data),
    getNextPageParam: (lastPage: any, pages: any[]) => {
      return lastPage.hasNextPage ? pages.length + 1 : undefined;
    },
    ...options,
  });
}

// Hook for optimistic updates
export function useOptimisticMutation(mutationFn: any, queryKey: any[], options: any = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn,
    onMutate: async (newData: any) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);
      
      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, (old: any) => ({
        ...old,
        data: [...(old?.data || []), newData],
      }));
      
      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (err: any, newData: any, context: any) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(queryKey, context.previousData);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey });
    },
    ...options,
  });
}

// Export all hooks
export default {
  useApiQuery,
  useApiMutation,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
  usePaginatedQuery,
  useInfiniteApiQuery,
  useOptimisticMutation,
};`;

  const useApiJS = `/**
   * Custom hooks for API calls with TanStack Query
   * Automatically included in all React-based projects
   */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { api } from './axios-config';

// Generic hook for GET requests
export function useApiQuery(key, url, options = {}) {
  return useQuery({
    queryKey: key,
    queryFn: () => api.get(url).then(res => res.data),
    ...options,
  });
}

// Generic hook for POST requests
export function useApiMutation(mutationFn, options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn,
    onSuccess: (data, variables, context) => {
      // Invalidate and refetch queries after successful mutation
      queryClient.invalidateQueries();
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('Mutation error:', error);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
}

// Specific hooks for common operations
export function useCreateItem(url, options = {}) {
  return useApiMutation(
    (data) => api.post(url, data).then(res => res.data),
    options
  );
}

export function useUpdateItem(url, options = {}) {
  return useApiMutation(
    ({ id, data }) => api.put(\`\${url}/\${id}\`, data).then(res => res.data),
    options
  );
}

export function useDeleteItem(url, options = {}) {
  return useApiMutation(
    (id) => api.delete(\`\${url}/\${id}\`).then(res => res.data),
    options
  );
}

// Hook for paginated data
export function usePaginatedQuery(key, url, page = 1, limit = 10, options = {}) {
  return useApiQuery(
    [...key, { page, limit }],
    \`\${url}?page=\${page}&limit=\${limit}\`,
    {
      keepPreviousData: true,
      ...options,
    }
  );
}

// Hook for infinite scroll data
export function useInfiniteApiQuery(key, url, options = {}) {
  return useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam = 1 }) => 
      api.get(\`\${url}?page=\${pageParam}\`).then(res => res.data),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasNextPage ? pages.length + 1 : undefined;
    },
    ...options,
  });
}

// Hook for optimistic updates
export function useOptimisticMutation(mutationFn, queryKey, options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn,
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);
      
      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, (old) => ({
        ...old,
        data: [...(old?.data || []), newData],
      }));
      
      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (err, newData, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(queryKey, context.previousData);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey });
    },
    ...options,
  });
}

// Export all hooks
export default {
  useApiQuery,
  useApiMutation,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
  usePaginatedQuery,
  useInfiniteApiQuery,
  useOptimisticMutation,
};`;

  const useApi = generateTemplate(useApiTS, useApiJS);

  const useApiExt = answers.typescript ? 'ts' : 'js';
  await fs.writeFile(path.join(libPath, `use-api.${useApiExt}`), useApi);
}