import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { performanceMonitor, PerformanceMetrics } from './performance';

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
  private pendingTransactions = new Set<string>();

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

    // Add global error handler for Polkadot.js API
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('Cannot read properties of undefined') ||
        message.includes('Accessing element.ref was removed') ||
        message.includes('Unsupported unsigned extrinsic version')) {
        console.warn('Polkadot.js API compatibility warning:', message);
        // Don't throw, just log the warning
        return;
      }
      originalConsoleError.apply(console, args);
    };

    try {
      for (let i = 0; i < this.config.endpoints.length; i++) {
        const endpointIndex = (this.currentEndpointIndex + i) % this.config.endpoints.length;
        const endpoint = this.config.endpoints[endpointIndex];

        try {
          console.log(`Attempting to connect to ${endpoint}...`);
          console.log(`Connecting to ${endpoint}`);

          const provider = new WsProvider(endpoint, 10000); // 10 second timeout for better reliability

          // Add connection event listeners for better debugging
          provider.on('connected', () => {
            console.log(`WebSocket connected to ${endpoint}`);
          });

          provider.on('disconnected', () => {
            console.log(`WebSocket disconnected from ${endpoint}`);
          });

          provider.on('error', (error) => {
            console.warn(`WebSocket error on ${endpoint}:`, error);
          });

          const api = await Promise.race([
            ApiPromise.create({
              provider,
              throwOnConnect: true, // Throw errors immediately instead of retrying
              // Add runtime version compatibility
              noInitWarn: true,
            }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('API creation timeout')), 15000)
            )
          ]) as ApiPromise;

          await Promise.race([
            api.isReady,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('API ready timeout')), 10000)
            )
          ]);

          // Verify the API is properly initialized
          if (!api.registry || !api.query || !api.tx) {
            throw new Error('API not properly initialized - missing registry, query, or tx');
          }

          this.api = api;
          this.currentEndpointIndex = endpointIndex;

          console.log(`Successfully connected to ${endpoint}`);
          console.log(`Successfully connected to ${endpoint}`);
          return api;
        } catch (error) {
          console.warn(`Failed to connect to ${endpoint}:`, error);
          console.error(`Connection failed for ${endpoint}:`, error);
          continue;
        }
      }

      const connectionError = new ApiError(
        ApiErrorType.CONNECTION_FAILED,
        'Failed to connect to any RPC endpoint'
      );

      console.error('Failed to connect to any RPC endpoint:', this.config.endpoints);

      throw connectionError;
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
    // Create a compact version of the metadata for blockchain storage
    const compactMetadata = this.createCompactMetadata(metadata);
    const jsonString = JSON.stringify(compactMetadata);
    const sizeInBytes = new TextEncoder().encode(jsonString).length;

    console.log(`Metadata size: ${sizeInBytes} bytes`);
    console.log(`Compact metadata:`, compactMetadata);

    if (sizeInBytes > 3072) { // Use 3KB limit to be safe (75% of 4KB)
      throw new ApiError(
        ApiErrorType.METADATA_TOO_LARGE,
        `Credential metadata exceeds 3KB limit (${sizeInBytes} bytes). Please reduce description length.`
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
   * Parse simple string format: type|name|issuer|timestamp|visibility
   */
  private parseSimpleFormat(simpleString: string): CredentialMetadata {
    const parts = simpleString.split('|');
    if (parts.length < 5) {
      throw new Error('Invalid simple format string');
    }

    return {
      credential_type: this.expandCredentialType(parts[0]),
      name: parts[1] || 'Untitled',
      description: '', // No description in minimal format
      issuer: parts[2] || 'Unknown',
      timestamp: new Date(parseInt(parts[3]) * 100000).toISOString(), // Convert back from reduced timestamp
      visibility: parts[4] === '0' ? 'private' : 'public',
      rating: undefined, // No rating in minimal format
    };
  }

  /**
   * Expand compact metadata back to full format
   */
  private expandCompactMetadata(compactData: any): CredentialMetadata {
    console.log('Expanding compact metadata:', compactData);

    // Check if this is compact format (has short keys like 't', 'n', etc.)
    if (compactData.t || compactData.credential_type) {
      // This could be compact format, expand it
      const expanded = {
        credential_type: compactData.credential_type || this.expandCredentialType(compactData.t || 'skil'),
        name: compactData.name || compactData.n || 'Untitled Credential',
        description: compactData.description || compactData.d || '',
        issuer: compactData.issuer || compactData.i || 'Unknown Issuer',
        timestamp: compactData.timestamp || compactData.ts || new Date().toISOString(),
        visibility: compactData.visibility || (compactData.v === 0 ? 'private' : 'public'),
        rating: compactData.rating || (compactData.r ? compactData.r / 10 : undefined),
        proof_hash: compactData.proof_hash || compactData.p || undefined,
      };

      console.log('Expanded metadata:', expanded);
      return expanded;
    } else {
      // This is already full format, return as is
      console.log('Using full format metadata:', compactData);
      return compactData as CredentialMetadata;
    }
  }

  /**
   * Expand shortened credential type back to full name
   */
  private expandCredentialType(shortType: string): 'skill' | 'review' | 'payment' | 'certification' {
    switch (shortType.toLowerCase()) {
      case 's':
      case 'skil':
        return 'skill';
      case 'r':
      case 'revi':
        return 'review';
      case 'p':
      case 'paym':
        return 'payment';
      case 'c':
      case 'cert':
        return 'certification';
      default:
        return 'skill'; // Default fallback
    }
  }

  /**
   * Create a compact version of metadata for blockchain storage
   */
  private createCompactMetadata(metadata: CredentialMetadata): any {
    // Create an extremely minimal structure for blockchain storage
    // Use very short values to avoid compact encoding issues
    const compact: any = {
      t: metadata.credential_type.charAt(0), // Just first letter: s/r/p/c
      n: metadata.name?.substring(0, 10) || 'Item', // Very short name
      d: metadata.description?.substring(0, 20) || '', // Very short description
      i: metadata.issuer?.substring(0, 8) || 'Issuer', // Very short issuer
      ts: Math.floor(Date.now() / 1000), // Unix timestamp in seconds (smaller number)
      v: metadata.visibility === 'private' ? 0 : 1, // Use number instead of string
    };

    // Only add rating if it exists and is meaningful
    if (metadata.rating && metadata.rating > 0) {
      compact.r = Math.floor(metadata.rating * 10); // Store as integer (rating * 10)
    }

    console.log('Created ultra-compact metadata:', compact);
    console.log('Compact metadata size:', JSON.stringify(compact).length, 'characters');
    return compact;
  }

  /**
   * Mint a new credential NFT
   */
  async mintCredential(
    accountAddress: string,
    credentialData: CredentialMetadata
  ): Promise<TransactionResult> {
    // Create a unique transaction key to prevent duplicates
    const transactionKey = `mint_${accountAddress}_${credentialData.name}_${credentialData.timestamp}`;

    if (this.pendingTransactions.has(transactionKey)) {
      throw new ApiError(ApiErrorType.TRANSACTION_FAILED, 'Transaction already in progress');
    }

    this.pendingTransactions.add(transactionKey);

    try {
      return await this.retryWithBackoff(async () => {
        const api = await this.connect();

        // Validate metadata
        this.validateCredentialMetadata(credentialData);

        // Enable web3 extension
        await web3Enable('FreelanceForge');

        // Get injector for signing
        const injector = await web3FromAddress(accountAddress);

        // Use basic metadata format
        const metadata = {
          credential_type: credentialData.credential_type,
          name: credentialData.name,
          description: credentialData.description,
          issuer: credentialData.issuer,
          timestamp: credentialData.timestamp,
          visibility: credentialData.visibility,
          rating: credentialData.rating,
          proof_hash: credentialData.proof_hash,
        };

        const metadataJson = JSON.stringify(metadata);
        console.log(`Metadata JSON:`, metadataJson);
        console.log(`Metadata size: ${metadataJson.length} characters`);

        // Convert to string for the pallet (let Polkadot.js handle encoding)
        const metadataString = metadataJson;

        if (metadataString.length > 1000) { // Reasonable limit
          throw new ApiError(
            ApiErrorType.METADATA_TOO_LARGE,
            `Metadata too large for minting: ${metadataString.length} characters`
          );
        }

        // Create and sign transaction
        console.log('Creating transaction with metadata string:', metadataString);
        console.log('API registry info:', api.registry.chainDecimals, api.registry.chainTokens);

        let tx: any;
        try {
          tx = api.tx.freelanceCredentials.mintCredential(metadataString);
          console.log('Transaction created successfully');
          console.log('Transaction method:', tx.method.toHuman());
        } catch (txError) {
          console.error('Transaction creation failed:', txError);
          throw new ApiError(
            ApiErrorType.TRANSACTION_FAILED,
            `Failed to create transaction: ${txError instanceof Error ? txError.message : 'Unknown error'}`
          );
        }

        // Check account balance before submitting
        try {
          const accountInfo = await api.query.system.account(accountAddress);
          const balance = (accountInfo as any).data.free.toBigInt();
          console.log(`Account balance: ${balance} units`);

          if (balance === 0n) {
            throw new ApiError(
              ApiErrorType.INSUFFICIENT_BALANCE,
              'Account has zero balance. Please fund your account with some tokens.'
            );
          }
        } catch (balanceError) {
          console.warn('Could not check balance:', balanceError);
          // Continue anyway, let the transaction fail if needed
        }

        return new Promise<TransactionResult>((resolve, reject) => {
          console.log('Submitting transaction...');
          let isResolved = false; // Prevent multiple resolutions

          tx.signAndSend(accountAddress, { signer: injector.signer }, (result: any) => {
            if (isResolved) return; // Skip if already resolved

            console.log('Transaction status update:', result?.status?.type);

            if (!result || !result.status) {
              console.warn('Received invalid transaction result');
              return;
            }

            if (result.status.isInBlock) {
              console.log(`Transaction included in block: ${result.status.asInBlock}`);
            } else if (result.status.isFinalized) {
              console.log(`Transaction finalized: ${result.status.asFinalized}`);
              isResolved = true; // Mark as resolved

              // Check for errors in events
              const errorEvent = result.events?.find(({ event }: any) =>
                event && api.events.system.ExtrinsicFailed.is(event)
              );

              if (errorEvent && errorEvent.event && errorEvent.event.data) {
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
                  hash: result.txHash?.toString() || 'unknown',
                  blockHash: result.status.asFinalized?.toString() || 'unknown',
                  success: true,
                });
              }
            } else if (result.isError) {
              isResolved = true;
              reject(new ApiError(
                ApiErrorType.TRANSACTION_FAILED,
                'Transaction failed'
              ));
            }
          }).catch((error: any) => {
            console.error('Transaction submission error:', error);

            if (error.message.includes('Cancelled')) {
              reject(new ApiError(ApiErrorType.TRANSACTION_FAILED, 'Transaction cancelled by user'));
            } else if (error.message.includes('balance') || error.message.includes('Balance')) {
              reject(new ApiError(ApiErrorType.INSUFFICIENT_BALANCE, 'Insufficient balance for transaction fees'));
            } else if (error.message.includes('Network') || error.message.includes('connection')) {
              reject(new ApiError(ApiErrorType.NETWORK_ERROR, 'Network error during transaction submission'));
            } else {
              reject(new ApiError(ApiErrorType.TRANSACTION_FAILED, `Transaction failed: ${error.message}`, error));
            }
          });
        });
      });
    } finally {
      this.pendingTransactions.delete(transactionKey);
    }
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

      // First, get the existing credential to update its metadata
      const existingCredential = await this.getCredentialById(credentialId);
      if (!existingCredential) {
        throw new ApiError(ApiErrorType.CREDENTIAL_NOT_FOUND, 'Credential not found');
      }

      // Create updated metadata
      const updatedMetadata: CredentialMetadata = {
        credential_type: existingCredential.credential_type,
        name: existingCredential.name,
        description: existingCredential.description,
        issuer: existingCredential.issuer,
        timestamp: existingCredential.timestamp,
        visibility: updates.visibility || existingCredential.visibility,
        proof_hash: updates.proof_hash || existingCredential.proof_hash,
      };

      // Enable web3 extension
      await web3Enable('FreelanceForge');

      // Get injector for signing
      const injector = await web3FromAddress(accountAddress);

      // Use basic metadata format for update
      const metadataJson = JSON.stringify(updatedMetadata);
      console.log('Update metadata JSON:', metadataJson);
      console.log('Update metadata size:', metadataJson.length, 'characters');

      const metadataString = metadataJson;

      if (metadataString.length > 1000) { // Reasonable limit
        throw new ApiError(
          ApiErrorType.METADATA_TOO_LARGE,
          `Metadata too large for update: ${metadataString.length} characters`
        );
      }

      console.log('Calling updateCredential with:', {
        credentialId,
        updatedMetadata,
        accountAddress
      });

      const tx = api.tx.freelanceCredentials.updateCredential(
        credentialId,
        metadataString
      );

      return new Promise<TransactionResult>((resolve, reject) => {
        console.log('Submitting updateCredential transaction...');
        let isResolved = false; // Prevent multiple resolutions

        tx.signAndSend(accountAddress, { signer: injector.signer }, (result: any) => {
          if (isResolved) return; // Skip if already resolved

          console.log('UpdateCredential transaction status:', result?.status?.type, result);

          if (!result || !result.status) {
            console.warn('Received invalid transaction result:', result);
            return;
          }

          if (result.status.isInBlock) {
            console.log(`UpdateCredential transaction included in block: ${result.status.asInBlock}`);
          } else if (result.status.isFinalized) {
            isResolved = true; // Mark as resolved

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
            isResolved = true;
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
        let isResolved = false; // Prevent multiple resolutions

        tx.signAndSend(accountAddress, { signer: injector.signer }, (result: any) => {
          if (isResolved) return; // Skip if already resolved

          if (result.status.isFinalized) {
            isResolved = true; // Mark as resolved

            // Check for errors in events
            const errorEvent = result.events.find(({ event }: any) =>
              api.events.system.ExtrinsicFailed.is(event)
            );

            if (errorEvent) {
              const [dispatchError] = errorEvent.event.data;
              let errorMessage = 'Delete failed';

              if (dispatchError && typeof dispatchError === 'object' && 'isModule' in dispatchError) {
                try {
                  const decoded = api.registry.findMetaError((dispatchError as unknown).asModule);
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
            isResolved = true;
            reject(new ApiError(
              ApiErrorType.TRANSACTION_FAILED,
              'Delete transaction failed'
            ));
          }
        }).catch((error: unknown) => {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          if (errorMessage.includes('Cancelled')) {
            reject(new ApiError(ApiErrorType.TRANSACTION_FAILED, 'Transaction cancelled by user'));
          } else if (errorMessage.includes('balance')) {
            reject(new ApiError(ApiErrorType.INSUFFICIENT_BALANCE, 'Insufficient balance for transaction'));
          } else {
            reject(new ApiError(ApiErrorType.TRANSACTION_FAILED, errorMessage, error instanceof Error ? error : undefined));
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
        // Verify API is ready and has the required pallet
        if (!api.query?.freelanceCredentials) {
          console.warn('FreelanceCredentials pallet not found in runtime, returning empty credentials');
          return [];
        }

        // Query the OwnerCredentials storage to get credential IDs for this account
        const credentialIds = await api.query.freelanceCredentials.ownerCredentials(accountAddress);

        console.log(`Raw credential IDs for ${accountAddress}:`, credentialIds?.toString());

        if (!credentialIds || credentialIds.isEmpty) {
          console.log(`No credentials found for account ${accountAddress}`);
          return [];
        }

        // Convert to array of credential IDs with error handling
        let ids: string[];
        try {
          ids = credentialIds.toJSON() as string[];
          console.log(`Parsed credential IDs for ${accountAddress}:`, ids);
          if (!Array.isArray(ids)) {
            console.warn('Expected array of credential IDs, got:', typeof ids, ids);
            return [];
          }
        } catch (jsonError) {
          console.warn('Failed to parse credential IDs:', jsonError);
          return [];
        }

        // Fetch each credential's metadata
        const credentials: Credential[] = [];

        for (const credentialId of ids) {
          try {
            const credentialData = await api.query.freelanceCredentials.credentials(credentialId);

            if (credentialData && !credentialData.isEmpty) {
              let owner: string;
              let metadataBytes: number[];

              try {
                const credentialJson = credentialData.toJSON();
                if (!Array.isArray(credentialJson) || credentialJson.length !== 2) {
                  console.warn(`Invalid credential data format for ${credentialId}:`, credentialJson);
                  continue;
                }
                [owner, metadataBytes] = credentialJson as [string, number[]];
              } catch (parseError) {
                console.warn(`Failed to parse credential data for ${credentialId}:`, parseError);
                continue;
              }

              // Convert bytes back to JSON string with error handling
              let metadata: CredentialMetadata;
              try {
                let uint8Array: Uint8Array;

                if (Array.isArray(metadataBytes)) {
                  // If it's already an array of numbers, use it directly
                  uint8Array = new Uint8Array(metadataBytes);
                } else if (typeof metadataBytes === 'string' && (metadataBytes as string).startsWith('0x')) {
                  // If it's a hex string, convert it to bytes
                  const hexString = (metadataBytes as string).slice(2); // Remove '0x' prefix
                  const bytes = [];
                  for (let i = 0; i < hexString.length; i += 2) {
                    bytes.push(parseInt(hexString.substr(i, 2), 16));
                  }
                  uint8Array = new Uint8Array(bytes);
                } else {
                  console.warn(`Invalid metadata bytes format for ${credentialId}:`, typeof metadataBytes, metadataBytes);
                  continue;
                }

                const metadataString = new TextDecoder().decode(uint8Array);

                // Check if this is the new simple string format (contains |)
                if (metadataString.includes('|')) {
                  metadata = this.parseSimpleFormat(metadataString);
                } else {
                  // Try to parse as JSON (legacy format)
                  const parsedMetadata = JSON.parse(metadataString);

                  // Validate metadata structure
                  if (!parsedMetadata || typeof parsedMetadata !== 'object') {
                    console.warn(`Invalid metadata structure for credential ${credentialId}:`, parsedMetadata);
                    continue;
                  }

                  // Check if this is compact metadata and expand it
                  metadata = this.expandCompactMetadata(parsedMetadata);
                }
              } catch (decodeError) {
                console.warn(`Failed to decode metadata for ${credentialId}:`, decodeError);
                continue;
              }

              // Validate and normalize timestamp
              let normalizedTimestamp: string;
              try {
                if (typeof metadata.timestamp === 'number') {
                  // Convert Unix timestamp to ISO string
                  const date = new Date(metadata.timestamp < 1e12 ? metadata.timestamp * 1000 : metadata.timestamp);
                  normalizedTimestamp = date.toISOString();
                } else if (typeof metadata.timestamp === 'string') {
                  // Validate string timestamp
                  const date = new Date(metadata.timestamp);
                  if (isNaN(date.getTime())) {
                    console.warn(`Invalid timestamp for credential ${credentialId}: ${metadata.timestamp}`);
                    normalizedTimestamp = new Date().toISOString();
                  } else {
                    normalizedTimestamp = metadata.timestamp;
                  }
                } else {
                  console.warn(`Invalid timestamp type for credential ${credentialId}:`, typeof metadata.timestamp);
                  normalizedTimestamp = new Date().toISOString();
                }
              } catch (timestampError) {
                console.warn(`Failed to process timestamp for credential ${credentialId}:`, timestampError);
                normalizedTimestamp = new Date().toISOString();
              }

              // Validate required fields and create credential object
              const credential: Credential = {
                id: credentialId || 'unknown',
                owner: owner || 'unknown',
                credential_type: metadata.credential_type || 'skill',
                name: metadata.name || 'Unnamed Credential',
                description: metadata.description || 'No description available',
                issuer: metadata.issuer || 'Unknown Issuer',
                rating: metadata.rating,
                timestamp: normalizedTimestamp,
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
        const sortedCredentials = credentials.sort((a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        console.log(`Found ${sortedCredentials.length} credentials for account ${accountAddress}:`, sortedCredentials.map(c => ({ id: c.id, name: c.name })));

        return sortedCredentials;

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

        const [owner, metadataBytes] = credentialData.toJSON() as [string, number[] | string];

        // Convert bytes back to JSON string
        let uint8Array: Uint8Array;

        if (Array.isArray(metadataBytes)) {
          // If it's already an array of numbers, use it directly
          uint8Array = new Uint8Array(metadataBytes);
        } else if (typeof metadataBytes === 'string' && metadataBytes.startsWith('0x')) {
          // If it's a hex string, convert it to bytes
          const hexString = metadataBytes.slice(2); // Remove '0x' prefix
          const bytes = [];
          for (let i = 0; i < hexString.length; i += 2) {
            bytes.push(parseInt(hexString.substr(i, 2), 16));
          }
          uint8Array = new Uint8Array(bytes);
        } else {
          throw new Error(`Invalid metadata bytes format: ${typeof metadataBytes}`);
        }

        const metadataString = new TextDecoder().decode(uint8Array);

        let metadata: CredentialMetadata;
        if (metadataString.includes('|')) {
          metadata = this.parseSimpleFormat(metadataString);
        } else {
          const parsedMetadata = JSON.parse(metadataString);
          metadata = this.expandCompactMetadata(parsedMetadata);
        }

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
  return performanceMonitor.measure(
    PerformanceMetrics.API_MINT_CREDENTIAL,
    () => freelanceForgeAPI.mintCredential(accountAddress, credentialData),
    { accountAddress, credentialType: credentialData.credential_type }
  );
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
  return performanceMonitor.measure(
    PerformanceMetrics.API_GET_CREDENTIALS,
    () => freelanceForgeAPI.getCredentials(accountAddress),
    { accountAddress }
  );
}

export async function getCredentialById(credentialId: string): Promise<Credential | null> {
  return freelanceForgeAPI.getCredentialById(credentialId);
}

export async function getNetworkInfo() {
  return freelanceForgeAPI.getNetworkInfo();
}