import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Box,
    useTheme,
    Fade,
    Backdrop,
    Button,
    Typography,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';

interface EnhancedModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    fullWidth?: boolean;
    disableBackdropClick?: boolean;
}

export function EnhancedModal({
    open,
    onClose,
    title,
    children,
    actions,
    maxWidth = 'md',
    fullWidth = true,
    disableBackdropClick = false,
}: EnhancedModalProps) {
    const theme = useTheme();
    const { isDarkMode } = useCustomTheme();

    const handleBackdropClick = (event: React.MouseEvent) => {
        if (disableBackdropClick) {
            event.stopPropagation();
            return;
        }
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={maxWidth}
            fullWidth={fullWidth}
            TransitionComponent={Fade}
            TransitionProps={{
                timeout: 300,
            }}
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 300,
                sx: {
                    backgroundColor: isDarkMode
                        ? 'rgba(0, 0, 0, 0.8)'
                        : 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(8px)',
                },
                onClick: handleBackdropClick,
            }}
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    background: isDarkMode
                        ? 'linear-gradient(135deg, rgba(26, 29, 35, 0.98) 0%, rgba(26, 29, 35, 0.95) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
                    backdropFilter: 'blur(16px)',
                    border: isDarkMode
                        ? '1px solid rgba(255, 255, 255, 0.12)'
                        : '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: isDarkMode
                        ? '0 24px 64px rgba(0, 0, 0, 0.6), 0 8px 24px rgba(0, 0, 0, 0.8)'
                        : '0 24px 64px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '1px',
                        background: isDarkMode
                            ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)'
                            : 'linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.15), transparent)',
                        opacity: 0.8,
                    },
                },
            }}
        >
            {title && (
                <DialogTitle
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        pb: 2,
                        borderBottom: isDarkMode
                            ? '1px solid rgba(255, 255, 255, 0.08)'
                            : '1px solid rgba(0, 0, 0, 0.06)',
                        background: isDarkMode
                            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)'
                            : 'linear-gradient(135deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.01) 100%)',
                    }}
                >
                    <Box
                        sx={{
                            fontWeight: 700,
                            fontSize: '1.25rem',
                            background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        {title}
                    </Box>
                    <IconButton
                        onClick={onClose}
                        size="small"
                        sx={{
                            color: 'text.secondary',
                            '&:hover': {
                                backgroundColor: isDarkMode
                                    ? 'rgba(255, 255, 255, 0.08)'
                                    : 'rgba(0, 0, 0, 0.04)',
                                transform: 'scale(1.1)',
                            },
                            transition: 'all 0.2s ease-in-out',
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
            )}

            <DialogContent
                sx={{
                    p: 3,
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: isDarkMode
                            ? 'rgba(255, 255, 255, 0.2)'
                            : 'rgba(0, 0, 0, 0.2)',
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: isDarkMode
                            ? 'rgba(255, 255, 255, 0.3)'
                            : 'rgba(0, 0, 0, 0.3)',
                    },
                }}
            >
                {children}
            </DialogContent>

            {actions && (
                <DialogActions
                    sx={{
                        p: 3,
                        pt: 0,
                        borderTop: isDarkMode
                            ? '1px solid rgba(255, 255, 255, 0.08)'
                            : '1px solid rgba(0, 0, 0, 0.06)',
                        background: isDarkMode
                            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)'
                            : 'linear-gradient(135deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.01) 100%)',
                    }}
                >
                    {actions}
                </DialogActions>
            )}
        </Dialog>
    );
}

// Specialized modal variants
export function ConfirmationModal({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    severity = 'info',
}: {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    severity?: 'info' | 'warning' | 'error' | 'success';
}) {
    const theme = useTheme();

    const getSeverityColor = () => {
        switch (severity) {
            case 'warning':
                return theme.palette.warning.main;
            case 'error':
                return theme.palette.error.main;
            case 'success':
                return theme.palette.success.main;
            default:
                return theme.palette.primary.main;
        }
    };

    return (
        <EnhancedModal
            open={open}
            onClose={onClose}
            title={title}
            maxWidth="sm"
            actions={
                <Box display="flex" gap={2}>
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        sx={{ minWidth: 100 }}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        variant="contained"
                        sx={{
                            minWidth: 100,
                            backgroundColor: getSeverityColor(),
                            '&:hover': {
                                backgroundColor: getSeverityColor(),
                                filter: 'brightness(0.9)',
                            },
                        }}
                    >
                        {confirmText}
                    </Button>
                </Box>
            }
        >
            <Typography variant="body1" sx={{ py: 2 }}>
                {message}
            </Typography>
        </EnhancedModal>
    );
}