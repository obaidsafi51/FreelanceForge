import {
    Box,
    Typography,
    CircularProgress,
    Chip,
    Tooltip,
    Card,
    CardContent,
    useTheme,
    Fade,
    Grow,
    LinearProgress,
} from '@mui/material';
import {
    EmojiEvents as TrophyIcon,
    Star as StarIcon,
    TrendingUp as TrendingUpIcon,
    WorkspacePremium as PremiumIcon,
} from '@mui/icons-material';
import type { TrustScore } from '../types';
import { getTierColor, getTierDescription } from '../utils/trustScore';
import { useResponsive } from '../utils/responsive';
import { durations } from '../utils/animations';

interface TrustScoreWidgetProps {
    trustScore: TrustScore;
    animated?: boolean;
    size?: 'small' | 'medium' | 'large';
}

export function TrustScoreWidget({
    trustScore,
    animated = true,
    size = 'medium'
}: TrustScoreWidgetProps) {
    const theme = useTheme();
    const { isMobile, prefersReducedMotion } = useResponsive();
    const tierColor = getTierColor(trustScore.tier, theme.palette.mode === 'dark');
    const tierDescription = getTierDescription(trustScore.tier);

    // Adjust size for mobile
    const effectiveSize = isMobile && size === 'large' ? 'medium' : size;

    // Size configurations
    const sizeConfig = {
        small: {
            circularSize: 80,
            fontSize: '1.5rem',
            chipSize: 'small' as const,
            padding: 2,
        },
        medium: {
            circularSize: 120,
            fontSize: '2rem',
            chipSize: 'medium' as const,
            padding: 3,
        },
        large: {
            circularSize: 160,
            fontSize: '2.5rem',
            chipSize: 'medium' as const,
            padding: 4,
        },
    };

    const config = sizeConfig[effectiveSize];

    // Get tier icon with enhanced styling
    const getTierIcon = () => {
        const iconProps = {
            sx: {
                color: tierColor,
                fontSize: 'inherit',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
            }
        };

        switch (trustScore.tier) {
            case 'Platinum':
                return <PremiumIcon {...iconProps} />;
            case 'Gold':
                return <TrophyIcon {...iconProps} />;
            case 'Silver':
                return <StarIcon {...iconProps} />;
            default:
                return <TrendingUpIcon {...iconProps} />;
        }
    };

    return (
        <Fade in timeout={durations.standard}>
            <Card
                elevation={3}
                sx={{
                    background: (theme) =>
                        theme.palette.mode === 'dark'
                            ? 'linear-gradient(135deg, rgba(26, 29, 35, 0.95) 0%, rgba(26, 29, 35, 0.9) 100%)'
                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
                    backdropFilter: 'blur(12px)',
                    border: (theme) =>
                        theme.palette.mode === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.12)'
                            : '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: 3,
                    boxShadow: (theme) =>
                        theme.palette.mode === 'dark'
                            ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.6)'
                            : '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
                    position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important',
                    willChange: 'transform, box-shadow, border-color',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '1px',
                        background: (theme) =>
                            theme.palette.mode === 'dark'
                                ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)'
                                : 'linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent)',
                        opacity: 0.5,
                    },
                    '&:hover': {
                        transform: 'translateY(-6px) scale(1.02)',
                        boxShadow: (theme) =>
                            theme.palette.mode === 'dark'
                                ? '0 20px 60px rgba(0, 0, 0, 0.6), 0 8px 24px rgba(0, 0, 0, 0.8)'
                                : '0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.08)',
                        borderColor: (theme) =>
                            theme.palette.mode === 'dark'
                                ? 'rgba(33, 150, 243, 0.4)'
                                : 'rgba(33, 150, 243, 0.3)',
                        '& .trust-score-circle': {
                            transform: 'scale(1.05)',
                        },
                        '& .tier-chip': {
                            transform: 'scale(1.1)',
                            boxShadow: `0 6px 20px ${tierColor}50`,
                        },
                        '& .breakdown-item': {
                            transform: 'translateX(4px)',
                        },
                    },
                    '&:active': {
                        transform: 'translateY(-2px) scale(1.01)',
                        transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                }}
            >
                <CardContent sx={{ textAlign: 'center', p: config.padding }}>
                    <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontSize: { xs: '1rem', sm: '1.25rem' },
                        }}
                    >
                        Trust Score
                    </Typography>

                    {/* Circular Progress Indicator */}
                    <Grow in timeout={durations.complex}>
                        <Box
                            position="relative"
                            display="inline-flex"
                            mb={2}
                            className="trust-score-circle"
                            sx={{
                                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important',
                                willChange: 'transform',
                                cursor: 'pointer',
                                '&:hover': {
                                    '& .score-text': {
                                        transform: 'scale(1.1)',
                                        color: tierColor,
                                    },
                                },
                            }}
                        >
                            {/* Background circle */}
                            <CircularProgress
                                variant="determinate"
                                value={100}
                                size={config.circularSize}
                                thickness={6}
                                sx={{
                                    color: theme.palette.mode === 'dark' ? '#3a3a3a' : '#e0e0e0',
                                    position: 'absolute',
                                }}
                            />
                            {/* Progress circle */}
                            <CircularProgress
                                variant="determinate"
                                value={animated && !prefersReducedMotion ? trustScore.total : 0}
                                size={config.circularSize}
                                thickness={6}
                                sx={{
                                    color: tierColor,
                                    '& .MuiCircularProgress-circle': {
                                        strokeLinecap: 'round',
                                        transition: 'stroke-dasharray 2s ease-in-out',
                                    },
                                    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))',
                                }}
                            />
                            <Box
                                position="absolute"
                                top={0}
                                left={0}
                                bottom={0}
                                right={0}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexDirection="column"
                            >
                                <Typography
                                    variant="h4"
                                    component="div"
                                    color="text.primary"
                                    className="score-text"
                                    sx={{
                                        fontSize: config.fontSize,
                                        fontWeight: 800,
                                        lineHeight: 1,
                                        textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important',
                                        willChange: 'transform, color',
                                    }}
                                >
                                    {trustScore.total}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' } }}
                                >
                                    / 100
                                </Typography>
                            </Box>
                        </Box>
                    </Grow>

                    {/* Tier Badge */}
                    <Grow in timeout={durations.complex} style={{ transitionDelay: '200ms' }}>
                        <Box mb={2}>
                            <Tooltip title={tierDescription} arrow>
                                <Chip
                                    icon={getTierIcon()}
                                    label={trustScore.tier}
                                    size={config.chipSize}
                                    className="tier-chip"
                                    sx={{
                                        background: `linear-gradient(45deg, ${tierColor}20, ${tierColor}10)`,
                                        color: tierColor,
                                        border: `2px solid ${tierColor}`,
                                        fontWeight: 700,
                                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                        cursor: 'pointer',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important',
                                        willChange: 'transform, box-shadow, background',
                                        '& .MuiChip-icon': {
                                            color: tierColor,
                                            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important',
                                            willChange: 'transform',
                                        },
                                        '&:hover': {
                                            transform: 'scale(1.08)',
                                            boxShadow: `0 6px 16px ${tierColor}50`,
                                            background: `linear-gradient(45deg, ${tierColor}30, ${tierColor}15)`,
                                            '& .MuiChip-icon': {
                                                transform: 'rotate(15deg) scale(1.1)',
                                            },
                                        },
                                        '&:active': {
                                            transform: 'scale(1.02)',
                                        },
                                    }}
                                />
                            </Tooltip>
                        </Box>
                    </Grow>

                    {/* Score Breakdown */}
                    <Fade in timeout={durations.standard} style={{ transitionDelay: '400ms' }}>
                        <Box>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                gutterBottom
                                sx={{
                                    fontWeight: 600,
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                }}
                            >
                                Score Breakdown
                            </Typography>

                            <Box display="flex" flexDirection="column" gap={1.5}>
                                {[
                                    {
                                        label: 'Reviews',
                                        percentage: 60,
                                        score: trustScore.breakdown.review_score,
                                        color: theme.palette.success.main,
                                        tooltip: 'Reviews contribute 60% to your trust score'
                                    },
                                    {
                                        label: 'Skills',
                                        percentage: 30,
                                        score: trustScore.breakdown.skill_score,
                                        color: theme.palette.primary.main,
                                        tooltip: 'Skills and certifications contribute 30% to your trust score'
                                    },
                                    {
                                        label: 'Payments',
                                        percentage: 10,
                                        score: trustScore.breakdown.payment_score,
                                        color: theme.palette.warning.main,
                                        tooltip: 'Payment history contributes 10% to your trust score'
                                    },
                                ].map((item, index) => (
                                    <Tooltip key={item.label} title={item.tooltip} arrow>
                                        <Box
                                            className="breakdown-item"
                                            sx={{
                                                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important',
                                                willChange: 'transform',
                                            }}
                                        >
                                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {item.label} ({item.percentage}%)
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight="bold"
                                                    color={item.color}
                                                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                                >
                                                    {item.score.toFixed(1)}
                                                </Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={(item.score / item.percentage) * 100}
                                                sx={{
                                                    height: 6,
                                                    borderRadius: 3,
                                                    backgroundColor: 'action.hover',
                                                    '& .MuiLinearProgress-bar': {
                                                        backgroundColor: item.color,
                                                        borderRadius: 3,
                                                        transition: 'transform 1s ease-in-out',
                                                        transitionDelay: `${600 + index * 200}ms`,
                                                    },
                                                }}
                                            />
                                        </Box>
                                    </Tooltip>
                                ))}
                            </Box>
                        </Box>
                    </Fade>
                </CardContent>
            </Card>
        </Fade>
    );
}