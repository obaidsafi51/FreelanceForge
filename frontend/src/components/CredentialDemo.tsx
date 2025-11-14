import { useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Alert,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Stack,
} from '@mui/material';
import { useCredentials, useMintCredential } from '../hooks/useCredentials';
import type { CredentialMetadata } from '../utils/api';

interface CredentialDemoProps {
    walletAddress: string | null;
}

/**
 * Demo component to test TanStack Query hooks with credential operations
 * This component demonstrates:
 * - Fetching credentials with caching
 * - Minting credentials with optimistic updates
 * - Loading states and error handling
 * - Cache invalidation
 */
export function CredentialDemo({ walletAddress }: CredentialDemoProps) {
    const [newCredential, setNewCredential] = useState<Partial<CredentialMetadata>>({
        credential_type: 'skill',
        name: '',
        description: '',
        issuer: '',
        visibility: 'public',
    });

    // Use the credentials query hook
    const {
        data: credentials,
        isLoading,
        isError,
        error,
        refetch,
        dataUpdatedAt,
        isStale,
    } = useCredentials(walletAddress);

    // Use the mint credential mutation hook
    const mintMutation = useMintCredential();

    const handleMintCredential = () => {
        if (!walletAddress || !newCredential.name || !newCredential.issuer) {
            return;
        }

        const credentialData: CredentialMetadata = {
            credential_type: newCredential.credential_type as any,
            name: newCredential.name,
            description: newCredential.description || '',
            issuer: newCredential.issuer,
            timestamp: new Date().toISOString(),
            visibility: newCredential.visibility as 'public' | 'private',
        };

        mintMutation.mutate(
            {
                accountAddress: walletAddress,
                credentialData,
            },
            {
                onSuccess: () => {
                    // Reset form on success
                    setNewCredential({
                        credential_type: 'skill',
                        name: '',
                        description: '',
                        issuer: '',
                        visibility: 'public',
                    });
                },
            }
        );
    };

    const handleInvalidateCache = () => {
        if (walletAddress) {
            refetch();
        }
    };

    const handleClearCache = () => {
        // For demo purposes, just refetch
        refetch();
    };

    if (!walletAddress) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Credential Demo
                    </Typography>
                    <Alert severity="info">
                        Please connect your wallet to test credential operations.
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
            <Typography variant="h4" gutterBottom>
                TanStack Query Demo
            </Typography>

            {/* Query Status Information */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Query Status
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <Chip
                            label={isLoading ? 'Loading' : 'Loaded'}
                            color={isLoading ? 'warning' : 'success'}
                        />
                        <Chip
                            label={isStale ? 'Stale' : 'Fresh'}
                            color={isStale ? 'warning' : 'success'}
                        />
                        <Chip
                            label={`${credentials?.length || 0} credentials`}
                            color="info"
                        />
                    </Stack>
                    {dataUpdatedAt && (
                        <Typography variant="body2" color="text.secondary">
                            Last updated: {new Date(dataUpdatedAt).toLocaleString()}
                        </Typography>
                    )}
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                        <Button onClick={() => refetch()} disabled={isLoading}>
                            Refetch
                        </Button>
                        <Button onClick={handleInvalidateCache}>
                            Invalidate Cache
                        </Button>
                        <Button onClick={handleClearCache} color="warning">
                            Clear All Cache
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            {/* Mint New Credential Form */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Mint New Credential (Test Optimistic Updates)
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControl>
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={newCredential.credential_type || 'skill'}
                                onChange={(e) => setNewCredential(prev => ({
                                    ...prev,
                                    credential_type: e.target.value as any
                                }))}
                            >
                                <MenuItem value="skill">Skill</MenuItem>
                                <MenuItem value="review">Review</MenuItem>
                                <MenuItem value="payment">Payment</MenuItem>
                                <MenuItem value="certification">Certification</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Name"
                            value={newCredential.name || ''}
                            onChange={(e) => setNewCredential(prev => ({
                                ...prev,
                                name: e.target.value
                            }))}
                            required
                        />

                        <TextField
                            label="Description"
                            value={newCredential.description || ''}
                            onChange={(e) => setNewCredential(prev => ({
                                ...prev,
                                description: e.target.value
                            }))}
                            multiline
                            rows={2}
                        />

                        <TextField
                            label="Issuer"
                            value={newCredential.issuer || ''}
                            onChange={(e) => setNewCredential(prev => ({
                                ...prev,
                                issuer: e.target.value
                            }))}
                            required
                        />

                        <FormControl>
                            <InputLabel>Visibility</InputLabel>
                            <Select
                                value={newCredential.visibility || 'public'}
                                onChange={(e) => setNewCredential(prev => ({
                                    ...prev,
                                    visibility: e.target.value as 'public' | 'private'
                                }))}
                            >
                                <MenuItem value="public">Public</MenuItem>
                                <MenuItem value="private">Private</MenuItem>
                            </Select>
                        </FormControl>

                        <Button
                            variant="contained"
                            onClick={handleMintCredential}
                            disabled={
                                mintMutation.isPending ||
                                !newCredential.name ||
                                !newCredential.issuer
                            }
                            startIcon={mintMutation.isPending && <CircularProgress size={20} />}
                        >
                            {mintMutation.isPending ? 'Minting...' : 'Mint Credential'}
                        </Button>

                        {mintMutation.isError && (
                            <Alert severity="error">
                                Mint failed: {mintMutation.error?.message}
                            </Alert>
                        )}

                        {mintMutation.isSuccess && mintMutation.data && (
                            <Alert severity="success">
                                Credential minted successfully! Hash: {mintMutation.data.hash}
                            </Alert>
                        )}
                    </Box>
                </CardContent>
            </Card>

            {/* Credentials List */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Your Credentials
                    </Typography>

                    {isLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    )}

                    {isError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            Failed to load credentials: {error?.message}
                        </Alert>
                    )}

                    {credentials && credentials.length === 0 && (
                        <Alert severity="info">
                            No credentials found. Try minting your first credential above!
                        </Alert>
                    )}

                    {credentials && credentials.length > 0 && (
                        <Stack spacing={2}>
                            {credentials.map((credential) => (
                                <Card key={credential.id} variant="outlined">
                                    <CardContent>
                                        <Stack direction="row" justifyContent="space-between" alignItems="start">
                                            <Box>
                                                <Typography variant="h6">
                                                    {credential.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {credential.description}
                                                </Typography>
                                                <Typography variant="caption" display="block">
                                                    Issued by: {credential.issuer}
                                                </Typography>
                                                <Typography variant="caption" display="block">
                                                    Date: {new Date(credential.timestamp).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                            <Stack direction="row" spacing={1}>
                                                <Chip
                                                    label={credential.credential_type}
                                                    size="small"
                                                    color="primary"
                                                />
                                                <Chip
                                                    label={credential.visibility}
                                                    size="small"
                                                    color={credential.visibility === 'public' ? 'success' : 'default'}
                                                />
                                                {credential.rating && (
                                                    <Chip
                                                        label={`★ ${credential.rating}`}
                                                        size="small"
                                                        color="warning"
                                                    />
                                                )}
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}

export default CredentialDemo;