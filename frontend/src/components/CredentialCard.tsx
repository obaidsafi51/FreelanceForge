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
        return getCredentialConfig(credential.credential_type);
    }, [credential.credential_type, theme]);

    // Memoized date calculations
    const { credentialDate, isRecent, formattedDate, relativeDate } = useMemo(() => {
        const date = new Date(credential.timestamp);
        const recent = Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000; // 7 days
        return {
            credentialDate: date,
            isRecent: recent,
            formattedDate: format(date, 'PPP'),
            relativeDate: formatDistanceToNow(date, { addSuffix: true }),
        };
    }, [credential.timestamp]);

    // Memoized description truncation check
    const shouldShowExpandButton = useMemo(() => {
        return credential.description.length > 100;
    }, [credential.description.length]);

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
                    transition: 'all 0.3s ease-in-out',
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
                                        {credential.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" noWrap>
                                        Issued by {credential.issuer}
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
                                            ({credential.rating.toFixed(1)})
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
                                {credential.description}
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
                                        {credential.id.slice(0, 16)}...
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
                                        label={credential.visibility}
                                        size="small"
                                        color={credential.visibility === 'public' ? 'success' : 'default'}
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
                                            {credential.proof_hash.slice(0, 16)}...
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