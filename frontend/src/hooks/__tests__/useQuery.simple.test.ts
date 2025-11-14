import { describe, it, expect } from 'vitest';
import { queryKeys, cacheUtils } from '../useQuery';

describe('TanStack Query Setup', () => {
  describe('Query Keys', () => {
    it('should generate correct query keys', () => {
      const accountAddress = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
      const credentialId = 'cred-123';

      expect(queryKeys.credentials(accountAddress)).toEqual(['credentials', accountAddress]);
      expect(queryKeys.credential(credentialId)).toEqual(['credential', credentialId]);
      expect(queryKeys.networkInfo()).toEqual(['networkInfo']);
    });
  });

  describe('Cache Utils', () => {
    it('should provide cache utility functions', () => {
      expect(typeof cacheUtils.invalidateCredentials).toBe('function');
      expect(typeof cacheUtils.invalidateCredential).toBe('function');
      expect(typeof cacheUtils.clearCache).toBe('function');
      expect(typeof cacheUtils.prefetchCredentials).toBe('function');
      expect(typeof cacheUtils.getCachedCredentials).toBe('function');
      expect(typeof cacheUtils.setCredentials).toBe('function');
    });
  });

  describe('Query Client Configuration', () => {
    it('should have correct default options', () => {
      // Test that the query client is properly configured
      // This is more of a smoke test to ensure the module loads correctly
      expect(queryKeys).toBeDefined();
      expect(cacheUtils).toBeDefined();
    });
  });
});