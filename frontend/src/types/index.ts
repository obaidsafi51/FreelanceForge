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