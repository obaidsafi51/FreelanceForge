import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Paper,
    Chip,
    Stack,
    SelectChangeEvent,
    Button,
    Collapse,
    IconButton,
    Fade,
    Grow,
    useMediaQuery,
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    ExpandMore as ExpandMoreIcon,
    Clear as ClearIcon,
} from '@mui/icons-material';
import { CredentialCard } from './CredentialCard';
import { LoadingSpinner, EmptyState, ErrorState, SkeletonTimeline } from './LoadingStates';
import { compareTimestamps } from '../utils/dateUtils';
import type { Credential } from '../types';
import { performanceMonitor, PerformanceMetrics, usePerformanceMonitor } from '../utils/performance';
import { useResponsive } from '../utils/responsive';
import { useScreenReaderAnnouncer } from '../hooks/useKeyboardNavigation';
import './CredentialTimeline.css';
import { useTheme } from '@emotion/react';

// Performance constants
const ITEMS_PER_PAGE = 20;
const DEBOUNCE_DELAY = 300;

// Animation constants
const durations = {
    short: 200,
    standard: 300,
    long: 500,
};

const easings = {
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

const animations = {
    fadeInLeft: 'fadeInLeft 0.3s ease-out',
};

interface CredentialTimelineProps {
    credentials: Credential[];
    loading: boolean;
    error?: string | null;
    walletAddress?: string;
    showVisibilityToggle?: boolean;
}

type SortField = 'date' | 'type' | 'rating' | 'name';
type SortOrder = 'asc' | 'desc';
type FilterType = 'all' | 'skill' | 'review' | 'payment' | 'certification';

// Custom hook for debounced search
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export function CredentialTimeline({
    credentials,
    loading,
    error,
    walletAddress,
    showVisibilityToggle = false
}: CredentialTimelineProps) {
    // Performance monitoring
    usePerformanceMonitor('CredentialTimeline', [credentials.length, loading]);
    const navigate = useNavigate();
    const theme = useTheme();
    const { isMobile } = useResponsive();
    const { announce } = useScreenReaderAnnouncer();

    // Check for reduced motion preference
    const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [displayedItems, setDisplayedItems] = useState(ITEMS_PER_PAGE);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [showFilters, setShowFilters] = useState(!isMobile);

    // Debounce search term to prevent excessive filtering
    const debouncedSearchTerm = useDebounce(searchTerm, DEBOUNCE_DELAY);

    // Ref for intersection observer
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Memoized filter and sort function for performance
    const filteredAndSortedCredentials = useMemo(() => {
        performanceMonitor.start(PerformanceMetrics.TIMELINE_FILTER, {
            credentialCount: credentials.length,
            hasSearch: !!debouncedSearchTerm,
            filterType,
            sortField,
        });

        let filtered = credentials;

        // Apply search filter using debounced search term
        if (debouncedSearchTerm) {
            const searchLower = debouncedSearchTerm.toLowerCase();
            filtered = filtered.filter(
                (credential) =>
                    credential.name.toLowerCase().includes(searchLower) ||
                    credential.description.toLowerCase().includes(searchLower) ||
                    credential.issuer.toLowerCase().includes(searchLower)
            );
        }

        // Apply type filter
        if (filterType !== 'all') {
            filtered = filtered.filter((credential) => credential.credential_type === filterType);
        }

        // Apply sorting with optimized comparison
        filtered.sort((a, b) => {
            let comparison = 0;

            switch (sortField) {
                case 'date':
                    comparison = compareTimestamps(a.timestamp, b.timestamp);
                    break;
                case 'type':
                    comparison = a.credential_type.localeCompare(b.credential_type);
                    break;
                case 'rating':
                    {
                        const aRating = a.rating || 0;
                        const bRating = b.rating || 0;
                        comparison = aRating - bRating;
                        break;
                    }
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                default:
                    comparison = 0;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        performanceMonitor.end(PerformanceMetrics.TIMELINE_FILTER, {
            filteredCount: filtered.length,
        });

        return filtered;
    }, [credentials, debouncedSearchTerm, sortField, sortOrder, filterType]);

    // Get currently displayed credentials for pagination
    const displayedCredentials = useMemo(() => {
        return filteredAndSortedCredentials.slice(0, displayedItems);
    }, [filteredAndSortedCredentials, displayedItems]);

    // Check if there are more items to load
    const hasMoreItems = displayedItems < filteredAndSortedCredentials.length;

    // Memoized event handlers to prevent unnecessary re-renders
    const handleSortFieldChange = useCallback((event: SelectChangeEvent<SortField>) => {
        const newSortField = event.target.value as SortField;
        setSortField(newSortField);
        setDisplayedItems(ITEMS_PER_PAGE);
        announce(`Sorted by ${newSortField}`, 'polite');
    }, [announce]);

    const handleSortOrderChange = useCallback((event: SelectChangeEvent<SortOrder>) => {
        const newSortOrder = event.target.value as SortOrder;
        setSortOrder(newSortOrder);
        setDisplayedItems(ITEMS_PER_PAGE);
        announce(`Sort order changed to ${newSortOrder === 'desc' ? 'newest first' : 'oldest first'}`, 'polite');
    }, [announce]);

    const handleFilterTypeChange = useCallback((event: SelectChangeEvent<FilterType>) => {
        const newFilterType = event.target.value as FilterType;
        setFilterType(newFilterType);
        setDisplayedItems(ITEMS_PER_PAGE);
        announce(`Filtered by ${newFilterType === 'all' ? 'all types' : newFilterType}`, 'polite');
    }, [announce]);

    const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setDisplayedItems(ITEMS_PER_PAGE);
    }, []);

    const clearSearch = useCallback(() => {
        setSearchTerm('');
        setDisplayedItems(ITEMS_PER_PAGE);
        announce('Search cleared', 'polite');
    }, [announce]);

    const clearAllFilters = useCallback(() => {
        setSearchTerm('');
        setFilterType('all');
        setSortField('date');
        setSortOrder('desc');
        setDisplayedItems(ITEMS_PER_PAGE);
        announce('All filters cleared', 'polite');
    }, [announce]);



    // Load more items handler
    const handleLoadMore = useCallback(() => {
        if (!isLoadingMore && hasMoreItems) {
            setIsLoadingMore(true);
            // Simulate loading delay for better UX
            setTimeout(() => {
                setDisplayedItems(prev => prev + ITEMS_PER_PAGE);
                setIsLoadingMore(false);
            }, 300);
        }
    }, [isLoadingMore, hasMoreItems]);

    // Intersection observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMoreItems && !isLoadingMore) {
                    handleLoadMore();
                }
            },
            { threshold: 0.1 }
        );

        const currentRef = loadMoreRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [hasMoreItems, isLoadingMore, handleLoadMore]);

    const getCredentialTypeColor = (type: string) => {
        switch (type) {
            case 'skill':
                return 'primary';
            case 'review':
                return 'success';
            case 'payment':
                return 'warning';
            case 'certification':
                return 'secondary';
            default:
                return 'default';
        }
    };



    if (loading) {
        return <SkeletonTimeline count={5} />;
    }

    if (error) {
        return (
            <ErrorState
                title="Failed to load credentials"
                message={error}
                onRetry={() => window.location.reload()}
                severity="error"
            />
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box mb={3}>
                <Typography
                    variant="h4"
                    gutterBottom
                    sx={{
                        fontWeight: 700,
                        background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                    }}
                >
                    Credential Timeline
                </Typography>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                    {filteredAndSortedCredentials.length} of {credentials.length} credential{credentials.length !== 1 ? 's' : ''}
                    {searchTerm || filterType !== 'all' ? ' (filtered)' : ''}
                </Typography>
            </Box>

            {/* Controls */}
            <Paper
                elevation={3}
                sx={{
                    p: { xs: 2, sm: 3 },
                    mb: 3,
                    borderRadius: 4,
                    background: (theme) =>
                        theme.palette.mode === 'dark'
                            ? 'linear-gradient(135deg, rgba(26, 29, 35, 0.95) 0%, rgba(26, 29, 35, 0.9) 100%)'
                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
                    backdropFilter: 'blur(12px)',
                    border: (theme) =>
                        theme.palette.mode === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.12)'
                            : '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: (theme) =>
                        theme.palette.mode === 'dark'
                            ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.6)'
                            : '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
                    position: 'relative',
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
                }}
                className="credential-timeline-controls"
            >
                {/* Mobile Filter Toggle */}
                {isMobile && (
                    <Box mb={2}>
                        <Button
                            variant="outlined"
                            startIcon={<FilterIcon />}
                            onClick={() => setShowFilters(!showFilters)}
                            fullWidth
                            sx={{ borderRadius: 2 }}
                        >
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </Button>
                    </Box>
                )}

                <Collapse in={showFilters || !isMobile}>
                    <Grid container spacing={2} alignItems="center">
                        {/* Search */}
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search credentials..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                        '&:hover': {
                                            transform: 'translateY(-1px)',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        },
                                    },
                                }}
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                    endAdornment: searchTerm && (
                                        <IconButton
                                            size="small"
                                            onClick={clearSearch}
                                            sx={{ mr: -0.5 }}
                                            aria-label="Clear search"
                                        >
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    ),
                                }}
                            />
                        </Grid>

                        {/* Sort Field */}
                        <Grid item xs={6} sm={3} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Sort by</InputLabel>
                                <Select
                                    value={sortField}
                                    label="Sort by"
                                    onChange={handleSortFieldChange}
                                    sx={{
                                        borderRadius: 2,
                                        '& .MuiOutlinedInput-root': {
                                            transition: 'transform 0.2s ease-in-out',
                                            '&:hover': {
                                                transform: 'translateY(-1px)',
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="date">Date</MenuItem>
                                    <MenuItem value="type">Type</MenuItem>
                                    <MenuItem value="rating">Rating</MenuItem>
                                    <MenuItem value="name">Name</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Sort Order */}
                        <Grid item xs={6} sm={3} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Order</InputLabel>
                                <Select
                                    value={sortOrder}
                                    label="Order"
                                    onChange={handleSortOrderChange}
                                    sx={{
                                        borderRadius: 2,
                                        '& .MuiOutlinedInput-root': {
                                            transition: 'transform 0.2s ease-in-out',
                                            '&:hover': {
                                                transform: 'translateY(-1px)',
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="desc">Newest First</MenuItem>
                                    <MenuItem value="asc">Oldest First</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Filter */}
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Filter by type</InputLabel>
                                <Select
                                    value={filterType}
                                    label="Filter by type"
                                    onChange={handleFilterTypeChange}
                                    sx={{
                                        borderRadius: 2,
                                        '& .MuiOutlinedInput-root': {
                                            transition: 'transform 0.2s ease-in-out',
                                            '&:hover': {
                                                transform: 'translateY(-1px)',
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="all">All Types</MenuItem>
                                    <MenuItem value="skill">Skills</MenuItem>
                                    <MenuItem value="review">Reviews</MenuItem>
                                    <MenuItem value="payment">Payments</MenuItem>
                                    <MenuItem value="certification">Certifications</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {/* Active Filters */}
                    {(searchTerm || filterType !== 'all') && (
                        <Fade in timeout={durations.short}>
                            <Box mt={2}>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <Typography variant="caption" color="text.secondary">
                                        Active filters:
                                    </Typography>
                                    <Button
                                        size="small"
                                        onClick={clearAllFilters}
                                        sx={{
                                            minWidth: 'auto',
                                            fontSize: '0.75rem',
                                            py: 0.25,
                                            px: 1,
                                        }}
                                    >
                                        Clear all
                                    </Button>
                                </Box>
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    flexWrap="wrap"
                                    sx={{ gap: 1 }}
                                >
                                    {searchTerm && (
                                        <Chip
                                            label={`Search: "${searchTerm}"`}
                                            onDelete={clearSearch}
                                            size="small"
                                            sx={{
                                                animation: `${animations.fadeInLeft} ${durations.short}ms ${easings.easeOut}`,
                                            }}
                                        />
                                    )}
                                    {filterType !== 'all' && (
                                        <Chip
                                            label={`Type: ${filterType}`}
                                            color={getCredentialTypeColor(filterType) as 'primary' | 'secondary' | 'success' | 'warning' | 'default'}
                                            onDelete={() => setFilterType('all')}
                                            size="small"
                                            sx={{
                                                animation: `${animations.fadeInLeft} ${durations.short}ms ${easings.easeOut}`,
                                                animationDelay: '100ms',
                                            }}
                                        />
                                    )}
                                </Stack>
                            </Box>
                        </Fade>
                    )}
                </Collapse>
            </Paper>

            {/* Timeline */}
            {filteredAndSortedCredentials.length === 0 ? (
                <Fade in timeout={durations.standard}>
                    <Box>
                        <EmptyState
                            title="No credentials found"
                            description={
                                credentials.length === 0
                                    ? 'Start by minting your first credential to build your portfolio.'
                                    : 'Try adjusting your search or filter criteria.'
                            }
                            action={
                                credentials.length === 0 ? (
                                    <Button
                                        variant="contained"
                                        onClick={() => navigate('/mint')}
                                        sx={{ mt: 2 }}
                                    >
                                        Mint Your First Credential
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outlined"
                                        onClick={clearAllFilters}
                                        sx={{ mt: 2 }}
                                    >
                                        Clear Filters
                                    </Button>
                                )
                            }
                        />
                    </Box>
                </Fade>
            ) : (
                <Box>
                    {/* Render displayed credentials with staggered animation */}
                    {displayedCredentials.map((credential, index) => (
                        <Grow
                            key={credential.id}
                            in
                            timeout={prefersReducedMotion ? 0 : durations.standard}
                            style={{
                                transitionDelay: prefersReducedMotion ? '0ms' : `${index * 100}ms`
                            }}
                        >
                            <Box
                                mb={2}
                                sx={{
                                    '&:hover': {
                                        '& .credential-card': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: (theme) =>
                                                theme.palette.mode === 'dark'
                                                    ? '0 8px 32px rgba(0,0,0,0.4)'
                                                    : '0 8px 32px rgba(0,0,0,0.12)',
                                        },
                                    },
                                }}
                            >
                                <CredentialCard
                                    credential={credential}
                                    showTimeline={index < displayedCredentials.length - 1}
                                    walletAddress={walletAddress}
                                    showVisibilityToggle={showVisibilityToggle}
                                />
                            </Box>
                        </Grow>
                    ))}

                    {/* Load more section */}
                    {hasMoreItems && (
                        <Fade in timeout={durations.standard}>
                            <Box textAlign="center" mt={4} mb={2}>
                                {isLoadingMore ? (
                                    <LoadingSpinner
                                        size={32}
                                        message="Loading more credentials..."
                                    />
                                ) : (
                                    <Button
                                        variant="outlined"
                                        onClick={handleLoadMore}
                                        startIcon={<ExpandMoreIcon />}
                                        size="large"
                                        sx={{
                                            borderRadius: 3,
                                            px: 4,
                                            py: 1.5,
                                            fontSize: '1rem',
                                            fontWeight: 500,
                                            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                            },
                                        }}
                                    >
                                        Load More ({filteredAndSortedCredentials.length - displayedItems} remaining)
                                    </Button>
                                )}
                            </Box>
                        </Fade>
                    )}

                    {/* Intersection observer target for infinite scroll */}
                    <div ref={loadMoreRef} style={{ height: '1px' }} />

                    {/* Performance info for development */}
                    {process.env.NODE_ENV === 'development' && (
                        <Fade in timeout={durations.standard}>
                            <Box
                                mt={3}
                                p={2}
                                bgcolor="action.hover"
                                borderRadius={2}
                                border={(theme) => `1px solid ${theme.palette.divider}`}
                            >
                                <Typography variant="caption" color="text.secondary">
                                    Performance: Showing {displayedCredentials.length} of {filteredAndSortedCredentials.length} filtered credentials
                                    ({credentials.length} total)
                                </Typography>
                            </Box>
                        </Fade>
                    )}
                </Box>
            )}
        </Box>
    );
}