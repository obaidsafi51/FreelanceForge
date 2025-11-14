import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions
} from '@tanstack/react-query';
import { 
  getCredentials, 
  mintCredential, 
  updateCredential, 
  deleteCredential,
  type CredentialMetadata,
  type TransactionResult,
  ApiError,
  ApiErrorType
} from '../utils/api';
import type { Credential } from '../types';

// Query keys for consistent cache management
export const credentialQueryKeys = {
  all: ['credentials'] as const,
  lists: () => [...credentialQueryKeys.all, 'list'] as const,
  list: (accountAddress: string) => [...credentialQueryKeys.lists(), accountAddress] as const,
  details: () => [...credentialQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...credentialQueryKeys.details(), id] as const,
};

// Hook for fetching user credentials with caching
export function useCredentials(
  accountAddress: string | null,
  options?: Omit<UseQueryOptions<Credential[], ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: credentialQueryKeys.list(accountAddress || ''),
    queryFn: () => {
      if (!accountAddress) {
        throw new ApiError(ApiErrorType.VALIDATION_ERROR, 'Account address is required');
      }
      return getCredentials(accountAddress);
    },
    enabled: !!accountAddress,
    staleTime: 60 * 1000, // 60 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
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
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
}

// Mutation hook for minting credentials
export function useMintCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { accountAddress: string; credentialData: CredentialMetadata }) => {
      return mintCredential(params.accountAddress, params.credentialData);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch credentials to get the real data
      queryClient.invalidateQueries({ 
        queryKey: credentialQueryKeys.list(variables.accountAddress) 
      });
    },
    onError: (error) => {
      console.error('Mint credential failed:', error);
    },
  });
}

// Mutation hook for updating credentials
export function useUpdateCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { 
      accountAddress: string; 
      credentialId: string; 
      updates: { visibility?: 'public' | 'private'; proof_hash?: string } 
    }) => {
      return updateCredential(params.accountAddress, params.credentialId, params.updates);
    },
    onSuccess: (data, variables) => {
      // Invalidate credentials list
      queryClient.invalidateQueries({ 
        queryKey: credentialQueryKeys.list(variables.accountAddress) 
      });
    },
  });
}

// Mutation hook for deleting credentials
export function useDeleteCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { accountAddress: string; credentialId: string }) => {
      return deleteCredential(params.accountAddress, params.credentialId);
    },
    onSuccess: (data, variables) => {
      // Invalidate credentials list
      queryClient.invalidateQueries({ 
        queryKey: credentialQueryKeys.list(variables.accountAddress) 
      });
    },
  });
}

// Cache utilities
export const credentialCacheUtils = {
  // Invalidate all credentials for a specific account
  invalidateCredentials: (accountAddress: string) => {
    const queryClient = useQueryClient();
    queryClient.invalidateQueries({ 
      queryKey: credentialQueryKeys.list(accountAddress) 
    });
  },

  // Get cached credentials without triggering a fetch
  getCachedCredentials: (accountAddress: string): Credential[] | undefined => {
    const queryClient = useQueryClient();
    return queryClient.getQueryData(credentialQueryKeys.list(accountAddress));
  },

  // Set credentials in cache manually
  setCredentials: (accountAddress: string, credentials: Credential[]) => {
    const queryClient = useQueryClient();
    queryClient.setQueryData(credentialQueryKeys.list(accountAddress), credentials);
  },
};