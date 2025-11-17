import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    useTheme,
    Fade,
    Grow,
} from '@mui/material';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    variant?: 'elevated' | 'outlined' | 'gradient';
    size?: 'small' | 'medium' | 'large';
    animated?: boolean;
    delay?: number;
}

export function StatsCard({
    title,
    value,
    subtitle,
    icon,
    color = 'primary',
    variant = 'elevated',
    size = 'medium',
    animated = true,
    delay = 0,
}: StatsCardProps) {
    const theme = useTheme();
    const { isDarkMode } = useCustomTheme();

    const getColorValue = () => {
        switch (color) {
            case 'secondary':
                return theme.palette.secondary.main;
            case 'success':
                return theme.palette.success.main;
            case 'warning':
                return theme.palette.warning.main;
            case 'error':
                return theme.palette.error.main;
            case 'info':
                return theme.palette.info.main;
            default:
                return theme.palette.primary.main;
        }
    };

    const getSizeConfig = () => {
        switch (size) {
            case 'small':
                return {
                    padding: 2,
                    titleSize: '0.875rem',
                    valueSize: '1.5rem',
                    subtitleSize: '0.75rem',
                    iconSize: 20,
                };
            case 'large':
                return {
                    padding: 4,
                    titleSize: '1.125rem',
                    valueSize: '2.5rem',
                    subtitleSize: '1rem',
                    iconSize: 32,
                };
            default:
                return {
                    padding: 3,
                    titleSize: '1rem',
                    valueSize: '2rem',
                    subtitleSize: '0.875rem',
                    iconSize: 24,
                };
        }
    };

    const getVariantStyles = () => {
        const colorValue = getColorValue();

        switch (variant) {
            case 'outlined':
                return {
                    background: 'transparent',
                    border: `2px solid ${colorValue}20`,
                    boxShadow: 'none',
                    '&:hover': {
                        borderColor: `${colorValue}40`,
                        backgroundColor: `${colorValue}05`,
                    },
                };

            case 'gradient':
                return {
                    background: `linear-gradient(135deg, ${colorValue}15 0%, ${colorValue}05 100%)`,
                    border: `1px solid ${colorValue}20`,
                    boxShadow: isDarkMode
                        ? `0 4px 16px ${colorValue}20`
                        : `0 4px 16px ${colorValue}10`,
                    '&:hover': {
                        background: `linear-gradient(135deg, ${colorValue}25 0%, ${colorValue}10 100%)`,
                        boxShadow: isDarkMode
                            ? `0 8px 24px ${colorValue}30`
                            : `0 8px 24px ${colorValue}15`,
                    },
                };

            default:
                return {
                    background: isDarkMode
                        ? 'linear-gradient(135deg, rgba(26, 29, 35, 0.95) 0%, rgba(26, 29, 35, 0.9) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
                    backdropFilter: 'blur(12px)',
                    border: isDarkMode
                        ? '1px solid rgba(255, 255, 255, 0.12)'
                        : '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: isDarkMode
                        ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.6)'
                        : '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
                };
        }
    };

    const config = getSizeConfig();
    const colorValue = getColorValue();

    const CardComponent = animated ?
        ({ children }: { children: React.ReactNode }) => (
            <Grow in timeout={300} style={{ transitionDelay: `${delay}ms` }}>
                <div>{children}</div>
            </Grow>
        ) :
        ({ children }: { children: React.ReactNode }) => <>{children}</>;

    return (
        <CardComponent>
            <Card
                sx={{
                    borderRadius: 4,
                    transition: 'all 0.3s ease-in-out',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'default',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                    },
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: `linear-gradient(90deg, ${colorValue}, ${colorValue}80, ${colorValue})`,
                        opacity: 0.8,
                    },
                    ...getVariantStyles(),
                }}
            >
                <CardContent sx={{ p: config.padding }}>
                    <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                        <Box flex={1}>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    fontSize: config.titleSize,
                                    fontWeight: 500,
                                    mb: 1,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                }}
                            >
                                {title}
                            </Typography>

                            <Typography
                                variant="h4"
                                component="div"
                                sx={{
                                    fontSize: config.valueSize,
                                    fontWeight: 700,
                                    color: colorValue,
                                    lineHeight: 1.2,
                                    mb: subtitle ? 0.5 : 0,
                                    textShadow: isDarkMode
                                        ? `0 2px 8px ${colorValue}40`
                                        : `0 2px 8px ${colorValue}20`,
                                }}
                            >
                                {value}
                            </Typography>

                            {subtitle && (
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                        fontSize: config.subtitleSize,
                                        fontWeight: 400,
                                        opacity: 0.8,
                                    }}
                                >
                                    {subtitle}
                                </Typography>
                            )}
                        </Box>

                        {icon && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: config.iconSize * 2,
                                    height: config.iconSize * 2,
                                    borderRadius: '50%',
                                    backgroundColor: `${colorValue}15`,
                                    color: colorValue,
                                    fontSize: config.iconSize,
                                    flexShrink: 0,
                                    ml: 2,
                                }}
                            >
                                {icon}
                            </Box>
                        )}
                    </Box>
                </CardContent>
            </Card>
        </CardComponent>
    );
}

// Specialized stats cards
export function MetricCard({
    metric,
    label,
    ...props
}: {
    metric: string | number;
    label: string;
} & Omit<StatsCardProps, 'title' | 'value'>) {
    return (
        <StatsCard
            title={label}
            value={metric}
            variant="gradient"
            {...props}
        />
    );
}

export function CounterCard({
    count,
    label,
    total,
    ...props
}: {
    count: number;
    label: string;
    total?: number;
} & Omit<StatsCardProps, 'title' | 'value' | 'subtitle'>) {
    return (
        <StatsCard
            title={label}
            value={count}
            subtitle={total ? `of ${total} total` : undefined}
            {...props}
        />
    );
}