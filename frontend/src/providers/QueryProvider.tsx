import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

interface QueryProviderProps {
    children: React.ReactNode;
}

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000, // 60 seconds
            gcTime: 5 * 60 * 1000, // 5 minutes
            retry: (failureCount, error) => {
                // Don't retry on certain errors
                if (error instanceof Error && error.message.includes('Cancelled')) {
                    return false;
                }
                return failureCount < 3;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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