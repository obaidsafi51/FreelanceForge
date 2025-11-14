import { useState, useCallback } from 'react';
import {
    Box,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    Typography,
    Alert,
    CircularProgress,
    Paper,
    Divider,
    Chip,
    Grid,
    Card,
    CardContent,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    Upload as UploadIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Star as StarIcon,
    Work as WorkIcon,
    School as SchoolIcon,
    Payment as PaymentIcon,
    Reviews as ReviewsIcon,
    Preview as PreviewIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { CredentialMetadata } from '../utils/api';

// Form data interface
interface CredentialFormData {
    credential_type: 'skill' | 'review' | 'payment' | 'certification';
    name: string;
    description: string;
    issuer: string;
    rating?: number | null;
    visibility: 'public' | 'private';
}

// Validation schema using Yup
const credentialSchema = yup.object({
    credential_type: yup
        .string()
        .oneOf(['skill', 'review', 'payment', 'certification'], 'Invalid credential type')
        .required('Credential type is required'),
    name: yup
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name must be 100 characters or less')
        .required('Name is required'),
    description: yup
        .string()
        .min(1, 'Description is required')
        .max(500, 'Description must be 500 characters or less')
        .required('Description is required'),
    issuer: yup
        .string()
        .min(1, 'Issuer is required')
        .max(100, 'Issuer must be 100 characters or less')
        .required('Issuer is required'),
    rating: yup
        .number()
        .min(0, 'Rating must be between 0 and 5')
        .max(5, 'Rating must be between 0 and 5')
        .nullable()
        .optional()
        .transform((value, originalValue) => originalValue === '' ? null : value),
    visibility: yup
        .string()
        .oneOf(['public', 'private'], 'Invalid visibility setting')
        .required('Visibility is required'),
}) as yup.ObjectSchema<CredentialFormData>;

interface CredentialFormProps {
    onSubmit: (data: CredentialMetadata, proofFile?: File) => Promise<void>;
    isSubmitting?: boolean;
    onCancel?: () => void;
}

// Credential type configurations
const credentialTypes = {
    skill: {
        label: 'Skill',
        icon: WorkIcon,
        color: '#2196f3',
        description: 'Technical or professional skills',
        showRating: false,
    },
    review: {
        label: 'Review',
        icon: ReviewsIcon,
        color: '#4caf50',
        description: 'Client reviews and feedback',
        showRating: true,
    },
    payment: {
        label: 'Payment',
        icon: PaymentIcon,
        color: '#ff9800',
        description: 'Payment history and earnings',
        showRating: false,
    },
    certification: {
        label: 'Certification',
        icon: SchoolIcon,
        color: '#9c27b0',
        description: 'Professional certifications',
        showRating: false,
    },
};

export function CredentialForm({ onSubmit, isSubmitting = false, onCancel }: CredentialFormProps) {
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [proofFileError, setProofFileError] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors, isValid },
        reset,
    } = useForm<CredentialFormData>({
        resolver: yupResolver(credentialSchema),
        defaultValues: {
            credential_type: 'skill',
            name: '',
            description: '',
            issuer: '',
            rating: null,
            visibility: 'public',
        },
        mode: 'onChange',
    });

    const watchedValues = watch();
    const selectedType = credentialTypes[watchedValues.credential_type as keyof typeof credentialTypes];

    // File upload handling
    const handleFileUpload = useCallback((file: File) => {
        setProofFileError(null);

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setProofFileError('File size must be 5MB or less');
            return;
        }

        // Validate file type (allow common document types)
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (!allowedTypes.includes(file.type)) {
            setProofFileError('Unsupported file type. Please upload PDF, image, or document files.');
            return;
        }

        setProofFile(file);
    }, []);

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

    const removeProofFile = () => {
        setProofFile(null);
        setProofFileError(null);
    };

    // Calculate SHA256 hash of file
    const calculateFileHash = async (file: File): Promise<string> => {
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const onFormSubmit = async (data: CredentialFormData) => {
        try {
            let proof_hash: string | undefined;

            // Calculate proof hash if file is uploaded
            if (proofFile) {
                proof_hash = await calculateFileHash(proofFile);
            }

            // Prepare credential metadata
            const credentialData: CredentialMetadata = {
                credential_type: data.credential_type as 'skill' | 'review' | 'payment' | 'certification',
                name: data.name,
                description: data.description,
                issuer: data.issuer,
                rating: data.rating || undefined,
                timestamp: new Date().toISOString(),
                visibility: data.visibility as 'public' | 'private',
                proof_hash,
            };

            await onSubmit(credentialData, proofFile || undefined);

            // Reset form on success
            reset();
            setProofFile(null);
            setProofFileError(null);
            setShowPreview(false);
        } catch (error) {
            console.error('Form submission error:', error);
        }
    };

    const handleCancel = () => {
        reset();
        setProofFile(null);
        setProofFileError(null);
        setShowPreview(false);
        onCancel?.();
    };

    // Preview component
    const PreviewCard = () => (
        <Card sx={{ mt: 3, border: '2px solid', borderColor: 'primary.main' }}>
            <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                    <PreviewIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" color="primary">
                        Credential Preview
                    </Typography>
                </Box>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" mb={1}>
                            <selectedType.icon sx={{ mr: 1, color: selectedType.color }} />
                            <Chip
                                label={selectedType.label}
                                sx={{ bgcolor: selectedType.color, color: 'white' }}
                                size="small"
                            />
                        </Box>
                        <Typography variant="h6" gutterBottom>
                            {watchedValues.name || 'Credential Name'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            {watchedValues.description || 'Credential description will appear here...'}
                        </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Issuer:</strong> {watchedValues.issuer || 'Not specified'}
                        </Typography>
                        {selectedType.showRating && watchedValues.rating && (
                            <Box display="flex" alignItems="center" mt={1}>
                                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                    <strong>Rating:</strong>
                                </Typography>
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon
                                        key={i}
                                        sx={{
                                            fontSize: 16,
                                            color: i < (watchedValues.rating || 0) ? '#ffc107' : '#e0e0e0',
                                        }}
                                    />
                                ))}
                                <Typography variant="body2" sx={{ ml: 1 }}>
                                    {watchedValues.rating}/5
                                </Typography>
                            </Box>
                        )}
                        <Box display="flex" alignItems="center" mt={1}>
                            {watchedValues.visibility === 'public' ? (
                                <VisibilityIcon sx={{ fontSize: 16, mr: 0.5, color: 'success.main' }} />
                            ) : (
                                <VisibilityOffIcon sx={{ fontSize: 16, mr: 0.5, color: 'warning.main' }} />
                            )}
                            <Typography variant="body2" color="text.secondary">
                                {watchedValues.visibility === 'public' ? 'Public' : 'Private'}
                            </Typography>
                        </Box>
                        {proofFile && (
                            <Typography variant="body2" color="text.secondary" mt={1}>
                                <strong>Proof Document:</strong> {proofFile.name}
                            </Typography>
                        )}
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );

    return (
        <Box component="form" onSubmit={handleSubmit(onFormSubmit)}>
            {/* Credential Type Selection */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Credential Type
                </Typography>
                <Controller
                    name="credential_type"
                    control={control}
                    render={({ field }) => (
                        <FormControl fullWidth error={!!errors.credential_type}>
                            <InputLabel>Type</InputLabel>
                            <Select {...field} label="Type">
                                {Object.entries(credentialTypes).map(([key, config]) => (
                                    <MenuItem key={key} value={key}>
                                        <Box display="flex" alignItems="center">
                                            <config.icon sx={{ mr: 1, color: config.color }} />
                                            <Box>
                                                <Typography variant="body1">{config.label}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {config.description}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.credential_type && (
                                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                                    {errors.credential_type.message}
                                </Typography>
                            )}
                        </FormControl>
                    )}
                />
            </Paper>

            {/* Basic Information */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Basic Information
                </Typography>

                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Credential Name"
                                    placeholder="e.g., React.js Development, 5-Star Client Review"
                                    error={!!errors.name}
                                    helperText={errors.name?.message || `${field.value.length}/100 characters`}
                                    inputProps={{ maxLength: 100 }}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Description"
                                    placeholder="Provide detailed information about this credential..."
                                    error={!!errors.description}
                                    helperText={errors.description?.message || `${field.value.length}/500 characters`}
                                    inputProps={{ maxLength: 500 }}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Controller
                            name="issuer"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Issuer"
                                    placeholder="e.g., Upwork, LinkedIn, Company Name"
                                    error={!!errors.issuer}
                                    helperText={errors.issuer?.message || `${field.value.length}/100 characters`}
                                    inputProps={{ maxLength: 100 }}
                                />
                            )}
                        />
                    </Grid>

                    {selectedType.showRating && (
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="rating"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        type="number"
                                        label="Rating"
                                        placeholder="0-5"
                                        error={!!errors.rating}
                                        helperText={errors.rating?.message || 'Optional rating (0-5 stars)'}
                                        inputProps={{ min: 0, max: 5, step: 0.1 }}
                                        value={field.value || ''}
                                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                                    />
                                )}
                            />
                        </Grid>
                    )}
                </Grid>
            </Paper>

            {/* Proof Document Upload */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Proof Document (Optional)
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Upload supporting documents for verification. Only the document hash will be stored on-chain.
                </Typography>

                {!proofFile ? (
                    <Box
                        sx={{
                            border: '2px dashed',
                            borderColor: dragOver ? 'primary.main' : 'grey.300',
                            borderRadius: 1,
                            p: 3,
                            textAlign: 'center',
                            bgcolor: dragOver ? 'action.hover' : 'background.paper',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => document.getElementById('proof-file-input')?.click()}
                    >
                        <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body1" gutterBottom>
                            Drop files here or click to browse
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Supports PDF, images, and documents (max 5MB)
                        </Typography>
                        <input
                            id="proof-file-input"
                            type="file"
                            hidden
                            onChange={handleFileInputChange}
                            accept=".pdf,.jpg,.jpeg,.png,.gif,.txt,.doc,.docx"
                        />
                    </Box>
                ) : (
                    <Box
                        sx={{
                            border: '1px solid',
                            borderColor: 'success.main',
                            borderRadius: 1,
                            p: 2,
                            bgcolor: 'success.50',
                        }}
                    >
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box>
                                <Typography variant="body2" fontWeight="medium">
                                    {proofFile.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {(proofFile.size / 1024 / 1024).toFixed(2)} MB
                                </Typography>
                            </Box>
                            <Tooltip title="Remove file">
                                <IconButton onClick={removeProofFile} size="small">
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                )}

                {proofFileError && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {proofFileError}
                    </Alert>
                )}
            </Paper>

            {/* Privacy Settings */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Privacy Settings
                </Typography>

                <Controller
                    name="visibility"
                    control={control}
                    render={({ field }) => (
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={field.value === 'public'}
                                    onChange={(e) => field.onChange(e.target.checked ? 'public' : 'private')}
                                    color="primary"
                                />
                            }
                            label={
                                <Box display="flex" alignItems="center">
                                    {field.value === 'public' ? (
                                        <VisibilityIcon sx={{ mr: 1, color: 'success.main' }} />
                                    ) : (
                                        <VisibilityOffIcon sx={{ mr: 1, color: 'warning.main' }} />
                                    )}
                                    <Box>
                                        <Typography variant="body2">
                                            {field.value === 'public' ? 'Public' : 'Private'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {field.value === 'public'
                                                ? 'Visible in shared portfolios and exports'
                                                : 'Only visible to you'
                                            }
                                        </Typography>
                                    </Box>
                                </Box>
                            }
                        />
                    )}
                />
            </Paper>

            {/* Preview Toggle */}
            <Box display="flex" justifyContent="center" mb={2}>
                <Button
                    variant="outlined"
                    startIcon={<PreviewIcon />}
                    onClick={() => setShowPreview(!showPreview)}
                    disabled={!isValid}
                >
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                </Button>
            </Box>

            {/* Preview */}
            {showPreview && isValid && <PreviewCard />}

            <Divider sx={{ my: 3 }} />

            {/* Action Buttons */}
            <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={!isValid || isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
                >
                    {isSubmitting ? 'Minting...' : 'Mint Credential'}
                </Button>
            </Box>
        </Box>
    );
}