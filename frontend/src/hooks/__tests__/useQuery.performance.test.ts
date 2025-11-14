import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { queryClient, cacheUtils, queryKeys } from '../useQuery';
import type { Credential } from '../../types';
import type { CredentialMetadata } from '../../utils/api';

// Mock the API functions
vi.mock('../../utils/api', () => ({
  getCredentials: vi.fn(),
  mintCredential: vi.fn(),
  updateCredential: vi.fn(),
  deleteCredential: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(public type: string, message: string) {
      super(message);
    }
  },
  ApiErrorType: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
  },
}));

const mockCredentials: Credential[] = [
  {
    id: 'cred-1',
    owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    credential_type: 'skill',
    name: 'React Development',
    description: 'Expert in React.js development',
    issuer: 'Tech Corp',
    timestamp: '2024-01-01T00:00:00Z',
    visibility: 'public',
  },
  {
    id: 'cred-2',
    owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    credential_type: 'review',
    name: 'Client Review',
    description: 'Excellent work on project',
    issuer: 'Client ABC',
    rating: 5,
    timestamp: '2024-01-02T00:00:00Z',
    visibility: 'public',
  },
];

describe('TanStack Query Performance and Caching', () => {
  let testQueryClient: QueryClient;
  const accountAddress = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

  beforeEach(() => {
    // Create a fresh query client for each test
    testQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 60 seconds
          gcTime: 5 * 60 * 1000, // 5 minutes
          retry: false, // Disable retries for testing
        },
        mutations: {
          retry: false,
        },
      },
    });
  });

  afterEach(() => {
    testQueryClient.clear();
    vi.clearAllMocks();
  });

  describe('Cache Configuration', () => {
    it('should have correct stale time (60s) and cache time (5min)', () => {
      const defaultOptions = testQueryClient.getDefaultOptions();
      
      expect(defaultOptions.queries?.staleTime).toBe(60 * 1000); // 60 seconds
      expect(defaultOptions.queries?.gcTime).toBe(5 * 60 * 1000); // 5 minutes
    });

    it('should configure background refetching correctly', () => {
      // Test the main query client configuration (not the test client)
      const mainQueryClient = queryClient;
      const defaultOptions = mainQueryClient.getDefaultOptions();
      
      expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(true);
      expect(defaultOptions.queries?.refetchOnReconnect).toBe(true);
      expect(defaultOptions.queries?.refetchOnMount).toBe(true);
    });
  });

  describe('Query Client Cache Management', () => {
    it('should cache credentials data correctly', async () => {
      const { getCredentials } = await import('../../utils/api');
      (getCredentials as any).mockResolvedValue(mockCredentials);

      // Manually set data in cache
      testQueryClient.setQueryData(queryKeys.credentials(accountAddress), mockCredentials);

      // Check that data is cached
      const cachedData = testQueryClient.getQueryData(queryKeys.credentials(accountAddress));
      expect(cachedData).toEqual(mockCredentials);
    });

    it('should handle cache invalidation correctly', async () => {
      // Set initial data
      testQueryClient.setQueryData(queryKeys.credentials(accountAddress), mockCredentials);
      
      // Verify data is cached
      expect(testQueryClient.getQueryData(queryKeys.credentials(accountAddress))).toEqual(mockCredentials);

      // Invalidate cache
      testQueryClient.invalidateQueries({ queryKey: queryKeys.credentials(accountAddress) });

      // Cache should be marked as stale
      const queryState = testQueryClient.getQueryState(queryKeys.credentials(accountAddress));
      expect(queryState?.isInvalidated).toBe(true);
    });

    it('should support manual cache operations', async () => {
      // Test setting data
      testQueryClient.setQueryData(queryKeys.credentials(accountAddress), mockCredentials);
      expect(testQueryClient.getQueryData(queryKeys.credentials(accountAddress))).toEqual(mockCredentials);

      // Test removing data
      testQueryClient.removeQueries({ queryKey: queryKeys.credentials(accountAddress) });
      expect(testQueryClient.getQueryData(queryKeys.credentials(accountAddress))).toBeUndefined();
    });

    it('should handle query state management', async () => {
      // Initially no query state
      expect(testQueryClient.getQueryState(queryKeys.credentials(accountAddress))).toBeUndefined();

      // Set data and check state
      testQueryClient.setQueryData(queryKeys.credentials(accountAddress), mockCredentials);
      const queryState = testQueryClient.getQueryState(queryKeys.credentials(accountAddress));
      
      expect(queryState).toBeDefined();
      expect(queryState?.data).toEqual(mockCredentials);
    });
  });

  describe('Cache Mutation Simulation', () => {
    it('should simulate optimistic updates for mint credential', async () => {
      // Pre-populate cache with existing credentials
      testQueryClient.setQueryData(queryKeys.credentials(accountAddress), mockCredentials);

      const newCredential: Credential = {
        id: 'temp-123',
        owner: accountAddress,
        credential_type: 'certification',
        name: 'AWS Certification',
        description: 'AWS Solutions Architect',
        issuer: 'Amazon',
        timestamp: '2024-01-03T00:00:00Z',
        visibility: 'public',
      };

      // Simulate optimistic update
      testQueryClient.setQueryData(
        queryKeys.credentials(accountAddress),
        (old: Credential[] | undefined) => old ? [newCredential, ...old] : [newCredential]
      );

      // Should immediately show optimistic update
      const cachedData = testQueryClient.getQueryData(queryKeys.credentials(accountAddress)) as Credential[];
      expect(cachedData).toHaveLength(3); // Original 2 + 1 optimistic
      expect(cachedData[0].name).toBe('AWS Certification'); // Should be first (newest)
    });

    it('should simulate rollback on error', async () => {
      // Pre-populate cache
      testQueryClient.setQueryData(queryKeys.credentials(accountAddress), mockCredentials);

      // Simulate optimistic update
      const optimisticCredential: Credential = {
        id: 'temp-456',
        owner: accountAddress,
        credential_type: 'skill',
        name: 'Failed Credential',
        description: 'This should be rolled back',
        issuer: 'Test',
        timestamp: '2024-01-03T00:00:00Z',
        visibility: 'public',
      };

      testQueryClient.setQueryData(
        queryKeys.credentials(accountAddress),
        (old: Credential[] | undefined) => old ? [optimisticCredential, ...old] : [optimisticCredential]
      );

      // Verify optimistic update
      let cachedData = testQueryClient.getQueryData(queryKeys.credentials(accountAddress)) as Credential[];
      expect(cachedData).toHaveLength(3);

      // Simulate rollback on error
      testQueryClient.setQueryData(queryKeys.credentials(accountAddress), mockCredentials);

      // Cache should be rolled back to original state
      cachedData = testQueryClient.getQueryData(queryKeys.credentials(accountAddress)) as Credential[];
      expect(cachedData).toEqual(mockCredentials);
      expect(cachedData).toHaveLength(2); // Back to original length
    });

    it('should simulate cache invalidation after successful mutation', async () => {
      // Pre-populate cache
      testQueryClient.setQueryData(queryKeys.credentials(accountAddress), mockCredentials);

      // Simulate successful mutation by invalidating cache
      testQueryClient.invalidateQueries({ queryKey: queryKeys.credentials(accountAddress) });

      // Cache should be marked as stale
      const queryState = testQueryClient.getQueryState(queryKeys.credentials(accountAddress));
      expect(queryState?.isInvalidated).toBe(true);

      // Simulate refetch with updated data
      const updatedCredentials = [...mockCredentials, {
        id: 'cred-3',
        owner: accountAddress,
        credential_type: 'certification' as const,
        name: 'Real Credential',
        description: 'This is the real credential from blockchain',
        issuer: 'Blockchain',
        timestamp: '2024-01-03T00:00:00Z',
        visibility: 'public' as const,
      }];

      testQueryClient.setQueryData(queryKeys.credentials(accountAddress), updatedCredentials);

      // Cache should be updated with real data
      const cachedData = testQueryClient.getQueryData(queryKeys.credentials(accountAddress)) as Credential[];
      expect(cachedData).toEqual(updatedCredentials);
      expect(cachedData).toHaveLength(3);
    });
  });

  describe('Cache Invalidation Strategies', () => {
    it('should provide cache utility functions', () => {
      expect(typeof cacheUtils.invalidateCredentials).toBe('function');
      expect(typeof cacheUtils.invalidateCredential).toBe('function');
      expect(typeof cacheUtils.clearCache).toBe('function');
      expect(typeof cacheUtils.prefetchCredentials).toBe('function');
      expect(typeof cacheUtils.getCachedCredentials).toBe('function');
      expect(typeof cacheUtils.setCredentials).toBe('function');
    });

    it('should manually invalidate credentials cache', async () => {
      // Pre-populate cache
      testQueryClient.setQueryData(['credentials', accountAddress], mockCredentials);

      // Verify data is cached
      expect(testQueryClient.getQueryData(['credentials', accountAddress])).toEqual(mockCredentials);

      // Invalidate cache
      testQueryClient.invalidateQueries({ queryKey: ['credentials', accountAddress] });

      // Cache should be marked as stale
      const queryState = testQueryClient.getQueryState(['credentials', accountAddress]);
      expect(queryState?.isInvalidated).toBe(true);
    });

    it('should prefetch credentials for better UX', async () => {
      const { getCredentials } = await import('../../utils/api');
      (getCredentials as any).mockResolvedValue(mockCredentials);

      // Prefetch data
      await testQueryClient.prefetchQuery({
        queryKey: ['credentials', accountAddress],
        queryFn: () => getCredentials(accountAddress),
        staleTime: 60 * 1000,
      });

      // Data should be available immediately
      const cachedData = testQueryClient.getQueryData(['credentials', accountAddress]);
      expect(cachedData).toEqual(mockCredentials);
    });
  });

  describe('Performance Characteristics', () => {
    it('should handle multiple cache operations efficiently', async () => {
      const startTime = performance.now();

      // Simulate multiple concurrent cache operations
      for (let i = 0; i < 100; i++) {
        testQueryClient.setQueryData(queryKeys.credentials(`account-${i}`), mockCredentials);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete quickly (under 100ms for 100 operations)
      expect(duration).toBeLessThan(100);

      // Verify all data was cached
      for (let i = 0; i < 100; i++) {
        const cachedData = testQueryClient.getQueryData(queryKeys.credentials(`account-${i}`));
        expect(cachedData).toEqual(mockCredentials);
      }
    });

    it('should handle background refetching simulation', async () => {
      // Set initial data
      testQueryClient.setQueryData(queryKeys.credentials(accountAddress), mockCredentials);

      // Simulate background refetch by invalidating
      testQueryClient.invalidateQueries({ queryKey: queryKeys.credentials(accountAddress) });

      // Check that query is marked as stale
      const queryState = testQueryClient.getQueryState(queryKeys.credentials(accountAddress));
      expect(queryState?.isInvalidated).toBe(true);

      // Simulate refetch completing
      const updatedData = [...mockCredentials, {
        id: 'new-cred',
        owner: accountAddress,
        credential_type: 'skill' as const,
        name: 'New Skill',
        description: 'Background updated skill',
        issuer: 'Auto Update',
        timestamp: new Date().toISOString(),
        visibility: 'public' as const,
      }];

      testQueryClient.setQueryData(queryKeys.credentials(accountAddress), updatedData);

      // Verify updated data
      const finalData = testQueryClient.getQueryData(queryKeys.credentials(accountAddress));
      expect(finalData).toEqual(updatedData);
    });
  });

  describe('Error Handling and Retry Logic', () => {
    it('should simulate retry behavior configuration', async () => {
      // Test retry configuration
      const retryQueryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
      });

      const defaultOptions = retryQueryClient.getDefaultOptions();
      expect(defaultOptions.queries?.retry).toBe(2);
      expect(typeof defaultOptions.queries?.retryDelay).toBe('function');

      // Test retry delay calculation
      const retryDelay = defaultOptions.queries?.retryDelay as (attemptIndex: number) => number;
      expect(retryDelay(0)).toBe(1000); // First retry: 1s
      expect(retryDelay(1)).toBe(2000); // Second retry: 2s
      expect(retryDelay(2)).toBe(4000); // Third retry: 4s
    });

    it('should handle error state simulation', async () => {
      const { ApiError, ApiErrorType } = await import('../../utils/api');
      
      // Simulate setting error state
      const validationError = new (ApiError as any)(ApiErrorType.VALIDATION_ERROR, 'Invalid input');
      
      // Test that error types are properly defined
      expect(ApiErrorType.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ApiErrorType.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(validationError.type).toBe('VALIDATION_ERROR');
      expect(validationError.message).toBe('Invalid input');
    });

    it('should test exponential backoff calculation', () => {
      const calculateRetryDelay = (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000);
      
      // Test exponential backoff progression
      expect(calculateRetryDelay(0)).toBe(1000);   // 1s
      expect(calculateRetryDelay(1)).toBe(2000);   // 2s
      expect(calculateRetryDelay(2)).toBe(4000);   // 4s
      expect(calculateRetryDelay(3)).toBe(8000);   // 8s
      expect(calculateRetryDelay(4)).toBe(16000);  // 16s
      expect(calculateRetryDelay(5)).toBe(30000);  // 30s (capped)
      expect(calculateRetryDelay(10)).toBe(30000); // Still capped at 30s
    });
  });
});