import React from 'react';
import { Box, Typography, Chip, Alert } from '@mui/material';
import { useWallet } from '../contexts/WalletContext';

export function WalletStatus() {
    try {
        const { isConnected, isConnecting, selectedAccount, accounts, error } = useWallet();

        return (
            <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Wallet Status Debug
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                        label={`Connected: ${isConnected ? 'Yes' : 'No'}`}
                        color={isConnected ? 'success' : 'default'}
                    />
                    <Chip
                        label={`Connecting: ${isConnecting ? 'Yes' : 'No'}`}
                        color={isConnecting ? 'warning' : 'default'}
                    />
                    <Chip
                        label={`Accounts: ${accounts?.length || 0}`}
                        color="info"
                    />
                </Box>

                {selectedAccount && (
                    <Box sx={{ mb: 1 }}>
                        <Typography variant="body2">
                            <strong>Selected Account:</strong> {selectedAccount.meta?.name || 'Unnamed'}
                        </Typography>
                        <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                            {selectedAccount.address}
                        </Typography>
                    </Box>
                )}

                {error && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                        {error}
                    </Alert>
                )}
            </Box>
        );
    } catch (err) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                Error accessing wallet state: {err.message}
            </Alert>
        );
    }
}