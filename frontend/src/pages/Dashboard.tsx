
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import { Dashboard as DashboardIcon } from '@mui/icons-material';
import { WalletConnection } from '../components/WalletConnection';
import { CredentialDemo } from '../components/CredentialDemo';
import { CredentialTimeline } from '../components/CredentialTimeline';
import { CredentialTimelineDemo } from '../components/CredentialTimelineDemo';
import { useWallet } from '../contexts/WalletContext';
import { useCredentials } from '../hooks/useCredentials';
import { useState } from 'react';

export function Dashboard() {
  const { isConnected, selectedAccount } = useWallet();
  const [tabValue, setTabValue] = useState(0);

  // Fetch credentials for the connected account
  const {
    data: credentials = [],
    isLoading: credentialsLoading,
    error: credentialsError,
  } = useCredentials(selectedAccount?.address || null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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
        <Box sx={{ mt: 3 }}>
          <Paper sx={{ mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ px: 2 }}>
              <Tab label="Portfolio View" />
              <Tab label="Timeline Demo" />
              <Tab label="TanStack Query Demo" />
            </Tabs>
          </Paper>

          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3, minHeight: 400 }}>
                  <CredentialTimeline
                    credentials={credentials}
                    loading={credentialsLoading}
                    error={credentialsError?.message || null}
                  />
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

          {tabValue === 1 && (
            <Paper sx={{ p: 3 }}>
              <CredentialTimelineDemo />
            </Paper>
          )}

          {tabValue === 2 && (
            <CredentialDemo walletAddress={selectedAccount?.address || null} />
          )}
        </Box>
      )}
    </Container>
  );
}