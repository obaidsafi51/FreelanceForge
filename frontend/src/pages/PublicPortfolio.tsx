
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Alert,
  Chip,
} from '@mui/material';
import { Public as PublicIcon, Verified } from '@mui/icons-material';

export function PublicPortfolio() {
  const { walletAddress } = useParams<{ walletAddress: string }>();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          <PublicIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Public Portfolio
        </Typography>
        <Box display="flex" alignItems="center" gap={2} mt={2}>
          <Chip
            icon={<Verified />}
            label={`Wallet: ${walletAddress ? formatAddress(walletAddress) : 'Unknown'}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label="Blockchain Verified"
            color="success"
            size="small"
          />
        </Box>
      </Box>

      {!walletAddress ? (
        <Alert severity="error">
          Invalid wallet address provided in URL.
        </Alert>
      ) : (
        <Box>
          <Paper sx={{ p: 4, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Freelancer Profile
            </Typography>
            <Typography color="text.secondary" paragraph>
              This is a public view of credentials for wallet address: {walletAddress}
            </Typography>
            
            <Box 
              display="flex" 
              alignItems="center" 
              justifyContent="center" 
              minHeight={300}
              bgcolor="grey.50"
              borderRadius={1}
            >
              <Typography variant="body1" color="text.secondary">
                Public portfolio display will be implemented in a future task
              </Typography>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Trust Score & Verification
            </Typography>
            <Typography color="text.secondary">
              All credentials are verifiable on the Polkadot blockchain.
            </Typography>
          </Paper>
        </Box>
      )}
    </Container>
  );
}