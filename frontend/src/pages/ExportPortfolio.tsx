
import {
  Container,
  Typography,
  Box,
  Paper,
  Alert,
} from '@mui/material';
import { FileDownload as ExportIcon } from '@mui/icons-material';
import { WalletConnection } from '../components/WalletConnection';
import { useWallet } from '../contexts/WalletContext';

export function ExportPortfolio() {
  const { isConnected } = useWallet();

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
      ) : (
        <Paper sx={{ p: 4, mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Portfolio Export Options
          </Typography>
          <Typography color="text.secondary" paragraph>
            Export your credentials as JSON or generate shareable links and QR codes for your portfolio.
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
              Export functionality will be implemented in a future task
            </Typography>
          </Box>
        </Paper>
      )}
    </Container>
  );
}