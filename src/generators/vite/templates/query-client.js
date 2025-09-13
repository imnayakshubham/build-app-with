/**
 * TanStack Query configuration
 * Automatically included in all React-based projects
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

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
    invalidateQuery: (queryKey) => queryClient.invalidateQueries({ queryKey }),

    // Set query data
    setQueryData: (queryKey, data) => queryClient.setQueryData(queryKey, data),

    // Get query data
    getQueryData: (queryKey) => queryClient.getQueryData(queryKey),

    // Prefetch query
    prefetchQuery: (queryKey, queryFn, options = {}) =>
        queryClient.prefetchQuery({ queryKey, queryFn, ...options }),
};

export default QueryProvider;
