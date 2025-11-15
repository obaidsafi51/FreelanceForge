import React from 'react';
import {
    Box,
    Skeleton,
    Card,
    CardContent,
    Grid,
    Typography,
    CircularProgress,
    LinearProgress,
    Fade,
    Stack,
    Chip,
    Avatar,
} from '@mui/material';
import {
    Work as WorkIcon,
    Reviews as ReviewsIcon,
    Payment as PaymentIcon,
    School as SchoolIcon,
} from '@mui/icons-material';

// Generic loading spinner
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
    const content = (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={2}
            p={3}
        >
            <CircularProgress size={size} />
            {message && (
                <Typography variant="body2" color="text.secondary">
                    {message}
                </Typography>
            )}
        </Box>
    );

    if (fullScreen) {
        return (
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    zIndex: 9999,
                }}
            >
                {content}
            </Box>
        );
    }

    return content;
}

// Skeleton for credential cards
export function CredentialCardSkeleton() {
    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box flex={1}>
                        <Skeleton variant="text" width="60%" height={24} />
                        <Skeleton variant="text" width="40%" height={20} />
                    </Box>
                    <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
                </Box>
                <Skeleton variant="text" width="100%" height={20} />
                <Skeleton variant="text" width="80%" height={20} />
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Skeleton variant="text" width="30%" height={20} />
                    <Skeleton variant="text" width="20%" height={20} />
                </Box>
            </CardContent>
        </Card>
    );
}

// Skeleton for credential timeline
interface CredentialTimelineSkeletonProps {
    count?: number;
}

export function CredentialTimelineSkeleton({ count = 5 }: CredentialTimelineSkeletonProps) {
    return (
        <Box>
            {Array.from({ length: count }).map((_, index) => (
                <CredentialCardSkeleton key={index} />
            ))}
        </Box>
    );
}

// Skeleton for trust score widget
export function TrustScoreWidgetSkeleton() {
    return (
        <Card>
            <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Skeleton variant="circular" width={80} height={80} />
                    <Box flex={1}>
                        <Skeleton variant="text" width="60%" height={28} />
                        <Skeleton variant="text" width="40%" height={24} />
                    </Box>
                </Box>

                <Box mb={2}>
                    <Skeleton variant="text" width="50%" height={20} />
                    <Skeleton variant="rectangular" width="100%" height={8} sx={{ borderRadius: 1, mt: 1 }} />
                </Box>

                <Box mb={2}>
                    <Skeleton variant="text" width="40%" height={20} />
                    <Skeleton variant="rectangular" width="100%" height={8} sx={{ borderRadius: 1, mt: 1 }} />
                </Box>

                <Box>
                    <Skeleton variant="text" width="45%" height={20} />
                    <Skeleton variant="rectangular" width="100%" height={8} sx={{ borderRadius: 1, mt: 1 }} />
                </Box>
            </CardContent>
        </Card>
    );
}

// Skeleton for dashboard
export function DashboardSkeleton() {
    return (
        <Box p={3}>
            {/* Header skeleton */}
            <Box mb={4}>
                <Skeleton variant="text" width="40%" height={40} />
                <Skeleton variant="text" width="60%" height={24} />
            </Box>

            <Grid container spacing={3}>
                {/* Trust score skeleton */}
                <Grid item xs={12} md={4}>
                    <TrustScoreWidgetSkeleton />
                </Grid>

                {/* Credentials timeline skeleton */}
                <Grid item xs={12} md={8}>
                    <Box mb={2}>
                        <Skeleton variant="text" width="30%" height={32} />
                    </Box>
                    <CredentialTimelineSkeleton count={3} />
                </Grid>
            </Grid>
        </Box>
    );
}

// Progress indicator for batch operations
interface BatchProgressProps {
    current: number;
    total: number;
    operation: string;
    currentItem?: string;
}

