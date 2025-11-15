import { useCallback } from 'react';
import { useNotifications } from '../components/NotificationSystem';
import { ErrorHandler, ErrorUtils } from '../utils/errorHandling';
import { ApiError } from '../utils/api';

// Hook for centralized error handling
export function useErrorHandler() {
  const { showError, showWarning } = useNotifications();

  const handleError = useCallback((
    error: unknown,
    context?: {
      operation?: string;
      silent?: boolean;
      showNotification?: boolean;
      customMessage?: string;
    }
  ) => {
    const { operation, silent = false, showNotification = true, customMessage } = context || {};

    // Log error for debugging/monitoring
    ErrorHandler.logError(error, { operation });

    // Process error to get user-friendly information
    const errorInfo = ErrorHandler.processError(error);

    // Show notification unless silenced
    if (showNotification && !silent) {
      const message = customMessage || errorInfo.userMessage;
      
      if (errorInfo.severity === 'critical' || errorInfo.severity === 'high') {
        showError(message, {
          title: errorInfo.title,
          persistent: true,
        });
      } else {
        showWarning(message, {
          title: errorInfo.title,
          duration: 6000,
        });
      }
    }

    return errorInfo;
  }, [showError, showWarning]);

  // Specialized error handlers
  const handleWalletError = useCallback((error: unknown) => {
    const message = ErrorUtils.getWalletConnectionError(error);
    return handleError(error, {
      operation: 'wallet_connection',
      customMessage: message,
    });
  }, [handleError]);

  const handleTransactionError = useCallback((error: unknown, network?: string) => {
    const { message, action } = ErrorUtils.getTransactionError(error, network);
    
    const errorInfo = handleError(error, {
      operation: 'transaction',
      customMessage: message,
      showNotification: false, // We'll show custom notification with action
    });

    // Show custom notification with action button if available
    if (action) {
      showError(message, {
        title: errorInfo.title,
        persistent: true,
        action: {
          label: action.label,
          onClick: () => window.open(action.url, '_blank'),
        },
      });
    } else {
      showError(message, {
        title: errorInfo.title,
        persistent: errorInfo.severity === 'high' || errorInfo.severity === 'critical',
      });
    }

    return errorInfo;
  }, [handleError, showError]);

  const handleFileUploadError = useCallback((error: unknown) => {
    const message = ErrorUtils.getFileUploadError(error);
    return handleError(error, {
      operation: 'file_upload',
      customMessage: message,
    });
  }, [handleError]);

  const handleNetworkError = useCallback((error: unknown) => {
    const errorInfo = handleError(error, {
      operation: 'network_operation',
      showNotification: false, // Custom handling
    });

    // Show network error with retry option
    showError(errorInfo.userMessage, {
      title: errorInfo.title,
      persistent: true,
      action: {
        label: 'Retry Connection',
        onClick: () => window.location.reload(),
      },
    });

    return errorInfo;
  }, [handleError, showError]);

  return {
    handleError,
    handleWalletError,
    handleTransactionError,
    handleFileUploadError,
    handleNetworkError,
  };
}

// Hook for retry logic with exponential backoff
export function useRetryHandler() {
  const { handleError } = useErrorHandler();

  const retryWithBackoff = useCallback(async <T>(
    operation: () => Promise<T>,
    options: {
      maxAttempts?: number;
      baseDelay?: number;
      onRetry?: (attempt: number, error: unknown) => void;
      shouldRetry?: (error: unknown, attempt: number) => boolean;
    } = {}
  ): Promise<T> => {
    const {
      maxAttempts = 3,
      baseDelay = 1000,
      onRetry,
      shouldRetry = ErrorHandler.shouldRetry,
    } = options;

    let lastError: unknown;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Don't retry on last attempt or if error is not retryable
        if (attempt === maxAttempts - 1 || !shouldRetry(error, attempt)) {
          break;
        }

        // Call retry callback
        onRetry?.(attempt + 1, error);

        // Wait before retrying with exponential backoff
        const delay = ErrorHandler.getRetryDelay(attempt, baseDelay);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Handle final error
    handleError(lastError, {
      operation: 'retry_operation',
      customMessage: `Operation failed after ${maxAttempts} attempts`,
    });

    throw lastError;
  }, [handleError]);

  return { retryWithBackoff };
}

// Hook for handling async operations with loading states and error handling
export function useAsyncOperation() {
  const { handleError } = useErrorHandler();
  const { showSuccess } = useNotifications();

  const executeAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    options: {
      loadingMessage?: string;
      successMessage?: string;
      errorContext?: string;
      onSuccess?: (result: T) => void;
      onError?: (error: unknown) => void;
      showSuccessNotification?: boolean;
    } = {}
  ): Promise<{ success: boolean; result?: T; error?: unknown }> => {
    const {
      successMessage,
      errorContext,
      onSuccess,
      onError,
      showSuccessNotification = true,
    } = options;

    try {
      const result = await operation();

      // Show success notification
      if (successMessage && showSuccessNotification) {
        showSuccess(successMessage);
      }

      // Call success callback
      onSuccess?.(result);

      return { success: true, result };
    } catch (error) {
      // Handle error
      handleError(error, {
        operation: errorContext,
      });

      // Call error callback
      onError?.(error);

      return { success: false, error };
    }
  }, [handleError, showSuccess]);

  return { executeAsync };
}

// Hook for form validation errors
export function useFormErrorHandler() {
  const { showWarning } = useNotifications();

  const handleValidationError = useCallback((
    errors: Record<string, any>,
    fieldLabels?: Record<string, string>
  ) => {
    const errorMessages = Object.entries(errors).map(([field, error]) => {
      const fieldLabel = fieldLabels?.[field] || field;
      const message = error?.message || 'Invalid value';
      return `${fieldLabel}: ${message}`;
    });

    if (errorMessages.length > 0) {
      showWarning('Please fix the following errors:', {
        title: 'Form Validation Failed',
        duration: 8000,
      });
    }
  }, [showWarning]);

  const handleFieldError = useCallback((
    field: string,
    error: string,
    fieldLabel?: string
  ) => {
    const label = fieldLabel || field;
    showWarning(`${label}: ${error}`, {
      title: 'Validation Error',
      duration: 5000,
    });
  }, [showWarning]);

  return {
    handleValidationError,
    handleFieldError,
  };
}