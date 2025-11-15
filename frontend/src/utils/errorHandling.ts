import { ApiError, ApiErrorType } from './api';

// Extended error types
export type ExtendedErrorType = ApiErrorType | 'UNKNOWN_ERROR' | 'VALIDATION_ERROR' | 'NETWORK_ERROR' | 'WALLET_NOT_DETECTED' | 'WALLET_CONNECTION_FAILED' | 'WALLET_ACCOUNT_NOT_FOUND' | 'TRANSACTION_REJECTED' | 'RPC_TIMEOUT' | 'FILE_TOO_LARGE' | 'INVALID_JSON_FORMAT';

// Error classification and user-friendly messages
export interface ErrorInfo {
  type: ExtendedErrorType;
  title: string;
  message: string;
  userMessage: string;
  suggestedAction?: string;
  retryable: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'wallet' | 'transaction' | 'network' | 'validation' | 'system';
}

// Error message mappings
const ERROR_MESSAGES: Record<string, Omit<ErrorInfo, 'type'>> = {
  // Wallet errors
  WALLET_NOT_DETECTED: {
    title: 'Wallet Extension Not Found',
    message: 'No Polkadot.js wallet extension detected',
    userMessage: 'Please install the Polkadot.js browser extension to connect your wallet.',
    suggestedAction: 'Install the Polkadot.js extension from the Chrome Web Store or Firefox Add-ons.',
    retryable: false,
    severity: 'high',
    category: 'wallet',
  },
  WALLET_CONNECTION_FAILED: {
    title: 'Wallet Connection Failed',
    message: 'Failed to connect to wallet extension',
    userMessage: 'Unable to connect to your wallet. Please check your extension settings.',
    suggestedAction: 'Refresh the page and try connecting again. Make sure your wallet extension is unlocked.',
    retryable: true,
    severity: 'medium',
    category: 'wallet',
  },
  WALLET_ACCOUNT_NOT_FOUND: {
    title: 'No Accounts Found',
    message: 'No accounts available in wallet',
    userMessage: 'No accounts found in your wallet extension.',
    suggestedAction: 'Create an account in your Polkadot.js extension or import an existing one.',
    retryable: false,
    severity: 'medium',
    category: 'wallet',
  },

  // Transaction errors
  INSUFFICIENT_BALANCE: {
    title: 'Insufficient Balance',
    message: 'Account balance too low for transaction',
    userMessage: 'You don\'t have enough tokens to complete this transaction.',
    suggestedAction: 'Add funds to your account or get testnet tokens from the faucet.',
    retryable: false,
    severity: 'medium',
    category: 'transaction',
  },
  TRANSACTION_REJECTED: {
    title: 'Transaction Cancelled',
    message: 'User rejected transaction signature',
    userMessage: 'Transaction was cancelled. No fees were charged.',
    suggestedAction: 'Try the transaction again and approve it in your wallet.',
    retryable: true,
    severity: 'low',
    category: 'transaction',
  },
  TRANSACTION_FAILED: {
    title: 'Transaction Failed',
    message: 'Transaction execution failed',
    userMessage: 'The transaction failed to execute on the blockchain.',
    suggestedAction: 'Check your account balance and try again. Contact support if the problem persists.',
    retryable: true,
    severity: 'medium',
    category: 'transaction',
  },

  // Pallet-specific errors
  CREDENTIAL_ALREADY_EXISTS: {
    title: 'Duplicate Credential',
    message: 'Credential with identical content already exists',
    userMessage: 'A credential with the same information already exists in your portfolio.',
    suggestedAction: 'Modify the credential details or check your existing credentials.',
    retryable: false,
    severity: 'low',
    category: 'validation',
  },
  METADATA_TOO_LARGE: {
    title: 'Credential Too Large',
    message: 'Credential metadata exceeds 4KB limit',
    userMessage: 'The credential information is too large to store on the blockchain.',
    suggestedAction: 'Reduce the description length or remove unnecessary details.',
    retryable: false,
    severity: 'medium',
    category: 'validation',
  },
  TOO_MANY_CREDENTIALS: {
    title: 'Credential Limit Reached',
    message: 'Maximum of 500 credentials per account exceeded',
    userMessage: 'You\'ve reached the maximum limit of 500 credentials per account.',
    suggestedAction: 'Delete some old credentials before adding new ones.',
    retryable: false,
    severity: 'medium',
    category: 'validation',
  },
  CREDENTIAL_NOT_FOUND: {
    title: 'Credential Not Found',
    message: 'Requested credential does not exist',
    userMessage: 'The credential you\'re trying to access no longer exists.',
    suggestedAction: 'Refresh the page to update your credential list.',
    retryable: true,
    severity: 'low',
    category: 'validation',
  },
  NOT_CREDENTIAL_OWNER: {
    title: 'Access Denied',
    message: 'User is not the owner of this credential',
    userMessage: 'You can only modify credentials that you own.',
    suggestedAction: 'Make sure you\'re connected with the correct wallet account.',
    retryable: false,
    severity: 'medium',
    category: 'validation',
  },

  // Network errors
  CONNECTION_FAILED: {
    title: 'Network Connection Failed',
    message: 'Failed to connect to blockchain network',
    userMessage: 'Unable to connect to the blockchain network.',
    suggestedAction: 'Check your internet connection and try again.',
    retryable: true,
    severity: 'high',
    category: 'network',
  },
  RPC_TIMEOUT: {
    title: 'Network Timeout',
    message: 'Request to blockchain network timed out',
    userMessage: 'The network request took too long to complete.',
    suggestedAction: 'The network may be congested. Please try again in a moment.',
    retryable: true,
    severity: 'medium',
    category: 'network',
  },
  NETWORK_ERROR: {
    title: 'Network Error',
    message: 'General network communication error',
    userMessage: 'A network error occurred while communicating with the blockchain.',
    suggestedAction: 'Check your internet connection and try again.',
    retryable: true,
    severity: 'medium',
    category: 'network',
  },

  // Validation errors
  INVALID_CREDENTIAL_DATA: {
    title: 'Invalid Credential Data',
    message: 'Credential data failed validation',
    userMessage: 'The credential information is invalid or incomplete.',
    suggestedAction: 'Please check all required fields and try again.',
    retryable: false,
    severity: 'low',
    category: 'validation',
  },
  FILE_TOO_LARGE: {
    title: 'File Too Large',
    message: 'Uploaded file exceeds size limit',
    userMessage: 'The file you\'re trying to upload is too large.',
    suggestedAction: 'Please select a file smaller than 5MB.',
    retryable: false,
    severity: 'low',
    category: 'validation',
  },
  INVALID_JSON_FORMAT: {
    title: 'Invalid File Format',
    message: 'File is not valid JSON format',
    userMessage: 'The uploaded file is not in a valid format.',
    suggestedAction: 'Please upload a valid JSON file exported from a supported platform.',
    retryable: false,
    severity: 'low',
    category: 'validation',
  },

  // System errors
  UNKNOWN_ERROR: {
    title: 'Unexpected Error',
    message: 'An unexpected error occurred',
    userMessage: 'Something went wrong. This error has been logged for investigation.',
    suggestedAction: 'Please try again. If the problem persists, contact support.',
    retryable: true,
    severity: 'high',
    category: 'system',
  },
};

