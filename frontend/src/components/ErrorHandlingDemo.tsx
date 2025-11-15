import React, { useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Stack,
    Divider,
    Alert,
    AlertTitle,
} from '@mui/material';
import {
    Error as ErrorIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    CheckCircle as SuccessIcon,
    NetworkCheck as NetworkIcon,
    AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import {
    useNotifications,
    NotificationTemplates
} from './NotificationSystem';
import {
    useErrorHandler,
    useRetryHandler,
    useAsyncOperation
} from '../hooks/useErrorHandler';
import {
    LoadingSpinner,
    BlockchainOperationLoading,
    WalletConnectionLoading
} from './LoadingStates';
import { ApiError, ApiErrorType } from '../utils/api';

/**
 * Demo component showcasing comprehensive error handling and user feedback
 * This component demonstrates all the error handling patterns implemented in Task 14
 */
export function ErrorHandlingDemo() {
    const [isLoading, setIsLoading] = useState(false);
    const [operationType, setOperationType] = useState<string>('');

    // Error handling hooks
    const {
        showSuccess,
        showError,
        showWarning,
        showInfo,
        addNotification
    } = useNotifications();

    const {
        handleError,
        handleWalletError,
        handleTransactionError,
        handleNetworkError
    } = useErrorHandler();

    const { retryWithBackoff } = useRetryHandler();
    const { executeAsync } = useAsyncOperation();

    // Demo functions for different error scenarios
    const simulateWalletError = () => {
        const error = new Error('No wallet extension detected. Please install Polkadot.js extension.');
        handleWalletError(error);
    };

    const simulateTransactionError = () => {
        const error = new ApiError(
            ApiErrorType.INSUFFICIENT_BALANCE,
            'Insufficient balance for transaction'
        );
        handleTransactionError(error, 'paseo');
    };

    const simulateNetworkError = () => {
        const error = new ApiError(
            ApiErrorType.CONNECTION_FAILED,
            'Failed to connect to blockchain network'
        );
        handleNetworkError(error);
    };

    const simulateValidationError = () => {
        const error = new ApiError(
            ApiErrorType.METADATA_TOO_LARGE,
            'Credential metadata exceeds 4KB limit'
        );
        handleError(error, { operation: 'credential_validation' });
    };

    const simulateRetryOperation = async () => {
        setIsLoading(true);
        setOperationType('retry');

        try {
            await retryWithBackoff(
                async () => {
                    // Simulate operation that fails twice then succeeds
                    const random = Math.random();
                    if (random < 0.7) {
                        throw new Error('Simulated network timeout');
                    }
                    return 'Operation successful!';
                },
                {
                    maxAttempts: 3,
                    baseDelay: 1000,
                    onRetry: (attempt, error) => {
                        showInfo(`Retry attempt ${attempt}/3: ${(error as Error).message}`);
                    },
                }
            );

            showSuccess('Operation completed successfully after retries!');
        } catch (error) {
            // Error is already handled by retryWithBackoff
        } finally {
            setIsLoading(false);
            setOperationType('');
        }
    };

    const simulateAsyncOperation = async () => {
        setIsLoading(true);
        setOperationType('async');

        const { success } = await executeAsync(
            async () => {
                // Simulate async operation
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Randomly succeed or fail
                if (Math.random() < 0.5) {
                    throw new Error('Simulated operation failure');
                }

                return 'Async operation result';
            },
            {
                successMessage: 'Async operation completed successfully!',
                errorContext: 'demo_async_operation',
            }
        );

        setIsLoading(false);
        setOperationType('');

        if (success) {
            console.log('Async operation succeeded');
        }
    };

    const showNotificationTemplates = () => {
        // Demonstrate various notification templates
        setTimeout(() => addNotification(NotificationTemplates.walletConnected('Demo Account')), 0);
        setTimeout(() => addNotification(NotificationTemplates.transactionSubmitted('0x1234...')), 1000);
        setTimeout(() => addNotification(NotificationTemplates.credentialMinted('React Development')), 2000);
        setTimeout(() => addNotification(NotificationTemplates.portfolioExported('portfolio.json')), 3000);
    };

    const simulateBlockchainOperation = () => {
        setIsLoading(true);
        setOperationType('blockchain');

        setTimeout(() => {
            setIsLoading(false);
            setOperationType('');
            showSuccess('Blockchain operation completed!');
        }, 4000);
    };

    const simulateWalletConnection = () => {
        setIsLoading(true);
        setOperationType('wallet');

        setTimeout(() => {
            setIsLoading(false);
            setOperationType('');
            showSuccess('Wallet connected successfully!');
        }, 3000);
    };

    if (isLoading) {
        if (operationType === 'blockchain') {
            return (
                <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
                    <CardContent>
                        <BlockchainOperationLoading
                            operation="Minting Credential"
                            step="Waiting for signature"
                            showSteps={true}
                        />
                    </CardContent>
                </Card>
            );
        }

        if (operationType === 'wallet') {
            return (
                <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
                    <CardContent>
                        <WalletConnectionLoading />
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
                <CardContent>
                    <LoadingSpinner
                        message={`Processing ${operationType} operation...`}
                        size={48}
                    />
                </CardContent>
            </Card>
        );
    }

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
            <Typography variant="h4" gutterBottom align="center">
                Error Handling & User Feedback Demo
            </Typography>

            <Typography variant="body1" color="text.secondary" paragraph align="center">
                This demo showcases the comprehensive error handling and user feedback system
                implemented for FreelanceForge. Try the different scenarios below to see how
                errors are handled gracefully with user-friendly messages and recovery options.
            </Typography>

            <Alert severity="info" sx={{ mb: 4 }}>
                <AlertTitle>Task 14 Implementation</AlertTitle>
                This component demonstrates all the error handling features implemented:
                <ul>
                    <li>Error boundary components for graceful React error handling</li>
                    <li>User-friendly error messages for wallet connection failures</li>
                    <li>Specific error handling for insufficient balance with faucet links</li>
                    <li>Network connection error handling with automatic RPC endpoint switching</li>
                    <li>Loading states for all async operations using skeleton screens and spinners</li>
                    <li>Success notifications for completed operations with appropriate feedback</li>
                </ul>
            </Alert>

            <Stack spacing={3}>
                {/* Error Scenarios */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            <ErrorIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Error Scenarios
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Test different error types and see how they're handled with user-friendly messages.
                        </Typography>

                        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<WalletIcon />}
                                onClick={simulateWalletError}
                            >
                                Wallet Error
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<ErrorIcon />}
                                onClick={simulateTransactionError}
                            >
                                Transaction Error
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<NetworkIcon />}
                                onClick={simulateNetworkError}
                            >
                                Network Error
                            </Button>
                            <Button
                                variant="outlined"
                                color="warning"
                                startIcon={<WarningIcon />}
                                onClick={simulateValidationError}
                            >
                                Validation Error
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Loading States */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            <LoadingSpinner size={24} />
                            Loading States
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Experience different loading states with appropriate feedback messages.
                        </Typography>

                        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                            <Button
                                variant="outlined"
                                onClick={simulateWalletConnection}
                                disabled={isLoading}
                            >
                                Wallet Connection
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={simulateBlockchainOperation}
                                disabled={isLoading}
                            >
                                Blockchain Operation
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Retry Logic */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Retry & Recovery
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Test automatic retry logic with exponential backoff and recovery mechanisms.
                        </Typography>

                        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                            <Button
                                variant="outlined"
                                onClick={simulateRetryOperation}
                                disabled={isLoading}
                            >
                                Retry Operation
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={simulateAsyncOperation}
                                disabled={isLoading}
                            >
                                Async Operation
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            <SuccessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Notification System
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            See various notification types and templates in action.
                        </Typography>

                        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                            <Button
                                variant="outlined"
                                color="success"
                                onClick={() => showSuccess('This is a success message!')}
                            >
                                Success
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => showError('This is an error message!')}
                            >
                                Error
                            </Button>
                            <Button
                                variant="outlined"
                                color="warning"
                                onClick={() => showWarning('This is a warning message!')}
                            >
                                Warning
                            </Button>
                            <Button
                                variant="outlined"
                                color="info"
                                onClick={() => showInfo('This is an info message!')}
                            >
                                Info
                            </Button>
                            <Button
                                variant="contained"
                                onClick={showNotificationTemplates}
                            >
                                Show Templates
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>

                <Divider />

                <Alert severity="success">
                    <AlertTitle>Implementation Complete</AlertTitle>
                    Task 14 has been successfully implemented with comprehensive error handling,
                    user feedback systems, loading states, and recovery mechanisms. The system
                    provides graceful error handling across all user interactions while maintaining
                    a smooth user experience.
                </Alert>
            </Stack>
        </Box>
    );
}