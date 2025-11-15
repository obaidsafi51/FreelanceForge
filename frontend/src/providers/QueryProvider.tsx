import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

interface QueryProviderProps {
    children: React.ReactNode;
}

// Create a client with optimized performance settings
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000, // 60 seconds - data is fresh for 1 minute
            gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache for 10 minutes
            refetchOnWindowFocus: false, // Disable refetch on window focus for better performance
            refetchOnReconnect: true, // Refetch when network reconnects
            refetchOnMount: true, // Refetch when component mounts
            retry: (failureCount, error) => {
                // Don't retry on certain errors
                if (error instanceof Error) {
                    const message = error.message.toLowerCase();
                    if (message.includes('cancelled') ||
                        message.includes('aborted') ||
                        message.includes('validation') ||
                        message.includes('unauthorized')) {
                        return false;
                    }
                }
                return failureCount < 3;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        },
        mutations: {
            retry: (failureCount, error) => {
                // Don't retry mutations on validation errors
                if (error instanceof Error) {
                    const message = error.message.toLowerCase();
                    if (message.includes('validation') ||
                        message.includes('unauthorized') ||
                        message.includes('already exists')) {
                        return false;
                    }
                }
                return failureCount < 2; // Fewer retries for mutations
            },
            retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 10000),
        },
    },
});

/**
 * QueryProvider component that wraps the app with TanStack Query
 * Provides caching, background refetching, and optimistic updates
 */
export function QueryProvider({ children }: QueryProviderProps) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* Only show devtools in development */}
            {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools
                    initialIsOpen={false}
                />
            )}
        </QueryClientProvider>
    );
}

export default QueryProvider;