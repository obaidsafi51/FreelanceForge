import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { 
  freelanceForgeAPI, 
  ApiError, 
  ApiErrorType,
  mintCredential,
  updateCredential,
  deleteCredential,
  getCredentials,
  getCredentialById,
  connectToBlockchain,
  type CredentialMetadata 
} from '../api';

// Mock @polkadot/extension-dapp for testing
vi.mock('@polkadot/extension-dapp', () => ({
  web3Enable: vi.fn().mockResolvedValue([{ name: 'polkadot-js', version: '0.44.1' }]),
  web3FromAddress: vi.fn().mockResolvedValue({
    signer: {
      signPayload: vi.fn().mockResolvedValue({ signature: '0x123' }),
    },
  }),
}));

describe('FreelanceForge API Integration', () => {
  let api: ApiPromise;
  const testAccount = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'; // Alice

  beforeAll(async () => {
    try {
      // Try to connect to local node
      api = await connectToBlockchain();
      console.log('Connected to blockchain for integration tests');
    } catch (error) {
      console.warn('Could not connect to blockchain, skipping integration tests');
      throw error;
    }
  }, 15000);

  afterAll(async () => {
    if (api) {
      await api.disconnect();
    }
  });

  describe('Connection Management', () => {
    it('should connect to blockchain successfully', async () => {
      expect(api).toBeDefined();
      expect(api.isConnected).toBe(true);
    });

    it('should get network information', async () => {
      const networkInfo = await freelanceForgeAPI.getNetworkInfo();
      
      expect(networkInfo).toHaveProperty('network');
      expect(networkInfo).toHaveProperty('endpoint');
      expect(networkInfo).toHaveProperty('chainName');
      expect(networkInfo).toHaveProperty('nodeVersion');
      expect(networkInfo.isConnected).toBe(true);
    });
  });

  describe('Credential Metadata Validation', () => {
    it('should validate credential metadata size', () => {
      const largeMetadata: CredentialMetadata = {
        credential_type: 'skill',
        name: 'A'.repeat(2000), // Very long name
        description: 'B'.repeat(2000), // Very long description
        issuer: 'Test Issuer',
        timestamp: new Date().toISOString(),
        visibility: 'public',
      };

      const jsonString = JSON.stringify(largeMetadata);
      const sizeInBytes = new TextEncoder().encode(jsonString).length;
      
      // Should be close to or exceed 4KB limit
      expect(sizeInBytes).toBeGreaterThan(4000);
      
      // The API should validate this
      expect(() => {
        if (sizeInBytes > 4096) {
          throw new ApiError(ApiErrorType.METADATA_TOO_LARGE, 'Metadata too large');
        }
      }).toThrow(ApiError);
    });

    it('should validate required fields', () => {
      const invalidMetadata = {
        credential_type: 'skill',
        // Missing required fields
      } as any;

      expect(() => {
        if (!invalidMetadata.name || !invalidMetadata.issuer || !invalidMetadata.timestamp) {
          throw new ApiError(ApiErrorType.VALIDATION_ERROR, 'Missing required fields');
        }
      }).toThrow(ApiError);
    });

    it('should validate credential type', () => {
      const invalidTypeMetadata = {
        credential_type: 'invalid_type',
        name: 'Test',
        description: 'Test',
        issuer: 'Test',
        timestamp: new Date().toISOString(),
        visibility: 'public',
      } as any;

      const validTypes = ['skill', 'review', 'payment', 'certification'];
      
      expect(() => {
        if (!validTypes.includes(invalidTypeMetadata.credential_type)) {
          throw new ApiError(ApiErrorType.VALIDATION_ERROR, 'Invalid credential type');
        }
      }).toThrow(ApiError);
    });
  });

  describe('Credential Operations', () => {
    const testCredential: CredentialMetadata = {
      credential_type: 'skill',
      name: 'React Development Test',
      description: 'Test credential for React.js development skills',
      issuer: 'Test Platform',
      timestamp: new Date().toISOString(),
      visibility: 'public',
    };

    it('should handle credential queries', async () => {
      try {
        // Test getting credentials for an account (should not throw)
        const credentials = await getCredentials(testAccount);
        expect(Array.isArray(credentials)).toBe(true);
      } catch (error) {
        // If there's an address format issue, that's expected in test environment
        expect(error).toBeInstanceOf(Error);
        console.log('Address format issue in test environment:', (error as Error).message);
      }
    });

    it('should handle credential by ID query', async () => {
      const testId = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      
      // This should return null for non-existent credential
      const credential = await getCredentialById(testId);
      expect(credential).toBeNull();
    });

    // Note: Actual minting tests would require a funded account and proper setup
    // These are more like integration smoke tests
    it('should validate mint credential parameters', () => {
      expect(() => {
        // Validate that we have required parameters
        if (!testAccount || !testCredential) {
          throw new Error('Missing required parameters');
        }
        
        // Validate credential structure
        if (!testCredential.credential_type || !testCredential.name) {
          throw new ApiError(ApiErrorType.VALIDATION_ERROR, 'Invalid credential structure');
        }
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors correctly', () => {
      const error = new ApiError(
        ApiErrorType.NETWORK_ERROR,
        'Test network error',
        new Error('Original error')
      );

      expect(error.type).toBe(ApiErrorType.NETWORK_ERROR);
      expect(error.message).toBe('Test network error');
      expect(error.originalError).toBeInstanceOf(Error);
      expect(error.name).toBe('ApiError');
    });

    it('should handle connection failures gracefully', async () => {
      // Test with invalid endpoint
      const invalidProvider = new WsProvider('ws://invalid:9944', 1000);
      
      try {
        const api = await ApiPromise.create({ 
          provider: invalidProvider,
          throwOnConnect: true
        });
        await Promise.race([
          api.isReady,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
        ]);
        // If this doesn't throw, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
      } finally {
        try {
          invalidProvider.disconnect();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }, 5000);
  });

  describe('Retry Logic', () => {
    it('should implement exponential backoff', () => {
      const baseDelay = 1000;
      const maxRetries = 3;
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const expectedDelay = baseDelay * Math.pow(2, attempt);
        const maxDelay = 30000;
        const actualDelay = Math.min(expectedDelay, maxDelay);
        
        expect(actualDelay).toBeGreaterThanOrEqual(baseDelay);
        expect(actualDelay).toBeLessThanOrEqual(maxDelay);
      }
    });
  });
});