import type { 
  Credential, 
  TrustScore, 
  PortfolioExport, 
  CredentialTransaction,
  ExportStats 
} from '../types';
import { getNetworkInfo } from './api';

// App version - in a real app this would come from package.json
const APP_VERSION = '1.0.0';
const EXPORT_FORMAT_VERSION = '1.0';

/**
 * Generate blockchain explorer URLs based on network
 */
export function generateExplorerUrls(network: 'Paseo' | 'Local', walletAddress: string) {
  if (network === 'Paseo') {
    return {
      explorer_base: 'https://paseo.subscan.io',
      account_url: `https://paseo.subscan.io/account/${walletAddress}`,
      transaction_base: 'https://paseo.subscan.io/extrinsic',
    };
  } else {
    // Local development - use Polkadot.js Apps
    return {
      explorer_base: 'https://polkadot.js.org/apps',
      account_url: `https://polkadot.js.org/apps/?rpc=ws://localhost:9944#/accounts`,
      transaction_base: 'https://polkadot.js.org/apps/?rpc=ws://localhost:9944#/explorer/query',
    };
  }
}

/**
 * Generate credential transaction data with explorer links
 * Note: In a real implementation, transaction hashes would be stored during minting
 * For now, we'll generate placeholder data
 */
export function generateCredentialTransactions(
  credentials: Credential[],
  network: 'Paseo' | 'Local'
): CredentialTransaction[] {
  const { transaction_base } = generateExplorerUrls(network, '');
  
  return credentials.map((credential) => {
    // Generate a mock transaction hash for demo purposes
    // In a real implementation, this would be stored during minting
    const mockTxHash = `0x${credential.id.slice(0, 64)}`;
    
    return {
      credential_id: credential.id,
      credential_name: credential.name,
      transaction_hash: mockTxHash,
      explorer_url: `${transaction_base}/${mockTxHash}`,
    };
  });
}

/**
 * Calculate file size in bytes and format for display
 */
export function calculateFileSize(data: any): { bytes: number; formatted: string } {
  const jsonString = JSON.stringify(data, null, 2);
  const bytes = new TextEncoder().encode(jsonString).length;
  
  let formatted: string;
  if (bytes < 1024) {
    formatted = `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    formatted = `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    formatted = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  
  return { bytes, formatted };
}

/**
 * Generate export statistics for UI display
 */
export function generateExportStats(credentials: Credential[]): ExportStats {
  const publicCredentials = credentials.filter(c => c.visibility === 'public').length;
  const privateCredentials = credentials.filter(c => c.visibility === 'private').length;
  
  // Calculate approximate file size (will be recalculated with full export data)
  const mockExport = {
    credentials,
    trust_score: { total: 0, tier: 'Bronze', breakdown: { review_score: 0, skill_score: 0, payment_score: 0 } },
    metadata: {},
  };
  const { bytes, formatted } = calculateFileSize(mockExport);
  
  return {
    total_credentials: credentials.length,
    public_credentials: publicCredentials,
    private_credentials: privateCredentials,
    file_size_bytes: bytes,
    file_size_formatted: formatted,
  };
}

/**
 * Generate complete portfolio export data
 */
export async function generatePortfolioExport(
  walletAddress: string,
  credentials: Credential[],
  trustScore: TrustScore
): Promise<PortfolioExport> {
  // Get network information
  let networkInfo;
  try {
    networkInfo = await getNetworkInfo();
  } catch (error) {
    console.warn('Failed to get network info, using defaults:', error);
    networkInfo = {
      network: 'local' as const,
      endpoint: 'ws://localhost:9944',
      chainName: 'Development',
      nodeVersion: 'unknown',
      isConnected: false,
    };
  }
  
  const network = networkInfo.network === 'paseo' ? 'Paseo' : 'Local';
  const { explorer_base, account_url } = generateExplorerUrls(network, walletAddress);
  
  // Generate credential transaction data
  const credentialTransactions = generateCredentialTransactions(credentials, network);
  
  // Create export data
  const exportData: PortfolioExport = {
    wallet_address: walletAddress,
    export_timestamp: new Date().toISOString(),
    trust_score: trustScore,
    credentials: credentials,
    blockchain_verification: {
      network,
      explorer_url: explorer_base,
      account_url,
      total_credentials: credentials.length,
      credential_transactions: credentialTransactions,
    },
    metadata: {
      app_version: APP_VERSION,
      export_format_version: EXPORT_FORMAT_VERSION,
      file_size_bytes: 0, // Will be calculated below
    },
  };
  
  // Calculate actual file size
  const { bytes } = calculateFileSize(exportData);
  exportData.metadata.file_size_bytes = bytes;
  
  return exportData;
}

/**
 * Download portfolio export as JSON file
 */
export function downloadPortfolioExport(
  exportData: PortfolioExport,
  walletAddress: string
): void {
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Generate filename with wallet address (shortened for readability)
  const shortAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const filename = `freelanceforge-portfolio-${shortAddress}-${timestamp}.json`;
  
  // Create download link and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validate export data before download
 */
export function validateExportData(exportData: PortfolioExport): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!exportData.wallet_address) {
    errors.push('Wallet address is required');
  }
  
  if (!exportData.credentials || exportData.credentials.length === 0) {
    errors.push('No credentials found to export');
  }
  
  if (!exportData.trust_score) {
    errors.push('Trust score calculation failed');
  }
  
  if (exportData.metadata.file_size_bytes > 10 * 1024 * 1024) { // 10MB limit
    errors.push('Export file size exceeds 10MB limit');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Format export data for preview display
 */
export function formatExportPreview(exportData: PortfolioExport): string {
  // Create a simplified version for preview
  const preview = {
    wallet_address: exportData.wallet_address,
    export_timestamp: exportData.export_timestamp,
    trust_score: exportData.trust_score,
    credentials_count: exportData.credentials.length,
    credentials_sample: exportData.credentials.slice(0, 2).map(c => ({
      id: c.id,
      name: c.name,
      type: c.credential_type,
      issuer: c.issuer,
      timestamp: c.timestamp,
    })),
    blockchain_verification: exportData.blockchain_verification,
    metadata: exportData.metadata,
  };
  
  return JSON.stringify(preview, null, 2);
}