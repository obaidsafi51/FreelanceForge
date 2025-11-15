/**
 * Error monitoring and logging utilities for production environment
 */

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Error categories
export enum ErrorCategory {
  WALLET = 'wallet',
  BLOCKCHAIN = 'blockchain',
  NETWORK = 'network',
  VALIDATION = 'validation',
  UI = 'ui',
  PERFORMANCE = 'performance',
}

// Error context interface
export interface ErrorContext {
  userId?: string;
  walletAddress?: string;
  network?: string;
  userAgent?: string;
  url?: string;
  timestamp?: string;
  sessionId?: string;
  buildVersion?: string;
  [key: string]: any;
}

// Error report interface
export interface ErrorReport {
  message: string;
  stack?: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  context: ErrorContext;
  fingerprint?: string;
}

class ErrorMonitor {
  private isProduction: boolean;
  private sessionId: string;
  private buildVersion: string;

  constructor() {
    this.isProduction = import.meta.env.PROD;
    this.sessionId = this.generateSessionId();
    this.buildVersion = import.meta.env.VITE_VERSION || '1.0.0';
    
    // Set up global error handlers
    this.setupGlobalErrorHandlers();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        category: ErrorCategory.UI,
        severity: ErrorSeverity.HIGH,
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {
          category: ErrorCategory.UI,
          severity: ErrorSeverity.HIGH,
          context: {
            type: 'unhandledrejection',
          },
        }
      );
    });

    // Handle React error boundary errors (if using error boundaries)
    if (typeof window !== 'undefined') {
      (window as any).__FREELANCEFORGE_ERROR_HANDLER__ = (error: Error, errorInfo: any) => {
        this.captureError(error, {
          category: ErrorCategory.UI,
          severity: ErrorSeverity.MEDIUM,
          context: {
            componentStack: errorInfo.componentStack,
            type: 'react-error-boundary',
          },
        });
      };
    }
  }

  /**
   * Capture and report an error
   */
  captureError(
    error: Error,
    options: {
      category: ErrorCategory;
      severity: ErrorSeverity;
      context?: Partial<ErrorContext>;
    }
  ): void {
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      category: options.category,
      severity: options.severity,
      context: {
        ...this.getBaseContext(),
        ...options.context,
      },
      fingerprint: this.generateFingerprint(error, options.category),
    };

    // Log to console in development
    if (!this.isProduction) {
      console.error('FreelanceForge Error:', errorReport);
    }

    // Send to monitoring service in production
    if (this.isProduction) {
      this.sendToMonitoringService(errorReport);
    }

    // Store locally for debugging
    this.storeLocalError(errorReport);
  }

  /**
   * Capture a custom message with context
   */
  captureMessage(
    message: string,
    category: ErrorCategory,
    severity: ErrorSeverity = ErrorSeverity.LOW,
    context?: Partial<ErrorContext>
  ): void {
    const errorReport: ErrorReport = {
      message,
      category,
      severity,
      context: {
        ...this.getBaseContext(),
        ...context,
      },
      fingerprint: this.generateFingerprint(new Error(message), category),
    };

    if (!this.isProduction) {
      console.log('FreelanceForge Message:', errorReport);
    }

    if (this.isProduction && severity !== ErrorSeverity.LOW) {
      this.sendToMonitoringService(errorReport);
    }
  }

  /**
   * Capture performance metrics
   */
  capturePerformance(
    metric: string,
    value: number,
    context?: Partial<ErrorContext>
  ): void {
    const performanceReport = {
      metric,
      value,
      context: {
        ...this.getBaseContext(),
        ...context,
      },
      timestamp: new Date().toISOString(),
    };

    if (!this.isProduction) {
      console.log('FreelanceForge Performance:', performanceReport);
    }

    // Send performance data to monitoring service
    if (this.isProduction) {
      this.sendPerformanceData(performanceReport);
    }
  }

  private getBaseContext(): ErrorContext {
    return {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      buildVersion: this.buildVersion,
      url: window.location.href,
      userAgent: navigator.userAgent,
      network: import.meta.env.VITE_NETWORK || 'unknown',
    };
  }

  private generateFingerprint(error: Error, category: ErrorCategory): string {
    const key = `${category}-${error.message}-${error.stack?.split('\n')[0] || ''}`;
    return btoa(key).replace(/[^a-zA-Z0-9]/g, '').substr(0, 32);
  }

  private async sendToMonitoringService(errorReport: ErrorReport): Promise<void> {
    try {
      // In a real implementation, you would send to services like:
      // - Sentry: https://sentry.io
      // - LogRocket: https://logrocket.com
      // - Rollbar: https://rollbar.com
      // - Custom logging endpoint

      // For now, we'll use a simple fetch to a logging endpoint
      const endpoint = import.meta.env.VITE_ERROR_REPORTING_URL;
      
      if (endpoint) {
        await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'error',
            data: errorReport,
          }),
        });
      }
    } catch (sendError) {
      console.error('Failed to send error report:', sendError);
    }
  }

  private async sendPerformanceData(performanceReport: any): Promise<void> {
    try {
      const endpoint = import.meta.env.VITE_PERFORMANCE_REPORTING_URL;
      
      if (endpoint) {
        await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'performance',
            data: performanceReport,
          }),
        });
      }
    } catch (sendError) {
      console.error('Failed to send performance data:', sendError);
    }
  }

  private storeLocalError(errorReport: ErrorReport): void {
    try {
      const errors = JSON.parse(localStorage.getItem('freelanceforge_errors') || '[]');
      errors.push(errorReport);
      
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('freelanceforge_errors', JSON.stringify(errors));
    } catch (storageError) {
      console.warn('Failed to store error locally:', storageError);
    }
  }

  /**
   * Get stored errors for debugging
   */
  getStoredErrors(): ErrorReport[] {
    try {
      return JSON.parse(localStorage.getItem('freelanceforge_errors') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Clear stored errors
   */
  clearStoredErrors(): void {
    localStorage.removeItem('freelanceforge_errors');
  }

  /**
   * Set user context for error reporting
   */
  setUserContext(context: Partial<ErrorContext>): void {
    (window as any).__FREELANCEFORGE_USER_CONTEXT__ = {
      ...(window as any).__FREELANCEFORGE_USER_CONTEXT__,
      ...context,
    };
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(message: string, category: string, data?: any): void {
    const breadcrumb = {
      message,
      category,
      data,
      timestamp: new Date().toISOString(),
    };

    const breadcrumbs = (window as any).__FREELANCEFORGE_BREADCRUMBS__ || [];
    breadcrumbs.push(breadcrumb);
    
    // Keep only last 20 breadcrumbs
    if (breadcrumbs.length > 20) {
      breadcrumbs.splice(0, breadcrumbs.length - 20);
    }
    
    (window as any).__FREELANCEFORGE_BREADCRUMBS__ = breadcrumbs;
  }
}

// Export singleton instance
export const errorMonitor = new ErrorMonitor();

// Convenience functions
export function captureError(
  error: Error,
  category: ErrorCategory,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  context?: Partial<ErrorContext>
): void {
  errorMonitor.captureError(error, { category, severity, context });
}

export function captureMessage(
  message: string,
  category: ErrorCategory,
  severity: ErrorSeverity = ErrorSeverity.LOW,
  context?: Partial<ErrorContext>
): void {
  errorMonitor.captureMessage(message, category, severity, context);
}

export function capturePerformance(
  metric: string,
  value: number,
  context?: Partial<ErrorContext>
): void {
  errorMonitor.capturePerformance(metric, value, context);
}

export function setUserContext(context: Partial<ErrorContext>): void {
  errorMonitor.setUserContext(context);
}

export function addBreadcrumb(message: string, category: string, data?: any): void {
  errorMonitor.addBreadcrumb(message, category, data);
}