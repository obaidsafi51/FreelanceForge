import React, { useState, useMemo, useCallback } from 'react';
import {
    Card,
    CardContent,
    Box,
    Typography,
    Chip,
    Rating,
    Avatar,
    IconButton,
    Collapse,
    Divider,
    Stack,
    Tooltip,
    useTheme,
    alpha,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Code as SkillIcon,
    Star as ReviewIcon,
    Payment as PaymentIcon,
    School as CertificationIcon,
    Verified as VerifiedIcon,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { VisibilityToggle } from './VisibilityToggle';
import { usePerformanceMonitor } from '../utils/performance';
import { safeParseDate, isRecentDate } from '../utils/dateUtils';
import type { Credential } from '../types';

interface CredentialCardProps {
    credential: Credential;
    showTimeline?: boolean;
    walletAddress?: string;
    showVisibilityToggle?: boolean;
}

// Memoized credential card component for performance
export const CredentialCard = React.memo(function CredentialCard({
    credential,
    showTimeline = false,
    walletAddress,
    showVisibilityToggle = false
}: CredentialCardProps) {
    const [expanded, setExpanded] = useState(false);
    const theme = useTheme();

    // Early return if credential is invalid
    if (!credential || typeof credential !== 'object') {
        console.warn('CredentialCard received invalid credential:', credential);
        return null;
    }

    // Debug logging for credential data
    if (!credential.name || credential.name.trim() === '') {
        console.warn('CredentialCard received credential with empty name:', credential);
    }

    // Performance monitoring
    usePerformanceMonitor('CredentialCard', [credential.id, expanded]);

    const handleExpandClick = useCallback(() => {
        setExpanded(!expanded);
    }, [expanded]);

    // Memoized credential type configuration
    const config = useMemo(() => {
        const getCredentialConfig = (type: string) => {
            switch (type) {
                case 'skill':
                    return {
                        icon: <SkillIcon />,
                        color: theme.palette.primary.main,
                        bgColor: alpha(theme.palette.primary.main, 0.1),
                        label: 'Skill',
                    };
                case 'review':
                    return {
                        icon: <ReviewIcon />,
                        color: theme.palette.success.main,
                        bgColor: alpha(theme.palette.success.main, 0.1),
                        label: 'Review',
                    };
                case 'payment':
                    return {
                        icon: <PaymentIcon />,
                        color: theme.palette.warning.main,
                        bgColor: alpha(theme.palette.warning.main, 0.1),
                        label: 'Payment',
                    };
                case 'certification':
                    return {
                        icon: <CertificationIcon />,
                        color: theme.palette.secondary.main,
                        bgColor: alpha(theme.palette.secondary.main, 0.1),
                        label: 'Certification',
                    };
                default:
                    return {
                        icon: <SkillIcon />,
                        color: theme.palette.grey[500],
                        bgColor: alpha(theme.palette.grey[500], 0.1),
                        label: 'Unknown',
                    };
            }
        };
        return getCredentialConfig(credential.credential_type || 'skill');
    }, [credential.credential_type, theme]);

    // Memoized date calculations with error handling
    const { credentialDate, isRecent, formattedDate, relativeDate } = useMemo(() => {
        const date = safeParseDate(credential.timestamp);
        const recent = isRecentDate(credential.timestamp, 7);

        // Check if we got a fallback date (current date) due to invalid timestamp
        const isValidTimestamp = credential.timestamp &&
            (typeof credential.timestamp === 'string' || typeof credential.timestamp === 'number') &&
            !isNaN(safeParseDate(credential.timestamp).getTime());

        return {
            credentialDate: date,
            isRecent: recent,
            formattedDate: isValidTimestamp ? format(date, 'PPP') : 'Unknown date',
            relativeDate: isValidTimestamp ? formatDistanceToNow(date, { addSuffix: true }) : 'Unknown time',
        };
    }, [credential.timestamp]);

    // Memoized description truncation check
    const shouldShowExpandButton = useMemo(() => {
        return credential.description && credential.description.length > 100;
    }, [credential.description]);

    return (
        <Box position="relative">
            {/* Timeline connector */}
            {showTimeline && (
                <Box
                    position="absolute"
                    left={24}
                    top={80}
                    bottom={-16}
                    width={2}
                    bgcolor="divider"
                    zIndex={0}
                />
            )}

            <Card
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, border-color 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[8],
                        '& .credential-actions': {
                            opacity: 1,
                        },
                    },
                    border: `1px solid ${theme.palette.divider}`,
                    borderLeft: `4px solid ${config.color}`,
                }}
            >
                <CardContent sx={{ pb: expanded ? 1 : 2 }}>
                    <Box display="flex" alignItems="flex-start" gap={2}>
                        {/* Timeline dot and icon */}
                        <Box position="relative">
                            <Avatar
                                sx={{
                                    bgcolor: config.bgColor,
                                    color: config.color,
                                    width: 48,
                                    height: 48,
                                }}
                            >
                                {config.icon}
                            </Avatar>
                            {isRecent && (
                                <Box
                                    position="absolute"
                                    top={-2}
                                    right={-2}
                                    width={12}
                                    height={12}
                                    bgcolor="success.main"
                                    borderRadius="50%"
                                    border={`2px solid ${theme.palette.background.paper}`}
                                />
                            )}
                        </Box>

                        {/* Main content */}
                        <Box flex={1} minWidth={0}>
                            <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
                                <Box flex={1} minWidth={0}>
                                    <Typography variant="h6" component="h3" noWrap>
                                        {credential.name?.trim() || 'Unnamed Credential'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" noWrap>
                                        Issued by {credential.issuer?.trim() || 'Unknown Issuer'}
                                    </Typography>
                                </Box>

                                {/* Actions (visible on hover) */}
                                <Box
                                    className="credential-actions"
                                    sx={{
                                        opacity: showVisibilityToggle ? 1 : 0,
                                        transition: 'opacity 0.2s ease-in-out',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                    }}
                                >
                                    {showVisibilityToggle && walletAddress && (
                                        <VisibilityToggle
                                            credential={credential}
                                            walletAddress={walletAddress}
                                            size="small"
                                        />
                                    )}
                                    {credential.proof_hash && (
                                        <Tooltip title="Verified with proof document">
                                            <VerifiedIcon color="success" fontSize="small" />
                                        </Tooltip>
                                    )}
                                </Box>
                            </Box>

                            {/* Metadata row */}
                            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" mb={1}>
                                <Chip
                                    label={config.label}
                                    size="small"
                                    sx={{
                                        bgcolor: config.bgColor,
                                        color: config.color,
                                        fontWeight: 'medium',
                                    }}
                                />

                                {credential.rating && (
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                        <Rating
                                            value={credential.rating}
                                            readOnly
                                            size="small"
                                            precision={0.1}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            ({credential.rating ? credential.rating.toFixed(1) : '0.0'})
                                        </Typography>
                                    </Box>
                                )}

                                <Typography variant="caption" color="text.secondary">
                                    {relativeDate}
                                </Typography>
                            </Stack>

                            {/* Description preview */}
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: expanded ? 'none' : 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    lineHeight: 1.4,
                                }}
                            >
                                {credential.description?.trim() || 'No description available'}
                            </Typography>

                            {/* Expand button */}
                            {shouldShowExpandButton && (
                                <Box display="flex" justifyContent="center" mt={1}>
                                    <IconButton
                                        onClick={handleExpandClick}
                                        size="small"
                                        sx={{
                                            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.3s ease-in-out',
                                        }}
                                    >
                                        <ExpandMoreIcon />
                                    </IconButton>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    {/* Expanded content */}
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <Divider sx={{ my: 2 }} />
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Details
                            </Typography>
                            <Stack spacing={1}>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">
                                        Credential ID:
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        fontFamily="monospace"
                                        sx={{ wordBreak: 'break-all' }}
                                    >
                                        {credential.id ? credential.id.slice(0, 16) + '...' : 'Unknown ID'}
                                    </Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">
                                        Created:
                                    </Typography>
                                    <Typography variant="body2">
                                        {formattedDate}
                                    </Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2" color="text.secondary">
                                        Visibility:
                                    </Typography>
                                    <Chip
                                        label={credential.visibility || 'public'}
                                        size="small"
                                        color={(credential.visibility || 'public') === 'public' ? 'success' : 'default'}
                                    />
                                </Box>
                                {credential.proof_hash && (
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body2" color="text.secondary">
                                            Proof Hash:
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            fontFamily="monospace"
                                            sx={{ wordBreak: 'break-all' }}
                                        >
                                            {credential.proof_hash ? credential.proof_hash.slice(0, 16) + '...' : 'No hash'}
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        </Box>
                    </Collapse>
                </CardContent>
            </Card>
        </Box>
    );
});