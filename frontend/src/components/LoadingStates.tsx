import React from 'react';
import {
    Box,
    Skeleton,
    Typography,
    CircularProgress,
    Card,
    CardContent,
    Grid,
    Stack,
    useTheme,
    keyframes,
    LinearProgress,
} from '@mui/material';
import {
    CloudOff as CloudOffIcon,
    Refresh as RefreshIcon,
    HourglassEmpty as HourglassIcon,
} from '@mui/icons-material';

// Pulse animation for loading states
const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
`;

// Bounce animation for icons
const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

interface LoadingSpinnerProps {
    size?: number;
    message?: string;
    fullScreen?: boolean;
}

export function LoadingSpinner({
    size = 40,
    message = 'Loading...',
    fullScreen = false
}: LoadingSpinnerProps) {
    const theme = useTheme();

    const content = (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={2}
            p={3}
        >
            <CircularProgress
                size={size}
                thickness={4}
                sx={{
                    color: theme.palette.primary.main,
                    animation: `${pulse} 2s ease-in-out infinite`,
                }}
            />
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                    animation: `${pulse} 2s ease-in-out infinite`,
                    animationDelay: '0.5s',
                }}
            >
                {message}
            </Typography>
        </Box>
    );

    if (fullScreen) {
        return (
            <Box
                position="fixed"
                top={0}
                left={0}
                right={0}
                bottom={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
                bgcolor="background.default"
                zIndex={9999}
            >
                {content}
            </Box>
        );
    }

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight={200}
        >
            {content}
        </Box>
    );
}

interface SkeletonCardProps {
    count?: number;
    showAvatar?: boolean;
    showActions?: boolean;
}

export function SkeletonCard({
    count = 1,
    showAvatar = true,
    showActions = true
}: SkeletonCardProps) {
    return (
        <Stack spacing={2}>
            {Array.from({ length: count }).map((_, index) => (
                <Card key={index} sx={{ animation: `${pulse} 2s ease-in-out infinite` }}>
                    <CardContent>
                        <Box display="flex" alignItems="flex-start" gap={2}>
                            {showAvatar && (
                                <Skeleton
                                    variant="circular"
                                    width={48}
                                    height={48}
                                    sx={{ flexShrink: 0 }}
                                />
                            )}
                            <Box flex={1}>
                                <Skeleton
                                    variant="text"
                                    width="60%"
                                    height={28}
                                    sx={{ mb: 1 }}
                                />
                                <Skeleton
                                    variant="text"
                                    width="100%"
                                    height={20}
                                    sx={{ mb: 1 }}
                                />
                                <Skeleton
                                    variant="text"
                                    width="80%"
                                    height={20}
                                    sx={{ mb: 2 }}
                                />
                                <Box display="flex" gap={1} mb={2}>
                                    <Skeleton variant="rounded" width={80} height={24} />
                                    <Skeleton variant="rounded" width={60} height={24} />
                                </Box>
                                {showActions && (
                                    <Box display="flex" gap={1}>
                                        <Skeleton variant="rounded" width={100} height={32} />
                                        <Skeleton variant="rounded" width={80} height={32} />
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            ))}
        </Stack>
    );
}

interface SkeletonTimelineProps {
    count?: number;
}

export function SkeletonTimeline({ count = 5 }: SkeletonTimelineProps) {
    return (
        <Box>
            {/* Timeline controls skeleton */}
            <Card sx={{ mb: 3, animation: `${pulse} 2s ease-in-out infinite` }}>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={4}>
                            <Skeleton variant="rounded" height={40} />
                        </Grid>
                        <Grid item xs={6} sm={3} md={2}>
                            <Skeleton variant="rounded" height={40} />
                        </Grid>
                        <Grid item xs={6} sm={3} md={2}>
                            <Skeleton variant="rounded" height={40} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Skeleton variant="rounded" height={40} />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Timeline items skeleton */}
            <SkeletonCard count={count} showAvatar={true} showActions={true} />
        </Box>
    );
}

interface SkeletonDashboardProps { }

export function SkeletonDashboard({ }: SkeletonDashboardProps) {
    return (
        <Box p={3}>
            <Grid container spacing={3}>
                {/* Header skeleton */}
                <Grid item xs={12}>
                    <Skeleton
                        variant="text"
                        width="40%"
                        height={40}
                        sx={{ mb: 1 }}
                    />
                    <Skeleton
                        variant="text"
                        width="60%"
                        height={24}
                    />
                </Grid>

                {/* Trust score widget skeleton */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ animation: `${pulse} 2s ease-in-out infinite` }}>
                        <CardContent sx={{ textAlign: 'center', p: 3 }}>
                            <Skeleton
                                variant="text"
                                width="60%"
                                height={28}
                                sx={{ mx: 'auto', mb: 2 }}
                            />
                            <Skeleton
                                variant="circular"
                                width={120}
                                height={120}
                                sx={{ mx: 'auto', mb: 2 }}
                            />
                            <Skeleton
                                variant="rounded"
                                width={100}
                                height={32}
                                sx={{ mx: 'auto', mb: 2 }}
                            />
                            <Stack spacing={1}>
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <Box key={index} display="flex" justifyContent="space-between">
                                        <Skeleton variant="text" width="60%" height={20} />
                                        <Skeleton variant="text" width="20%" height={20} />
                                    </Box>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Timeline skeleton */}
                <Grid item xs={12} md={8}>
                    <SkeletonTimeline count={3} />
                </Grid>
            </Grid>
        </Box>
    );
}

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description: string;
    action?: React.ReactNode;
    illustration?: boolean;
}

export function EmptyState({
    icon,
    title,
    description,
    action,
    illustration = true
}: EmptyStateProps) {
    const theme = useTheme();

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            py={6}
            px={3}
        >
            {illustration && (
                <Box
                    sx={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        backgroundColor: theme.palette.action.hover,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                        animation: `${bounce} 2s ease-in-out infinite`,
                    }}
                >
                    {icon || (
                        <HourglassIcon
                            sx={{
                                fontSize: 48,
                                color: theme.palette.text.secondary,
                            }}
                        />
                    )}
                </Box>
            )}

            <Typography
                variant="h6"
                color="text.primary"
                gutterBottom
                sx={{ fontWeight: 600 }}
            >
                {title}
            </Typography>

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                    maxWidth: 400,
                    mb: action ? 3 : 0,
                    lineHeight: 1.6,
                }}
            >
                {description}
            </Typography>

            {action && action}
        </Box>
    );
}

interface ErrorStateProps {
    title?: string;
    message: string;
    onRetry?: () => void;
    showRetryButton?: boolean;
    severity?: 'error' | 'warning' | 'info';
}

export function ErrorState({
    title = 'Something went wrong',
    message,
    onRetry,
    showRetryButton = true,
    severity = 'error'
}: ErrorStateProps) {
    const theme = useTheme();

    const getErrorColor = () => {
        switch (severity) {
            case 'warning':
                return theme.palette.warning.main;
            case 'info':
                return theme.palette.info.main;
            default:
                return theme.palette.error.main;
        }
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            py={6}
            px={3}
        >
            <Box
                sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    backgroundColor: `${getErrorColor()}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    animation: `${bounce} 2s ease-in-out infinite`,
                }}
            >
                <CloudOffIcon
                    sx={{
                        fontSize: 48,
                        color: getErrorColor(),
                    }}
                />
            </Box>

            <Typography
                variant="h6"
                color="text.primary"
                gutterBottom
                sx={{ fontWeight: 600 }}
            >
                {title}
            </Typography>

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                    maxWidth: 400,
                    mb: showRetryButton && onRetry ? 3 : 0,
                    lineHeight: 1.6,
                }}
            >
                {message}
            </Typography>

            {showRetryButton && onRetry && (
                <Box
                    component="button"
                    onClick={onRetry}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 3,
                        py: 1.5,
                        border: `2px solid ${getErrorColor()}`,
                        borderRadius: 2,
                        backgroundColor: 'transparent',
                        color: getErrorColor(),
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            backgroundColor: `${getErrorColor()}10`,
                            transform: 'translateY(-1px)',
                        },
                        '&:active': {
                            transform: 'translateY(0)',
                        },
                        '&:focus-visible': {
                            outline: `2px solid ${getErrorColor()}`,
                            outlineOffset: '2px',
                        },
                    }}
                >
                    <RefreshIcon sx={{ fontSize: 18 }} />
                    Try Again
                </Box>
            )}
        </Box>
    );
}

