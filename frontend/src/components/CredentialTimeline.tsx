import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
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
    Alert,
    CircularProgress,
    SelectChangeEvent,
    Button,
    Skeleton,
} from '@mui/material';
import {
    Search as SearchIcon,
    Sort as SortIcon,
    FilterList as FilterIcon,
    ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { CredentialCard } from './CredentialCard';
import type { Credential } from '../types';
import { performanceMonitor, PerformanceMetrics, usePerformanceMonitor } from '../utils/performance';
import './CredentialTimeline.css';

// Performance constants
const ITEMS_PER_PAGE = 20;
const DEBOUNCE_DELAY = 300;

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
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [displayedItems, setDisplayedItems] = useState(ITEMS_PER_PAGE);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

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
                    comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
                    break;
                case 'type':
                    comparison = a.credential_type.localeCompare(b.credential_type);
                    break;
                case 'rating':
                    const aRating = a.rating || 0;
                    const bRating = b.rating || 0;
                    comparison = aRating - bRating;
                    break;
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
        setSortField(event.target.value as SortField);
        setDisplayedItems(ITEMS_PER_PAGE); // Reset pagination when sorting changes
    }, []);

    const handleSortOrderChange = useCallback((event: SelectChangeEvent<SortOrder>) => {
        setSortOrder(event.target.value as SortOrder);
        setDisplayedItems(ITEMS_PER_PAGE); // Reset pagination when sorting changes
    }, []);

    const handleFilterTypeChange = useCallback((event: SelectChangeEvent<FilterType>) => {
        setFilterType(event.target.value as FilterType);
        setDisplayedItems(ITEMS_PER_PAGE); // Reset pagination when filter changes
    }, []);

    const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setDisplayedItems(ITEMS_PER_PAGE); // Reset pagination when search changes
    }, []);

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
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>
                    Loading credentials...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box mb={3}>
                <Typography variant="h5" gutterBottom>
                    Credential Timeline
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {credentials.length} credential{credentials.length !== 1 ? 's' : ''} found
                </Typography>
            </Box>

            {/* Controls */}
            <Paper sx={{ p: 2, mb: 3 }} className="credential-timeline-controls">
                <Grid container spacing={2} alignItems="center">
                    {/* Search */}
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search credentials..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
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
                                startAdornment={<SortIcon sx={{ mr: 1, color: 'text.secondary' }} />}
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
                                startAdornment={<FilterIcon sx={{ mr: 1, color: 'text.secondary' }} />}
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
                    <Box mt={2}>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            {searchTerm && (
                                <Chip
                                    label={`Search: "${searchTerm}"`}
                                    onDelete={() => setSearchTerm('')}
                                    size="small"
                                />
                            )}
                            {filterType !== 'all' && (
                                <Chip
                                    label={`Type: ${filterType}`}
                                    color={getCredentialTypeColor(filterType) as any}
                                    onDelete={() => setFilterType('all')}
                                    size="small"
                                />
                            )}
                        </Stack>
                    </Box>
                )}
            </Paper>

            {/* Timeline */}
            {filteredAndSortedCredentials.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No credentials found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {credentials.length === 0
                            ? 'Start by minting your first credential to build your portfolio.'
                            : 'Try adjusting your search or filter criteria.'}
                    </Typography>
                </Paper>
            ) : (
                <Box>
                    {/* Render displayed credentials */}
                    {displayedCredentials.map((credential, index) => (
                        <Box key={credential.id} mb={2}>
                            <CredentialCard
                                credential={credential}
                                showTimeline={index < displayedCredentials.length - 1}
                                walletAddress={walletAddress}
                                showVisibilityToggle={showVisibilityToggle}
                            />
                        </Box>
                    ))}

                    {/* Load more section */}
                    {hasMoreItems && (
                        <Box textAlign="center" mt={3} mb={2}>
                            {isLoadingMore ? (
                                <Box>
                                    <CircularProgress size={24} sx={{ mb: 2 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        Loading more credentials...
                                    </Typography>
                                </Box>
                            ) : (
                                <Button
                                    variant="outlined"
                                    onClick={handleLoadMore}
                                    startIcon={<ExpandMoreIcon />}
                                    sx={{ mb: 2 }}
                                >
                                    Load More ({filteredAndSortedCredentials.length - displayedItems} remaining)
                                </Button>
                            )}
                        </Box>
                    )}

                    {/* Intersection observer target for infinite scroll */}
                    <div ref={loadMoreRef} style={{ height: '1px' }} />

                    {/* Performance info for development */}
                    {process.env.NODE_ENV === 'development' && (
                        <Box mt={2} p={2} bgcolor="grey.100" borderRadius={1}>
                            <Typography variant="caption" color="text.secondary">
                                Performance: Showing {displayedCredentials.length} of {filteredAndSortedCredentials.length} filtered credentials
                                ({credentials.length} total)
                            </Typography>
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
}