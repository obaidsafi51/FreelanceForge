import type { Credential, TrustScore } from '../types';

/**
 * Generate a public portfolio URL for sharing
 */
export function generatePortfolioUrl(walletAddress: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/portfolio/${walletAddress}`;
}

/**
 * Filter credentials to show only public ones for sharing
 */
export function filterPublicCredentials(credentials: Credential[]): Credential[] {
  return credentials.filter(credential => credential.visibility === 'public');
}

/**
 * Copy text to clipboard using the Clipboard API
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Generate sharing metadata for social platforms
 */
export function generateSharingMetadata(walletAddress: string, trustScore: TrustScore, publicCredentialCount: number) {
  const portfolioUrl = generatePortfolioUrl(walletAddress);
  const formattedAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-6)}`;
  
  return {
    url: portfolioUrl,
    title: `FreelanceForge Portfolio - ${formattedAddress}`,
    description: `Verified freelance portfolio with ${publicCredentialCount} credentials and ${trustScore.tier} tier (${trustScore.total}/100 trust score). Built on Polkadot blockchain.`,
    hashtags: ['FreelanceForge', 'Web3', 'Polkadot', 'Blockchain', 'Freelance', 'Portfolio'],
  };
}

/**
 * Validate wallet address format (basic validation)
 */
export function isValidWalletAddress(address: string): boolean {
  // Basic validation for Substrate addresses
  // Polkadot addresses are typically 47-48 characters long and start with '1' or '5'
  if (!address || typeof address !== 'string') {
    return false;
  }
  
  // Check length and starting character
  const isValidLength = address.length >= 47 && address.length <= 48;
  const isValidStart = address.startsWith('1') || address.startsWith('5');
  
  return isValidLength && isValidStart;
}

/**
 * Format wallet address for display
 */
export function formatWalletAddress(address: string, length: number = 6): string {
  if (!address || address.length <= length * 2) {
    return address;
  }
  
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

/**
 * Generate QR code data with error correction
 */
export function generateQRCodeData(walletAddress: string) {
  const portfolioUrl = generatePortfolioUrl(walletAddress);
  
  return {
    value: portfolioUrl,
    size: 256,
    level: 'M', // Medium error correction
    includeMargin: true,
    imageSettings: {
      src: '/vite.svg', // FreelanceForge logo (if available)
      height: 24,
      width: 24,
      excavate: true,
    },
  };
}

/**
 * Get network-specific explorer URL
 */
export function getExplorerUrl(walletAddress: string): string {
  const network = import.meta.env.VITE_NETWORK || 'local';
  
  if (network === 'paseo') {
    return `https://paseo.subscan.io/account/${walletAddress}`;
  } else {
    // Local development - no explorer available
    return '#';
  }
}

/**
 * Generate verification badge data
 */
export function generateVerificationBadge(credentialCount: number, trustScore: TrustScore) {
  return {
    isVerified: credentialCount > 0,
    badgeText: 'Blockchain Verified',
    badgeColor: trustScore.tier === 'Platinum' ? 'secondary' :
                trustScore.tier === 'Gold' ? 'warning' :
                trustScore.tier === 'Silver' ? 'info' : 'default',
    verificationLevel: trustScore.tier,
    credentialCount,
  };
}