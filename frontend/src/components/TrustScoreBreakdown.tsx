import {
    Box,
    Typography,
    LinearProgress,
    Tooltip,
    Card,
    CardContent,
    Grid,
    Chip,
} from '@mui/material';
import {
    Reviews as ReviewIcon,
    Psychology as SkillIcon,
    Payment as PaymentIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import type { TrustScore } from '../types';
import { WEIGHTS } from '../utils/trustScore';

interface TrustScoreBreakdownProps {
    trustScore: TrustScore;
    showDetails?: boolean;
}

export function TrustScoreBreakdown({
    trustScore,
    showDetails = true
}: TrustScoreBreakdownProps) {

    const breakdownItems = [
        {
            category: 'Reviews',
            weight: WEIGHTS.REVIEW,
            score: trustScore.breakdown.review_score,
            maxPossible: 60, // 100 * 0.6
            icon: <ReviewIcon />,
            color: '#4CAF50',
            description: 'Average client ratings and feedback quality',
            tooltip: `Reviews contribute ${WEIGHTS.REVIEW * 100}% to your trust score. Based on average rating from client reviews.`,
        },
        {
            category: 'Skills',
            weight: WEIGHTS.SKILL,
            score: trustScore.breakdown.skill_score,
            maxPossible: 30, // 100 * 0.3
            icon: <SkillIcon />,
            color: '#2196F3',
            description: 'Verified skills and certifications',
            tooltip: `Skills contribute ${WEIGHTS.SKILL * 100}% to your trust score. Based on number of skills (5 pts each) and certifications (10 pts each).`,
        },
        {
            category: 'Payments',
            weight: WEIGHTS.PAYMENT,
            score: trustScore.breakdown.payment_score,
            maxPossible: 10, // 100 * 0.1
            icon: <PaymentIcon />,
            color: '#FF9800',
            description: 'Payment history and volume',
            tooltip: `Payments contribute ${WEIGHTS.PAYMENT * 100}% to your trust score. Based on total payment volume with recency factors.`,
        },
    ];

    return (
        <Card
            elevation={2}
            sx={{
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important',
                willChange: 'transform, box-shadow',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) =>
                        theme.palette.mode === 'dark'
                            ? '0 12px 40px rgba(0, 0, 0, 0.6)'
                            : '0 12px 40px rgba(0, 0, 0, 0.15)',
                },
            }}
        >
            <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Typography variant="h6">
                        Trust Score Breakdown
                    </Typography>
                    <Tooltip
                        title="Your trust score is calculated from three components: Reviews (60%), Skills (30%), and Payments (10%)"
                        arrow
                    >
                        <InfoIcon fontSize="small" color="action" />
                    </Tooltip>
                </Box>

                <Grid container spacing={2}>
                    {breakdownItems.map((item, index) => (
                        <Grid item xs={12} key={item.category}>
                            <Box
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important',
                                    willChange: 'transform, box-shadow',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        transform: 'translateX(8px) scale(1.02)',
                                        backgroundColor: (theme) =>
                                            theme.palette.mode === 'dark'
                                                ? 'rgba(255, 255, 255, 0.05)'
                                                : 'rgba(0, 0, 0, 0.02)',
                                        boxShadow: `0 4px 12px ${item.color}20`,
                                        '& .category-icon': {
                                            transform: 'scale(1.2) rotate(5deg)',
                                        },
                                        '& .progress-bar': {
                                            transform: 'scaleY(1.2)',
                                        },
                                        '& .score-text': {
                                            transform: 'scale(1.05)',
                                        },
                                    },
                                }}
                            >
                                {/* Category Header */}
                                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Box
                                            className="category-icon"
                                            sx={{
                                                color: item.color,
                                                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important',
                                                willChange: 'transform',
                                            }}
                                        >
                                            {item.icon}
                                        </Box>
                                        <Typography variant="body1" fontWeight="medium">
                                            {item.category}
                                        </Typography>
                                        <Chip
                                            label={`${item.weight * 100}%`}
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                                fontSize: '0.75rem',
                                                height: 20,
                                                borderColor: item.color,
                                                color: item.color,
                                                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important',
                                                willChange: 'transform, box-shadow',
                                                '&:hover': {
                                                    transform: 'scale(1.1)',
                                                    boxShadow: `0 2px 8px ${item.color}40`,
                                                    backgroundColor: `${item.color}10`,
                                                },
                                            }}
                                        />
                                    </Box>
                                    <Tooltip title={item.tooltip} arrow>
                                        <Typography
                                            variant="body2"
                                            fontWeight="bold"
                                            className="score-text"
                                            sx={{
                                                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important',
                                                willChange: 'transform',
                                            }}
                                        >
                                            {item.score.toFixed(1)} / {item.maxPossible}
                                        </Typography>
                                    </Tooltip>
                                </Box>

                                {/* Progress Bar */}
                                <Box mb={1}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={(item.score / item.maxPossible) * 100}
                                        className="progress-bar"
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            backgroundColor: `${item.color}20`,
                                            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important',
                                            willChange: 'transform',
                                            transformOrigin: 'center',
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: item.color,
                                                borderRadius: 4,
                                                transition: 'transform 1s ease-in-out',
                                                transitionDelay: `${index * 200}ms`,
                                            },
                                        }}
                                    />
                                </Box>

                                {/* Description */}
                                {showDetails && (
                                    <Typography variant="caption" color="text.secondary">
                                        {item.description}
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                {/* Total Score Summary */}
                <Box
                    mt={3}
                    pt={2}
                    borderTop={1}
                    borderColor="divider"
                    textAlign="center"
                    sx={{
                        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important',
                        willChange: 'transform',
                        '&:hover': {
                            transform: 'scale(1.02)',
                            '& .total-score': {
                                transform: 'scale(1.1)',
                                textShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
                            },
                        },
                    }}
                >
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Total Trust Score
                    </Typography>
                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="primary"
                        className="total-score"
                        sx={{
                            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), text-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important',
                            willChange: 'transform, text-shadow',
                        }}
                    >
                        {trustScore.total} / 100
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {trustScore.tier} Tier
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}