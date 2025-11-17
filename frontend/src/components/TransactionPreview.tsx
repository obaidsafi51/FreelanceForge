import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Alert,
    Divider,
    Chip,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Security as SecurityIcon,
    AccountBalance as AccountBalanceIcon,
    Receipt as ReceiptIcon,
    Warning as WarningIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    HelpOutline as HelpIcon,
} from '@mui/icons-material';
import { useWallet } from '../contexts/WalletContext';
import { getNetworkInfo } from '../utils/api';
import type { CredentialMetadata } from '../utils/api';

export interface TransactionDetails {
    type: 'mint_credential' | 'update_credential' | 'delete_credential';
    palletName: string;
    extrinsicName: string;
    parameters: Record<string, any>;
    estimatedFee?: string;
    credentialData?: CredentialMetadata;
    credentialId?: string;
    updates?: {
        visibility?: 'public' | 'private';
        proof_hash?: string;
    };
}

interface TransactionPreviewProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    onCancel: () => void;
    transactionDetails?: TransactionDetails;
    isLoading?: boolean;
    error?: string;
}

export function TransactionPreview({
    open,
    onClose,
    onConfirm,
    onCancel,
    transactionDetails,
    isLoading = false,
    error,
}: TransactionPreviewProps) {
    const { selectedAccount } = useWallet();
    const [networkInfo, setNetworkInfo] = useState<any>(null);
    const [loadingNetwork, setLoadingNetwork] = useState(true);

    // Load network information
    useEffect(() => {
        if (open) {
            loadNetworkInfo();
        }
    }, [open]);

    const loadNetworkInfo = async () => {
        try {
            setLoadingNetwork(true);
            const info = await getNetworkInfo();
            setNetworkInfo(info);
        } catch (error) {
            console.error('Failed to load network info:', error);
        } finally {
            setLoadingNetwork(false);
        }
    };

    // Format transaction type for display
    const getTransactionTypeInfo = () => {
        if (!transactionDetails || !transactionDetails.type) {
            return {
                title: 'Loading Transaction',
                description: 'Preparing transaction details...',
                color: 'default' as const,
                IconComponent: HelpIcon,
            };
        }

        switch (transactionDetails.type) {
            case 'mint_credential':
                return {
                    title: 'Mint Credential NFT',
                    description: 'Create a new soulbound credential NFT on the blockchain',
                    color: 'success' as const,
                    IconComponent: AddIcon,
                };
            case 'update_credential':
                return {
                    title: 'Update Credential',
                    description: 'Modify credential visibility or add proof hash',
                    color: 'info' as const,
                    IconComponent: EditIcon,
                };
            case 'delete_credential':
                return {
                    title: 'Delete Credential',
                    description: 'Permanently remove credential from blockchain',
                    color: 'error' as const,
                    IconComponent: DeleteIcon,
                };
            default:
                return {
                    title: 'Unknown Transaction',
                    description: 'Unknown transaction type',
                    color: 'default' as const,
                    IconComponent: HelpIcon,
                };
        }
    };

    const typeInfo = getTransactionTypeInfo();

    // Format parameters for display
    const formatParameterValue = (key: string, value: any): string => {
        if (key === 'metadata_json' && typeof value === 'object') {
            return JSON.stringify(value, null, 2);
        }

        if (key === 'visibility' && Array.isArray(value)) {
            return new TextDecoder().decode(new Uint8Array(value));
        }

        if (typeof value === 'object') {
            return JSON.stringify(value);
        }

        return String(value);
    };

    // Security warnings
    const getSecurityWarnings = (): string[] => {
        const warnings: string[] = [];

        if (!transactionDetails) {
            return warnings;
        }

        if (transactionDetails.type === 'mint_credential') {
            warnings.push('This will create a permanent, non-transferable NFT on the blockchain');
            warnings.push('Credential data will be publicly visible on-chain');

            if (transactionDetails.credentialData?.visibility === 'private') {
                warnings.push('Private credentials are still stored on-chain but excluded from public sharing');
            }
        }

        if (transactionDetails.type === 'delete_credential') {
            warnings.push('This action cannot be undone - the credential will be permanently deleted');
        }

        if (transactionDetails.estimatedFee) {
            const fee = parseFloat(transactionDetails.estimatedFee);
            if (fee > 0.1) {
                warnings.push(`High transaction fee: ${transactionDetails.estimatedFee} DOT`);
            }
        }

        return warnings;
    };

    const securityWarnings = getSecurityWarnings();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { minHeight: '60vh' }
            }}
        >
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={2}>
                    <SecurityIcon color="primary" />
                    <Box>
                        <Typography variant="h6">
                            Transaction Security Review
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Please review the transaction details before signing
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {/* Transaction Type */}
                <Card sx={{
                    mb: 3,
                    background: theme => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(33, 150, 243, 0.02) 100%)',
                    border: theme => theme.palette.mode === 'dark'
                        ? '1px solid rgba(33, 150, 243, 0.2)'
                        : '1px solid rgba(33, 150, 243, 0.1)'
                }}>
                    <CardContent>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    background: theme => theme.palette.mode === 'dark'
                                        ? 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)'
                                        : 'linear-gradient(135deg, #2196f3 0%, #1565c0 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white'
                                }}
                            >
                                <typeInfo.IconComponent sx={{ fontSize: '1.5rem' }} />
                            </Box>
                            <Box flex={1}>
                                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                                    {typeInfo.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {typeInfo.description}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {/* Network Information */}
                <Card sx={{
                    mb: 3,
                    background: theme => theme.palette.mode === 'dark'
                        ? 'rgba(26, 29, 35, 0.6)'
                        : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(8px)'
                }}>
                    <CardContent>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <AccountBalanceIcon color="primary" />
                            <Typography variant="h6">
                                Network Information
                            </Typography>
                        </Box>

                        {loadingNetwork ? (
                            <Box display="flex" alignItems="center" gap={2}>
                                <CircularProgress size={20} />
                                <Typography variant="body2">Loading network info...</Typography>
                            </Box>
                        ) : networkInfo ? (
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Network
                                    </Typography>
                                    <Typography variant="body1">
                                        {networkInfo.chainName}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Endpoint
                                    </Typography>
                                    <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                                        {networkInfo.endpoint}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Account
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontFamily: 'monospace',
                                            fontSize: '0.75rem',
                                            wordBreak: 'break-all',
                                            lineHeight: 1.2
                                        }}
                                        title={selectedAccount?.address}
                                    >
                                        {selectedAccount?.address ?
                                            `${selectedAccount.address.slice(0, 8)}...${selectedAccount.address.slice(-8)}` :
                                            'No account'
                                        }
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Estimated Fee
                                    </Typography>
                                    <Typography variant="body1">
                                        {transactionDetails?.estimatedFee || '< 0.01'} DOT
                                    </Typography>
                                </Grid>
                            </Grid>
                        ) : (
                            <Alert severity="warning">
                                Failed to load network information
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* Transaction Details */}
                <Card sx={{
                    mb: 3,
                    background: theme => theme.palette.mode === 'dark'
                        ? 'rgba(26, 29, 35, 0.6)'
                        : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(8px)'
                }}>
                    <CardContent>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <ReceiptIcon color="primary" />
                            <Typography variant="h6">
                                Transaction Details
                            </Typography>
                        </Box>

                        <Grid container spacing={2} mb={2}>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Pallet
                                </Typography>
                                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                                    {transactionDetails?.palletName || 'Loading...'}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Extrinsic
                                </Typography>
                                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                                    {transactionDetails?.extrinsicName || 'Loading...'}
                                </Typography>
                            </Grid>
                        </Grid>

                        {/* Credential Data Preview */}
                        {transactionDetails?.credentialData && (
                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="body2">
                                        Credential Data
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Box sx={{
                                        bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                                        p: 2,
                                        borderRadius: 1
                                    }}>
                                        <Typography variant="body2" component="pre" sx={{
                                            fontFamily: 'monospace',
                                            fontSize: '0.75rem',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                            color: 'text.primary'
                                        }}>
                                            {JSON.stringify(transactionDetails?.credentialData || {}, null, 2)}
                                        </Typography>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        )}

                        {/* Update Details */}
                        {transactionDetails?.updates && (
                            <Box mt={2}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Updates
                                </Typography>
                                {transactionDetails?.updates?.visibility && (
                                    <Typography variant="body2">
                                        • Visibility: {transactionDetails.updates.visibility}
                                    </Typography>
                                )}
                                {transactionDetails?.updates?.proof_hash && (
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                        • Proof Hash: {transactionDetails.updates.proof_hash}
                                    </Typography>
                                )}
                            </Box>
                        )}

                        {/* Raw Parameters */}
                        {transactionDetails?.parameters && Object.keys(transactionDetails.parameters).length > 0 && (
                            <Accordion sx={{ mt: 2 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="body2">
                                        Raw Parameters
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Box sx={{
                                        bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                                        p: 2,
                                        borderRadius: 1
                                    }}>
                                        {Object.entries(transactionDetails?.parameters || {}).map(([key, value]) => (
                                            <Box key={key} mb={1}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {key}:
                                                </Typography>
                                                <Typography variant="body2" component="pre" sx={{
                                                    fontFamily: 'monospace',
                                                    fontSize: '0.75rem',
                                                    ml: 1,
                                                    whiteSpace: 'pre-wrap',
                                                    wordBreak: 'break-word',
                                                    color: 'text.primary'
                                                }}>
                                                    {formatParameterValue(key, value)}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        )}
                    </CardContent>
                </Card>

                {/* Security Warnings */}
                {securityWarnings.length > 0 && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        <Box display="flex" alignItems="flex-start" gap={1}>
                            <WarningIcon sx={{ mt: 0.5 }} />
                            <Box>
                                <Typography variant="body2" fontWeight="medium" gutterBottom>
                                    Security Considerations
                                </Typography>
                                {securityWarnings.map((warning, index) => (
                                    <Typography key={index} variant="body2" component="div">
                                        • {warning}
                                    </Typography>
                                ))}
                            </Box>
                        </Box>
                    </Alert>
                )}

                <Divider sx={{ my: 2 }} />

                <Alert severity="info">
                    <Typography variant="body2">
                        By confirming this transaction, you acknowledge that you have reviewed the details above
                        and understand the implications of this blockchain operation. This transaction will be
                        signed with your wallet and cannot be reversed once confirmed.
                    </Typography>
                </Alert>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button
                    onClick={onCancel}
                    disabled={isLoading}
                    size="large"
                >
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    disabled={isLoading || !!error}
                    startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
                    size="large"
                >
                    {isLoading ? 'Processing...' : 'Sign Transaction'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}