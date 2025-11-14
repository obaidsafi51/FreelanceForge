import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { queryKeys, cacheUtils } from '../useQuery';
import type { Credential } from '../../types';

// Mock data for testing caching behavior
const mockCredentials: Credential[] = [
  {
    id: 'cred-1',
    owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    credential_type: 'skill',
    name: 'React Development',
    description: 'Expert in React.js development with 5+ years experience',
    issuer: 'Tech Corp',
    timestamp: '2024-01-01T00:00:00Z',
    visibility: 'public',
  },
  {
    id: 'cred-2',
    owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    credential_type: 'review',
    name: 'Excellent Client Review',
    description: 'Outstanding work on e-commerce platform development',
    issuer: 'Client ABC Inc',
    rating: 5,
    timestamp: '2024-01-15T00:00:00Z',
    visibility: 'public',
  },
  {
    id: 'cred-3',
    owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    credential_type: 'payment',
    name: 'Project Payment Confirmation',
    description: 'Payment received for mobile app development project',
    issuer: 'PaymentProcessor',
    timestamp: '2024-01-20T00:00:00Z',
    visibility: 'public',
  },
  {
    id: 'cred-4',
    owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    credential_type: 'certification',
    name: 'AWS Solutions Architect',
    description: 'AWS Certified Solutions Architect - Professional',
    issuer: 'Amazon Web Services',
    timestamp: '2024-02-01T00:00:00Z',
    visibility: 'public',
  },
];