// Specialized loading states for different components
export function CredentialCardSkeleton() {
    return <SkeletonCard count={1} showAvatar={true} showActions={true} />;
}

export function TrustScoreWidgetSkeleton() {
    return (
        <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Skeleton
                    variant="text"
                    width="60%"
                    height={28}
                    sx={{ mx: 'auto', mb: 2 }}
                />
                <Skeleton
                    variant="circular"
                    width={120}
                    height={120}
                    sx={{ mx: 'auto', mb: 2 }}
                />
                <Skeleton
                    variant="rounded"
                    width={100}
                    height={32}
                    sx={{ mx: 'auto', mb: 2 }}
                />
                <Stack spacing={1}>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Box key={index} display="flex" justifyContent="space-between">
                            <Skeleton variant="text" width="60%" height={20} />
                            <Skeleton variant="text" width="20%" height={20} />
                        </Box>
                    ))}
                </Stack>
            </CardContent>
        </Card>
    );
}

// Additional specialized components for compatibility
export const CredentialTimelineSkeleton = SkeletonTimeline;
export const DashboardSkeleton = SkeletonDashboard;

// Placeholder components for missing exports
export function BatchProgress({ current, total }: { current: number; total: number }) {
    return (
        <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                Processing {current} of {total} credentials...
            </Typography>
            <LinearProgress
                variant="determinate"
                value={(current / total) * 100}
                sx={{ borderRadius: 1 }}
            />
        </Box>
    );
}

export function WalletConnectionLoading() {
    return <LoadingSpinner message="Connecting to wallet..." />;
}

export function BlockchainOperationLoading({ operation }: { operation: string }) {
    return <LoadingSpinner message={`${operation}...`} />;
}

export function ShimmerBox({ width, height }: { width?: number | string; height?: number | string }) {
    return (
        <Skeleton
            variant="rectangular"
            width={width || '100%'}
            height={height || 40}
            sx={{
                borderRadius: 1,
                animation: `${pulse} 2s ease-in-out infinite`,
            }}
        />
    );
}

export function FormLoadingOverlay({ loading, children, message }: { loading: boolean; children: React.ReactNode; message?: string }) {
    return (
        <Box position="relative">
            {children}
            {loading && (
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bgcolor="rgba(255, 255, 255, 0.8)"
                    borderRadius={1}
                    zIndex={1}
                >
                    <LoadingSpinner size={32} message={message || "Processing..."} />
                </Box>
            )}
        </Box>
    );
}