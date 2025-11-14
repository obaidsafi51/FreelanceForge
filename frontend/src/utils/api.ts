import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import type { Credential } from '../types';

// API Error types
export const ApiErrorType = {
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  CREDENTIAL_ALREADY_EXISTS: 'CREDENTIAL_ALREADY_EXISTS',
  METADATA_TOO_LARGE: 'METADATA_TOO_LARGE',
  TOO_MANY_CREDENTIALS: 'TOO_MANY_CREDENTIALS',
  CREDENTIAL_NOT_FOUND: 'CREDENTIAL_NOT_FOUND',
  NOT_CREDENTIAL_OWNER: 'NOT_CREDENTIAL_OWNER',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

export type ApiErrorType = typeof ApiErrorType[keyof typeof ApiErrorType];

export class ApiError extends Error {
  constructor(
    public type: ApiErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Configuration interface
interface ApiConfig {
  endpoints: string[];
  network: 'local' | 'paseo';
  retryAttempts: number;
  retryDelay: number;
}

// Transaction result interface
export interface TransactionResult {
  hash: string;
  blockHash?: string;
  success: boolean;
  error?: string;
}

// Credential metadata interface matching pallet schema
export interface CredentialMetadata {
  credential_type: 'skill' | 'review' | 'payment' | 'certification';
  name: string;
  description: string;
  issuer: string;
  rating?: number;
  timestamp: string;
  visibility: 'public' | 'private';
  proof_hash?: string;
  metadata?: {
    platform?: string;
    external_id?: string;
    verification_url?: string;
  };
}

class FreelanceForgeAPI {
  private api: ApiPromise | null = null;
  private config: ApiConfig;
  private currentEndpointIndex = 0;
  private isConnecting = false;

  constructor() {
    // Initialize configuration based on environment variables
    const network = (import.meta.env.VITE_NETWORK || import.meta.env.REACT_APP_NETWORK || 'local') as 'local' | 'paseo';
    
    this.config = {
      network,
      endpoints: this.getEndpoints(network),
      retryAttempts: 3,
      retryDelay: 1000,
    };
  }

  private getEndpoints(network: 'local' | 'paseo'): string[] {
    if (network === 'local') {
      return [
        import.meta.env.VITE_WS_PROVIDER || 
        import.meta.env.REACT_APP_WS_PROVIDER || 
        'ws://localhost:9944'
      ];
    }
    
    // Paseo testnet endpoints with fallbacks
    return [
      import.meta.env.VITE_PASEO_RPC_1 || 
      import.meta.env.REACT_APP_PASEO_RPC_1 || 
      'wss://paseo.dotters.network',
      
      import.meta.env.VITE_PASEO_RPC_2 || 
      import.meta.env.REACT_APP_PASEO_RPC_2 || 
      'wss://rpc.ibp.network/paseo',
      
      import.meta.env.VITE_PASEO_RPC_3 || 
      import.meta.env.REACT_APP_PASEO_RPC_3 || 
      'wss://paseo.rpc.amforc.com',
    ];
  }

  /**
   * Connect to the Substrate node with endpoint fallback
   */
  async connect(): Promise<ApiPromise> {
    if (this.api && this.api.isConnected) {
      return this.api;
    }

    if (this.isConnecting) {
      // Wait for existing connection attempt
      while (this.isConnecting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (this.api && this.api.isConnected) {
        return this.api;
      }
    }

    this.isConnecting = true;

    try {
      for (let i = 0; i < this.config.endpoints.length; i++) {
        const endpointIndex = (this.currentEndpointIndex + i) % this.config.endpoints.length;
        const endpoint = this.config.endpoints[endpointIndex];

        try {
          console.log(`Attempting to connect to ${endpoint}...`);
          
          const provider = new WsProvider(endpoint, 5000); // 5 second timeout
          const api = await ApiPromise.create({ provider });
          
          await api.isReady;
          
          this.api = api;
          this.currentEndpointIndex = endpointIndex;
          
          console.log(`Successfully connected to ${endpoint}`);
          return api;
        } catch (error) {
          console.warn(`Failed to connect to ${endpoint}:`, error);
          continue;
        }
      }

      throw new ApiError(
        ApiErrorType.CONNECTION_FAILED,
        'Failed to connect to any RPC endpoint'
      );
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Disconnect from the API
   */
  async disconnect(): Promise<void> {
    if (this.api) {
      await this.api.disconnect();
      this.api = null;
    }
  }

  /**
   * Retry operation with exponential backoff
   */
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.config.retryAttempts
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff: 1s, 2s, 4s, etc.
        const delay = this.config.retryDelay * Math.pow(2, attempt);
        console.warn(`Operation failed, retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new ApiError(
      ApiErrorType.NETWORK_ERROR,
      `Operation failed after ${maxRetries + 1} attempts: ${lastError?.message || 'Unknown error'}`,
      lastError || undefined
    );
  }

  /**
   * Validate credential metadata size and format
   */
  private validateCredentialMetadata(metadata: CredentialMetadata): void {
    const jsonString = JSON.stringify(metadata);
    const sizeInBytes = new TextEncoder().encode(jsonString).length;
    
    if (sizeInBytes > 4096) {
      throw new ApiError(
        ApiErrorType.METADATA_TOO_LARGE,
        `Credential metadata exceeds 4KB limit (${sizeInBytes} bytes)`
      );
    }

    // Validate required fields
    if (!metadata.credential_type || !metadata.name || !metadata.issuer || !metadata.timestamp) {
      throw new ApiError(
        ApiErrorType.VALIDATION_ERROR,
        'Missing required credential fields: credential_type, name, issuer, timestamp'
      );
    }

    // Validate credential type
    const validTypes = ['skill', 'review', 'payment', 'certification'];
    if (!validTypes.includes(metadata.credential_type)) {
      throw new ApiError(
        ApiErrorType.VALIDATION_ERROR,
        `Invalid credential type: ${metadata.credential_type}`
      );
    }

    // Validate visibility
    if (metadata.visibility && !['public', 'private'].includes(metadata.visibility)) {
      throw new ApiError(
        ApiErrorType.VALIDATION_ERROR,
        `Invalid visibility setting: ${metadata.visibility}`
      );
    }
  }

  /**
   * Mint a new credential NFT
   */
  async mintCredential(
    accountAddress: string,
    credentialData: CredentialMetadata
  ): Promise<TransactionResult> {
    return this.retryWithBackoff(async () => {
      const api = await this.connect();
      
      // Validate metadata
      this.validateCredentialMetadata(credentialData);
      
      // Enable web3 extension
      await web3Enable('FreelanceForge');
      
      // Get injector for signing
      const injector = await web3FromAddress(accountAddress);
      
      // Prepare metadata JSON
      const metadataJson = JSON.stringify(credentialData);
      const metadataBytes = new TextEncoder().encode(metadataJson);
      
      // Create and sign transaction
      const tx = api.tx.freelanceCredentials.mintCredential(metadataBytes);
      
      return new Promise<TransactionResult>((resolve, reject) => {
        tx.signAndSend(accountAddress, { signer: injector.signer }, (result: any) => {
          if (result.status.isInBlock) {
            console.log(`Transaction included in block: ${result.status.asInBlock}`);
          } else if (result.status.isFinalized) {
            console.log(`Transaction finalized: ${result.status.asFinalized}`);
            
            // Check for errors in events
            const errorEvent = result.events.find(({ event }: any) => 
              api.events.system.ExtrinsicFailed.is(event)
            );
            
            if (errorEvent) {
              const [dispatchError] = errorEvent.event.data;
              let errorMessage = 'Transaction failed';
              
              if (dispatchError && typeof dispatchError === 'object' && 'isModule' in dispatchError) {
                try {
                  const decoded = api.registry.findMetaError((dispatchError as any).asModule);
                  errorMessage = `${decoded.section}.${decoded.name}: ${decoded.docs}`;
                  
                  // Map pallet errors to API errors
                  if (decoded.name === 'CredentialAlreadyExists') {
                    reject(new ApiError(ApiErrorType.CREDENTIAL_ALREADY_EXISTS, errorMessage));
                    return;
                  } else if (decoded.name === 'MetadataTooLarge') {
                    reject(new ApiError(ApiErrorType.METADATA_TOO_LARGE, errorMessage));
                    return;
                  } else if (decoded.name === 'TooManyCredentials') {
                    reject(new ApiError(ApiErrorType.TOO_MANY_CREDENTIALS, errorMessage));
                    return;
                  }
                } catch (decodeError) {
                  console.warn('Failed to decode error:', decodeError);
                }
              }
              
              reject(new ApiError(ApiErrorType.TRANSACTION_FAILED, errorMessage));
            } else {
              resolve({
                hash: result.txHash.toString(),
                blockHash: result.status.asFinalized.toString(),
                success: true,
              });
            }
          } else if (result.isError) {
            reject(new ApiError(
              ApiErrorType.TRANSACTION_FAILED,
              'Transaction failed'
            ));
          }
        }).catch((error: any) => {
          if (error.message.includes('Cancelled')) {
            reject(new ApiError(ApiErrorType.TRANSACTION_FAILED, 'Transaction cancelled by user'));
          } else if (error.message.includes('balance')) {
            reject(new ApiError(ApiErrorType.INSUFFICIENT_BALANCE, 'Insufficient balance for transaction'));
          } else {
            reject(new ApiError(ApiErrorType.TRANSACTION_FAILED, error.message, error));
          }
        });
      });
    });
  } 
  /**
   * Update an existing credential's visibility or proof_hash
   */
  async updateCredential(
    accountAddress: string,
    credentialId: string,
    updates: {
      visibility?: 'public' | 'private';
      proof_hash?: string;
    }
  ): Promise<TransactionResult> {
    return this.retryWithBackoff(async () => {
      const api = await this.connect();
      
      // Enable web3 extension
      await web3Enable('FreelanceForge');
      
      // Get injector for signing
      const injector = await web3FromAddress(accountAddress);
      
      // Prepare update parameters
      const visibilityBytes = updates.visibility ? 
        new TextEncoder().encode(updates.visibility) : null;
      const proofHash = updates.proof_hash || null;
      
      // Create and sign transaction
      const tx = api.tx.freelanceCredentials.updateCredential(
        credentialId,
        visibilityBytes,
        proofHash
      );
      
      return new Promise<TransactionResult>((resolve, reject) => {
        tx.signAndSend(accountAddress, { signer: injector.signer }, (result: any) => {
          if (result.status.isFinalized) {
            // Check for errors in events
            const errorEvent = result.events.find(({ event }: any) => 
              api.events.system.ExtrinsicFailed.is(event)
            );
            
            if (errorEvent) {
              const [dispatchError] = errorEvent.event.data;
              let errorMessage = 'Update failed';
              
              if (dispatchError && typeof dispatchError === 'object' && 'isModule' in dispatchError) {
                try {
                  const decoded = api.registry.findMetaError((dispatchError as any).asModule);
                  errorMessage = `${decoded.section}.${decoded.name}: ${decoded.docs}`;
                  
                  if (decoded.name === 'CredentialNotFound') {
                    reject(new ApiError(ApiErrorType.CREDENTIAL_NOT_FOUND, errorMessage));
                    return;
                  } else if (decoded.name === 'NotCredentialOwner') {
                    reject(new ApiError(ApiErrorType.NOT_CREDENTIAL_OWNER, errorMessage));
                    return;
                  }
                } catch (decodeError) {
                  console.warn('Failed to decode error:', decodeError);
                }
              }
              
              reject(new ApiError(ApiErrorType.TRANSACTION_FAILED, errorMessage));
            } else {
              resolve({
                hash: result.txHash.toString(),
                blockHash: result.status.asFinalized.toString(),
                success: true,
              });
            }
          } else if (result.isError) {
            reject(new ApiError(
              ApiErrorType.TRANSACTION_FAILED,
              'Update transaction failed'
            ));
          }
        }).catch((error: any) => {
          if (error.message.includes('Cancelled')) {
            reject(new ApiError(ApiErrorType.TRANSACTION_FAILED, 'Transaction cancelled by user'));
          } else if (error.message.includes('balance')) {
            reject(new ApiError(ApiErrorType.INSUFFICIENT_BALANCE, 'Insufficient balance for transaction'));
          } else {
            reject(new ApiError(ApiErrorType.TRANSACTION_FAILED, error.message, error));
          }
        });
      });
    });
  }

  /**
   * Delete a credential (only by owner)
   */
  async deleteCredential(
    accountAddress: string,
    credentialId: string
  ): Promise<TransactionResult> {
    return this.retryWithBackoff(async () => {
      const api = await this.connect();
      
      // Enable web3 extension
      await web3Enable('FreelanceForge');
      
      // Get injector for signing
      const injector = await web3FromAddress(accountAddress);
      
      // Create and sign transaction
      const tx = api.tx.freelanceCredentials.deleteCredential(credentialId);
      
      return new Promise<TransactionResult>((resolve, reject) => {
        tx.signAndSend(accountAddress, { signer: injector.signer }, (result: any) => {
          if (result.status.isFinalized) {
            // Check for errors in events
            const errorEvent = result.events.find(({ event }: any) => 
              api.events.system.ExtrinsicFailed.is(event)
            );
            
            if (errorEvent) {
              const [dispatchError] = errorEvent.event.data;
              let errorMessage = 'Delete failed';
              
              if (dispatchError && typeof dispatchError === 'object' && 'isModule' in dispatchError) {
                try {
                  const decoded = api.registry.findMetaError((dispatchError as any).asModule);
                  errorMessage = `${decoded.section}.${decoded.name}: ${decoded.docs}`;
                  
                  if (decoded.name === 'CredentialNotFound') {
                    reject(new ApiError(ApiErrorType.CREDENTIAL_NOT_FOUND, errorMessage));
                    return;
                  } else if (decoded.name === 'NotCredentialOwner') {
                    reject(new ApiError(ApiErrorType.NOT_CREDENTIAL_OWNER, errorMessage));
                    return;
                  }
                } catch (decodeError) {
                  console.warn('Failed to decode error:', decodeError);
                }
              }
              
              reject(new ApiError(ApiErrorType.TRANSACTION_FAILED, errorMessage));
            } else {
              resolve({
                hash: result.txHash.toString(),
                blockHash: result.status.asFinalized.toString(),
                success: true,
              });
            }
          } else if (result.isError) {
            reject(new ApiError(
              ApiErrorType.TRANSACTION_FAILED,
              'Delete transaction failed'
            ));
          }
        }).catch((error: any) => {
          if (error.message.includes('Cancelled')) {
            reject(new ApiError(ApiErrorType.TRANSACTION_FAILED, 'Transaction cancelled by user'));
          } else if (error.message.includes('balance')) {
            reject(new ApiError(ApiErrorType.INSUFFICIENT_BALANCE, 'Insufficient balance for transaction'));
          } else {
            reject(new ApiError(ApiErrorType.TRANSACTION_FAILED, error.message, error));
          }
        });
      });
    });
  }

  /**
   * Get all credentials for a specific account
   */
  async getCredentials(accountAddress: string): Promise<Credential[]> {
    return this.retryWithBackoff(async () => {
      const api = await this.connect();
      
      try {
        // Query the OwnerCredentials storage to get credential IDs for this account
        const credentialIds = await api.query.freelanceCredentials.ownerCredentials(accountAddress);
        
        if (!credentialIds || credentialIds.isEmpty) {
          return [];
        }
        
        // Convert to array of credential IDs
        const ids = credentialIds.toJSON() as string[];
        
        // Fetch each credential's metadata
        const credentials: Credential[] = [];
        
        for (const credentialId of ids) {
          try {
            const credentialData = await api.query.freelanceCredentials.credentials(credentialId);
            
            if (credentialData && !credentialData.isEmpty) {
              const [owner, metadataBytes] = credentialData.toJSON() as [string, number[]];
              
              // Convert bytes back to JSON string
              const metadataJson = new TextDecoder().decode(new Uint8Array(metadataBytes));
              const metadata = JSON.parse(metadataJson) as CredentialMetadata;
              
              // Create credential object
              const credential: Credential = {
                id: credentialId,
                owner,
                credential_type: metadata.credential_type,
                name: metadata.name,
                description: metadata.description,
                issuer: metadata.issuer,
                rating: metadata.rating,
                timestamp: metadata.timestamp,
                visibility: metadata.visibility || 'public',
                proof_hash: metadata.proof_hash,
              };
              
              credentials.push(credential);
            }
          } catch (error) {
            console.warn(`Failed to fetch credential ${credentialId}:`, error);
            // Continue with other credentials
          }
        }
        
        // Sort by timestamp (newest first)
        return credentials.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
      } catch (error) {
        console.error('Failed to fetch credentials:', error);
        throw new ApiError(
          ApiErrorType.NETWORK_ERROR,
          'Failed to fetch credentials from blockchain',
          error as Error
        );
      }
    });
  }

  /**
   * Get a specific credential by ID
   */
  async getCredentialById(credentialId: string): Promise<Credential | null> {
    return this.retryWithBackoff(async () => {
      const api = await this.connect();
      
      try {
        const credentialData = await api.query.freelanceCredentials.credentials(credentialId);
        
        if (!credentialData || credentialData.isEmpty) {
          return null;
        }
        
        const [owner, metadataBytes] = credentialData.toJSON() as [string, number[]];
        
        // Convert bytes back to JSON string
        const metadataJson = new TextDecoder().decode(new Uint8Array(metadataBytes));
        const metadata = JSON.parse(metadataJson) as CredentialMetadata;
        
        return {
          id: credentialId,
          owner,
          credential_type: metadata.credential_type,
          name: metadata.name,
          description: metadata.description,
          issuer: metadata.issuer,
          rating: metadata.rating,
          timestamp: metadata.timestamp,
          visibility: metadata.visibility || 'public',
          proof_hash: metadata.proof_hash,
        };
        
      } catch (error) {
        console.error(`Failed to fetch credential ${credentialId}:`, error);
        throw new ApiError(
          ApiErrorType.NETWORK_ERROR,
          'Failed to fetch credential from blockchain',
          error as Error
        );
      }
    });
  }

  /**
   * Get network information
   */
  async getNetworkInfo() {
    const api = await this.connect();
    
    return {
      network: this.config.network,
      endpoint: this.config.endpoints[this.currentEndpointIndex],
      chainName: (await api.rpc.system.chain()).toString(),
      nodeVersion: (await api.rpc.system.version()).toString(),
      isConnected: api.isConnected,
    };
  }
}

// Export singleton instance
export const freelanceForgeAPI = new FreelanceForgeAPI();

// Export utility functions
export async function connectToBlockchain(): Promise<ApiPromise> {
  return freelanceForgeAPI.connect();
}

export async function mintCredential(
  accountAddress: string,
  credentialData: CredentialMetadata
): Promise<TransactionResult> {
  return freelanceForgeAPI.mintCredential(accountAddress, credentialData);
}

export async function updateCredential(
  accountAddress: string,
  credentialId: string,
  updates: {
    visibility?: 'public' | 'private';
    proof_hash?: string;
  }
): Promise<TransactionResult> {
  return freelanceForgeAPI.updateCredential(accountAddress, credentialId, updates);
}

export async function deleteCredential(
  accountAddress: string,
  credentialId: string
): Promise<TransactionResult> {
  return freelanceForgeAPI.deleteCredential(accountAddress, credentialId);
}

export async function getCredentials(accountAddress: string): Promise<Credential[]> {
  return freelanceForgeAPI.getCredentials(accountAddress);
}

export async function getCredentialById(credentialId: string): Promise<Credential | null> {
  return freelanceForgeAPI.getCredentialById(credentialId);
}

export async function getNetworkInfo() {
  return freelanceForgeAPI.getNetworkInfo();
}