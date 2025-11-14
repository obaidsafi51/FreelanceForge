import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  QueryClient,
  QueryClientProvider as TanStackQueryClientProvider,
  type UseQueryOptions,
  type UseMutationOptions
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { 
  getCredentials, 
  mintCredential, 
  updateCredential, 
  deleteCredential,
  getCredentialById,
  ApiError,
  ApiErrorType,
  type CredentialMetadata,
  type TransactionResult
} from '../utils/api';
import type { Credential } from '../types';

// Query keys for consistent cache management
export const queryKeys = {
  credentials: (accountAddress: string) => ['credentials', accountAddress] as const,
  credential: (credentialId: string) => ['credential', credentialId] as const,
  networkInfo: () => ['networkInfo'] as const,
} as const;

// Configure QueryClient with appropriate cache settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 60 seconds stale time as specified in requirements
      staleTime: 60 * 1000, // 60 seconds
      // 5 minutes cache time as specified in requirements
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      // Retry failed queries with exponential backoff
      retry: (failureCount, error) => {
        // Don't retry on certain error types
        if (error instanceof ApiError) {
          const nonRetryableErrors = [
            ApiErrorType.CREDENTIAL_ALREADY_EXISTS,
            ApiErrorType.METADATA_TOO_LARGE,
            ApiErrorType.TOO_MANY_CREDENTIALS,
            ApiErrorType.NOT_CREDENTIAL_OWNER,
            ApiErrorType.VALIDATION_ERROR,
          ];
          if (nonRetryableErrors.includes(error.type)) {
            return false;
          }
        }
        // Retry up to 3 times for network errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      // Background refetching settings
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      // Retry mutations once for network errors
      retry: (failureCount, error) => {
        if (error instanceof ApiError) {
          // Only retry network errors
          return error.type === ApiErrorType.NETWORK_ERROR && failureCount < 1;
        }
        return false;
      },
    },
  },
});

// Hook for fetching user credentials with caching
export function useCredentials(
  accountAddress: string | null,
  options?: Omit<UseQueryOptions<Credential[], ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.credentials(accountAddress || ''),
    queryFn: () => {
      if (!accountAddress) {
        throw new ApiError(ApiErrorType.VALIDATION_ERROR, 'Account address is required');
      }
      return getCredentials(accountAddress);
    },
    enabled: !!accountAddress, // Only run query when account address is available
    ...options,
  });
}

// Hook for fetching a specific credential by ID
export function useCredential(
  credentialId: string | null,
  options?: Omit<UseQueryOptions<Credential | null, ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.credential(credentialId || ''),
    queryFn: () => {
      if (!credentialId) {
        throw new ApiError(ApiErrorType.VALIDATION_ERROR, 'Credential ID is required');
      }
      return getCredentialById(credentialId);
    },
    enabled: !!credentialId,
    ...options,
  });
}

// Mutation hook for minting credentials with optimistic updates
export function useMintCredential(
  options?: UseMutationOptions<
    TransactionResult,
    ApiError,
    { accountAddress: string; credentialData: CredentialMetadata },
    { previousCredentials?: Credential[]; accountAddress: string }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accountAddress, credentialData }) => 
      mintCredential(accountAddress, credentialData),
    
    // Optimistic update: add credential to cache immediately
    onMutate: async ({ accountAddress, credentialData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.credentials(accountAddress) 
      });

      // Snapshot the previous value
      const previousCredentials = queryClient.getQueryData<Credential[]>(
        queryKeys.credentials(accountAddress)
      );

      // Optimistically update to the new value
      if (previousCredentials) {
        const optimisticCredential: Credential = {
          id: `temp-${Date.now()}`, // Temporary ID
          owner: accountAddress,
          credential_type: credentialData.credential_type,
          name: credentialData.name,
          description: credentialData.description,
          issuer: credentialData.issuer,
          rating: credentialData.rating,
          timestamp: credentialData.timestamp,
          visibility: credentialData.visibility || 'public',
          proof_hash: credentialData.proof_hash,
        };

        queryClient.setQueryData<Credential[]>(
          queryKeys.credentials(accountAddress),
          (old) => old ? [optimisticCredential, ...old] : [optimisticCredential]
        );
      }

      // Return a context object with the snapshotted value
      return { previousCredentials, accountAddress };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (error, variables, context) => {
      if (context?.previousCredentials) {
        queryClient.setQueryData(
          queryKeys.credentials(context.accountAddress),
          context.previousCredentials
        );
      }
      
      // Call user-provided onError if exists
      options?.onError?.(error, variables, context);
    },

    // Always refetch after error or success to ensure cache consistency
    onSettled: (data, error, variables, context) => {
      // Invalidate and refetch credentials to get the real data
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.credentials(variables.accountAddress) 
      });
      
      // Call user-provided onSettled if exists
      options?.onSettled?.(data, error, variables, context);
    },

    // On success, update cache with real credential data
    onSuccess: (data, variables, context) => {
      // The invalidation in onSettled will refetch the real data
      // We could also update the cache here if we had the real credential ID
      
      // Call user-provided onSuccess if exists
      options?.onSuccess?.(data, variables, context);
    },

    ...options,
  });
}

