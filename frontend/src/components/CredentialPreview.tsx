import { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    Grid,
    IconButton,
    Collapse,
    Divider,
    Avatar,
    Tooltip,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Work as WorkIcon,
    Reviews as ReviewsIcon,
    Payment as PaymentIcon,
    School as SchoolIcon,
    Star as StarIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Verified as VerifiedIcon,
} from '@mui/icons-material';
import type { CredentialMetadata } from '../utils/api';

interface CredentialPreviewProps {
    credentials: CredentialMetadata[];
    maxVisible?: number;
    showPlatformInfo?: boolean;
}

// Credential type configurations
const credentialTypeConfig = {
    skill: {
        label: 'Skill',
        icon: WorkIcon,
        color: '#2196f3',
        bgColor: '#e3f2fd',
    },
    review: {
        label: 'Review',
        icon: ReviewsIcon,
        color: '#4caf50',
        bgColor: '#e8f5e9',
    },
    payment: {
        label: 'Payment',
        icon: PaymentIcon,
        color: '#ff9800',
        bgColor: '#fff3e0',
    },
    certification: {
        label: 'Certification',
        icon: SchoolIcon,
        color: '#9c27b0',
        bgColor: '#f3e5f5',
    },
};

interface CredentialCardProps {
    credential: CredentialMetadata;
    index: number;
    showPlatformInfo?: boolean;
}

function CredentialCard({ credential, index, showPlatformInfo = false }: CredentialCardProps) {
    const [expanded, setExpanded] = useState(false);
    const config = credentialTypeConfig[credential.credential_type];
    const IconComponent = config.icon;

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return 'Invalid date';
        }
    };

    const getPlatformInfo = () => {
        if (!credential.metadata?.platform) return null;

        const platformNames = {
            upwork: 'Upwork',
            linkedin: 'LinkedIn',
            stripe: 'Stripe',
        };

        return platformNames[credential.metadata.platform as keyof typeof platformNames] || credential.metadata.platform;
    };

    return (
        <Card
            sx={{
                mb: 2,
                border: '1px solid',
                borderColor: 'grey.200',
                '&:hover': {
                    borderColor: config.color,
                    boxShadow: 2,
                },
                transition: 'all 0.2s',
            }}
        >
            <CardContent sx={{ pb: 1 }}>
                <Grid container spacing={2} alignItems="flex-start">
                    {/* Icon and Type */}
                    <Grid item xs="auto">
                        <Avatar
                            sx={{
                                bgcolor: config.bgColor,
                                color: config.color,
                                width: 40,
                                height: 40,
                            }}
                        >
                            <IconComponent />
                        </Avatar>
                    </Grid>

                    {/* Main Content */}
                    <Grid item xs>
                        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
                            <Box flex={1}>
                                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                    <Typography variant="h6" component="h3" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                                        {credential.name}
                                    </Typography>
                                    <Chip
                                        label={config.label}
                                        size="small"
                                        sx={{
                                            bgcolor: config.color,
                                            color: 'white',
                                            fontSize: '0.75rem',
                                            height: 20,
                                        }}
                                    />
                                    {showPlatformInfo && getPlatformInfo() && (
                                        <Chip
                                            label={getPlatformInfo()}
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontSize: '0.75rem', height: 20 }}
                                        />
                                    )}
                                </Box>

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    <strong>Issuer:</strong> {credential.issuer}
                                </Typography>

                                {/* Rating */}
                                {credential.rating && (
                                    <Box display="flex" alignItems="center" mb={1}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                            <strong>Rating:</strong>
                                        </Typography>
                                        {[...Array(5)].map((_, i) => (
                                            <StarIcon
                                                key={i}
                                                sx={{
                                                    fontSize: 16,
                                                    color: i < (credential.rating || 0) ? '#ffc107' : '#e0e0e0',
                                                }}
                                            />
                                        ))}
                                        <Typography variant="body2" sx={{ ml: 1 }}>
                                            {credential.rating}/5
                                        </Typography>
                                    </Box>
                                )}

                                {/* Visibility and Date */}
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Box display="flex" alignItems="center">
                                        {credential.visibility === 'public' ? (
                                            <Tooltip title="Public - visible in shared portfolios">
                                                <VisibilityIcon sx={{ fontSize: 16, mr: 0.5, color: 'success.main' }} />
                                            </Tooltip>
                                        ) : (
                                            <Tooltip title="Private - only visible to you">
                                                <VisibilityOffIcon sx={{ fontSize: 16, mr: 0.5, color: 'warning.main' }} />
                                            </Tooltip>
                                        )}
                                        <Typography variant="caption" color="text.secondary">
                                            {credential.visibility === 'public' ? 'Public' : 'Private'}
                                        </Typography>
                                    </Box>

                                    <Typography variant="caption" color="text.secondary">
                                        {formatDate(credential.timestamp)}
                                    </Typography>

                                    {credential.proof_hash && (
                                        <Tooltip title="Has proof document">
                                            <VerifiedIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                        </Tooltip>
                                    )}
                                </Box>
                            </Box>

                            {/* Expand Button */}
                            <IconButton
                                size="small"
                                onClick={() => setExpanded(!expanded)}
                                sx={{ ml: 1 }}
                            >
                                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                        </Box>
                    </Grid>
                </Grid>

                {/* Expanded Content */}
                <Collapse in={expanded}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" color="text.secondary" paragraph>
                        <strong>Description:</strong>
                    </Typography>
                    <Typography variant="body2" paragraph>
                        {credential.description}
                    </Typography>

                    {/* Additional Metadata */}
                    {credential.metadata && (
                        <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                <strong>Additional Information:</strong>
                            </Typography>
                            <Box component="pre" sx={{
                                fontSize: '0.75rem',
                                bgcolor: 'grey.50',
                                p: 1,
                                borderRadius: 1,
                                overflow: 'auto',
                                fontFamily: 'monospace',
                            }}>
                                {JSON.stringify(credential.metadata, null, 2)}
                            </Box>
                        </Box>
                    )}
                </Collapse>
            </CardContent>
        </Card>
    );
}

