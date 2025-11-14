import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Divider,
    Alert,
    Chip,
    Grid,
    Paper,
    CircularProgress,
} from '@mui/material';
import {
    AccountBalance as AccountBalanceIcon,
    Receipt as ReceiptIcon,
    Security as SecurityIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import type { CredentialMetadata } from '../utils/api';

interface TransactionPreviewProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    credentialData: CredentialMetadata;
    accountAddress: string;
    isSubmitting: boolean;
    estimatedFee?: string;
    networkName?: string;
}

export function TransactionPreview({
    open,
    onClose,
    onConfirm,
    credentialData,
    accountAddress,
    isSubmitting,
    estimatedFee = '< 0.01 DOT',
    networkName = 'Paseo Testnet',
}: TransactionPreviewProps) {
    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-6)}`;
    };

    const getCredentialTypeColor = (type: string) => {
        const colors = {
            skill: '#2196f3',
            review: '#4caf50',
            payment: '#ff9800',
            certification: '#9c27b0',
        };
        return colors[type as keyof typeof colors] || '#757575';
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 }
            }}
        >
            <DialogTitle>
                <Box display="flex" alignItems="center">
                    <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                        Transaction Preview
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                    Review the transaction details before signing
                </Typography>
            </DialogTitle>

            <DialogContent>
                <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                        You are about to mint a credential NFT on the {networkName}.
                        This action is irreversible and will create a permanent record on the blockchain.
                    </Typography>
                </Alert>

                {/* Transaction Details */}
                <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                    <Box display="flex" alignItems="center" mb={2}>
                        <ReceiptIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6">Transaction Details</Typography>
                    </Box>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                                Function Call
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                                freelanceCredentials.mintCredential
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                                Network
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                                {networkName}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                                From Account
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                                {formatAddress(accountAddress)}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                                Estimated Fee
                            </Typography>
                            <Typography variant="body1" fontWeight="medium" color="primary.main">
                                {estimatedFee}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Credential Data */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                        <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6">Credential Data</Typography>
                    </Box>

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <Chip
                                    label={credentialData.credential_type.toUpperCase()}
                                    sx={{
                                        bgcolor: getCredentialTypeColor(credentialData.credential_type),
                                        color: 'white',
                                        fontWeight: 'bold',
                                    }}
                                    size="small"
                                />
                                <Chip
                                    label={credentialData.visibility.toUpperCase()}
                                    variant="outlined"
                                    size="small"
                                    color={credentialData.visibility === 'public' ? 'success' : 'warning'}
                                />
                            </Box>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                                Name
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                                {credentialData.name}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                                Issuer
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                                {credentialData.issuer}
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                                Description
                            </Typography>
                            <Typography variant="body1">
                                {credentialData.description}
                            </Typography>
                        </Grid>

                        {credentialData.rating && (
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Rating
                                </Typography>
                                <Typography variant="body1" fontWeight="medium">
                                    {credentialData.rating}/5 stars
                                </Typography>
                            </Grid>
                        )}

                        {credentialData.proof_hash && (
                            <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">
                                    Proof Document Hash
                                </Typography>
                                <Typography
                                    variant="body2"
                                    fontFamily="monospace"
                                    sx={{
                                        wordBreak: 'break-all',
                                        bgcolor: 'grey.100',
                                        p: 1,
                                        borderRadius: 1,
                                    }}
                                >
                                    {credentialData.proof_hash}
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </Paper>

                {/* Storage Information */}
                <Alert severity="info" icon={<AccountBalanceIcon />}>
                    <Typography variant="body2">
                        <strong>Storage Details:</strong> This credential will be stored permanently on the blockchain.
                        The metadata size is {JSON.stringify(credentialData).length} bytes
                        (limit: 4,096 bytes). {credentialData.proof_hash ?
                            'The proof document hash ensures document integrity without storing the full file on-chain.' :
                            'No proof document attached.'
                        }
                    </Typography>
                </Alert>

                <Divider sx={{ my: 2 }} />

                {/* Security Notice */}
                <Alert severity="warning">
                    <Typography variant="body2">
                        <strong>Important:</strong> Once minted, this credential NFT will be permanently bound to your account
                        (soulbound) and cannot be transferred. You can update its visibility or delete it, but the blockchain
                        record will remain immutable.
                    </Typography>
                </Alert>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button
                    onClick={onClose}
                    disabled={isSubmitting}
                    variant="outlined"
                >
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    disabled={isSubmitting}
                    variant="contained"
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
                >
                    {isSubmitting ? 'Signing Transaction...' : 'Sign & Submit'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}