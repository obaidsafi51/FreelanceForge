import { useState, useCallback } from 'react';
import {
    Box,
    Typography,
    Button,
    Alert,
    Paper,
    IconButton,
    Chip,
    LinearProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Delete as DeleteIcon,
    ExpandMore as ExpandMoreIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    CheckCircle as SuccessIcon,
    Description as FileIcon,
} from '@mui/icons-material';
import {
    validateJsonFile,
    detectPlatform,
    transformPlatformData,
    generateSampleData,
    type TransformationResult,
    type PlatformData,
} from '../utils/mockDataTransformers';
import type { CredentialMetadata } from '../utils/api';

interface MockDataUploadProps {
    onCredentialsParsed: (credentials: CredentialMetadata[]) => void;
    onError: (error: string) => void;
    disabled?: boolean;
}

export function MockDataUpload({ onCredentialsParsed, onError, disabled = false }: MockDataUploadProps) {
    const [dragOver, setDragOver] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transformationResult, setTransformationResult] = useState<TransformationResult | null>(null);
    const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);

    // File upload handling
    const handleFileUpload = useCallback(async (file: File) => {
        if (disabled) return;

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            onError('File size must be 5MB or less');
            return;
        }

        // Validate file type
        if (!file.name.toLowerCase().endsWith('.json')) {
            onError('Please upload a JSON file');
            return;
        }

        setUploadedFile(file);
        setIsProcessing(true);
        setTransformationResult(null);
        setDetectedPlatform(null);

        try {
            // Read file content
            const fileContent = await file.text();

            // Validate JSON
            const validation = validateJsonFile(fileContent);
            if (!validation.isValid) {
                onError(`Invalid JSON file: ${validation.error}`);
                setIsProcessing(false);
                return;
            }

            // Detect platform
            const platform = detectPlatform(validation.data);
            setDetectedPlatform(platform);

            if (platform === 'unknown') {
                onError('Unable to detect platform format. Please check the JSON structure or use manual entry.');
                setIsProcessing(false);
                return;
            }

            // Transform data
            const platformData: PlatformData = {
                platform: platform as 'upwork' | 'linkedin' | 'stripe',
                data: validation.data,
            };

            const result = transformPlatformData(platformData);
            setTransformationResult(result);

            if (result.errors.length > 0 && result.credentials.length === 0) {
                onError(`Failed to parse credentials: ${result.errors.join(', ')}`);
            } else if (result.credentials.length > 0) {
                onCredentialsParsed(result.credentials);
            }

        } catch (error) {
            onError(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsProcessing(false);
        }
    }, [disabled, onCredentialsParsed, onError]);

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        setDragOver(false);

        const file = event.dataTransfer.files[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (event: React.DragEvent) => {
        event.preventDefault();
        setDragOver(false);
    };

    const removeFile = () => {
        setUploadedFile(null);
        setTransformationResult(null);
        setDetectedPlatform(null);
    };

    const downloadSampleData = (platform: 'upwork' | 'linkedin' | 'stripe') => {
        const sampleData = generateSampleData(platform);
        const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${platform}-sample-data.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Import from Web2 Platforms
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Upload JSON data exported from Upwork, LinkedIn, or Stripe to automatically create credentials.
            </Typography>

            {/* Sample Data Downloads */}
            <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                    Download Sample Data:
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => downloadSampleData('upwork')}
                        disabled={disabled}
                    >
                        Upwork Sample
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => downloadSampleData('linkedin')}
                        disabled={disabled}
                    >
                        LinkedIn Sample
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => downloadSampleData('stripe')}
                        disabled={disabled}
                    >
                        Stripe Sample
                    </Button>
                </Box>
            </Box>

            {/* File Upload Area */}
            {!uploadedFile ? (
                <Paper
                    sx={{
                        border: '2px dashed',
                        borderColor: dragOver ? 'primary.main' : 'grey.300',
                        borderRadius: 2,
                        p: 4,
                        textAlign: 'center',
                        bgcolor: dragOver ? 'action.hover' : 'background.paper',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        opacity: disabled ? 0.6 : 1,
                        transition: 'all 0.2s',
                    }}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => !disabled && document.getElementById('json-file-input')?.click()}
                >
                    <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        Drop JSON file here or click to browse
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Supports Upwork, LinkedIn, and Stripe data exports (max 5MB)
                    </Typography>
                    <Button
                        variant="contained"
                        component="span"
                        disabled={disabled}
                        startIcon={<UploadIcon />}
                    >
                        Choose File
                    </Button>
                    <input
                        id="json-file-input"
                        type="file"
                        hidden
                        accept=".json"
                        onChange={handleFileInputChange}
                        disabled={disabled}
                    />
                </Paper>
            ) : (
                <Paper sx={{ p: 3 }}>
                    {/* File Info */}
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Box display="flex" alignItems="center">
                            <FileIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Box>
                                <Typography variant="body1" fontWeight="medium">
                                    {uploadedFile.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                    {detectedPlatform && detectedPlatform !== 'unknown' && (
                                        <>
                                            {' • '}
                                            <Chip
                                                label={detectedPlatform.charAt(0).toUpperCase() + detectedPlatform.slice(1)}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </>
                                    )}
                                </Typography>
                            </Box>
                        </Box>
                        <IconButton onClick={removeFile} disabled={disabled || isProcessing}>
                            <DeleteIcon />
                        </IconButton>
                    </Box>

                    {/* Processing Indicator */}
                    {isProcessing && (
                        <Box mb={2}>
                            <Typography variant="body2" gutterBottom>
                                Processing file...
                            </Typography>
                            <LinearProgress />
                        </Box>
                    )}

                    {/* Transformation Results */}
                    {transformationResult && (
                        <Box>
                            {/* Summary */}
                            <Alert
                                severity={transformationResult.errors.length > 0 ? 'warning' : 'success'}
                                sx={{ mb: 2 }}
                            >
                                <Typography variant="body2">
                                    <strong>Parsed {transformationResult.summary.total} credentials:</strong>
                                    {' '}
                                    {transformationResult.summary.byType.skill > 0 && `${transformationResult.summary.byType.skill} skills, `}
                                    {transformationResult.summary.byType.review > 0 && `${transformationResult.summary.byType.review} reviews, `}
                                    {transformationResult.summary.byType.payment > 0 && `${transformationResult.summary.byType.payment} payments, `}
                                    {transformationResult.summary.byType.certification > 0 && `${transformationResult.summary.byType.certification} certifications`}
                                </Typography>
                            </Alert>

                            {/* Errors and Warnings */}
                            {(transformationResult.errors.length > 0 || transformationResult.warnings.length > 0) && (
                                <Accordion sx={{ mb: 2 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Box display="flex" alignItems="center">
                                            {transformationResult.errors.length > 0 && (
                                                <ErrorIcon sx={{ mr: 1, color: 'error.main' }} />
                                            )}
                                            {transformationResult.warnings.length > 0 && (
                                                <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
                                            )}
                                            <Typography>
                                                Issues Found ({transformationResult.errors.length + transformationResult.warnings.length})
                                            </Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {transformationResult.errors.length > 0 && (
                                            <>
                                                <Typography variant="subtitle2" color="error" gutterBottom>
                                                    Errors:
                                                </Typography>
                                                <List dense>
                                                    {transformationResult.errors.map((error, index) => (
                                                        <ListItem key={index}>
                                                            <ListItemIcon>
                                                                <ErrorIcon color="error" />
                                                            </ListItemIcon>
                                                            <ListItemText primary={error} />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </>
                                        )}

                                        {transformationResult.warnings.length > 0 && (
                                            <>
                                                {transformationResult.errors.length > 0 && <Divider sx={{ my: 1 }} />}
                                                <Typography variant="subtitle2" color="warning.main" gutterBottom>
                                                    Warnings:
                                                </Typography>
                                                <List dense>
                                                    {transformationResult.warnings.map((warning, index) => (
                                                        <ListItem key={index}>
                                                            <ListItemIcon>
                                                                <WarningIcon color="warning" />
                                                            </ListItemIcon>
                                                            <ListItemText primary={warning} />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </>
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                            )}

                            {/* Success Message */}
                            {transformationResult.credentials.length > 0 && (
                                <Alert severity="success" icon={<SuccessIcon />}>
                                    <Typography variant="body2">
                                        Ready to mint {transformationResult.credentials.length} credentials.
                                        Review the preview below and click "Start Batch Mint" to proceed.
                                    </Typography>
                                </Alert>
                            )}
                        </Box>
                    )}
                </Paper>
            )}
        </Box>
    );
}