export function CredentialPreview({
    credentials,
    maxVisible = 10,
    showPlatformInfo = true
}: CredentialPreviewProps) {
    const [showAll, setShowAll] = useState(false);

    const visibleCredentials = showAll ? credentials : credentials.slice(0, maxVisible);
    const hasMore = credentials.length > maxVisible;

    // Group credentials by type for summary
    const summary = credentials.reduce((acc, cred) => {
        acc[cred.credential_type] = (acc[cred.credential_type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    if (credentials.length === 0) {
        return (
            <Box textAlign="center" py={4}>
                <Typography variant="body1" color="text.secondary">
                    No credentials to preview
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            {/* Summary Header */}
            <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                    Credential Preview ({credentials.length} total)
                </Typography>

                <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                    {Object.entries(summary).map(([type, count]) => {
                        const config = credentialTypeConfig[type as keyof typeof credentialTypeConfig];
                        return (
                            <Chip
                                key={type}
                                label={`${count} ${config.label}${count !== 1 ? 's' : ''}`}
                                size="small"
                                sx={{
                                    bgcolor: config.bgColor,
                                    color: config.color,
                                    fontWeight: 500,
                                }}
                            />
                        );
                    })}
                </Box>

                <Typography variant="body2" color="text.secondary">
                    Review the credentials below before minting. You can expand each card to see full details.
                </Typography>
            </Box>

            {/* Credential Cards */}
            <Box>
                {visibleCredentials.map((credential, index) => (
                    <CredentialCard
                        key={index}
                        credential={credential}
                        index={index}
                        showPlatformInfo={showPlatformInfo}
                    />
                ))}
            </Box>

            {/* Show More/Less Button */}
            {hasMore && (
                <Box textAlign="center" mt={2}>
                    <IconButton
                        onClick={() => setShowAll(!showAll)}
                        sx={{
                            border: '1px solid',
                            borderColor: 'grey.300',
                            '&:hover': {
                                borderColor: 'primary.main',
                            },
                        }}
                    >
                        {showAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                    <Typography variant="caption" display="block" mt={1} color="text.secondary">
                        {showAll ? 'Show Less' : `Show ${credentials.length - maxVisible} More`}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}