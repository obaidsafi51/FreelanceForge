
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Alert,
} from '@mui/material';
import { Dashboard as DashboardIcon } from '@mui/icons-material';
import { WalletConnection } from '../components/WalletConnection';
import { useWallet } from '../contexts/WalletContext';

export function Dashboard() {
  const { isConnected, selectedAccount } = useWallet();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          <DashboardIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage your freelance credentials and portfolio
        </Typography>
      </Box>

      <WalletConnection variant="card" />

      {!isConnected ? (
        <Alert severity="info" sx={{ mt: 3 }}>
          Please connect your wallet to view your credential dashboard.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, minHeight: 400 }}>
              <Typography variant="h5" gutterBottom>
                Credential Timeline
              </Typography>
              <Typography color="text.secondary">
                Your credentials will appear here once you start minting them.
              </Typography>
              <Box 
                display="flex" 
                alignItems="center" 
                justifyContent="center" 
                minHeight={300}
                bgcolor="grey.50"
                borderRadius={1}
                mt={2}
              >
                <Typography variant="body1" color="text.secondary">
                  No credentials found for {selectedAccount?.meta.name || 'this account'}
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Trust Score
              </Typography>
              <Box 
                display="flex" 
                alignItems="center" 
                justifyContent="center" 
                minHeight={150}
                bgcolor="grey.50"
                borderRadius={1}
              >
                <Typography variant="body2" color="text.secondary">
                  Trust score will be calculated from your credentials
                </Typography>
              </Box>
            </Paper>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mint credentials, export portfolio, and share your profile
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}