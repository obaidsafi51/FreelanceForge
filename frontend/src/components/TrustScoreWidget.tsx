import {
    Box,
    Typography,
    CircularProgress,
    Chip,
    Tooltip,
    Card,
    CardContent,
    useTheme,
} from '@mui/material';
import {
    EmojiEvents as TrophyIcon,
    Star as StarIcon,
    TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import type { TrustScore } from '../types';
import { getTierColor, getTierDescription } from '../utils/trustScore';

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
    const tierColor = getTierColor(trustScore.tier);
    const tierDescription = getTierDescription(trustScore.tier);

    // Size configurations
    const sizeConfig = {
        small: { circularSize: 80, fontSize: '1.5rem', chipSize: 'small' as const },
        medium: { circularSize: 120, fontSize: '2rem', chipSize: 'medium' as const },
        large: { circularSize: 160, fontSize: '2.5rem', chipSize: 'medium' as const },
    };

    const config = sizeConfig[size];

    // Get tier icon
    const getTierIcon = () => {
        switch (trustScore.tier) {
            case 'Platinum':
                return <TrophyIcon sx={{ color: tierColor, fontSize: 'inherit' }} />;
            case 'Gold':
                return <StarIcon sx={{ color: tierColor, fontSize: 'inherit' }} />;
            case 'Silver':
                return <TrendingUpIcon sx={{ color: tierColor, fontSize: 'inherit' }} />;
            default:
                return <TrophyIcon sx={{ color: tierColor, fontSize: 'inherit' }} />;
        }
    };

    return (
        <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Trust Score
                </Typography>

                {/* Circular Progress Indicator */}
                <Box position="relative" display="inline-flex" mb={2}>
                    <CircularProgress
                        variant="determinate"
                        value={trustScore.total}
                        size={config.circularSize}
                        thickness={6}
                        sx={{
                            color: tierColor,
                            '& .MuiCircularProgress-circle': {
                                strokeLinecap: 'round',
                            },
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
                            sx={{
                                fontSize: config.fontSize,
                                fontWeight: 'bold',
                                lineHeight: 1,
                            }}
                        >
                            {trustScore.total}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            / 100
                        </Typography>
                    </Box>
                </Box>

                {/* Tier Badge */}
                <Box mb={2}>
                    <Tooltip title={tierDescription} arrow>
                        <Chip
                            icon={getTierIcon()}
                            label={trustScore.tier}
                            size={config.chipSize}
                            sx={{
                                backgroundColor: `${tierColor}20`,
                                color: theme.palette.getContrastText(tierColor),
                                border: `2px solid ${tierColor}`,
                                fontWeight: 'bold',
                                '& .MuiChip-icon': {
                                    color: tierColor,
                                },
                            }}
                        />
                    </Tooltip>
                </Box>

                {/* Score Breakdown */}
                <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Score Breakdown
                    </Typography>

                    <Box display="flex" flexDirection="column" gap={1}>
                        <Tooltip title="Reviews contribute 60% to your trust score" arrow>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2">Reviews (60%)</Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {trustScore.breakdown.review_score.toFixed(1)}
                                </Typography>
                            </Box>
                        </Tooltip>

                        <Tooltip title="Skills and certifications contribute 30% to your trust score" arrow>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2">Skills (30%)</Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {trustScore.breakdown.skill_score.toFixed(1)}
                                </Typography>
                            </Box>
                        </Tooltip>

                        <Tooltip title="Payment history contributes 10% to your trust score" arrow>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2">Payments (10%)</Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {trustScore.breakdown.payment_score.toFixed(1)}
                                </Typography>
                            </Box>
                        </Tooltip>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}