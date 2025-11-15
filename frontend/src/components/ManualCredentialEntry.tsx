import { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    Grid,
    Paper,
    IconButton,
    Alert,
    Divider,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Clear as ClearIcon,
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { CredentialMetadata } from '../utils/api';

// Form data interface for manual entry
interface ManualCredentialFormData {
    credentials: Array<{
        credential_type: 'skill' | 'review' | 'payment' | 'certification';
        name: string;
        description: string;
        issuer: string;
        rating?: number | null;
        visibility: 'public' | 'private';
    }>;
}

// Validation schema
const manualCredentialSchema = yup.object({
    credentials: yup.array().of(
        yup.object({
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
        })
    ).min(1, 'At least one credential is required'),
}) as yup.ObjectSchema<ManualCredentialFormData>;

interface ManualCredentialEntryProps {
    onCredentialsCreated: (credentials: CredentialMetadata[]) => void;
    onError: (error: string) => void;
    disabled?: boolean;
}

// Credential type configurations
const credentialTypes = {
    skill: {
        label: 'Skill',
        description: 'Technical or professional skills',
        showRating: false,
    },
    review: {
        label: 'Review',
        description: 'Client reviews and feedback',
        showRating: true,
    },
    payment: {
        label: 'Payment',
        description: 'Payment history and earnings',
        showRating: false,
    },
    certification: {
        label: 'Certification',
        description: 'Professional certifications',
        showRating: false,
    },
};

export function ManualCredentialEntry({
    onCredentialsCreated,
    onError,
    disabled = false
}: ManualCredentialEntryProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isValid },
    } = useForm<ManualCredentialFormData>({
        resolver: yupResolver(manualCredentialSchema),
        defaultValues: {
            credentials: [{
                credential_type: 'skill',
                name: '',
                description: '',
                issuer: '',
                rating: null,
                visibility: 'public',
            }],
        },
        mode: 'onChange',
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'credentials',
    });

    const watchedCredentials = watch('credentials');

    const onSubmit = async (data: ManualCredentialFormData) => {
        if (disabled) return;

        setIsSubmitting(true);
        try {
            // Convert form data to CredentialMetadata format
            const credentials: CredentialMetadata[] = data.credentials.map(cred => ({
                credential_type: cred.credential_type,
                name: cred.name,
                description: cred.description,
                issuer: cred.issuer,
                rating: cred.rating || undefined,
                timestamp: new Date().toISOString(),
                visibility: cred.visibility,
                metadata: {
                    platform: 'manual',
                },
            }));

            onCredentialsCreated(credentials);

            // Reset form
            reset({
                credentials: [{
                    credential_type: 'skill',
                    name: '',
                    description: '',
                    issuer: '',
                    rating: null,
                    visibility: 'public',
                }],
            });
        } catch (error) {
            onError(error instanceof Error ? error.message : 'Failed to create credentials');
        } finally {
            setIsSubmitting(false);
        }
    };

    const addCredential = () => {
        append({
            credential_type: 'skill',
            name: '',
            description: '',
            issuer: '',
            rating: null,
            visibility: 'public',
        });
    };

    const clearAll = () => {
        reset({
            credentials: [{
                credential_type: 'skill',
                name: '',
                description: '',
                issuer: '',
                rating: null,
                visibility: 'public',
            }],
        });
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Manual Credential Entry
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Manually create credentials by filling out the form below. You can add multiple credentials at once.
            </Typography>

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                {/* Credentials List */}
                {fields.map((field, index) => {
                    const credentialType = watchedCredentials[index]?.credential_type;
                    const typeConfig = credentialTypes[credentialType as keyof typeof credentialTypes];

                    return (
                        <Paper key={field.id} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'grey.200' }}>
                            <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
                                <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
                                    Credential {index + 1}
                                </Typography>
                                {fields.length > 1 && (
                                    <IconButton
                                        onClick={() => remove(index)}
                                        color="error"
                                        disabled={disabled || isSubmitting}
                                        sx={{ ml: 'auto' }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                )}
                            </Box>

                            <Grid container spacing={2}>
                                {/* Credential Type */}
                                <Grid item xs={12} sm={6}>
                                    <Controller
                                        name={`credentials.${index}.credential_type`}
                                        control={control}
                                        render={({ field: controllerField }) => (
                                            <FormControl fullWidth error={!!errors.credentials?.[index]?.credential_type}>
                                                <InputLabel>Type</InputLabel>
                                                <Select {...controllerField} label="Type" disabled={disabled || isSubmitting}>
                                                    {Object.entries(credentialTypes).map(([key, config]) => (
                                                        <MenuItem key={key} value={key}>
                                                            <Box>
                                                                <Typography variant="body1">{config.label}</Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {config.description}
                                                                </Typography>
                                                            </Box>
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                {errors.credentials?.[index]?.credential_type && (
                                                    <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                                                        {errors.credentials[index]?.credential_type?.message}
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        )}
                                    />
                                </Grid>

                                {/* Visibility */}
                                <Grid item xs={12} sm={6}>
                                    <Controller
                                        name={`credentials.${index}.visibility`}
                                        control={control}
                                        render={({ field: controllerField }) => (
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={controllerField.value === 'public'}
                                                        onChange={(e) => controllerField.onChange(e.target.checked ? 'public' : 'private')}
                                                        disabled={disabled || isSubmitting}
                                                    />
                                                }
                                                label={controllerField.value === 'public' ? 'Public' : 'Private'}
                                                sx={{ mt: 1 }}
                                            />
                                        )}
                                    />
                                </Grid>

                                {/* Name */}
                                <Grid item xs={12}>
                                    <Controller
                                        name={`credentials.${index}.name`}
                                        control={control}
                                        render={({ field: controllerField }) => (
                                            <TextField
                                                {...controllerField}
                                                fullWidth
                                                label="Credential Name"
                                                placeholder="e.g., React.js Development, 5-Star Client Review"
                                                error={!!errors.credentials?.[index]?.name}
                                                helperText={
                                                    errors.credentials?.[index]?.name?.message ||
                                                    `${controllerField.value.length}/100 characters`
                                                }
                                                inputProps={{ maxLength: 100 }}
                                                disabled={disabled || isSubmitting}
                                            />
                                        )}
                                    />
                                </Grid>

                                {/* Description */}
                                <Grid item xs={12}>
                                    <Controller
                                        name={`credentials.${index}.description`}
                                        control={control}
                                        render={({ field: controllerField }) => (
                                            <TextField
                                                {...controllerField}
                                                fullWidth
                                                multiline
                                                rows={3}
                                                label="Description"
                                                placeholder="Provide detailed information about this credential..."
                                                error={!!errors.credentials?.[index]?.description}
                                                helperText={
                                                    errors.credentials?.[index]?.description?.message ||
                                                    `${controllerField.value.length}/500 characters`
                                                }
                                                inputProps={{ maxLength: 500 }}
                                                disabled={disabled || isSubmitting}
                                            />
                                        )}
                                    />
                                </Grid>

                                {/* Issuer and Rating */}
                                <Grid item xs={12} sm={typeConfig?.showRating ? 8 : 12}>
                                    <Controller
                                        name={`credentials.${index}.issuer`}
                                        control={control}
                                        render={({ field: controllerField }) => (
                                            <TextField
                                                {...controllerField}
                                                fullWidth
                                                label="Issuer"
                                                placeholder="e.g., Company Name, Client Name, Platform"
                                                error={!!errors.credentials?.[index]?.issuer}
                                                helperText={
                                                    errors.credentials?.[index]?.issuer?.message ||
                                                    `${controllerField.value.length}/100 characters`
                                                }
                                                inputProps={{ maxLength: 100 }}
                                                disabled={disabled || isSubmitting}
                                            />
                                        )}
                                    />
                                </Grid>

                                {typeConfig?.showRating && (
                                    <Grid item xs={12} sm={4}>
                                        <Controller
                                            name={`credentials.${index}.rating`}
                                            control={control}
                                            render={({ field: controllerField }) => (
                                                <TextField
                                                    {...controllerField}
                                                    fullWidth
                                                    type="number"
                                                    label="Rating"
                                                    placeholder="0-5"
                                                    error={!!errors.credentials?.[index]?.rating}
                                                    helperText={
                                                        errors.credentials?.[index]?.rating?.message ||
                                                        'Optional rating (0-5 stars)'
                                                    }
                                                    inputProps={{ min: 0, max: 5, step: 0.1 }}
                                                    value={controllerField.value || ''}
                                                    onChange={(e) => controllerField.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                                                    disabled={disabled || isSubmitting}
                                                />
                                            )}
                                        />
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>
                    );
                })}

                {/* Add More Button */}
                <Box display="flex" gap={2} mb={3}>
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={addCredential}
                        disabled={disabled || isSubmitting || fields.length >= 20}
                    >
                        Add Another Credential
                    </Button>

                    {fields.length > 1 && (
                        <Button
                            variant="outlined"
                            color="warning"
                            startIcon={<ClearIcon />}
                            onClick={clearAll}
                            disabled={disabled || isSubmitting}
                        >
                            Clear All
                        </Button>
                    )}
                </Box>

                {/* Validation Errors */}
                {errors.credentials && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            Please fix the following errors:
                        </Typography>
                        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                            {Object.entries(errors.credentials).map(([index, credError]) => (
                                <li key={index}>
                                    <strong>Credential {parseInt(index) + 1}:</strong>{' '}
                                    {Object.values(credError || {}).map(error => error?.message).filter(Boolean).join(', ')}
                                </li>
                            ))}
                        </ul>
                    </Alert>
                )}

                <Divider sx={{ my: 3 }} />

                {/* Submit Button */}
                <Box display="flex" justifyContent="flex-end">
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={!isValid || disabled || isSubmitting || fields.length === 0}
                        sx={{ minWidth: 200 }}
                    >
                        {isSubmitting ? 'Creating...' : `Create ${fields.length} Credential${fields.length !== 1 ? 's' : ''}`}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}