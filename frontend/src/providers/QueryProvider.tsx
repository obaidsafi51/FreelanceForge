import React from 'react';
import { QueryClientProvider, ReactQueryDevtools, queryClient } from '../hooks/useQuery';

interface QueryProviderProps {
    children: React.ReactNode;
}

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