// Mutation hook for updating credentials
export function useUpdateCredential(
  options?: UseMutationOptions<
    TransactionResult,
    ApiError,
    { 
      accountAddress: string; 
      credentialId: string; 
      updates: { visibility?: 'public' | 'private'; proof_hash?: string } 
    }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accountAddress, credentialId, updates }) => 
      updateCredential(accountAddress, credentialId, updates),
    
    // Optimistic update for credential changes
    onMutate: async ({ accountAddress, credentialId, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.credentials(accountAddress) 
      });
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.credential(credentialId) 
      });

      // Snapshot the previous values
      const previousCredentials = queryClient.getQueryData<Credential[]>(
        queryKeys.credentials(accountAddress)
      );
      const previousCredential = queryClient.getQueryData<Credential | null>(
        queryKeys.credential(credentialId)
      );

      // Optimistically update credentials list
      if (previousCredentials) {
        queryClient.setQueryData<Credential[]>(
          queryKeys.credentials(accountAddress),
          (old) => old?.map(credential => 
            credential.id === credentialId 
              ? { ...credential, ...updates }
              : credential
          ) || []
        );
      }

      // Optimistically update individual credential
      if (previousCredential) {
        queryClient.setQueryData<Credential>(
          queryKeys.credential(credentialId),
          { ...previousCredential, ...updates }
        );
      }

      return { previousCredentials, previousCredential, accountAddress, credentialId };
    },

    // Rollback on error
    onError: (error, variables, context) => {
      if (context?.previousCredentials) {
        queryClient.setQueryData(
          queryKeys.credentials(context.accountAddress),
          context.previousCredentials
        );
      }
      if (context?.previousCredential) {
        queryClient.setQueryData(
          queryKeys.credential(context.credentialId),
          context.previousCredential
        );
      }
      
      options?.onError?.(error, variables, context);
    },

    // Refetch to ensure consistency
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.credentials(variables.accountAddress) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.credential(variables.credentialId) 
      });
      
      options?.onSettled?.(data, error, variables, context);
    },

    ...options,
  });
}

// Mutation hook for deleting credentials
export function useDeleteCredential(
  options?: UseMutationOptions<
    TransactionResult,
    ApiError,
    { accountAddress: string; credentialId: string }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accountAddress, credentialId }) => 
      deleteCredential(accountAddress, credentialId),
    
    // Optimistic update: remove credential from cache immediately
    onMutate: async ({ accountAddress, credentialId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.credentials(accountAddress) 
      });

      // Snapshot the previous value
      const previousCredentials = queryClient.getQueryData<Credential[]>(
        queryKeys.credentials(accountAddress)
      );

      // Optimistically remove the credential
      if (previousCredentials) {
        queryClient.setQueryData<Credential[]>(
          queryKeys.credentials(accountAddress),
          (old) => old?.filter(credential => credential.id !== credentialId) || []
        );
      }

      // Remove individual credential from cache
      queryClient.removeQueries({ 
        queryKey: queryKeys.credential(credentialId) 
      });

      return { previousCredentials, accountAddress, credentialId };
    },

    // Rollback on error
    onError: (error, variables, context) => {
      if (context?.previousCredentials) {
        queryClient.setQueryData(
          queryKeys.credentials(context.accountAddress),
          context.previousCredentials
        );
      }
      
      options?.onError?.(error, variables, context);
    },

    // Refetch to ensure consistency
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.credentials(variables.accountAddress) 
      });
      
      options?.onSettled?.(data, error, variables, context);
    },

    ...options,
  });
}

// Cache invalidation utilities
export const cacheUtils = {
  // Invalidate all credentials for a specific account
  invalidateCredentials: (accountAddress: string) => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.credentials(accountAddress) 
    });
  },

  // Invalidate a specific credential
  invalidateCredential: (credentialId: string) => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.credential(credentialId) 
    });
  },

  // Clear all cached data
  clearCache: () => {
    queryClient.clear();
  },

  // Prefetch credentials for better UX
  prefetchCredentials: (accountAddress: string) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.credentials(accountAddress),
      queryFn: () => getCredentials(accountAddress),
      staleTime: 60 * 1000, // 60 seconds
    });
  },

  // Get cached credentials without triggering a fetch
  getCachedCredentials: (accountAddress: string): Credential[] | undefined => {
    return queryClient.getQueryData(queryKeys.credentials(accountAddress));
  },

  // Set credentials in cache manually
  setCredentials: (accountAddress: string, credentials: Credential[]) => {
    queryClient.setQueryData(queryKeys.credentials(accountAddress), credentials);
  },
};

// Export components for provider setup
export { TanStackQueryClientProvider as QueryClientProvider, ReactQueryDevtools };