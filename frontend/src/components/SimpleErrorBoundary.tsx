import React, { Component, type ReactNode } from 'react';
import { Box, Typography, Button, Alert, Paper } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class SimpleErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('SimpleErrorBoundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Paper sx={{ p: 3, m: 2 }}>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Something went wrong
                        </Typography>
                        <Typography variant="body2" paragraph>
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<RefreshIcon />}
                            onClick={this.handleRetry}
                            size="small"
                        >
                            Try Again
                        </Button>
                    </Alert>
                </Paper>
            );
        }

        return this.props.children;
    }
}