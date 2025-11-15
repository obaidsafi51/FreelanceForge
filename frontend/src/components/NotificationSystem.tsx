import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import {
    Snackbar,
    Alert,
    AlertTitle,
    IconButton,
    Box,
    Typography,
    Button,
    Slide,
    type SlideProps,
} from '@mui/material';
import {
    Close as CloseIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
} from '@mui/icons-material';

// Notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
    id: string;
    type: NotificationType;
    title?: string;
    message: string;
    duration?: number;
    persistent?: boolean;
    action?: {
        label: string;
        onClick: () => void;
    };
    timestamp: number;
}

interface NotificationState {
    notifications: Notification[];
}

type NotificationAction =
    | { type: 'ADD_NOTIFICATION'; payload: Notification }
    | { type: 'REMOVE_NOTIFICATION'; payload: string }
    | { type: 'CLEAR_ALL' };

const initialState: NotificationState = {
    notifications: [],
};

function notificationReducer(
    state: NotificationState,
    action: NotificationAction
): NotificationState {
    switch (action.type) {
        case 'ADD_NOTIFICATION':
            return {
                ...state,
                notifications: [...state.notifications, action.payload],
            };
        case 'REMOVE_NOTIFICATION':
            return {
                ...state,
                notifications: state.notifications.filter(n => n.id !== action.payload),
            };
        case 'CLEAR_ALL':
            return {
                ...state,
                notifications: [],
            };
        default:
            return state;
    }
}

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string;
    removeNotification: (id: string) => void;
    clearAll: () => void;
    // Convenience methods
    showSuccess: (message: string, options?: Partial<Notification>) => string;
    showError: (message: string, options?: Partial<Notification>) => string;
    showWarning: (message: string, options?: Partial<Notification>) => string;
    showInfo: (message: string, options?: Partial<Notification>) => string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Slide transition component
function SlideTransition(props: SlideProps) {
    return <Slide {...props} direction="up" />;
}

interface NotificationProviderProps {
    children: ReactNode;
    maxNotifications?: number;
}

export function NotificationProvider({
    children,
    maxNotifications = 5
}: NotificationProviderProps) {
    const [state, dispatch] = useReducer(notificationReducer, initialState);

    const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>): string => {
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newNotification: Notification = {
            ...notification,
            id,
            timestamp: Date.now(),
            duration: notification.duration ?? (notification.type === 'error' ? 8000 : 5000),
        };

        dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });

        // Auto-remove non-persistent notifications
        if (!newNotification.persistent && newNotification.duration && newNotification.duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, newNotification.duration);
        }

        // Remove oldest notifications if we exceed the limit
        if (state.notifications.length >= maxNotifications) {
            const oldestId = state.notifications[0]?.id;
            if (oldestId) {
                removeNotification(oldestId);
            }
        }

        return id;
    };

    const removeNotification = (id: string) => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    };

    const clearAll = () => {
        dispatch({ type: 'CLEAR_ALL' });
    };

    // Convenience methods
    const showSuccess = (message: string, options?: Partial<Notification>): string => {
        return addNotification({ ...options, type: 'success', message });
    };

    const showError = (message: string, options?: Partial<Notification>): string => {
        return addNotification({
            ...options,
            type: 'error',
            message,
            persistent: options?.persistent ?? true, // Errors are persistent by default
        });
    };

    const showWarning = (message: string, options?: Partial<Notification>): string => {
        return addNotification({ ...options, type: 'warning', message });
    };

    const showInfo = (message: string, options?: Partial<Notification>): string => {
        return addNotification({ ...options, type: 'info', message });
    };

    const contextValue: NotificationContextType = {
        notifications: state.notifications,
        addNotification,
        removeNotification,
        clearAll,
        showSuccess,
        showError,
        showWarning,
        showInfo,
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
            <NotificationContainer />
        </NotificationContext.Provider>
    );
}

