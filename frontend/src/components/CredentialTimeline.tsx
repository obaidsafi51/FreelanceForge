import React, { useState, useMemo } from 'react';
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
} from '@mui/material';
import {
    Search as SearchIcon,
    Sort as SortIcon,
    FilterList as FilterIcon,
} from '@mui/icons-material';
import { CredentialCard } from './CredentialCard';
import type { Credential } from '../types';
import './CredentialTimeline.css';

interface CredentialTimelineProps {
    credentials: Credential[];
    loading: boolean;
    error?: string | null;
}

type SortField = 'date' | 'type' | 'rating' | 'name';
type SortOrder = 'asc' | 'desc';
type FilterType = 'all' | 'skill' | 'review' | 'payment' | 'certification';

export function CredentialTimeline({ credentials, loading, error }: CredentialTimelineProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [filterType, setFilterType] = useState<FilterType>('all');

    // Filter and sort credentials
    const filteredAndSortedCredentials = useMemo(() => {
        let filtered = credentials;

        // Apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
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

        // Apply sorting
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

        return filtered;
    }, [credentials, searchTerm, sortField, sortOrder, filterType]);

    const handleSortFieldChange = (event: SelectChangeEvent<SortField>) => {
        setSortField(event.target.value as SortField);
    };

    const handleSortOrderChange = (event: SelectChangeEvent<SortOrder>) => {
        setSortOrder(event.target.value as SortOrder);
    };

    const handleFilterTypeChange = (event: SelectChangeEvent<FilterType>) => {
        setFilterType(event.target.value as FilterType);
    };

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
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                    {filteredAndSortedCredentials.map((credential, index) => (
                        <Box key={credential.id} mb={2}>
                            <CredentialCard
                                credential={credential}
                                showTimeline={index < filteredAndSortedCredentials.length - 1}
                            />
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
}