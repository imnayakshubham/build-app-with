/**
 * Custom hooks for API calls with TanStack Query
 * Automatically included in all React-based projects
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
        ({ id, data }) => api.put(`${url}/${id}`, data).then(res => res.data),
        options
    );
}

export function useDeleteItem(url, options = {}) {
    return useApiMutation(
        (id) => api.delete(`${url}/${id}`).then(res => res.data),
        options
    );
}

// Hook for paginated data
export function usePaginatedQuery(key, url, page = 1, limit = 10, options = {}) {
    return useApiQuery(
        [...key, { page, limit }],
        `${url}?page=${page}&limit=${limit}`,
        {
            keepPreviousData: true,
            ...options,
        }
    );
}

// Hook for infinite scroll data
export function useInfiniteQuery(key, url, options = {}) {
    return useInfiniteQuery({
        queryKey: key,
        queryFn: ({ pageParam = 1 }) =>
            api.get(`${url}?page=${pageParam}`).then(res => res.data),
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
    useInfiniteQuery,
    useOptimisticMutation,
};
