import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generatePortfolioUrl,
  filterPublicCredentials,
  copyToClipboard,
  generateSharingMetadata,
  isValidWalletAddress,
  formatWalletAddress,
  generateQRCodeData,
  getExplorerUrl,
  generateVerificationBadge,
} from '../sharingUtils';
import type { Credential, TrustScore } from '../../types';

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'https://freelanceforge.app',
  },
  writable: true,
});

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn(),
  },
  writable: true,
});

describe('Sharing Utils', () => {
  const mockWalletAddress = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
  
  const mockCredentials: Credential[] = [
    {
      id: 'cred1',
      owner: mockWalletAddress,
      credential_type: 'skill',
      name: 'React Development',
      description: 'Expert in React.js',
      issuer: 'TechCorp',
      timestamp: '2024-01-01T00:00:00Z',
      visibility: 'public',
    },
    {
      id: 'cred2',
      owner: mockWalletAddress,
      credential_type: 'review',
      name: 'Client Review',
      description: 'Excellent work',
      issuer: 'ClientCorp',
      rating: 5,
      timestamp: '2024-01-02T00:00:00Z',
      visibility: 'private',
    },
    {
      id: 'cred3',
      owner: mockWalletAddress,
      credential_type: 'certification',
      name: 'AWS Certified',
      description: 'AWS Solutions Architect',
      issuer: 'Amazon',
      timestamp: '2024-01-03T00:00:00Z',
      visibility: 'public',
    },
  ];

  const mockTrustScore: TrustScore = {
    total: 75,
    tier: 'Gold',
    breakdown: {
      review_score: 45,
      skill_score: 25,
      payment_score: 5,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generatePortfolioUrl', () => {
    it('should generate correct portfolio URL', () => {
      const url = generatePortfolioUrl(mockWalletAddress);
      expect(url).toBe(`https://freelanceforge.app/portfolio/${mockWalletAddress}`);
    });
  });

  describe('filterPublicCredentials', () => {
    it('should filter only public credentials', () => {
      const publicCredentials = filterPublicCredentials(mockCredentials);
      expect(publicCredentials).toHaveLength(2);
      expect(publicCredentials.every(c => c.visibility === 'public')).toBe(true);
    });

    it('should return empty array when no public credentials', () => {
      const privateCredentials = mockCredentials.map(c => ({ ...c, visibility: 'private' as const }));
      const result = filterPublicCredentials(privateCredentials);
      expect(result).toHaveLength(0);
    });
  });

  describe('copyToClipboard', () => {
    it('should copy text using clipboard API', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      navigator.clipboard.writeText = mockWriteText;
      
      // Mock window.isSecureContext
      Object.defineProperty(window, 'isSecureContext', {
        value: true,
        writable: true,
      });

      const result = await copyToClipboard('test text');
      
      expect(result).toBe(true);
      expect(mockWriteText).toHaveBeenCalledWith('test text');
    });

    it('should handle clipboard API errors', async () => {
      const mockWriteText = vi.fn().mockRejectedValue(new Error('Clipboard error'));
      navigator.clipboard.writeText = mockWriteText;

      const result = await copyToClipboard('test text');
      
      // Should return false when clipboard API fails and fallback also fails
      expect(result).toBe(false);
    });
  });

  describe('generateSharingMetadata', () => {
    it('should generate correct sharing metadata', () => {
      const metadata = generateSharingMetadata(mockWalletAddress, mockTrustScore, 2);
      
      expect(metadata.url).toBe(`https://freelanceforge.app/portfolio/${mockWalletAddress}`);
      expect(metadata.title).toContain('5Grwva...GKutQY');
      expect(metadata.description).toContain('2 credentials');
      expect(metadata.description).toContain('Gold tier');
      expect(metadata.description).toContain('75/100');
      expect(metadata.hashtags).toContain('FreelanceForge');
    });
  });

  describe('isValidWalletAddress', () => {
    it('should validate correct Polkadot addresses', () => {
      expect(isValidWalletAddress('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY')).toBe(true);
      expect(isValidWalletAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe(false); // Bitcoin address
    });

    it('should reject invalid addresses', () => {
      expect(isValidWalletAddress('')).toBe(false);
      expect(isValidWalletAddress('invalid')).toBe(false);
      expect(isValidWalletAddress('0x1234567890abcdef')).toBe(false); // Ethereum address
    });
  });

  describe('formatWalletAddress', () => {
    it('should format long addresses correctly', () => {
      const formatted = formatWalletAddress(mockWalletAddress);
      expect(formatted).toBe('5Grwva...GKutQY');
    });

    it('should return short addresses unchanged', () => {
      const shortAddress = '5GrwvaEF';
      const formatted = formatWalletAddress(shortAddress);
      expect(formatted).toBe(shortAddress);
    });

    it('should handle custom length', () => {
      const formatted = formatWalletAddress(mockWalletAddress, 4);
      expect(formatted).toBe('5Grw...utQY');
    });
  });

  describe('generateQRCodeData', () => {
    it('should generate QR code configuration', () => {
      const qrData = generateQRCodeData(mockWalletAddress);
      
      expect(qrData.value).toBe(`https://freelanceforge.app/portfolio/${mockWalletAddress}`);
      expect(qrData.size).toBe(256);
      expect(qrData.level).toBe('M');
      expect(qrData.includeMargin).toBe(true);
    });
  });

  describe('getExplorerUrl', () => {
    it('should generate Paseo explorer URL', () => {
      // Mock environment variable
      vi.stubEnv('VITE_NETWORK', 'paseo');
      
      const url = getExplorerUrl(mockWalletAddress);
      expect(url).toBe(`https://paseo.subscan.io/account/${mockWalletAddress}`);
    });

    it('should return # for local network', () => {
      vi.stubEnv('VITE_NETWORK', 'local');
      
      const url = getExplorerUrl(mockWalletAddress);
      expect(url).toBe('#');
    });
  });

  describe('generateVerificationBadge', () => {
    it('should generate verification badge for credentials', () => {
      const badge = generateVerificationBadge(5, mockTrustScore);
      
      expect(badge.isVerified).toBe(true);
      expect(badge.badgeText).toBe('Blockchain Verified');
      expect(badge.badgeColor).toBe('warning'); // Gold tier
      expect(badge.verificationLevel).toBe('Gold');
      expect(badge.credentialCount).toBe(5);
    });

    it('should handle no credentials', () => {
      const emptyTrustScore: TrustScore = {
        total: 0,
        tier: 'Bronze',
        breakdown: { review_score: 0, skill_score: 0, payment_score: 0 },
      };
      
      const badge = generateVerificationBadge(0, emptyTrustScore);
      
      expect(badge.isVerified).toBe(false);
      expect(badge.badgeColor).toBe('default');
      expect(badge.verificationLevel).toBe('Bronze');
    });

    it('should handle different tiers correctly', () => {
      const platinumScore: TrustScore = {
        total: 90,
        tier: 'Platinum',
        breakdown: { review_score: 54, skill_score: 27, payment_score: 9 },
      };
      
      const badge = generateVerificationBadge(10, platinumScore);
      expect(badge.badgeColor).toBe('secondary');
      
      const silverScore: TrustScore = {
        total: 40,
        tier: 'Silver',
        breakdown: { review_score: 24, skill_score: 12, payment_score: 4 },
      };
      
      const silverBadge = generateVerificationBadge(3, silverScore);
      expect(silverBadge.badgeColor).toBe('info');
    });
  });
});