// Notification container component
function NotificationContainer() {
    const { notifications, removeNotification } = useNotifications();

    return (
        <>
            {notifications.map((notification, index) => (
                <Snackbar
                    key={notification.id}
                    open={true}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    TransitionComponent={SlideTransition}
                    sx={{
                        // Stack notifications vertically
                        bottom: `${16 + index * 80}px !important`,
                        zIndex: 1400 + index,
                    }}
                >
                    <Alert
                        severity={notification.type}
                        variant="filled"
                        sx={{
                            minWidth: 300,
                            maxWidth: 500,
                            '& .MuiAlert-message': {
                                width: '100%',
                            },
                        }}
                        action={
                            <IconButton
                                size="small"
                                color="inherit"
                                onClick={() => removeNotification(notification.id)}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        }
                    >
                        {notification.title && (
                            <AlertTitle>{notification.title}</AlertTitle>
                        )}
                        <Typography variant="body2">
                            {notification.message}
                        </Typography>
                        {notification.action && (
                            <Box sx={{ mt: 1 }}>
                                <Button
                                    size="small"
                                    color="inherit"
                                    variant="outlined"
                                    onClick={notification.action.onClick}
                                    sx={{
                                        borderColor: 'currentColor',
                                        color: 'inherit',
                                        '&:hover': {
                                            borderColor: 'currentColor',
                                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                                        },
                                    }}
                                >
                                    {notification.action.label}
                                </Button>
                            </Box>
                        )}
                    </Alert>
                </Snackbar>
            ))}
        </>
    );
}

// Hook to use notifications
export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}

// Predefined notification templates for common scenarios
export const NotificationTemplates = {
    // Wallet connection notifications
    walletConnected: (accountName: string) => ({
        type: 'success' as const,
        title: 'Wallet Connected',
        message: `Successfully connected to ${accountName}`,
        duration: 3000,
    }),

    walletDisconnected: () => ({
        type: 'info' as const,
        title: 'Wallet Disconnected',
        message: 'Your wallet has been disconnected',
        duration: 3000,
    }),

    walletNotFound: () => ({
        type: 'error' as const,
        title: 'Wallet Extension Not Found',
        message: 'Please install the Polkadot.js browser extension to continue',
        persistent: true,
        action: {
            label: 'Install Extension',
            onClick: () => window.open('https://polkadot.js.org/extension/', '_blank'),
        },
    }),

    // Transaction notifications
    transactionSubmitted: (hash: string) => ({
        type: 'info' as const,
        title: 'Transaction Submitted',
        message: `Transaction submitted with hash: ${hash.slice(0, 10)}...`,
        duration: 5000,
    }),

    transactionConfirmed: (type: string) => ({
        type: 'success' as const,
        title: 'Transaction Confirmed',
        message: `${type} transaction has been confirmed on the blockchain`,
        duration: 5000,
    }),

    transactionFailed: (reason: string) => ({
        type: 'error' as const,
        title: 'Transaction Failed',
        message: reason,
        persistent: true,
    }),

    insufficientBalance: (network: string) => ({
        type: 'error' as const,
        title: 'Insufficient Balance',
        message: `You don't have enough tokens to complete this transaction`,
        persistent: true,
        action: network === 'paseo' ? {
            label: 'Get Testnet Tokens',
            onClick: () => window.open('https://faucet.polkadot.io/', '_blank'),
        } : undefined,
    }),

    // Credential notifications
    credentialMinted: (name: string) => ({
        type: 'success' as const,
        title: 'Credential Minted',
        message: `Successfully minted "${name}" credential`,
        duration: 5000,
    }),

    credentialUpdated: (name: string) => ({
        type: 'success' as const,
        title: 'Credential Updated',
        message: `Successfully updated "${name}" credential`,
        duration: 4000,
    }),

    credentialDeleted: (name: string) => ({
        type: 'info' as const,
        title: 'Credential Deleted',
        message: `"${name}" credential has been removed`,
        duration: 4000,
    }),

    // Network notifications
    networkConnected: (network: string, endpoint: string) => ({
        type: 'success' as const,
        title: 'Network Connected',
        message: `Connected to ${network} network`,
        duration: 3000,
    }),

    networkError: (error: string) => ({
        type: 'error' as const,
        title: 'Network Connection Error',
        message: `Failed to connect to blockchain: ${error}`,
        persistent: true,
        action: {
            label: 'Retry Connection',
            onClick: () => window.location.reload(),
        },
    }),

    // File upload notifications
    fileUploadSuccess: (fileName: string) => ({
        type: 'success' as const,
        title: 'File Uploaded',
        message: `Successfully processed "${fileName}"`,
        duration: 3000,
    }),

    fileUploadError: (error: string) => ({
        type: 'error' as const,
        title: 'File Upload Failed',
        message: error,
        duration: 6000,
    }),

    // Export notifications
    portfolioExported: (fileName: string) => ({
        type: 'success' as const,
        title: 'Portfolio Exported',
        message: `Successfully exported portfolio as "${fileName}"`,
        duration: 4000,
    }),

    // Generic notifications
    operationSuccess: (operation: string) => ({
        type: 'success' as const,
        message: `${operation} completed successfully`,
        duration: 3000,
    }),

    operationError: (operation: string, error: string) => ({
        type: 'error' as const,
        title: `${operation} Failed`,
        message: error,
        persistent: true,
    }),
};