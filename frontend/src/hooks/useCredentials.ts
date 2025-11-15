import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  type UseQueryOptions
} from '@tanstack/react-query';
import { 
  getCredentials, 
  mintCredential, 
  updateCredential, 
  deleteCredential,
  type CredentialMetadata,
  ApiError,
  ApiErrorType
} from '../utils/api';
import { useNotifications, NotificationTemplates } from '../components/NotificationSystem';
import { useErrorHandler } from './useErrorHandler';
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
        const nonRetryableErrors: ApiErrorType[] = [
          ApiErrorType.CREDENTIAL_ALREADY_EXISTS,
          ApiErrorType.METADATA_TOO_LARGE,
          ApiErrorType.TOO_MANY_CREDENTIALS,
          ApiErrorType.NOT_CREDENTIAL_OWNER,
          ApiErrorType.VALIDATION_ERROR,
        ];
        if (nonRetryableErrors.includes(error.type as ApiErrorType)) {
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
  const { addNotification } = useNotifications();
  const { handleTransactionError } = useErrorHandler();

  return useMutation({
    mutationFn: async (params: { accountAddress: string; credentialData: CredentialMetadata }) => {
      // Show transaction submitted notification
      addNotification(NotificationTemplates.transactionSubmitted('mint'));
      
      const result = await mintCredential(params.accountAddress, params.credentialData);
      
      // Show transaction confirmed notification
      addNotification(NotificationTemplates.transactionConfirmed('Credential minting'));
      
      return result;
    },
    onSuccess: (result, variables) => {
      // Show success notification
      addNotification(NotificationTemplates.credentialMinted(variables.credentialData.name));
      
      // Invalidate and refetch credentials to get the real data
      queryClient.invalidateQueries({ 
        queryKey: credentialQueryKeys.list(variables.accountAddress) 
      });
    },
    onError: (error, variables) => {
      console.error('Mint credential failed:', error);
      
      // Use transaction error handler with network context
      handleTransactionError(error, 'paseo'); // TODO: Get network from context
    },
  });
}

// Mutation hook for updating credentials
export function useUpdateCredential() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const { handleTransactionError } = useErrorHandler();

  return useMutation({
    mutationFn: async (params: { 
      accountAddress: string; 
      credentialId: string; 
      updates: { visibility?: 'public' | 'private'; proof_hash?: string };
      credentialName?: string; // For notification purposes
    }) => {
      const result = await updateCredential(params.accountAddress, params.credentialId, params.updates);
      return { ...result, credentialName: params.credentialName };
    },
    onSuccess: (result, variables) => {
      // Show success notification
      const credentialName = result.credentialName || 'Credential';
      addNotification(NotificationTemplates.credentialUpdated(credentialName));
      
      // Invalidate credentials list
      queryClient.invalidateQueries({ 
        queryKey: credentialQueryKeys.list(variables.accountAddress) 
      });
    },
    onError: (error) => {
      console.error('Update credential failed:', error);
      handleTransactionError(error, 'paseo');
    },
  });
}

// Mutation hook for deleting credentials
export function useDeleteCredential() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const { handleTransactionError } = useErrorHandler();

  return useMutation({
    mutationFn: async (params: { 
      accountAddress: string; 
      credentialId: string;
      credentialName?: string; // For notification purposes
    }) => {
      const result = await deleteCredential(params.accountAddress, params.credentialId);
      return { ...result, credentialName: params.credentialName };
    },
    onSuccess: (result, variables) => {
      // Show success notification
      const credentialName = result.credentialName || 'Credential';
      addNotification(NotificationTemplates.credentialDeleted(credentialName));
      
      // Invalidate credentials list
      queryClient.invalidateQueries({ 
        queryKey: credentialQueryKeys.list(variables.accountAddress) 
      });
    },
    onError: (error) => {
      console.error('Delete credential failed:', error);
      handleTransactionError(error, 'paseo');
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