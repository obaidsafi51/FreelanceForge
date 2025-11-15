import { useState, useCallback } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Paper,
    Button,
    Alert,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Edit as ManualIcon,
    PlayArrow as StartIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import { MockDataUpload } from './MockDataUpload';
import { ManualCredentialEntry } from './ManualCredentialEntry';
import { CredentialPreview } from './CredentialPreview';
import { BatchMintProgress, type BatchMintProgress as BatchMintProgressType, type BatchMintResult } from './BatchMintProgress';
import { useMintCredential } from '../hooks/useCredentials';
import { useWallet } from '../contexts/WalletContext';
import type { CredentialMetadata } from '../utils/api';

interface MockDataImportProps {
    onComplete?: (results: BatchMintResult[]) => void;
}

export function MockDataImport({ onComplete }: MockDataImportProps) {
    const { selectedAccount } = useWallet();
    const mintCredentialMutation = useMintCredential();

    // UI State
    const [activeTab, setActiveTab] = useState(0);
    const [parsedCredentials, setParsedCredentials] = useState<CredentialMetadata[]>([]);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showBatchProgress, setShowBatchProgress] = useState(false);

    // Batch minting state
    const [batchProgress, setBatchProgress] = useState<BatchMintProgressType>({
        total: 0,
        completed: 0,
        successful: 0,
        failed: 0,
        results: [],
        isPaused: false,
        isComplete: false,
    });
    const [batchController, setBatchController] = useState<{
        isPaused: boolean;
        shouldStop: boolean;
    }>({ isPaused: false, shouldStop: false });

    // Notifications
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Constants
    const ESTIMATED_FEE_PER_CREDENTIAL = 0.01; // DOT
    const LARGE_BATCH_THRESHOLD = 50;
    const BATCH_DELAY_MS = 2000; // 2 seconds between transactions

    // Handle credentials parsed from upload or manual entry
    const handleCredentialsParsed = useCallback((credentials: CredentialMetadata[]) => {
        setParsedCredentials(credentials);
        setSuccessMessage(`${credentials.length} credentials ready for minting`);
    }, []);

    // Handle errors
    const handleError = useCallback((error: string) => {
        setErrorMessage(error);
    }, []);

    // Start batch minting process
    const startBatchMint = async () => {
        if (!selectedAccount || parsedCredentials.length === 0) {
            setErrorMessage('No wallet connected or no credentials to mint');
            return;
        }

        setShowConfirmDialog(false);
        setShowBatchProgress(true);

        // Initialize progress
        const initialProgress: BatchMintProgressType = {
            total: parsedCredentials.length,
            completed: 0,
            successful: 0,
            failed: 0,
            results: [],
            isPaused: false,
            isComplete: false,
        };
        setBatchProgress(initialProgress);
        setBatchController({ isPaused: false, shouldStop: false });

        const results: BatchMintResult[] = [];
        const startTime = Date.now();

        try {
            for (let i = 0; i < parsedCredentials.length; i++) {
                // Check if we should stop
                if (batchController.shouldStop) {
                    break;
                }

                // Check if we should pause
                while (batchController.isPaused && !batchController.shouldStop) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                const credential = parsedCredentials[i];

                // Update current credential
                setBatchProgress(prev => ({
                    ...prev,
                    current: credential,
                }));

                try {
                    // Mint the credential
                    const result = await mintCredentialMutation.mutateAsync({
                        accountAddress: selectedAccount.address,
                        credentialData: credential,
                    });

                    // Success
                    const mintResult: BatchMintResult = {
                        credential,
                        success: true,
                        transactionHash: result.hash,
                        index: i,
                    };
                    results.push(mintResult);

                    setBatchProgress(prev => ({
                        ...prev,
                        completed: i + 1,
                        successful: prev.successful + 1,
                        results: [...prev.results, mintResult],
                        estimatedTimeRemaining: calculateTimeRemaining(startTime, i + 1, parsedCredentials.length),
                    }));

                } catch (error) {
                    // Failure
                    const mintResult: BatchMintResult = {
                        credential,
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error',
                        index: i,
                    };
                    results.push(mintResult);

                    setBatchProgress(prev => ({
                        ...prev,
                        completed: i + 1,
                        failed: prev.failed + 1,
                        results: [...prev.results, mintResult],
                        estimatedTimeRemaining: calculateTimeRemaining(startTime, i + 1, parsedCredentials.length),
                    }));
                }

                // Add delay between transactions (except for the last one)
                if (i < parsedCredentials.length - 1 && !batchController.shouldStop) {
                    await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
                }
            }

        } catch (error) {
            setErrorMessage(`Batch minting failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            // Mark as complete
            setBatchProgress(prev => ({
                ...prev,
                isComplete: true,
                current: undefined,
            }));

            // Call completion callback
            onComplete?.(results);
        }
    };

    // Calculate estimated time remaining
    const calculateTimeRemaining = (startTime: number, completed: number, total: number): number => {
        if (completed === 0) return 0;

        const elapsed = (Date.now() - startTime) / 1000; // seconds
        const avgTimePerCredential = elapsed / completed;
        const remaining = total - completed;

        return remaining * avgTimePerCredential;
    };

    // Batch control functions
    const pauseBatch = () => {
        setBatchController(prev => ({ ...prev, isPaused: true }));
        setBatchProgress(prev => ({ ...prev, isPaused: true }));
    };

    const resumeBatch = () => {
        setBatchController(prev => ({ ...prev, isPaused: false }));
        setBatchProgress(prev => ({ ...prev, isPaused: false }));
    };

    const stopBatch = () => {
        setBatchController(prev => ({ ...prev, shouldStop: true, isPaused: false }));
        setBatchProgress(prev => ({ ...prev, isPaused: false }));
    };

    // Clear parsed credentials
    const clearCredentials = () => {
        setParsedCredentials([]);
    };

    // Close notifications
    const handleCloseSnackbar = () => {
        setSuccessMessage(null);
        setErrorMessage(null);
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Import Credentials
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Import your existing credentials from Web2 platforms or create them manually.
            </Typography>

            {/* Import Method Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, newValue) => setActiveTab(newValue)}
                    variant="fullWidth"
                >
                    <Tab
                        icon={<UploadIcon />}
                        label="Upload JSON"
                        iconPosition="start"
                    />
                    <Tab
                        icon={<ManualIcon />}
                        label="Manual Entry"
                        iconPosition="start"
                    />
                </Tabs>

                <Box sx={{ p: 3 }}>
                    {activeTab === 0 && (
                        <MockDataUpload
                            onCredentialsParsed={handleCredentialsParsed}
                            onError={handleError}
                            disabled={showBatchProgress && !batchProgress.isComplete}
                        />
                    )}

                    {activeTab === 1 && (
                        <ManualCredentialEntry
                            onCredentialsCreated={handleCredentialsParsed}
                            onError={handleError}
                            disabled={showBatchProgress && !batchProgress.isComplete}
                        />
                    )}
                </Box>
            </Paper>

            {/* Credential Preview */}
            {parsedCredentials.length > 0 && (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Typography variant="h6">
                            Credential Preview
                        </Typography>
                        <Box display="flex" gap={2}>
                            <Button
                                variant="outlined"
                                onClick={clearCredentials}
                                disabled={showBatchProgress && !batchProgress.isComplete}
                            >
                                Clear
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<StartIcon />}
                                onClick={() => setShowConfirmDialog(true)}
                                disabled={!selectedAccount || showBatchProgress && !batchProgress.isComplete}
                            >
                                Start Batch Mint
                            </Button>
                        </Box>
                    </Box>

                    <CredentialPreview credentials={parsedCredentials} />
                </Paper>
            )}

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Confirm Batch Minting
                </DialogTitle>
                <DialogContent>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                            You are about to mint <strong>{parsedCredentials.length} credentials</strong> to the blockchain.
                        </Typography>
                    </Alert>

                    <Box mb={2}>
                        <Typography variant="body2" gutterBottom>
                            <strong>Estimated Cost:</strong> {(parsedCredentials.length * ESTIMATED_FEE_PER_CREDENTIAL).toFixed(4)} DOT
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                            <strong>Network:</strong> Paseo Testnet
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                            <strong>Estimated Time:</strong> ~{Math.ceil(parsedCredentials.length * (BATCH_DELAY_MS / 1000))} seconds
                        </Typography>
                    </Box>

                    {parsedCredentials.length >= LARGE_BATCH_THRESHOLD && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                                Large batch detected ({parsedCredentials.length} credentials).
                                You can pause or stop the process at any time if needed.
                            </Typography>
                        </Alert>
                    )}

                    <Typography variant="body2" color="text.secondary">
                        This process will mint each credential as a separate transaction.
                        You can pause or stop the process at any time.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowConfirmDialog(false)}>
                        Cancel
                    </Button>
                    <Button onClick={startBatchMint} variant="contained" color="primary">
                        Start Minting
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Batch Progress Dialog */}
            <BatchMintProgress
                open={showBatchProgress}
                credentials={parsedCredentials}
                progress={batchProgress}
                onPause={pauseBatch}
                onResume={resumeBatch}
                onStop={stopBatch}
                onClose={() => {
                    setShowBatchProgress(false);
                    setParsedCredentials([]);
                }}
                estimatedFeePerCredential={ESTIMATED_FEE_PER_CREDENTIAL}
                networkName="Paseo Testnet"
            />

            {/* Success/Error Notifications */}
            <Snackbar
                open={!!successMessage}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                    {successMessage}
                </Alert>
            </Snackbar>

            <Snackbar
                open={!!errorMessage}
                autoHideDuration={8000}
                onClose={handleCloseSnackbar}
            >
                <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}