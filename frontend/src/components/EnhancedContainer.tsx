import React from 'react';
import { Box, Paper, useTheme } from '@mui/material';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';

interface EnhancedContainerProps {
    children: React.ReactNode;
    variant?: 'elevated' | 'outlined' | 'glass';
    padding?: number;
    borderRadius?: number;
    className?: string;
    sx?: any;
}

export function EnhancedContainer({
    children,
    variant = 'elevated',
    padding = 3,
    borderRadius = 16,
    className,
    sx = {},
}: EnhancedContainerProps) {
    const theme = useTheme();
    const { isDarkMode } = useCustomTheme();

    const getVariantStyles = () => {
        switch (variant) {
            case 'elevated':
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

            case 'outlined':
                return {
                    background: isDarkMode
                        ? 'rgba(26, 29, 35, 0.6)'
                        : 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(8px)',
                    border: isDarkMode
                        ? '2px solid rgba(255, 255, 255, 0.16)'
                        : '2px solid rgba(0, 0, 0, 0.12)',
                    boxShadow: 'none',
                };

            case 'glass':
                return {
                    background: isDarkMode
                        ? 'linear-gradient(135deg, rgba(26, 29, 35, 0.3) 0%, rgba(26, 29, 35, 0.1) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)',
                    backdropFilter: 'blur(16px)',
                    border: isDarkMode
                        ? '1px solid rgba(255, 255, 255, 0.08)'
                        : '1px solid rgba(0, 0, 0, 0.06)',
                    boxShadow: isDarkMode
                        ? '0 4px 16px rgba(0, 0, 0, 0.2)'
                        : '0 4px 16px rgba(0, 0, 0, 0.04)',
                };

            default:
                return {};
        }
    };

    return (
        <Paper
            className={className}
            sx={{
                p: padding,
                borderRadius: `${borderRadius}px`,
                transition: 'all 0.3s ease-in-out',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: isDarkMode
                        ? '0 12px 40px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.7)'
                        : '0 12px 40px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.06)',
                },
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: isDarkMode
                        ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)'
                        : 'linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent)',
                    opacity: 0.5,
                },
                ...getVariantStyles(),
                ...sx,
            }}
        >
            {children}
        </Paper>
    );
}

// Specialized containers for different use cases
export function FormContainer({ children, ...props }: Omit<EnhancedContainerProps, 'variant'>) {
    return (
        <EnhancedContainer variant="elevated" {...props}>
            {children}
        </EnhancedContainer>
    );
}

export function StatsContainer({ children, ...props }: Omit<EnhancedContainerProps, 'variant'>) {
    return (
        <EnhancedContainer variant="glass" {...props}>
            {children}
        </EnhancedContainer>
    );
}

export function ContentContainer({ children, ...props }: Omit<EnhancedContainerProps, 'variant'>) {
    return (
        <EnhancedContainer variant="outlined" {...props}>
            {children}
        </EnhancedContainer>
    );
}