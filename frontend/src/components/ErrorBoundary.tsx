import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import {
    Box,
    Typography,
    Button,
    Alert,
    AlertTitle,
    Paper,
    Stack,
    Divider,
} from '@mui/material';
import {
    Error as ErrorIcon,
    Refresh as RefreshIcon,
    Home as HomeIcon,
    BugReport as BugReportIcon,
} from '@mui/icons-material';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState({
            error,
            errorInfo,
        });

        // Call optional error handler
        this.props.onError?.(error, errorInfo);

        // Log to external service in production
        if (process.env.NODE_ENV === 'production') {
            // TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
            console.error('Production error logged:', {
                error: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                timestamp: new Date().toISOString(),
            });
        }
    }

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <Box
                    sx={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'background.default',
                        p: 3,
                    }}
                >
                    <Paper
                        sx={{
                            maxWidth: 600,
                            width: '100%',
                            p: 4,
                            textAlign: 'center',
                        }}
                    >
                        <ErrorIcon
                            sx={{
                                fontSize: 64,
                                color: 'error.main',
                                mb: 2,
                            }}
                        />

                        <Typography variant="h4" gutterBottom color="error">
                            Oops! Something went wrong
                        </Typography>

                        <Typography variant="body1" color="text.secondary" paragraph>
                            We encountered an unexpected error. This has been logged and our team will investigate.
                        </Typography>

                        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                            <AlertTitle>Error Details</AlertTitle>
                            <Typography variant="body2" component="div">
                                <strong>Message:</strong> {this.state.error?.message || 'Unknown error'}
                            </Typography>
                            {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                                <Box sx={{ mt: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        <strong>Stack Trace:</strong>
                                    </Typography>
                                    <Box
                                        component="pre"
                                        sx={{
                                            fontSize: '0.75rem',
                                            overflow: 'auto',
                                            maxHeight: 200,
                                            bgcolor: 'grey.100',
                                            p: 1,
                                            borderRadius: 1,
                                            mt: 1,
                                        }}
                                    >
                                        {this.state.error.stack}
                                    </Box>
                                </Box>
                            )}
                        </Alert>

                        <Stack direction="row" spacing={2} justifyContent="center">
                            <Button
                                variant="contained"
                                startIcon={<RefreshIcon />}
                                onClick={this.handleRetry}
                            >
                                Try Again
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<HomeIcon />}
                                onClick={this.handleGoHome}
                            >
                                Go Home
                            </Button>
                        </Stack>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="caption" color="text.secondary">
                            If this problem persists, please contact support with the error details above.
                        </Typography>
                    </Paper>
                </Box>
            );
        }

        return this.props.children;
    }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode
) {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary fallback={fallback}>
            <Component {...props} />
        </ErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

    return WrappedComponent;
}

// Hook for error boundary in functional components
export function useErrorHandler() {
    return (error: Error, errorInfo?: ErrorInfo) => {
        console.error('Manual error report:', error, errorInfo);

        // In a real app, you might want to trigger error boundary or report to service
        if (process.env.NODE_ENV === 'production') {
            // TODO: Report to error tracking service
            console.error('Production error reported:', {
                error: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString(),
            });
        }

        throw error; // Re-throw to trigger error boundary
    };
}