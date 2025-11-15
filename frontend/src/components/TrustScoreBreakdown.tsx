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
        <Card elevation={2}>
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
                    {breakdownItems.map((item) => (
                        <Grid item xs={12} key={item.category}>
                            <Box>
                                {/* Category Header */}
                                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Box sx={{ color: item.color }}>
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
                                            }}
                                        />
                                    </Box>
                                    <Tooltip title={item.tooltip} arrow>
                                        <Typography variant="body2" fontWeight="bold">
                                            {item.score.toFixed(1)} / {item.maxPossible}
                                        </Typography>
                                    </Tooltip>
                                </Box>

                                {/* Progress Bar */}
                                <Box mb={1}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={(item.score / item.maxPossible) * 100}
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            backgroundColor: `${item.color}20`,
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: item.color,
                                                borderRadius: 4,
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
                >
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Total Trust Score
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="primary">
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