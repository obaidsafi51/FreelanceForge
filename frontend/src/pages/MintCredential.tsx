
import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  CloudUpload as ImportIcon,
} from '@mui/icons-material';
import { WalletConnection } from '../components/WalletConnection';
import { CredentialForm } from '../components/CredentialForm';
import { TransactionPreview } from '../components/TransactionPreview';
import { MockDataImport } from '../components/MockDataImport';
import { useWallet } from '../contexts/WalletContext';
import { useMintCredential } from '../hooks/useCredentials';
import type { CredentialMetadata } from '../utils/api';
import type { BatchMintResult } from '../components/BatchMintProgress';

export function MintCredential() {
  const { isConnected, selectedAccount } = useWallet();
  const mintCredentialMutation = useMintCredential();

  const [activeTab, setActiveTab] = useState(0);
  const [showTransactionPreview, setShowTransactionPreview] = useState(false);
  const [pendingCredential, setPendingCredential] = useState<CredentialMetadata | null>(null);
  const [, setPendingProofFile] = useState<File | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFormSubmit = async (credentialData: CredentialMetadata, proofFile?: File) => {
    if (!selectedAccount) {
      setErrorMessage('No wallet account selected');
      return;
    }

    // Store the credential data and show transaction preview
    setPendingCredential(credentialData);
    setPendingProofFile(proofFile || null);
    setShowTransactionPreview(true);
  };

  const handleTransactionConfirm = async () => {
    if (!selectedAccount || !pendingCredential) {
      setErrorMessage('Missing required data for transaction');
      return;
    }

    try {
      const result = await mintCredentialMutation.mutateAsync({
        accountAddress: selectedAccount.address,
        credentialData: pendingCredential,
      });

      setSuccessMessage(
        `Credential minted successfully! Transaction hash: ${result.hash.slice(0, 10)}...`
      );

      // Reset state
      setShowTransactionPreview(false);
      setPendingCredential(null);
      setPendingProofFile(null);

    } catch (error) {
      console.error('Minting failed:', error);

      let errorMsg = 'Failed to mint credential';
      if (error instanceof Error) {
        // Handle specific API errors
        if (error.message.includes('CredentialAlreadyExists')) {
          errorMsg = 'A credential with this data already exists';
        } else if (error.message.includes('MetadataTooLarge')) {
          errorMsg = 'Credential metadata is too large (max 4KB)';
        } else if (error.message.includes('TooManyCredentials')) {
          errorMsg = 'Maximum credential limit reached (500 per account)';
        } else if (error.message.includes('Cancelled')) {
          errorMsg = 'Transaction was cancelled';
        } else if (error.message.includes('balance')) {
          errorMsg = 'Insufficient balance for transaction fees';
        } else {
          errorMsg = error.message;
        }
      }

      setErrorMessage(errorMsg);
      setShowTransactionPreview(false);
    }
  };

  const handleTransactionCancel = () => {
    setShowTransactionPreview(false);
    setPendingCredential(null);
    setPendingProofFile(null);
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleBatchMintComplete = (results: BatchMintResult[]) => {
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    if (failed === 0) {
      setSuccessMessage(`Successfully minted all ${successful} credentials!`);
    } else if (successful === 0) {
      setErrorMessage(`Failed to mint all ${failed} credentials`);
    } else {
      setSuccessMessage(`Batch complete: ${successful} successful, ${failed} failed`);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          <AddIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Mint Credentials
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Create verifiable NFT credentials for your professional achievements
        </Typography>
      </Box>

      <WalletConnection variant="card" />

      {!isConnected ? (
        <Alert severity="info" sx={{ mt: 3 }}>
          Please connect your wallet to mint credentials.
        </Alert>
      ) : (
        <Paper sx={{ mt: 3 }}>
          {/* Minting Method Tabs */}
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab
              icon={<AddIcon />}
              label="Single Credential"
              iconPosition="start"
            />
            <Tab
              icon={<ImportIcon />}
              label="Import & Batch Mint"
              iconPosition="start"
            />
          </Tabs>

          <Box sx={{ p: 4 }}>
            {activeTab === 0 && (
              <>
                <Typography variant="h5" gutterBottom>
                  Create New Credential
                </Typography>
                <Typography color="text.secondary" paragraph>
                  Fill out the form below to mint a new credential NFT. Your credential will be stored immutably on the blockchain.
                </Typography>

                <CredentialForm
                  onSubmit={handleFormSubmit}
                  isSubmitting={mintCredentialMutation.isPending}
                />
              </>
            )}

            {activeTab === 1 && (
              <MockDataImport onComplete={handleBatchMintComplete} />
            )}
          </Box>
        </Paper>
      )}

      {/* Transaction Preview Dialog */}
      {pendingCredential && (
        <TransactionPreview
          open={showTransactionPreview}
          onClose={handleTransactionCancel}
          onConfirm={handleTransactionConfirm}
          credentialData={pendingCredential}
          accountAddress={selectedAccount?.address || ''}
          isSubmitting={mintCredentialMutation.isPending}
          networkName="Paseo Testnet"
        />
      )}

      {/* Success/Error Notifications */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={8000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}