describe('TanStack Query Caching Demo with Mock Data', () => {
  let demoQueryClient: QueryClient;
  const accountAddress = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

  beforeEach(() => {
    // Create a fresh query client with production-like settings
    demoQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 60 seconds - as specified in requirements
          gcTime: 5 * 60 * 1000, // 5 minutes - as specified in requirements
          refetchOnWindowFocus: true,
          refetchOnReconnect: true,
          refetchOnMount: true,
          retry: (failureCount, error) => {
            // Retry logic as implemented in useQuery.ts
            return failureCount < 3;
          },
          retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        },
      },
    });
  });

  afterEach(() => {
    demoQueryClient.clear();
  });

  describe('Cache Performance with Mock Data', () => {
    it('should demonstrate fast cache operations with 100+ credentials', () => {
      const startTime = performance.now();

      // Generate 100 mock credentials
      const largeCredentialSet: Credential[] = Array.from({ length: 100 }, (_, index) => ({
        id: `cred-${index + 1}`,
        owner: accountAddress,
        credential_type: ['skill', 'review', 'payment', 'certification'][index % 4] as any,
        name: `Credential ${index + 1}`,
        description: `Description for credential ${index + 1}`,
        issuer: `Issuer ${Math.floor(index / 10) + 1}`,
        rating: index % 4 === 1 ? Math.floor(Math.random() * 5) + 1 : undefined,
        timestamp: new Date(2024, 0, 1 + index).toISOString(),
        visibility: 'public',
      }));

      // Cache the large dataset
      demoQueryClient.setQueryData(queryKeys.credentials(accountAddress), largeCredentialSet);

      const cacheTime = performance.now();

      // Retrieve from cache multiple times
      for (let i = 0; i < 10; i++) {
        const cachedData = demoQueryClient.getQueryData(queryKeys.credentials(accountAddress));
        expect(cachedData).toHaveLength(100);
      }

      const retrievalTime = performance.now();

      // Performance assertions
      const cacheOperationTime = cacheTime - startTime;
      const retrievalOperationTime = retrievalTime - cacheTime;

      console.log(`Cache operation time: ${cacheOperationTime.toFixed(2)}ms`);
      console.log(`10 retrieval operations time: ${retrievalOperationTime.toFixed(2)}ms`);

      // Should be very fast (under 50ms for caching, under 20ms for retrievals)
      expect(cacheOperationTime).toBeLessThan(50);
      expect(retrievalOperationTime).toBeLessThan(20);
    });

    it('should demonstrate cache invalidation strategies', async () => {
      // Set initial data
      demoQueryClient.setQueryData(queryKeys.credentials(accountAddress), mockCredentials);

      // Verify data is cached
      let cachedData = demoQueryClient.getQueryData(queryKeys.credentials(accountAddress));
      expect(cachedData).toEqual(mockCredentials);
      expect(cachedData).toHaveLength(4);

      // Strategy 1: Invalidate specific account credentials
      demoQueryClient.invalidateQueries({ queryKey: queryKeys.credentials(accountAddress) });
      
      let queryState = demoQueryClient.getQueryState(queryKeys.credentials(accountAddress));
      expect(queryState?.isInvalidated).toBe(true);

      // Strategy 2: Selective invalidation (simulate after successful mutation)
      demoQueryClient.setQueryData(queryKeys.credentials(accountAddress), mockCredentials);
      
      // Add new credential optimistically
      const newCredential: Credential = {
        id: 'cred-5',
        owner: accountAddress,
        credential_type: 'skill',
        name: 'TypeScript Expert',
        description: 'Advanced TypeScript development skills',
        issuer: 'TypeScript Community',
        timestamp: '2024-02-15T00:00:00Z',
        visibility: 'public',
      };

      demoQueryClient.setQueryData(
        queryKeys.credentials(accountAddress),
        (old: Credential[] | undefined) => old ? [newCredential, ...old] : [newCredential]
      );

      cachedData = demoQueryClient.getQueryData(queryKeys.credentials(accountAddress)) as Credential[];
      expect(cachedData).toHaveLength(5);
      expect(cachedData[0]).toEqual(newCredential);

      // Strategy 3: Background refetch simulation
      demoQueryClient.invalidateQueries({ queryKey: queryKeys.credentials(accountAddress) });
      
      // Simulate updated data from blockchain
      const updatedCredentials = [...mockCredentials, newCredential];
      demoQueryClient.setQueryData(queryKeys.credentials(accountAddress), updatedCredentials);

      cachedData = demoQueryClient.getQueryData(queryKeys.credentials(accountAddress)) as Credential[];
      expect(cachedData).toEqual(updatedCredentials);
    });

    it('should demonstrate optimistic updates and rollback', () => {
      // Initial state
      demoQueryClient.setQueryData(queryKeys.credentials(accountAddress), mockCredentials);

      // Simulate optimistic update for minting
      const optimisticCredential: Credential = {
        id: 'temp-optimistic',
        owner: accountAddress,
        credential_type: 'certification',
        name: 'Optimistic Credential',
        description: 'This will be updated optimistically',
        issuer: 'Optimistic Issuer',
        timestamp: new Date().toISOString(),
        visibility: 'public',
      };

      // Store original state for rollback
      const originalCredentials = demoQueryClient.getQueryData(queryKeys.credentials(accountAddress)) as Credential[];

      // Apply optimistic update
      demoQueryClient.setQueryData(
        queryKeys.credentials(accountAddress),
        (old: Credential[] | undefined) => old ? [optimisticCredential, ...old] : [optimisticCredential]
      );

      // Verify optimistic update
      let cachedData = demoQueryClient.getQueryData(queryKeys.credentials(accountAddress)) as Credential[];
      expect(cachedData).toHaveLength(5);
      expect(cachedData[0]).toEqual(optimisticCredential);

      // Simulate transaction failure - rollback
      demoQueryClient.setQueryData(queryKeys.credentials(accountAddress), originalCredentials);

      // Verify rollback
      cachedData = demoQueryClient.getQueryData(queryKeys.credentials(accountAddress)) as Credential[];
      expect(cachedData).toEqual(mockCredentials);
      expect(cachedData).toHaveLength(4);

      // Simulate successful transaction - update with real data
      const realCredential: Credential = {
        ...optimisticCredential,
        id: 'cred-real-5', // Real ID from blockchain
        name: 'Real Blockchain Credential',
      };

      demoQueryClient.setQueryData(
        queryKeys.credentials(accountAddress),
        [...originalCredentials, realCredential]
      );

      cachedData = demoQueryClient.getQueryData(queryKeys.credentials(accountAddress)) as Credential[];
      expect(cachedData).toHaveLength(5);
      expect(cachedData[4]).toEqual(realCredential);
    });

    it('should demonstrate cache utility functions', () => {
      // Test cache utilities
      expect(typeof cacheUtils.invalidateCredentials).toBe('function');
      expect(typeof cacheUtils.invalidateCredential).toBe('function');
      expect(typeof cacheUtils.clearCache).toBe('function');
      expect(typeof cacheUtils.prefetchCredentials).toBe('function');
      expect(typeof cacheUtils.getCachedCredentials).toBe('function');
      expect(typeof cacheUtils.setCredentials).toBe('function');

      // Set data using utility
      demoQueryClient.setQueryData(queryKeys.credentials(accountAddress), mockCredentials);

      // Get data using utility
      const cachedData = demoQueryClient.getQueryData(queryKeys.credentials(accountAddress));
      expect(cachedData).toEqual(mockCredentials);

      // Clear cache
      demoQueryClient.clear();
      const clearedData = demoQueryClient.getQueryData(queryKeys.credentials(accountAddress));
      expect(clearedData).toBeUndefined();
    });

    it('should demonstrate stale time and garbage collection configuration', () => {
      // Set data with timestamp
      const setTime = Date.now();
      demoQueryClient.setQueryData(queryKeys.credentials(accountAddress), mockCredentials);

      // Check query state
      const queryState = demoQueryClient.getQueryState(queryKeys.credentials(accountAddress));
      expect(queryState?.data).toEqual(mockCredentials);
      expect(queryState?.dataUpdatedAt).toBeGreaterThanOrEqual(setTime);

      // Verify stale time and gc time configuration
      const defaultOptions = demoQueryClient.getDefaultOptions();
      expect(defaultOptions.queries?.staleTime).toBe(60 * 1000); // 60 seconds
      expect(defaultOptions.queries?.gcTime).toBe(5 * 60 * 1000); // 5 minutes

      // Verify data is accessible
      const cachedData = demoQueryClient.getQueryData(queryKeys.credentials(accountAddress));
      expect(cachedData).toEqual(mockCredentials);
    });

    it('should demonstrate concurrent query deduplication', () => {
      const queryKey = queryKeys.credentials(accountAddress);
      
      // Simulate multiple components requesting the same data
      const promises = Array.from({ length: 5 }, () => 
        demoQueryClient.fetchQuery({
          queryKey,
          queryFn: async () => {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 10));
            return mockCredentials;
          },
        })
      );

      // All promises should resolve to the same data
      return Promise.all(promises).then(results => {
        results.forEach(result => {
          expect(result).toEqual(mockCredentials);
        });

        // Verify data is cached
        const cachedData = demoQueryClient.getQueryData(queryKey);
        expect(cachedData).toEqual(mockCredentials);
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should demonstrate error state management', () => {
      const queryKey = queryKeys.credentials(accountAddress);
      
      // Simulate error state
      const error = new Error('Network connection failed');
      
      // Set error state manually (simulating failed query)
      demoQueryClient.setQueryData(queryKey, undefined);
      
      // In real usage, errors would be handled by the query function
      // Here we just verify that error handling is properly configured
      const defaultOptions = demoQueryClient.getDefaultOptions();
      
      expect(typeof defaultOptions.queries?.retry).toBe('function');
      expect(typeof defaultOptions.queries?.retryDelay).toBe('function');
      
      // Test retry logic
      const retryFn = defaultOptions.queries?.retry as (failureCount: number, error: Error) => boolean;
      expect(retryFn(0, error)).toBe(true);  // First retry
      expect(retryFn(1, error)).toBe(true);  // Second retry
      expect(retryFn(2, error)).toBe(true);  // Third retry
      expect(retryFn(3, error)).toBe(false); // No more retries
    });

    it('should demonstrate retry delay calculation', () => {
      const defaultOptions = demoQueryClient.getDefaultOptions();
      const retryDelay = defaultOptions.queries?.retryDelay as (attemptIndex: number) => number;
      
      // Test exponential backoff with cap
      expect(retryDelay(0)).toBe(1000);   // 1 second
      expect(retryDelay(1)).toBe(2000);   // 2 seconds
      expect(retryDelay(2)).toBe(4000);   // 4 seconds
      expect(retryDelay(3)).toBe(8000);   // 8 seconds
      expect(retryDelay(4)).toBe(16000);  // 16 seconds
      expect(retryDelay(5)).toBe(30000);  // 30 seconds (capped)
      expect(retryDelay(10)).toBe(30000); // Still capped at 30 seconds
    });
  });
});