import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Credential, TrustScore } from '../../types';
import {
  generatePortfolioExport,
  generateExportStats,
  validateExportData,
  downloadPortfolioExport,
} from '../exportUtils';

// Mock the API module
vi.mock('../api', () => ({
  getNetworkInfo: vi.fn().mockResolvedValue({
    network: 'paseo',
    endpoint: 'wss://paseo.dotters.network',
    chainName: 'Paseo Testnet',
    nodeVersion: '1.0.0',
    isConnected: true,
  }),
}));

// Mock DOM APIs for download functionality
Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'mock-blob-url'),
    revokeObjectURL: vi.fn(),
  },
});

Object.defineProperty(global, 'Blob', {
  value: class MockBlob {
    constructor(public content: any[], public options: any) {}
  },
});

// Mock document for download functionality
Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn(() => ({
      href: '',
      download: '',
      click: vi.fn(),
    })),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
  },
});

describe('Export Integration Tests', () => {
  const mockCredentials: Credential[] = [
    {
      id: 'cred1',
      owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      credential_type: 'skill',
      name: 'JavaScript Development',
      description: 'Expert in JavaScript and React development with 5+ years experience',
      issuer: 'TechCorp Inc.',
      timestamp: '2024-01-15T10:00:00Z',
      visibility: 'public',
      proof_hash: 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890',
    },
    {
      id: 'cred2',
      owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      credential_type: 'review',
      name: 'Excellent Frontend Developer',
      description: 'Delivered high-quality React application on time and within budget',
      issuer: 'ClientCorp LLC',
      rating: 5,
      timestamp: '2024-01-10T10:00:00Z',
      visibility: 'public',
    },
    {
      id: 'cred3',
      owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      credential_type: 'payment',
      name: 'Project Payment - $5000',
      description: 'Payment received for React dashboard development project',
      issuer: 'ClientCorp LLC',
      timestamp: '2024-01-12T10:00:00Z',
      visibility: 'private',
    },
    {
      id: 'cred4',
      owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      credential_type: 'certification',
      name: 'AWS Certified Developer',
      description: 'AWS Certified Developer - Associate certification',
      issuer: 'Amazon Web Services',
      timestamp: '2024-01-05T10:00:00Z',
      visibility: 'public',
    },
  ];

  const mockTrustScore: TrustScore = {
    total: 78,
    tier: 'Platinum',
    breakdown: {
      review_score: 60,
      skill_score: 15,
      payment_score: 3,
    },
  };

  const walletAddress = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate complete portfolio export with all required fields', async () => {
    const exportData = await generatePortfolioExport(walletAddress, mockCredentials, mockTrustScore);

    // Verify basic structure
    expect(exportData).toMatchObject({
      wallet_address: walletAddress,
      export_timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
      trust_score: mockTrustScore,
      credentials: mockCredentials,
    });

    // Verify blockchain verification section
    expect(exportData.blockchain_verification).toMatchObject({
      network: 'Paseo',
      explorer_url: 'https://paseo.subscan.io',
      account_url: `https://paseo.subscan.io/account/${walletAddress}`,
      total_credentials: 4,
      credential_transactions: expect.arrayContaining([
        expect.objectContaining({
          credential_id: expect.any(String),
          credential_name: expect.any(String),
          transaction_hash: expect.stringMatching(/^0x/),
          explorer_url: expect.stringContaining('https://paseo.subscan.io/extrinsic'),
        }),
      ]),
    });

    // Verify metadata section
    expect(exportData.metadata).toMatchObject({
      app_version: '1.0.0',
      export_format_version: '1.0',
      file_size_bytes: expect.any(Number),
    });

    // Verify file size is reasonable
    expect(exportData.metadata.file_size_bytes).toBeGreaterThan(0);
    expect(exportData.metadata.file_size_bytes).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
  });

  it('should generate accurate export statistics', () => {
    const stats = generateExportStats(mockCredentials);

    expect(stats).toMatchObject({
      total_credentials: 4,
      public_credentials: 3, // skill, review, certification
      private_credentials: 1, // payment
      file_size_bytes: expect.any(Number),
      file_size_formatted: expect.stringMatching(/\d+(\.\d+)?\s*(B|KB|MB)$/),
    });
  });

  it('should validate export data correctly', async () => {
    const exportData = await generatePortfolioExport(walletAddress, mockCredentials, mockTrustScore);
    const validation = validateExportData(exportData);

    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('should handle edge cases in validation', () => {
    // Test empty credentials
    const emptyCredsValidation = validateExportData({
      wallet_address: walletAddress,
      credentials: [],
      trust_score: mockTrustScore,
      metadata: { file_size_bytes: 1000 },
    } as any);

    expect(emptyCredsValidation.isValid).toBe(false);
    expect(emptyCredsValidation.errors).toContain('No credentials found to export');

    // Test missing wallet address
    const noWalletValidation = validateExportData({
      wallet_address: '',
      credentials: mockCredentials,
      trust_score: mockTrustScore,
      metadata: { file_size_bytes: 1000 },
    } as any);

    expect(noWalletValidation.isValid).toBe(false);
    expect(noWalletValidation.errors).toContain('Wallet address is required');

    // Test file size limit
    const largeSizeValidation = validateExportData({
      wallet_address: walletAddress,
      credentials: mockCredentials,
      trust_score: mockTrustScore,
      metadata: { file_size_bytes: 11 * 1024 * 1024 }, // 11MB
    } as any);

    expect(largeSizeValidation.isValid).toBe(false);
    expect(largeSizeValidation.errors).toContain('Export file size exceeds 10MB limit');
  });

  it('should trigger download with correct filename format', async () => {
    const exportData = await generatePortfolioExport(walletAddress, mockCredentials, mockTrustScore);
    
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
    };
    
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');

    downloadPortfolioExport(exportData, walletAddress);

    // Verify DOM manipulation
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
    expect(removeChildSpy).toHaveBeenCalledWith(mockLink);
    expect(mockLink.click).toHaveBeenCalled();

    // Verify filename format (shortened address format)
    const expectedPattern = /^freelanceforge-portfolio-5Grwva\.\.\.utQY-\d{4}-\d{2}-\d{2}\.json$/;
    expect(mockLink.download).toMatch(expectedPattern);
  });

  it('should handle different network configurations', async () => {
    // Test with local network
    const { getNetworkInfo } = await import('../api');
    vi.mocked(getNetworkInfo).mockResolvedValueOnce({
      network: 'local',
      endpoint: 'ws://localhost:9944',
      chainName: 'Development',
      nodeVersion: '1.0.0',
      isConnected: true,
    });

    const localExportData = await generatePortfolioExport(walletAddress, mockCredentials, mockTrustScore);

    expect(localExportData.blockchain_verification).toMatchObject({
      network: 'Local',
      explorer_url: 'https://polkadot.js.org/apps',
      account_url: 'https://polkadot.js.org/apps/?rpc=ws://localhost:9944#/accounts',
    });
  });

  it('should handle API errors gracefully', async () => {
    const { getNetworkInfo } = await import('../api');
    vi.mocked(getNetworkInfo).mockRejectedValueOnce(new Error('Network error'));

    // Should still generate export with default values
    const exportData = await generatePortfolioExport(walletAddress, mockCredentials, mockTrustScore);

    expect(exportData.blockchain_verification.network).toBe('Local');
    expect(exportData.wallet_address).toBe(walletAddress);
    expect(exportData.credentials).toEqual(mockCredentials);
  });

  it('should include all credential types in transaction list', async () => {
    const exportData = await generatePortfolioExport(walletAddress, mockCredentials, mockTrustScore);

    expect(exportData.blockchain_verification.credential_transactions).toHaveLength(4);
    
    const transactionNames = exportData.blockchain_verification.credential_transactions.map(t => t.credential_name);
    expect(transactionNames).toContain('JavaScript Development');
    expect(transactionNames).toContain('Excellent Frontend Developer');
    expect(transactionNames).toContain('Project Payment - $5000');
    expect(transactionNames).toContain('AWS Certified Developer');
  });

  it('should generate valid JSON that can be parsed', async () => {
    const exportData = await generatePortfolioExport(walletAddress, mockCredentials, mockTrustScore);
    const jsonString = JSON.stringify(exportData, null, 2);

    // Should be valid JSON
    expect(() => JSON.parse(jsonString)).not.toThrow();

    // Parsed data should match original
    const parsed = JSON.parse(jsonString);
    expect(parsed.wallet_address).toBe(walletAddress);
    expect(parsed.credentials).toHaveLength(4);
    expect(parsed.trust_score.total).toBe(78);
  });
});