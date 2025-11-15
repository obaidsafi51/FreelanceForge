import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    LinearProgress,
    Alert,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
    Divider,
    IconButton,
    Collapse,
    Paper,
} from '@mui/material';
import {
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    Pause as PauseIcon,
    PlayArrow as PlayIcon,
    Stop as StopIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import type { CredentialMetadata } from '../utils/api';

export interface BatchMintResult {
    credential: CredentialMetadata;
    success: boolean;
    transactionHash?: string;
    error?: string;
    index: number;
}

export interface BatchMintProgress {
    total: number;
    completed: number;
    successful: number;
    failed: number;
    current?: CredentialMetadata;
    results: BatchMintResult[];
    isPaused: boolean;
    isComplete: boolean;
    estimatedTimeRemaining?: number;
}

interface BatchMintProgressProps {
    open: boolean;
    credentials: CredentialMetadata[];
    progress: BatchMintProgress;
    onPause: () => void;
    onResume: () => void;
    onStop: () => void;
    onClose: () => void;
    estimatedFeePerCredential: number;
    networkName: string;
}

export function BatchMintProgress({
    open,
    credentials,
    progress,
    onPause,
    onResume,
    onStop,
    onClose,
    estimatedFeePerCredential,
    networkName,
}: BatchMintProgressProps) {
    const [showDetails, setShowDetails] = useState(false);
    const [showErrors, setShowErrors] = useState(false);

    // Calculate progress percentage
    const progressPercentage = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

    // Calculate estimated total cost
    const totalEstimatedCost = credentials.length * estimatedFeePerCredential;

    // Format time remaining
    const formatTimeRemaining = (seconds?: number) => {
        if (!seconds || seconds <= 0) return 'Calculating...';

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        }
        return `${remainingSeconds}s`;
    };

    // Get status color
    const getStatusColor = () => {
        if (progress.isComplete) {
            return progress.failed > 0 ? 'warning' : 'success';
        }
        return progress.isPaused ? 'info' : 'primary';
    };

    // Get status text
    const getStatusText = () => {
        if (progress.isComplete) {
            if (progress.failed === 0) {
                return 'All credentials minted successfully!';
            } else if (progress.successful === 0) {
                return 'All credentials failed to mint';
            } else {
                return `${progress.successful} successful, ${progress.failed} failed`;
            }
        }

        if (progress.isPaused) {
            return 'Paused';
        }

        return 'Minting in progress...';
    };

    // Filter results
    const successfulResults = progress.results.filter(r => r.success);
    const failedResults = progress.results.filter(r => !r.success);

    return (
        <Dialog
            open={open}
            onClose={progress.isComplete ? onClose : undefined}
            maxWidth="md"
            fullWidth
            disableEscapeKeyDown={!progress.isComplete}
        >
            <DialogTitle>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">
                        Batch Minting Progress
                    </Typography>
                    <Chip
                        label={getStatusText()}
                        color={getStatusColor()}
                        variant={progress.isComplete ? 'filled' : 'outlined'}
                    />
                </Box>
            </DialogTitle>

            <DialogContent>
                {/* Cost Estimate */}
                <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
                    <Box display="flex" alignItems="center" mb={1}>
                        <InfoIcon sx={{ mr: 1, color: 'info.main' }} />
                        <Typography variant="subtitle2" color="info.main">
                            Transaction Cost Estimate
                        </Typography>
                    </Box>
                    <Typography variant="body2">
                        <strong>Network:</strong> {networkName}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Estimated cost per credential:</strong> {estimatedFeePerCredential.toFixed(4)} DOT
                    </Typography>
                    <Typography variant="body2">
                        <strong>Total estimated cost:</strong> {totalEstimatedCost.toFixed(4)} DOT
                    </Typography>
                </Paper>

                {/* Progress Bar */}
                <Box mb={3}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">
                            Progress: {progress.completed} of {progress.total} credentials
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {progressPercentage.toFixed(1)}%
                        </Typography>
                    </Box>

                    <LinearProgress
                        variant="determinate"
                        value={progressPercentage}
                        sx={{ height: 8, borderRadius: 4, mb: 1 }}
                        color={getStatusColor()}
                    />

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                            {progress.successful} successful • {progress.failed} failed
                        </Typography>
                        {progress.estimatedTimeRemaining && !progress.isComplete && (
                            <Typography variant="caption" color="text.secondary">
                                ~{formatTimeRemaining(progress.estimatedTimeRemaining)} remaining
                            </Typography>
                        )}
                    </Box>
                </Box>

                {/* Current Credential */}
                {progress.current && !progress.isComplete && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            <strong>Currently minting:</strong> {progress.current.name}
                        </Typography>
                    </Alert>
                )}

                {/* Summary Stats */}
                <Box display="flex" gap={2} mb={3}>
                    <Chip
                        label={`${progress.successful} Successful`}
                        color="success"
                        variant={progress.successful > 0 ? 'filled' : 'outlined'}
                        size="small"
                    />
                    <Chip
                        label={`${progress.failed} Failed`}
                        color="error"
                        variant={progress.failed > 0 ? 'filled' : 'outlined'}
                        size="small"
                    />
                    <Chip
                        label={`${progress.total - progress.completed} Remaining`}
                        color="default"
                        variant="outlined"
                        size="small"
                    />
                </Box>

                {/* Error Summary */}
                {failedResults.length > 0 && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography variant="body2">
                                {failedResults.length} credential(s) failed to mint
                            </Typography>
                            <Button
                                size="small"
                                onClick={() => setShowErrors(!showErrors)}
                                endIcon={showErrors ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            >
                                {showErrors ? 'Hide' : 'Show'} Errors
                            </Button>
                        </Box>

                        <Collapse in={showErrors}>
                            <List dense sx={{ mt: 1 }}>
                                {failedResults.map((result) => (
                                    <ListItem key={result.index} sx={{ pl: 0 }}>
                                        <ListItemIcon>
                                            <ErrorIcon color="error" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={result.credential.name}
                                            secondary={result.error || 'Unknown error'}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Collapse>
                    </Alert>
                )}

                {/* Detailed Results */}
                <Box>
                    <Button
                        onClick={() => setShowDetails(!showDetails)}
                        endIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        sx={{ mb: 2 }}
                    >
                        {showDetails ? 'Hide' : 'Show'} Detailed Results
                    </Button>

                    <Collapse in={showDetails}>
                        <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                            <List dense>
                                {progress.results.map((result, index) => (
                                    <div key={result.index}>
                                        <ListItem>
                                            <ListItemIcon>
                                                {result.success ? (
                                                    <SuccessIcon color="success" />
                                                ) : (
                                                    <ErrorIcon color="error" />
                                                )}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={result.credential.name}
                                                secondary={
                                                    result.success
                                                        ? `Success • Hash: ${result.transactionHash?.slice(0, 10)}...`
                                                        : `Failed • ${result.error}`
                                                }
                                            />
                                        </ListItem>
                                        {index < progress.results.length - 1 && <Divider />}
                                    </div>
                                ))}
                            </List>
                        </Paper>
                    </Collapse>
                </Box>
            </DialogContent>

            <DialogActions>
                {!progress.isComplete ? (
                    <>
                        <Button onClick={onStop} color="error" startIcon={<StopIcon />}>
                            Stop
                        </Button>
                        {progress.isPaused ? (
                            <Button onClick={onResume} color="primary" startIcon={<PlayIcon />}>
                                Resume
                            </Button>
                        ) : (
                            <Button onClick={onPause} color="warning" startIcon={<PauseIcon />}>
                                Pause
                            </Button>
                        )}
                    </>
                ) : (
                    <Button onClick={onClose} color="primary" variant="contained">
                        Close
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}