import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Credential, TrustScore } from '../../types';
import {
  generateExplorerUrls,
  generateCredentialTransactions,
  calculateFileSize,
  generateExportStats,
  generatePortfolioExport,
  validateExportData,
  formatExportPreview,
} from '../exportUtils';

// Mock the API module
vi.mock('../api', () => ({
  getNetworkInfo: vi.fn().mockResolvedValue({
    network: 'local',
    endpoint: 'ws://localhost:9944',
    chainName: 'Development',
    nodeVersion: '1.0.0',
    isConnected: true,
  }),
}));

describe('exportUtils', () => {
  const mockCredentials: Credential[] = [
    {
      id: 'cred1',
      owner: 'wallet123',
      credential_type: 'skill',
      name: 'JavaScript Development',
      description: 'Expert in JavaScript and React',
      issuer: 'TechCorp',
      timestamp: '2024-01-15T10:00:00Z',
      visibility: 'public',
    },
    {
      id: 'cred2',
      owner: 'wallet123',
      credential_type: 'review',
      name: 'Client Review',
      description: 'Excellent work on project',
      issuer: 'ClientCorp',
      rating: 5,
      timestamp: '2024-01-10T10:00:00Z',
      visibility: 'private',
    },
  ];

  const mockTrustScore: TrustScore = {
    total: 75,
    tier: 'Gold',
    breakdown: {
      review_score: 60,
      skill_score: 15,
      payment_score: 0,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateExplorerUrls', () => {
    it('should generate Paseo explorer URLs', () => {
      const urls = generateExplorerUrls('Paseo', 'wallet123');
      
      expect(urls.explorer_base).toBe('https://paseo.subscan.io');
      expect(urls.account_url).toBe('https://paseo.subscan.io/account/wallet123');
      expect(urls.transaction_base).toBe('https://paseo.subscan.io/extrinsic');
    });

    it('should generate local explorer URLs', () => {
      const urls = generateExplorerUrls('Local', 'wallet123');
      
      expect(urls.explorer_base).toBe('https://polkadot.js.org/apps');
      expect(urls.account_url).toBe('https://polkadot.js.org/apps/?rpc=ws://localhost:9944#/accounts');
      expect(urls.transaction_base).toBe('https://polkadot.js.org/apps/?rpc=ws://localhost:9944#/explorer/query');
    });
  });

  describe('generateCredentialTransactions', () => {
    it('should generate transaction data for credentials', () => {
      const transactions = generateCredentialTransactions(mockCredentials, 'Paseo');
      
      expect(transactions).toHaveLength(2);
      expect(transactions[0]).toMatchObject({
        credential_id: 'cred1',
        credential_name: 'JavaScript Development',
        transaction_hash: expect.stringMatching(/^0x/),
        explorer_url: expect.stringContaining('https://paseo.subscan.io/extrinsic'),
      });
    });
  });

  describe('calculateFileSize', () => {
    it('should calculate file size in bytes and format correctly', () => {
      const testData = { test: 'data', number: 123 };
      const result = calculateFileSize(testData);
      
      expect(result.bytes).toBeGreaterThan(0);
      expect(result.formatted).toMatch(/\d+(\.\d+)?\s*(B|KB|MB)$/);
    });

    it('should format bytes correctly', () => {
      const smallData = { a: 1 };
      const result = calculateFileSize(smallData);
      expect(result.formatted).toMatch(/\d+ B$/);
    });
  });

  describe('generateExportStats', () => {
    it('should generate correct export statistics', () => {
      const stats = generateExportStats(mockCredentials);
      
      expect(stats).toMatchObject({
        total_credentials: 2,
        public_credentials: 1,
        private_credentials: 1,
        file_size_bytes: expect.any(Number),
        file_size_formatted: expect.stringMatching(/\d+(\.\d+)?\s*(B|KB|MB)$/),
      });
    });

    it('should handle empty credentials array', () => {
      const stats = generateExportStats([]);
      
      expect(stats).toMatchObject({
        total_credentials: 0,
        public_credentials: 0,
        private_credentials: 0,
        file_size_bytes: expect.any(Number),
        file_size_formatted: expect.stringMatching(/\d+(\.\d+)?\s*(B|KB|MB)$/),
      });
    });
  });

  describe('generatePortfolioExport', () => {
    it('should generate complete portfolio export data', async () => {
      const exportData = await generatePortfolioExport('wallet123', mockCredentials, mockTrustScore);
      
      expect(exportData).toMatchObject({
        wallet_address: 'wallet123',
        export_timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        trust_score: mockTrustScore,
        credentials: mockCredentials,
        blockchain_verification: {
          network: 'Local',
          explorer_url: expect.any(String),
          account_url: expect.any(String),
          total_credentials: 2,
          credential_transactions: expect.arrayContaining([
            expect.objectContaining({
              credential_id: expect.any(String),
              credential_name: expect.any(String),
              transaction_hash: expect.stringMatching(/^0x/),
              explorer_url: expect.any(String),
            }),
          ]),
        },
        metadata: {
          app_version: '1.0.0',
          export_format_version: '1.0',
          file_size_bytes: expect.any(Number),
        },
      });
    });
  });

  describe('validateExportData', () => {
    it('should validate correct export data', async () => {
      const exportData = await generatePortfolioExport('wallet123', mockCredentials, mockTrustScore);
      const validation = validateExportData(exportData);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect missing wallet address', () => {
      const invalidData = {
        wallet_address: '',
        credentials: mockCredentials,
        trust_score: mockTrustScore,
        metadata: { file_size_bytes: 1000 },
      } as any;
      
      const validation = validateExportData(invalidData);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Wallet address is required');
    });

    it('should detect empty credentials', () => {
      const invalidData = {
        wallet_address: 'wallet123',
        credentials: [],
        trust_score: mockTrustScore,
        metadata: { file_size_bytes: 1000 },
      } as any;
      
      const validation = validateExportData(invalidData);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('No credentials found to export');
    });

    it('should detect file size limit exceeded', () => {
      const invalidData = {
        wallet_address: 'wallet123',
        credentials: mockCredentials,
        trust_score: mockTrustScore,
        metadata: { file_size_bytes: 11 * 1024 * 1024 }, // 11MB
      } as any;
      
      const validation = validateExportData(invalidData);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Export file size exceeds 10MB limit');
    });
  });

  describe('formatExportPreview', () => {
    it('should format export data for preview', async () => {
      const exportData = await generatePortfolioExport('wallet123', mockCredentials, mockTrustScore);
      const preview = formatExportPreview(exportData);
      
      expect(preview).toContain('wallet123');
      expect(preview).toContain('credentials_count');
      expect(preview).toContain('credentials_sample');
      
      // Should be valid JSON
      expect(() => JSON.parse(preview)).not.toThrow();
      
      const parsed = JSON.parse(preview);
      expect(parsed.credentials_count).toBe(2);
      expect(parsed.credentials_sample).toHaveLength(2);
    });
  });
});