// Error handler class
export class ErrorHandler {
  /**
   * Process an error and return user-friendly information
   */
  static processError(error: unknown): ErrorInfo {
    console.error('Processing error:', error);

    // Handle ApiError instances
    if (error instanceof ApiError) {
      const errorInfo = ERROR_MESSAGES[error.type];
      if (errorInfo) {
        return {
          type: error.type,
          ...errorInfo,
        };
      }
    }

    // Handle standard Error instances
    if (error instanceof Error) {
      // Check for specific error patterns
      if (error.message.includes('Extension not found') || error.message.includes('No extension')) {
        return {
          type: 'WALLET_NOT_DETECTED' as ExtendedErrorType,
          ...ERROR_MESSAGES.WALLET_NOT_DETECTED,
        };
      }

      if (error.message.includes('User rejected') || error.message.includes('Cancelled')) {
        return {
          type: 'TRANSACTION_REJECTED' as ExtendedErrorType,
          ...ERROR_MESSAGES.TRANSACTION_REJECTED,
        };
      }

      if (error.message.includes('balance') || error.message.includes('insufficient')) {
        return {
          type: 'INSUFFICIENT_BALANCE' as ExtendedErrorType,
          ...ERROR_MESSAGES.INSUFFICIENT_BALANCE,
        };
      }

      if (error.message.includes('timeout') || error.message.includes('timed out')) {
        return {
          type: 'RPC_TIMEOUT' as ExtendedErrorType,
          ...ERROR_MESSAGES.RPC_TIMEOUT,
        };
      }

      if (error.message.includes('network') || error.message.includes('connection')) {
        return {
          type: 'NETWORK_ERROR' as ExtendedErrorType,
          ...ERROR_MESSAGES.NETWORK_ERROR,
        };
      }
    }

    // Default unknown error
    return {
      type: 'UNKNOWN_ERROR',
      ...ERROR_MESSAGES.UNKNOWN_ERROR,
    };
  }

