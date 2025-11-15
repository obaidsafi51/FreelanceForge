import React, { useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Alert,
    Snackbar,
    CircularProgress,
    Grid,
    Chip,
    Divider,
} from '@mui/material';
import {
    Download as DownloadIcon,
    Assessment as ScoreIcon,
    Storage as DataIcon,
    Security as SecurityIcon,
    CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { useCredentials } from '../hooks/useCredentials';
import { useTrustScore } from '../hooks/useTrustScore';
import { ExportPreviewModal } from './ExportPreviewModal';
import {
    generatePortfolioExport,
    generateExportStats,
    downloadPortfolioExport,
    validateExportData,
} from '../utils/exportUtils';
import type { PortfolioExport, ExportStats } from '../types';

interface PortfolioExporterProps {
    walletAddress: string;
}

export function PortfolioExporter({ walletAddress }: PortfolioExporterProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [exportData, setExportData] = useState<PortfolioExport | null>(null);
    const [exportStats, setExportStats] = useState<ExportStats | null>(null);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    // Fetch credentials and calculate trust score
    const { data: credentials = [], isLoading: credentialsLoading, error: credentialsError } = useCredentials(walletAddress);
    const trustScore = useTrustScore(credentials);

    const hasCredentials = credentials.length > 0;

    const handleGenerateExport = async () => {
        if (!hasCredentials) {
            setErrorMessage('No credentials found to export');
            return;
        }

        setIsGenerating(true);
        setErrorMessage('');

        try {
            // Generate export data
            const exportData = await generatePortfolioExport(walletAddress, credentials, trustScore);

            // Validate export data
            const validation = validateExportData(exportData);
            if (!validation.isValid) {
                throw new Error(`Export validation failed: ${validation.errors.join(', ')}`);
            }

            // Generate stats for UI
            const stats = generateExportStats(credentials);

            setExportData(exportData);
            setExportStats(stats);
            setShowPreview(true);
        } catch (error) {
            console.error('Export generation failed:', error);
            setErrorMessage(error instanceof Error ? error.message : 'Failed to generate export');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleConfirmExport = async () => {
        if (!exportData || !exportStats) return;

        setIsExporting(true);

        try {
            // Download the file
            downloadPortfolioExport(exportData, walletAddress);

            // Show success message
            const message = `Portfolio exported successfully! ${exportStats.total_credentials} credentials, ${exportStats.file_size_formatted}`;
            setSuccessMessage(message);

            // Close preview modal
            setShowPreview(false);
        } catch (error) {
            console.error('Export download failed:', error);
            setErrorMessage(error instanceof Error ? error.message : 'Failed to download export');
        } finally {
            setIsExporting(false);
        }
    };

    const handleClosePreview = () => {
        setShowPreview(false);
        setExportData(null);
        setExportStats(null);
    };

    if (credentialsLoading) {
        return (
            <Card>
                <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="center" py={4}>
                        <CircularProgress size={24} sx={{ mr: 2 }} />
                        <Typography>Loading credentials...</Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    if (credentialsError) {
        return (
            <Card>
                <CardContent>
                    <Alert severity="error">
                        Failed to load credentials: {credentialsError.message}
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardContent>
                    <Box mb={3}>
                        <Typography variant="h5" gutterBottom>
                            Export Portfolio
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Generate a comprehensive JSON export of your credentials with blockchain verification links.
                        </Typography>
                    </Box>

                    {!hasCredentials ? (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            You don't have any credentials to export yet. Start by minting some credentials to build your portfolio.
                        </Alert>
                    ) : (
                        <>
                            {/* Portfolio Summary */}
                            <Box mb={3}>
                                <Typography variant="h6" gutterBottom>
                                    Portfolio Summary
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={6} sm={3}>
                                        <Box textAlign="center">
                                            <Typography variant="h4" color="primary">
                                                {credentials.length}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Total Credentials
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={6} sm={3}>
                                        <Box textAlign="center">
                                            <Typography variant="h4" color="primary">
                                                {trustScore.total}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Trust Score
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={6} sm={3}>
                                        <Box textAlign="center">
                                            <Chip
                                                label={trustScore.tier}
                                                color={
                                                    trustScore.tier === 'Platinum' ? 'secondary' :
                                                        trustScore.tier === 'Gold' ? 'warning' :
                                                            trustScore.tier === 'Silver' ? 'info' : 'default'
                                                }
                                            />
                                            <Typography variant="body2" color="text.secondary" mt={1}>
                                                Tier
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={6} sm={3}>
                                        <Box textAlign="center">
                                            <Typography variant="h4" color="success.main">
                                                {credentials.filter(c => c.visibility === 'public').length}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Public Credentials
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Divider sx={{ mb: 3 }} />

                            {/* Export Features */}
                            <Box mb={3}>
                                <Typography variant="h6" gutterBottom>
                                    What's Included
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <DataIcon fontSize="small" color="primary" />
                                            <Typography variant="body2">
                                                Complete credential metadata
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <ScoreIcon fontSize="small" color="primary" />
                                            <Typography variant="body2">
                                                Trust score breakdown
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <SecurityIcon fontSize="small" color="primary" />
                                            <Typography variant="body2">
                                                Blockchain verification links
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <SuccessIcon fontSize="small" color="primary" />
                                            <Typography variant="body2">
                                                Export timestamp & metadata
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </>
                    )}

                    {/* Export Button */}
                    <Box display="flex" justifyContent="center">
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={isGenerating ? <CircularProgress size={20} /> : <DownloadIcon />}
                            onClick={handleGenerateExport}
                            disabled={!hasCredentials || isGenerating}
                            sx={{ minWidth: 200 }}
                        >
                            {isGenerating ? 'Generating...' : 'Generate Export'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Export Preview Modal */}
            <ExportPreviewModal
                open={showPreview}
                onClose={handleClosePreview}
                onConfirmExport={handleConfirmExport}
                exportData={exportData}
                exportStats={exportStats || {
                    total_credentials: 0,
                    public_credentials: 0,
                    private_credentials: 0,
                    file_size_bytes: 0,
                    file_size_formatted: '0 B',
                }}
                isExporting={isExporting}
            />

            {/* Success Snackbar */}
            <Snackbar
                open={!!successMessage}
                autoHideDuration={6000}
                onClose={() => setSuccessMessage('')}
            >
                <Alert
                    onClose={() => setSuccessMessage('')}
                    severity="success"
                    sx={{ width: '100%' }}
                >
                    {successMessage}
                </Alert>
            </Snackbar>

            {/* Error Snackbar */}
            <Snackbar
                open={!!errorMessage}
                autoHideDuration={6000}
                onClose={() => setErrorMessage('')}
            >
                <Alert
                    onClose={() => setErrorMessage('')}
                    severity="error"
                    sx={{ width: '100%' }}
                >
                    {errorMessage}
                </Alert>
            </Snackbar>
        </>
    );
}