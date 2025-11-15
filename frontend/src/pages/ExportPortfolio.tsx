
import {
  Container,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { FileDownload as ExportIcon } from '@mui/icons-material';
import { WalletConnection, PortfolioExporter } from '../components';
import { useWallet } from '../contexts/WalletContext';

export function ExportPortfolio() {
  const { isConnected, selectedAccount } = useWallet();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          <ExportIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Export Portfolio
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Export and share your verifiable credential portfolio
        </Typography>
      </Box>

      <WalletConnection variant="card" />

      {!isConnected ? (
        <Alert severity="info" sx={{ mt: 3 }}>
          Please connect your wallet to export your portfolio.
        </Alert>
      ) : selectedAccount ? (
        <Box mt={3}>
          <PortfolioExporter walletAddress={selectedAccount.address} />
        </Box>
      ) : (
        <Alert severity="warning" sx={{ mt: 3 }}>
          Please select an account to export your portfolio.
        </Alert>
      )}
    </Container>
  );
}