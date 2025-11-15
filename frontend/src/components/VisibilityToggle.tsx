import React, { useState } from 'react';
import {
    IconButton,
    Tooltip,
    CircularProgress,
    Snackbar,
    Alert,
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useUpdateCredential } from '../hooks/useCredentials';
import type { Credential } from '../types';

interface VisibilityToggleProps {
    credential: Credential;
    walletAddress: string;
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
}

export function VisibilityToggle({
    credential,
    walletAddress,
    size = 'medium',
    disabled = false
}: VisibilityToggleProps) {
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const updateCredentialMutation = useUpdateCredential();

    const isPublic = credential.visibility === 'public';
    const isUpdating = updateCredentialMutation.isPending;

    const handleToggleVisibility = async () => {
        if (disabled || isUpdating) return;

        const newVisibility = isPublic ? 'private' : 'public';

        try {
            await updateCredentialMutation.mutateAsync({
                accountAddress: walletAddress,
                credentialId: credential.id,
                updates: {
                    visibility: newVisibility,
                },
            });

            setShowSuccess(true);
        } catch (error) {
            console.error('Failed to update credential visibility:', error);
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : 'Failed to update credential visibility'
            );
            setShowError(true);
        }
    };

    const tooltipTitle = isUpdating
        ? 'Updating...'
        : isPublic
            ? 'Make private (hide from shared portfolio)'
            : 'Make public (show in shared portfolio)';

    return (
        <>
            <Tooltip title={tooltipTitle}>
                <span>
                    <IconButton
                        onClick={handleToggleVisibility}
                        disabled={disabled || isUpdating}
                        size={size}
                        color={isPublic ? 'success' : 'default'}
                        sx={{
                            opacity: disabled ? 0.5 : 1,
                        }}
                    >
                        {isUpdating ? (
                            <CircularProgress size={size === 'small' ? 16 : size === 'large' ? 28 : 20} />
                        ) : isPublic ? (
                            <VisibilityIcon />
                        ) : (
                            <VisibilityOffIcon />
                        )}
                    </IconButton>
                </span>
            </Tooltip>

            {/* Success Snackbar */}
            <Snackbar
                open={showSuccess}
                autoHideDuration={3000}
                onClose={() => setShowSuccess(false)}
            >
                <Alert
                    onClose={() => setShowSuccess(false)}
                    severity="success"
                    sx={{ width: '100%' }}
                >
                    Credential visibility updated to {isPublic ? 'public' : 'private'}
                </Alert>
            </Snackbar>

            {/* Error Snackbar */}
            <Snackbar
                open={showError}
                autoHideDuration={5000}
                onClose={() => setShowError(false)}
            >
                <Alert
                    onClose={() => setShowError(false)}
                    severity="error"
                    sx={{ width: '100%' }}
                >
                    {errorMessage}
                </Alert>
            </Snackbar>
        </>
    );
}