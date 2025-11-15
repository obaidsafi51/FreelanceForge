// Type definitions for FreelanceForge

export interface WalletAccount {
  address: string;
  meta: {
    name?: string;
    source: string;
  };
}

export interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  accounts: WalletAccount[];
  selectedAccount: WalletAccount | null;
  error: string | null;
}

export interface Credential {
  id: string;
  owner: string;
  credential_type: "skill" | "review" | "payment" | "certification";
  name: string;
  description: string;
  issuer: string;
  rating?: number;
  timestamp: string;
  visibility: "public" | "private";
  proof_hash?: string;
}

export interface TrustScore {
  total: number;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  breakdown: {
    review_score: number;
    skill_score: number;
    payment_score: number;
  };
}

// Portfolio export data structures
export interface PortfolioExport {
  wallet_address: string;
  export_timestamp: string;
  trust_score: TrustScore;
  credentials: Credential[];
  blockchain_verification: {
    network: "Paseo" | "Local";
    explorer_url: string;
    account_url: string;
    total_credentials: number;
    credential_transactions: CredentialTransaction[];
  };
  metadata: {
    app_version: string;
    export_format_version: string;
    file_size_bytes: number;
  };
}

export interface CredentialTransaction {
  credential_id: string;
  credential_name: string;
  transaction_hash: string;
  block_hash?: string;
  explorer_url: string;
}

// Export statistics for UI display
export interface ExportStats {
  total_credentials: number;
  public_credentials: number;
  private_credentials: number;
  file_size_bytes: number;
  file_size_formatted: string;
}