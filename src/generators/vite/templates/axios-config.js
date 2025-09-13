/**
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
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request timestamp for debugging
        config.metadata = { startTime: new Date() };

        // Log request in development
        if (import.meta.env.DEV) {
            console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
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
            console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
                status: response.status,
                duration: `${duration}ms`,
                data: response.data,
            });
        }

        return response;
    },
    (error) => {
        const duration = new Date() - error.config?.metadata?.startTime;

        // Log error in development
        if (import.meta.env.DEV) {
            console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
                status: error.response?.status,
                duration: `${duration}ms`,
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
}
