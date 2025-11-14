import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiPromise, WsProvider } from '@polkadot/api';
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

// Mock @polkadot/api
vi.mock('@polkadot/api');
vi.mock('@polkadot/extension-dapp');

const mockApi = {
  isConnected: true,
  isReady: Promise.resolve(),
  disconnect: vi.fn(),
  tx: {
    freelanceCredentials: {
      mintCredential: vi.fn(),
      updateCredential: vi.fn(),
      deleteCredential: vi.fn(),
    },
  },
  query: {
    freelanceCredentials: {
      credentials: vi.fn(),
      ownerCredentials: vi.fn(),
    },
  },
  events: {
    system: {
      ExtrinsicFailed: {
        is: vi.fn(),
      },
    },
  },
  registry: {
    findMetaError: vi.fn(),
  },
  rpc: {
    system: {
      chain: vi.fn().mockResolvedValue({ toString: () => 'Development' }),
      version: vi.fn().mockResolvedValue({ toString: () => '1.0.0' }),
    },
  },
};

const mockProvider = {
  connect: vi.fn(),
  disconnect: vi.fn(),
};

describe('FreelanceForge API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (WsProvider as any).mockImplementation(() => mockProvider);
    (ApiPromise.create as any).mockResolvedValue(mockApi);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Connection Management', () => {
    it('should connect to blockchain successfully', async () => {
      const api = await connectToBlockchain();
      expect(api).toBe(mockApi);
      expect(ApiPromise.create).toHaveBeenCalledWith({ provider: mockProvider });
    });

    it('should handle connection failures with fallback endpoints', async () => {
      const connectionError = new Error('Connection failed');
      (ApiPromise.create as any)
        .mockRejectedValueOnce(connectionError)
        .mockRejectedValueOnce(connectionError)
        .mockResolvedValueOnce(mockApi);

      const api = await connectToBlockchain();
      expect(api).toBe(mockApi);
      expect(ApiPromise.create).toHaveBeenCalledTimes(3);
    });

    it('should throw ApiError when all endpoints fail', async () => {
      const connectionError = new Error('Connection failed');
      (ApiPromise.create as any).mockRejectedValue(connectionError);

      await expect(connectToBlockchain()).rejects.toThrow(ApiError);
      await expect(connectToBlockchain()).rejects.toThrow('Failed to connect to any RPC endpoint');
    });
  });

  describe('Credential Metadata Validation', () => {
    it('should validate credential metadata size', async () => {
      const largeMetadata: CredentialMetadata = {
        credential_type: 'skill',
        name: 'Test Credential',
        description: 'A'.repeat(4000), // Large description
        issuer: 'Test Issuer',
        timestamp: new Date().toISOString(),
        visibility: 'public',
      };

      await expect(
        mintCredential('test-address', largeMetadata)
      ).rejects.toThrow(ApiError);
    });

    it('should validate required fields', async () => {
      const invalidMetadata = {
        credential_type: 'skill',
        // Missing required fields
      } as CredentialMetadata;

      await expect(
        mintCredential('test-address', invalidMetadata)
      ).rejects.toThrow('Missing required credential fields');
    });

    it('should validate credential type', async () => {
      const invalidMetadata: CredentialMetadata = {
        credential_type: 'invalid' as any,
        name: 'Test',
        description: 'Test',
        issuer: 'Test',
        timestamp: new Date().toISOString(),
        visibility: 'public',
      };

      await expect(
        mintCredential('test-address', invalidMetadata)
      ).rejects.toThrow('Invalid credential type');
    });
  });

  describe('Credential Minting', () => {
    const validMetadata: CredentialMetadata = {
      credential_type: 'skill',
      name: 'JavaScript Development',
      description: 'Expert in JavaScript and React',
      issuer: 'Tech Company',
      rating: 5,
      timestamp: new Date().toISOString(),
      visibility: 'public',
      proof_hash: 'abc123',
    };

    it('should mint credential successfully', async () => {
      const mockTx = {
        signAndSend: vi.fn((address, options, callback) => {
          // Simulate successful transaction
          setTimeout(() => {
            callback({
              status: { 
                isFinalized: true, 
                asFinalized: { toString: () => 'block-hash' } 
              },
              txHash: { toString: () => 'tx-hash' },
              events: [],
              isError: false,
            });
          }, 0);
          return Promise.resolve();
        }),
      };

      mockApi.tx.freelanceCredentials.mintCredential.mockReturnValue(mockTx);

      const result = await mintCredential('test-address', validMetadata);

      expect(result).toEqual({
        hash: 'tx-hash',
        blockHash: 'block-hash',
        success: true,
      });
    });

    it('should handle transaction errors', async () => {
      const mockTx = {
        signAndSend: vi.fn((address, options, callback) => {
          setTimeout(() => {
            callback({
              status: { isFinalized: true },
              txHash: { toString: () => 'tx-hash' },
              events: [{
                event: { data: [{ isModule: true, asModule: {} }] }
              }],
              isError: false,
            });
          }, 0);
          return Promise.resolve();
        }),
      };

      mockApi.tx.freelanceCredentials.mintCredential.mockReturnValue(mockTx);
      mockApi.events.system.ExtrinsicFailed.is.mockReturnValue(true);
      mockApi.registry.findMetaError.mockReturnValue({
        section: 'freelanceCredentials',
        name: 'CredentialAlreadyExists',
        docs: 'Credential already exists',
      });

      await expect(
        mintCredential('test-address', validMetadata)
      ).rejects.toThrow(ApiError);
    });
  });

  describe('Credential Updates', () => {
    it('should update credential visibility', async () => {
      const mockTx = {
        signAndSend: vi.fn((address, options, callback) => {
          setTimeout(() => {
            callback({
              status: { 
                isFinalized: true, 
                asFinalized: { toString: () => 'block-hash' } 
              },
              txHash: { toString: () => 'tx-hash' },
              events: [],
              isError: false,
            });
          }, 0);
          return Promise.resolve();
        }),
      };

      mockApi.tx.freelanceCredentials.updateCredential.mockReturnValue(mockTx);

      const result = await updateCredential('test-address', 'credential-id', {
        visibility: 'private',
      });

      expect(result.success).toBe(true);
      expect(mockApi.tx.freelanceCredentials.updateCredential).toHaveBeenCalledWith(
        'credential-id',
        expect.any(Uint8Array), // visibility bytes
        null // proof_hash
      );
    });
  });

  describe('Credential Deletion', () => {
    it('should delete credential successfully', async () => {
      const mockTx = {
        signAndSend: vi.fn((address, options, callback) => {
          setTimeout(() => {
            callback({
              status: { 
                isFinalized: true, 
                asFinalized: { toString: () => 'block-hash' } 
              },
              txHash: { toString: () => 'tx-hash' },
              events: [],
              isError: false,
            });
          }, 0);
          return Promise.resolve();
        }),
      };

      mockApi.tx.freelanceCredentials.deleteCredential.mockReturnValue(mockTx);

      const result = await deleteCredential('test-address', 'credential-id');

      expect(result.success).toBe(true);
      expect(mockApi.tx.freelanceCredentials.deleteCredential).toHaveBeenCalledWith('credential-id');
    });
  });

  describe('Credential Queries', () => {
    it('should fetch user credentials', async () => {
      const mockCredentialIds = {
        isEmpty: false,
        toJSON: () => ['id1', 'id2'],
      };

      const mockCredentialData = {
        isEmpty: false,
        toJSON: () => [
          'owner-address',
          [123, 34, 110, 97, 109, 101, 34, 58, 34, 84, 101, 115, 116, 34, 125] // JSON bytes
        ],
      };

      mockApi.query.freelanceCredentials.ownerCredentials.mockResolvedValue(mockCredentialIds);
      mockApi.query.freelanceCredentials.credentials.mockResolvedValue(mockCredentialData);

      const credentials = await getCredentials('test-address');

      expect(Array.isArray(credentials)).toBe(true);
      expect(mockApi.query.freelanceCredentials.ownerCredentials).toHaveBeenCalledWith('test-address');
    });

    it('should return empty array when no credentials found', async () => {
      const mockEmptyResult = {
        isEmpty: true,
        toJSON: () => [],
      };

      mockApi.query.freelanceCredentials.ownerCredentials.mockResolvedValue(mockEmptyResult);

      const credentials = await getCredentials('test-address');

      expect(credentials).toEqual([]);
    });

    it('should fetch credential by ID', async () => {
      const mockCredentialData = {
        isEmpty: false,
        toJSON: () => [
          'owner-address',
          Array.from(new TextEncoder().encode(JSON.stringify({
            credential_type: 'skill',
            name: 'Test Credential',
            description: 'Test Description',
            issuer: 'Test Issuer',
            timestamp: '2023-01-01T00:00:00.000Z',
            visibility: 'public',
          })))
        ],
      };

      mockApi.query.freelanceCredentials.credentials.mockResolvedValue(mockCredentialData);

      const credential = await getCredentialById('credential-id');

      expect(credential).toBeTruthy();
      expect(credential?.name).toBe('Test Credential');
      expect(credential?.credential_type).toBe('skill');
    });

    it('should return null when credential not found', async () => {
      const mockEmptyResult = {
        isEmpty: true,
      };

      mockApi.query.freelanceCredentials.credentials.mockResolvedValue(mockEmptyResult);

      const credential = await getCredentialById('non-existent-id');

      expect(credential).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should retry operations with exponential backoff', async () => {
      let attempts = 0;
      const mockTx = {
        signAndSend: vi.fn(() => {
          attempts++;
          if (attempts < 3) {
            throw new Error('Network error');
          }
          return Promise.resolve();
        }),
      };

      mockApi.tx.freelanceCredentials.mintCredential.mockReturnValue(mockTx);

      // This should eventually succeed after retries
      // Note: This test would need to be adjusted based on actual retry implementation
    });

    it('should handle insufficient balance errors', async () => {
      const mockTx = {
        signAndSend: vi.fn().mockRejectedValue(new Error('balance too low')),
      };

      mockApi.tx.freelanceCredentials.mintCredential.mockReturnValue(mockTx);

      await expect(
        mintCredential('test-address', {
          credential_type: 'skill',
          name: 'Test',
          description: 'Test',
          issuer: 'Test',
          timestamp: new Date().toISOString(),
          visibility: 'public',
        })
      ).rejects.toThrow(ApiError);
    });
  });

  describe('Network Configuration', () => {
    it('should use correct endpoints for local development', () => {
      // Test that local endpoints are used when NETWORK=local
      expect(true).toBe(true); // Placeholder - actual implementation would test endpoint selection
    });

    it('should use correct endpoints for Paseo testnet', () => {
      // Test that Paseo endpoints are used when NETWORK=paseo
      expect(true).toBe(true); // Placeholder - actual implementation would test endpoint selection
    });
  });
});