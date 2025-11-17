import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Divider,
    useTheme,
} from '@mui/material';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';

interface FormSectionProps {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    variant?: 'elevated' | 'outlined' | 'minimal';
    spacing?: number;
    divider?: boolean;
}

export function FormSection({
    title,
    subtitle,
    children,
    variant = 'elevated',
    spacing = 3,
    divider = false,
}: FormSectionProps) {
    const theme = useTheme();
    const { isDarkMode } = useCustomTheme();

    const getVariantStyles = () => {
        switch (variant) {
            case 'elevated':
                return {
                    background: isDarkMode
                        ? 'linear-gradient(135deg, rgba(26, 29, 35, 0.6) 0%, rgba(26, 29, 35, 0.4) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)',
                    backdropFilter: 'blur(8px)',
                    border: isDarkMode
                        ? '1px solid rgba(255, 255, 255, 0.08)'
                        : '1px solid rgba(0, 0, 0, 0.06)',
                    boxShadow: isDarkMode
                        ? '0 4px 16px rgba(0, 0, 0, 0.3)'
                        : '0 4px 16px rgba(0, 0, 0, 0.06)',
                };

            case 'outlined':
                return {
                    background: 'transparent',
                    border: isDarkMode
                        ? '2px solid rgba(255, 255, 255, 0.12)'
                        : '2px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: 'none',
                };

            case 'minimal':
                return {
                    background: 'transparent',
                    border: 'none',
                    boxShadow: 'none',
                };

            default:
                return {};
        }
    };

    const content = (
        <Box sx={{ p: spacing }}>
            {(title || subtitle) && (
                <Box mb={spacing}>
                    {title && (
                        <Typography
                            variant="h6"
                            gutterBottom={!!subtitle}
                            sx={{
                                fontWeight: 600,
                                color: 'text.primary',
                                fontSize: { xs: '1rem', sm: '1.125rem' },
                            }}
                        >
                            {title}
                        </Typography>
                    )}
                    {subtitle && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                                lineHeight: 1.5,
                            }}
                        >
                            {subtitle}
                        </Typography>
                    )}
                    {divider && (
                        <Divider
                            sx={{
                                mt: 2,
                                borderColor: isDarkMode
                                    ? 'rgba(255, 255, 255, 0.08)'
                                    : 'rgba(0, 0, 0, 0.06)',
                            }}
                        />
                    )}
                </Box>
            )}
            {children}
        </Box>
    );

    if (variant === 'minimal') {
        return content;
    }

    return (
        <Paper
            sx={{
                borderRadius: 3,
                transition: 'all 0.2s ease-in-out',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                    transform: variant === 'elevated' ? 'translateY(-1px)' : 'none',
                    boxShadow: variant === 'elevated'
                        ? isDarkMode
                            ? '0 8px 24px rgba(0, 0, 0, 0.4)'
                            : '0 8px 24px rgba(0, 0, 0, 0.08)'
                        : undefined,
                },
                '&::before': variant === 'elevated' ? {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: isDarkMode
                        ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)'
                        : 'linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.08), transparent)',
                    opacity: 0.6,
                } : {},
                ...getVariantStyles(),
            }}
        >
            {content}
        </Paper>
    );
}

// Specialized form sections
export function BasicInfoSection({ children, ...props }: Omit<FormSectionProps, 'title' | 'subtitle'>) {
    return (
        <FormSection
            title="Basic Information"
            subtitle="Enter the core details for your credential"
            divider
            {...props}
        >
            {children}
        </FormSection>
    );
}

export function ProofDocumentSection({ children, ...props }: Omit<FormSectionProps, 'title' | 'subtitle'>) {
    return (
        <FormSection
            title="Proof Document (Optional)"
            subtitle="Upload supporting document for verification. Only the document hash will be stored on-chain."
            divider
            {...props}
        >
            {children}
        </FormSection>
    );
}

export function PreviewSection({ children, ...props }: Omit<FormSectionProps, 'title' | 'subtitle'>) {
    return (
        <FormSection
            title="Preview"
            subtitle="Review your credential before minting"
            variant="outlined"
            {...props}
        >
            {children}
        </FormSection>
    );
}