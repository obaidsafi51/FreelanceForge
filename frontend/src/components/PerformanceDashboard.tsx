/**
 * Performance Dashboard Component
 * Development-only component for monitoring application performance
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Alert,
    Grid,
    Card,
    CardContent,
    LinearProgress,
    Switch,
    FormControlLabel,
} from '@mui/material';
import {
    Speed as SpeedIcon,
    Memory as MemoryIcon,
    Timeline as TimelineIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { performanceMonitor, PerformanceThresholds } from '../utils/performance';
import { performanceTestSuite, generateMockCredentials } from '../utils/performanceTest';

interface PerformanceDashboardProps {
    onMockDataGenerated?: (credentials: any[]) => void;
}

export function PerformanceDashboard({ onMockDataGenerated }: PerformanceDashboardProps) {
    const [metrics, setMetrics] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>({});
    const [isRunningTests, setIsRunningTests] = useState(false);
    const [monitoringEnabled, setMonitoringEnabled] = useState(true);
    const [memoryInfo, setMemoryInfo] = useState<any>(null);

    // Update metrics periodically
    useEffect(() => {
        const updateMetrics = () => {
            setMetrics(performanceMonitor.getMetrics());
            setSummary(performanceMonitor.getSummary());

            // Update memory info if available
            if ('memory' in performance) {
                setMemoryInfo((performance as any).memory);
            }
        };

        updateMetrics();
        const interval = setInterval(updateMetrics, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleRunTests = async () => {
        setIsRunningTests(true);
        try {
            await performanceTestSuite.runAllTests();
        } catch (error) {
            console.error('Performance tests failed:', error);
        } finally {
            setIsRunningTests(false);
        }
    };

    const handleGenerateMockData = (count: number) => {
        const mockCredentials = generateMockCredentials(count);
        if (onMockDataGenerated) {
            onMockDataGenerated(mockCredentials);
        }
    };

    const handleClearMetrics = () => {
        performanceMonitor.clear();
        setMetrics([]);
        setSummary({});
    };

    const handleToggleMonitoring = () => {
        const newEnabled = !monitoringEnabled;
        setMonitoringEnabled(newEnabled);
        performanceMonitor.setEnabled(newEnabled);
    };

    const getPerformanceStatus = (metricName: string, avgDuration: number) => {
        const thresholds = PerformanceThresholds as any;
        const threshold = thresholds[metricName.toUpperCase()] || 1000;

        if (avgDuration < threshold * 0.5) return { color: 'success', label: 'Excellent' };
        if (avgDuration < threshold) return { color: 'warning', label: 'Good' };
        return { color: 'error', label: 'Needs Optimization' };
    };

    const formatBytes = (bytes: number) => {
        return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    };

    // Only render in development
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                <SpeedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Performance Dashboard
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
                This dashboard is only available in development mode. Use it to monitor and optimize application performance.
            </Alert>

            {/* Controls */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={monitoringEnabled}
                                    onChange={handleToggleMonitoring}
                                />
                            }
                            label="Performance Monitoring"
                        />
                    </Grid>
                    <Grid item>
                        <Button
                            variant="contained"
                            onClick={handleRunTests}
                            disabled={isRunningTests}
                            startIcon={<TimelineIcon />}
                        >
                            {isRunningTests ? 'Running Tests...' : 'Run Performance Tests'}
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="outlined"
                            onClick={handleClearMetrics}
                            startIcon={<RefreshIcon />}
                        >
                            Clear Metrics
                        </Button>
                    </Grid>
                </Grid>

                {isRunningTests && (
                    <Box sx={{ mt: 2 }}>
                        <LinearProgress />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Running comprehensive performance tests...
                        </Typography>
                    </Box>
                )}
            </Paper>

            {/* Mock Data Generation */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Mock Data Generation
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Generate mock credentials to test performance with large datasets.
                </Typography>
                <Grid container spacing={1}>
                    {[10, 50, 100, 200, 500].map(count => (
                        <Grid item key={count}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleGenerateMockData(count)}
                            >
                                {count} Credentials
                            </Button>
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            {/* Memory Information */}
            {memoryInfo && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            <MemoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Memory Usage
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={4}>
                                <Typography variant="body2" color="text.secondary">
                                    Used Heap Size
                                </Typography>
                                <Typography variant="h6">
                                    {formatBytes(memoryInfo.usedJSHeapSize)}
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="body2" color="text.secondary">
                                    Total Heap Size
                                </Typography>
                                <Typography variant="h6">
                                    {formatBytes(memoryInfo.totalJSHeapSize)}
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography variant="body2" color="text.secondary">
                                    Heap Size Limit
                                </Typography>
                                <Typography variant="h6">
                                    {formatBytes(memoryInfo.jsHeapSizeLimit)}
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* Performance Summary */}
            {Object.keys(summary).length > 0 && (
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Performance Summary
                    </Typography>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Metric</TableCell>
                                    <TableCell align="right">Count</TableCell>
                                    <TableCell align="right">Avg Duration</TableCell>
                                    <TableCell align="right">Max Duration</TableCell>
                                    <TableCell align="right">Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(summary).map(([name, stats]: [string, any]) => {
                                    const status = getPerformanceStatus(name, stats.avgDuration);
                                    return (
                                        <TableRow key={name}>
                                            <TableCell component="th" scope="row">
                                                {name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </TableCell>
                                            <TableCell align="right">{stats.count}</TableCell>
                                            <TableCell align="right">
                                                {stats.avgDuration.toFixed(2)}ms
                                            </TableCell>
                                            <TableCell align="right">
                                                {stats.maxDuration.toFixed(2)}ms
                                            </TableCell>
                                            <TableCell align="right">
                                                <Chip
                                                    label={status.label}
                                                    color={status.color as any}
                                                    size="small"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* Recent Metrics */}
            {metrics.length > 0 && (
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Recent Metrics (Last 20)
                    </Typography>
                    <TableContainer sx={{ maxHeight: 400 }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Metric</TableCell>
                                    <TableCell align="right">Duration</TableCell>
                                    <TableCell align="right">Start Time</TableCell>
                                    <TableCell>Metadata</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {metrics.slice(-20).reverse().map((metric, index) => (
                                    <TableRow key={index}>
                                        <TableCell component="th" scope="row">
                                            {metric.name}
                                        </TableCell>
                                        <TableCell align="right">
                                            {metric.duration?.toFixed(2)}ms
                                        </TableCell>
                                        <TableCell align="right">
                                            {new Date(metric.startTime).toLocaleTimeString()}
                                        </TableCell>
                                        <TableCell>
                                            {metric.metadata && (
                                                <Typography variant="caption" component="pre">
                                                    {JSON.stringify(metric.metadata, null, 2)}
                                                </Typography>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {metrics.length === 0 && (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Performance Metrics Yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Use the application or run performance tests to see metrics here.
                    </Typography>
                </Paper>
            )}
        </Box>
    );
}