import React, { useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    TextField,
    IconButton,
    Snackbar,
    Alert,
    Grid,
    Chip,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
} from '@mui/material';
import {
    Share as ShareIcon,
    ContentCopy as CopyIcon,
    QrCode as QrCodeIcon,
    Public as PublicIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Launch as LaunchIcon,
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import {
    generatePortfolioUrl,
    copyToClipboard,
    generateSharingMetadata,
    generateQRCodeData,
    formatWalletAddress,
    getExplorerUrl,
    generateVerificationBadge,
} from '../utils/sharingUtils';
import type { Credential, TrustScore } from '../types';

interface PortfolioSharingProps {
    walletAddress: string;
    credentials: Credential[];
    trustScore: TrustScore;
}

export function PortfolioSharing({ walletAddress, credentials, trustScore }: PortfolioSharingProps) {
    const [showQRDialog, setShowQRDialog] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [copyError, setCopyError] = useState(false);

    // Filter public credentials for sharing
    const publicCredentials = credentials.filter(c => c.visibility === 'public');
    const privateCredentials = credentials.filter(c => c.visibility === 'private');

    // Generate sharing data
    const portfolioUrl = generatePortfolioUrl(walletAddress);
    const sharingMetadata = generateSharingMetadata(walletAddress, trustScore, publicCredentials.length);
    const qrCodeData = generateQRCodeData(walletAddress);
    const verificationBadge = generateVerificationBadge(publicCredentials.length, trustScore);
    const explorerUrl = getExplorerUrl(walletAddress);

    const handleCopyUrl = async () => {
        const success = await copyToClipboard(portfolioUrl);
        if (success) {
            setCopySuccess(true);
        } else {
            setCopyError(true);
        }
    };

    const handleOpenPortfolio = () => {
        window.open(portfolioUrl, '_blank');
    };

    const handleShowQR = () => {
        setShowQRDialog(true);
    };

    const handleCloseQR = () => {
        setShowQRDialog(false);
    };

    return (
        <>
            <Card sx={{
                transition: 'box-shadow 0.2s ease-in-out, transform 0.1s ease-in-out',
                '&:hover': {
                    boxShadow: 3,
                    transform: 'translateY(-1px)'
                }
            }}>
                <CardContent>
                    <Box mb={3}>
                        <Typography variant="h5" gutterBottom>
                            <ShareIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Share Portfolio
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Share your public credentials with potential clients and collaborators
                        </Typography>
                    </Box>

                    {/* Privacy Summary */}
                    <Box mb={3}>
                        <Typography variant="h6" gutterBottom>
                            Privacy Overview
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={6} sm={4}>
                                <Box textAlign="center">
                                    <Typography variant="h4" color="success.main">
                                        {publicCredentials.length}
                                    </Typography>
                                    <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                                        <VisibilityIcon fontSize="small" color="success" />
                                        <Typography variant="body2" color="text.secondary">
                                            Public
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid item xs={6} sm={4}>
                                <Box textAlign="center">
                                    <Typography variant="h4" color="text.secondary">
                                        {privateCredentials.length}
                                    </Typography>
                                    <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                                        <VisibilityOffIcon fontSize="small" color="disabled" />
                                        <Typography variant="body2" color="text.secondary">
                                            Private
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <Box textAlign="center">
                                    <Chip
                                        icon={<PublicIcon />}
                                        label={verificationBadge.badgeText}
                                        color={verificationBadge.badgeColor as any}
                                        size="small"
                                    />
                                    <Typography variant="body2" color="text.secondary" mt={1}>
                                        Verification Status
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        {privateCredentials.length > 0 && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                {privateCredentials.length} credential{privateCredentials.length !== 1 ? 's are' : ' is'} marked as private and will not be visible in your shared portfolio.
                            </Alert>
                        )}
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* Sharing URL */}
                    <Box mb={3}>
                        <Typography variant="h6" gutterBottom>
                            Portfolio Link
                        </Typography>

                        <Box display="flex" gap={1} alignItems="center">
                            <TextField
                                fullWidth
                                value={portfolioUrl}
                                InputProps={{
                                    readOnly: true,
                                    sx: { fontSize: '0.875rem' }
                                }}
                                size="small"
                            />

                            <IconButton
                                onClick={handleCopyUrl}
                                color="primary"
                                title="Copy link"
                                sx={{
                                    transition: 'transform 0.15s ease-in-out, background-color 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'scale(1.1)'
                                    }
                                }}
                            >
                                <CopyIcon />
                            </IconButton>

                            <IconButton
                                onClick={handleOpenPortfolio}
                                color="primary"
                                title="Open portfolio"
                                sx={{
                                    transition: 'transform 0.15s ease-in-out, background-color 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'scale(1.1)'
                                    }
                                }}
                            >
                                <LaunchIcon />
                            </IconButton>
                        </Box>

                        <Typography variant="body2" color="text.secondary" mt={1}>
                            Share this link to showcase your {publicCredentials.length} public credential{publicCredentials.length !== 1 ? 's' : ''}
                        </Typography>
                    </Box>

                    {/* Action Buttons */}
                    <Box display="flex" gap={2} flexWrap="wrap">
                        <Button
                            variant="contained"
                            startIcon={<QrCodeIcon />}
                            onClick={handleShowQR}
                            disabled={publicCredentials.length === 0}
                            sx={{
                                transition: 'transform 0.15s ease-in-out, box-shadow 0.2s ease-in-out',
                                '&:hover:not(:disabled)': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: 4
                                }
                            }}
                        >
                            Generate QR Code
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<LaunchIcon />}
                            onClick={handleOpenPortfolio}
                            disabled={publicCredentials.length === 0}
                            sx={{
                                transition: 'transform 0.15s ease-in-out, border-color 0.2s ease-in-out, background-color 0.2s ease-in-out',
                                '&:hover:not(:disabled)': {
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            Preview Portfolio
                        </Button>
                    </Box>

                    {publicCredentials.length === 0 && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            You don't have any public credentials to share. Make some of your credentials public to enable portfolio sharing.
                        </Alert>
                    )}

                    {/* Verification Info */}
                    <Box mt={3}>
                        <Typography variant="h6" gutterBottom>
                            Blockchain Verification
                        </Typography>

                        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                            <Chip
                                label={`Wallet: ${formatWalletAddress(walletAddress)}`}
                                variant="outlined"
                                size="small"
                                sx={{
                                    transition: 'transform 0.15s ease-in-out, box-shadow 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-1px)',
                                        boxShadow: 1
                                    }
                                }}
                            />

                            <Chip
                                label={`${trustScore.tier} Tier (${trustScore.total}/100)`}
                                color={verificationBadge.badgeColor as unknown}
                                size="small"
                                sx={{
                                    transition: 'transform 0.15s ease-in-out, box-shadow 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-1px)',
                                        boxShadow: 1
                                    }
                                }}
                            />

                            {explorerUrl !== '#' && (
                                <Button
                                    size="small"
                                    startIcon={<LaunchIcon />}
                                    onClick={() => window.open(explorerUrl, '_blank')}
                                    sx={{
                                        transition: 'transform 0.15s ease-in-out, background-color 0.2s ease-in-out',
                                        '&:hover': {
                                            transform: 'translateY(-1px)'
                                        }
                                    }}
                                >
                                    View on Explorer
                                </Button>
                            )}
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* QR Code Dialog */}
            <Dialog
                open={showQRDialog}
                onClose={handleCloseQR}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <QrCodeIcon />
                        Portfolio QR Code
                    </Box>
                </DialogTitle>

                <DialogContent>
                    <Box textAlign="center" py={2}>
                        <Paper
                            elevation={1}
                            sx={{
                                display: 'inline-block',
                                p: 2,
                                mb: 2,
                                backgroundColor: 'background.paper',
                                transition: 'box-shadow 0.2s ease-in-out, transform 0.15s ease-in-out',
                                '&:hover': {
                                    boxShadow: 3,
                                    transform: 'scale(1.02)'
                                }
                            }}
                        >
                            <QRCodeSVG
                                value={qrCodeData.value}
                                size={qrCodeData.size}
                                level={qrCodeData.level}
                                includeMargin={qrCodeData.includeMargin}
                            />
                        </Paper>

                        <Typography variant="body1" gutterBottom>
                            Scan to view portfolio
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                            {portfolioUrl}
                        </Typography>

                        <Box mt={2}>
                            <Chip
                                label={`${publicCredentials.length} Public Credentials`}
                                color="primary"
                                size="small"
                            />
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={handleCopyUrl}
                        startIcon={<CopyIcon />}
                        sx={{
                            transition: 'transform 0.15s ease-in-out, background-color 0.2s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-1px)'
                            }
                        }}
                    >
                        Copy Link
                    </Button>
                    <Button
                        onClick={handleCloseQR}
                        sx={{
                            transition: 'transform 0.15s ease-in-out, background-color 0.2s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-1px)'
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success Snackbar */}
            <Snackbar
                open={copySuccess}
                autoHideDuration={3000}
                onClose={() => setCopySuccess(false)}
            >
                <Alert
                    onClose={() => setCopySuccess(false)}
                    severity="success"
                    sx={{ width: '100%' }}
                >
                    Portfolio link copied to clipboard!
                </Alert>
            </Snackbar>

            {/* Error Snackbar */}
            <Snackbar
                open={copyError}
                autoHideDuration={3000}
                onClose={() => setCopyError(false)}
            >
                <Alert
                    onClose={() => setCopyError(false)}
                    severity="error"
                    sx={{ width: '100%' }}
                >
                    Failed to copy link. Please copy manually.
                </Alert>
            </Snackbar>
        </>
    );
}