  /**
   * Get faucet URL for testnet tokens
   */
  static getFaucetUrl(network: string): string | null {
    const faucetUrls: Record<string, string> = {
      paseo: 'https://faucet.polkadot.io/',
      westend: 'https://faucet.polkadot.io/',
      rococo: 'https://faucet.polkadot.io/',
    };

    return faucetUrls[network.toLowerCase()] || null;
  }

  /**
   * Get explorer URL for transaction
   */
  static getExplorerUrl(network: string, txHash?: string, address?: string): string | null {
    const explorerUrls: Record<string, string> = {
      paseo: 'https://paseo.subscan.io',
      westend: 'https://westend.subscan.io',
      rococo: 'https://rococo.subscan.io',
    };

    const baseUrl = explorerUrls[network.toLowerCase()];
    if (!baseUrl) return null;

    if (txHash) {
      return `${baseUrl}/extrinsic/${txHash}`;
    }

    if (address) {
      return `${baseUrl}/account/${address}`;
    }

    return baseUrl;
  }

  /**
   * Determine if an error should trigger automatic retry
   */
  static shouldRetry(error: unknown, attemptCount: number, maxAttempts: number = 3): boolean {
    if (attemptCount >= maxAttempts) return false;

    const errorInfo = this.processError(error);
    
    // Don't retry validation errors or user-cancelled operations
    if (errorInfo.category === 'validation' || errorInfo.type === 'TRANSACTION_REJECTED') {
      return false;
    }

    // Retry network and some transaction errors
    return errorInfo.retryable;
  }

  /**
   * Get retry delay with exponential backoff
   */
  static getRetryDelay(attemptCount: number, baseDelay: number = 1000): number {
    return Math.min(baseDelay * Math.pow(2, attemptCount), 30000); // Max 30 seconds
  }

  /**
   * Log error for monitoring/debugging
   */
  static logError(error: unknown, context?: Record<string, any>): void {
    const errorInfo = this.processError(error);
    
    const logData = {
      timestamp: new Date().toISOString(),
      error: {
        type: errorInfo.type,
        message: errorInfo.message,
        severity: errorInfo.severity,
        category: errorInfo.category,
      },
      context,
      stack: error instanceof Error ? error.stack : undefined,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', logData);
    }

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
      console.error('Production error:', logData);
    }
  }
}

// Utility functions for common error scenarios
export const ErrorUtils = {
  /**
   * Create a user-friendly error message for wallet connection issues
   */
  getWalletConnectionError: (error: unknown): string => {
    const errorInfo = ErrorHandler.processError(error);
    
    if (errorInfo.type === 'WALLET_NOT_DETECTED') {
      return 'Please install the Polkadot.js browser extension to connect your wallet.';
    }
    
    if (errorInfo.type === 'WALLET_ACCOUNT_NOT_FOUND') {
      return 'No accounts found. Please create or import an account in your wallet extension.';
    }
    
    return errorInfo.userMessage;
  },

  /**
   * Create a user-friendly error message for transaction failures
   */
  getTransactionError: (error: unknown, network?: string): { message: string; action?: { label: string; url: string } } => {
    const errorInfo = ErrorHandler.processError(error);
    
    let action: { label: string; url: string } | undefined;
    
    if (errorInfo.type === 'INSUFFICIENT_BALANCE' && network) {
      const faucetUrl = ErrorHandler.getFaucetUrl(network);
      if (faucetUrl) {
        action = {
          label: 'Get Testnet Tokens',
          url: faucetUrl,
        };
      }
    }
    
    return {
      message: errorInfo.userMessage,
      action,
    };
  },

  /**
   * Create a user-friendly error message for file upload issues
   */
  getFileUploadError: (error: unknown): string => {
    const errorInfo = ErrorHandler.processError(error);
    
    if (errorInfo.type === 'FILE_TOO_LARGE') {
      return 'File is too large. Please select a file smaller than 5MB.';
    }
    
    if (errorInfo.type === 'INVALID_JSON_FORMAT') {
      return 'Invalid file format. Please upload a valid JSON file.';
    }
    
    return errorInfo.userMessage;
  },

  /**
   * Check if error indicates network connectivity issues
   */
  isNetworkError: (error: unknown): boolean => {
    const errorInfo = ErrorHandler.processError(error);
    return errorInfo.category === 'network';
  },

  /**
   * Check if error is retryable
   */
  isRetryable: (error: unknown): boolean => {
    const errorInfo = ErrorHandler.processError(error);
    return errorInfo.retryable;
  },
};