export function BatchProgress({ current, total, operation, currentItem }: BatchProgressProps) {
    const progress = (current / total) * 100;

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Typography variant="h6" gutterBottom>
                {operation}
            </Typography>

            <Box display="flex" alignItems="center" mb={2}>
                <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ height: 8, borderRadius: 1 }}
                    />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="text.secondary">
                        {current}/{total}
                    </Typography>
                </Box>
            </Box>

            {currentItem && (
                <Typography variant="body2" color="text.secondary">
                    Processing: {currentItem}
                </Typography>
            )}
        </Box>
    );
}

// Animated loading state for wallet connection
export function WalletConnectionLoading() {
    return (
        <Fade in timeout={300}>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap={2}
                p={4}
            >
                <CircularProgress size={48} />
                <Typography variant="h6">Connecting to Wallet</Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                    Please approve the connection request in your wallet extension
                </Typography>
            </Box>
        </Fade>
    );
}

// Loading state for blockchain operations
interface BlockchainOperationLoadingProps {
    operation: string;
    step?: string;
    showSteps?: boolean;
}

export function BlockchainOperationLoading({
    operation,
    step,
    showSteps = false
}: BlockchainOperationLoadingProps) {
    const steps = [
        'Preparing transaction',
        'Waiting for signature',
        'Broadcasting to network',
        'Confirming on blockchain',
    ];

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={3}
            p={4}
        >
            <CircularProgress size={56} />

            <Box textAlign="center">
                <Typography variant="h6" gutterBottom>
                    {operation}
                </Typography>
                {step && (
                    <Typography variant="body2" color="text.secondary">
                        {step}
                    </Typography>
                )}
            </Box>

            {showSteps && (
                <Stack spacing={1} sx={{ width: '100%', maxWidth: 300 }}>
                    {steps.map((stepText, index) => (
                        <Box
                            key={stepText}
                            display="flex"
                            alignItems="center"
                            gap={1}
                            sx={{
                                opacity: step === stepText ? 1 : 0.5,
                                transition: 'opacity 0.3s',
                            }}
                        >
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: step === stepText ? 'primary.main' : 'grey.300',
                                    transition: 'background-color 0.3s',
                                }}
                            />
                            <Typography variant="body2" color="text.secondary">
                                {stepText}
                            </Typography>
                        </Box>
                    ))}
                </Stack>
            )}
        </Box>
    );
}

// Empty state component
interface EmptyStateProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            p={6}
            sx={{ minHeight: 300 }}
        >
            {icon && (
                <Box sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}>
                    {icon}
                </Box>
            )}

            <Typography variant="h6" gutterBottom color="text.secondary">
                {title}
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph sx={{ maxWidth: 400 }}>
                {description}
            </Typography>

            {action && (
                <Box sx={{ mt: 2 }}>
                    <button onClick={action.onClick}>
                        {action.label}
                    </button>
                </Box>
            )}
        </Box>
    );
}

// Shimmer effect for loading placeholders
export function ShimmerBox({
    width = '100%',
    height = 20,
    borderRadius = 1
}: {
    width?: string | number;
    height?: number;
    borderRadius?: number;
}) {
    return (
        <Skeleton
            variant="rectangular"
            width={width}
            height={height}
            sx={{
                borderRadius,
                '&::after': {
                    animationDuration: '1.5s',
                },
            }}
        />
    );
}

// Loading overlay for forms
interface FormLoadingOverlayProps {
    loading: boolean;
    message?: string;
    children: React.ReactNode;
}

export function FormLoadingOverlay({
    loading,
    message = 'Processing...',
    children
}: FormLoadingOverlayProps) {
    return (
        <Box sx={{ position: 'relative' }}>
            {children}
            {loading && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                        zIndex: 1,
                        borderRadius: 1,
                    }}
                >
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        gap={2}
                    >
                        <CircularProgress />
                        <Typography variant="body2" color="text.secondary">
                            {message}
                        </Typography>
                    </Box>
                </Box>
            )}
        </Box>
    );
}