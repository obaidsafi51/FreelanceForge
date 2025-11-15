import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Paper,
    Chip,
    Grid,
    Divider,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    Close as CloseIcon,
    Download as DownloadIcon,
    Visibility as PreviewIcon,
    AccountBalanceWallet as WalletIcon,
    Assessment as ScoreIcon,
    Storage as DataIcon,
} from '@mui/icons-material';
import type { PortfolioExport, ExportStats } from '../types';
import { formatExportPreview } from '../utils/exportUtils';

interface ExportPreviewModalProps {
    open: boolean;
    onClose: () => void;
    onConfirmExport: () => void;
    exportData: PortfolioExport | null;
    exportStats: ExportStats;
    isExporting: boolean;
}

export function ExportPreviewModal({
    open,
    onClose,
    onConfirmExport,
    exportData,
    exportStats,
    isExporting,
}: ExportPreviewModalProps) {
    const previewJson = exportData ? formatExportPreview(exportData) : '';

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { minHeight: '70vh' }
            }}
        >
            <DialogTitle>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1}>
                        <PreviewIcon color="primary" />
                        <Typography variant="h6">Export Preview</Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                {exportData ? (
                    <Box>
                        {/* Export Summary */}
                        <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
                            <Typography variant="h6" gutterBottom>
                                Export Summary
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <WalletIcon fontSize="small" color="primary" />
                                        <Typography variant="body2" color="text.secondary">
                                            Wallet Address
                                        </Typography>
                                    </Box>
                                    <Typography variant="body1" fontFamily="monospace" fontSize="0.875rem">
                                        {exportData.wallet_address}
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                                        <ScoreIcon fontSize="small" color="primary" />
                                        <Typography variant="body2" color="text.secondary">
                                            Trust Score
                                        </Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Typography variant="h6">
                                            {exportData.trust_score.total}
                                        </Typography>
                                        <Chip
                                            label={exportData.trust_score.tier}
                                            size="small"
                                            color={
                                                exportData.trust_score.tier === 'Platinum' ? 'secondary' :
                                                    exportData.trust_score.tier === 'Gold' ? 'warning' :
                                                        exportData.trust_score.tier === 'Silver' ? 'info' : 'default'
                                            }
                                        />
                                    </Box>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 2 }} />

                            <Grid container spacing={2}>
                                <Grid item xs={6} sm={3}>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Credentials
                                    </Typography>
                                    <Typography variant="h6">
                                        {exportStats.total_credentials}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6} sm={3}>
                                    <Typography variant="body2" color="text.secondary">
                                        Public
                                    </Typography>
                                    <Typography variant="h6" color="success.main">
                                        {exportStats.public_credentials}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6} sm={3}>
                                    <Typography variant="body2" color="text.secondary">
                                        Private
                                    </Typography>
                                    <Typography variant="h6" color="warning.main">
                                        {exportStats.private_credentials}
                                    </Typography>
                                </Grid>

                                <Grid item xs={6} sm={3}>
                                    <Typography variant="body2" color="text.secondary">
                                        File Size
                                    </Typography>
                                    <Typography variant="h6">
                                        {exportStats.file_size_formatted}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Blockchain Verification */}
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Blockchain Verification
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Network
                                    </Typography>
                                    <Chip
                                        label={exportData.blockchain_verification.network}
                                        variant="outlined"
                                        size="small"
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Explorer Link
                                    </Typography>
                                    <Tooltip title="Click to view account on blockchain explorer">
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            href={exportData.blockchain_verification.account_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View on Explorer
                                        </Button>
                                    </Tooltip>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* JSON Preview */}
                        <Paper sx={{ p: 3 }}>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <DataIcon color="primary" />
                                <Typography variant="h6">
                                    JSON Structure Preview
                                </Typography>
                            </Box>

                            <Typography variant="body2" color="text.secondary" paragraph>
                                This is a simplified preview of your export data. The actual export will include complete credential details.
                            </Typography>

                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    bgcolor: 'grey.900',
                                    color: 'grey.100',
                                    maxHeight: 300,
                                    overflow: 'auto',
                                }}
                            >
                                <pre style={{
                                    margin: 0,
                                    fontSize: '0.75rem',
                                    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                }}>
                                    {previewJson}
                                </pre>
                            </Paper>
                        </Paper>
                    </Box>
                ) : (
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        minHeight={200}
                    >
                        <Typography color="text.secondary">
                            Generating export preview...
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} disabled={isExporting}>
                    Cancel
                </Button>
                <Button
                    onClick={onConfirmExport}
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    disabled={!exportData || isExporting}
                >
                    {isExporting ? 'Exporting...' : 'Download JSON'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}