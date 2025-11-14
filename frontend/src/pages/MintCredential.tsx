
import {
  Container,
  Typography,
  Box,
  Paper,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { WalletConnection } from '../components/WalletConnection';
import { useWallet } from '../contexts/WalletContext';

export function MintCredential() {
  const { isConnected } = useWallet();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          <AddIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Mint Credential
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
        <Paper sx={{ p: 4, mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Create New Credential
          </Typography>
          <Typography color="text.secondary" paragraph>
            Fill out the form below to mint a new credential NFT. Your credential will be stored immutably on the blockchain.
          </Typography>
          
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="center" 
            minHeight={400}
            bgcolor="grey.50"
            borderRadius={1}
          >
            <Typography variant="body1" color="text.secondary">
              Credential minting form will be implemented in the next task
            </Typography>
          </Box>
        </Paper>
      )}
    </Container>
  );
}