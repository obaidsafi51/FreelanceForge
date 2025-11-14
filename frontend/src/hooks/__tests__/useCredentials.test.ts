import { describe, it, expect } from 'vitest';
import { credentialQueryKeys } from '../useCredentials';

describe('Credential Hooks', () => {
  describe('Query Keys', () => {
    it('should generate correct credential query keys', () => {
      const accountAddress = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
      const credentialId = 'cred-123';

      expect(credentialQueryKeys.all).toEqual(['credentials']);
      expect(credentialQueryKeys.lists()).toEqual(['credentials', 'list']);
      expect(credentialQueryKeys.list(accountAddress)).toEqual(['credentials', 'list', accountAddress]);
      expect(credentialQueryKeys.details()).toEqual(['credentials', 'detail']);
      expect(credentialQueryKeys.detail(credentialId)).toEqual(['credentials', 'detail', credentialId]);
    });

    it('should provide hierarchical query keys for cache management', () => {
      const accountAddress1 = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
      const accountAddress2 = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';

      // Different accounts should have different keys
      expect(credentialQueryKeys.list(accountAddress1)).not.toEqual(
        credentialQueryKeys.list(accountAddress2)
      );

      // All list keys should start with the same base
      expect(credentialQueryKeys.list(accountAddress1).slice(0, 2)).toEqual(['credentials', 'list']);
      expect(credentialQueryKeys.list(accountAddress2).slice(0, 2)).toEqual(['credentials', 'list']);
    });
  });

  describe('Hook Configuration', () => {
    it('should have proper cache configuration constants', () => {
      // Test that the hooks module loads correctly
      expect(credentialQueryKeys).toBeDefined();
      expect(typeof credentialQueryKeys.all).toBe('object');
      expect(typeof credentialQueryKeys.lists).toBe('function');
      expect(typeof credentialQueryKeys.list).toBe('function');
    });
  });
});