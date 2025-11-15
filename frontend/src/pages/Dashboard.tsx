
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
import { TrustScoreWidget, TrustScoreBreakdown, TrustScoreDemo } from '../components';
import { useWallet } from '../contexts/WalletContext';
import { useCredentials } from '../hooks/useCredentials';
import { useTrustScore } from '../hooks/useTrustScore';
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

  // Calculate trust score from credentials
  const trustScore = useTrustScore(credentials);

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
              <Tab label="Trust Score Demo" />
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
                <Box sx={{ mb: 3 }}>
                  <TrustScoreWidget
                    trustScore={trustScore}
                    animated={true}
                    size="medium"
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <TrustScoreBreakdown
                    trustScore={trustScore}
                    showDetails={true}
                  />
                </Box>

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
              <TrustScoreDemo />
            </Paper>
          )}

          {tabValue === 2 && (
            <Paper sx={{ p: 3 }}>
              <CredentialTimelineDemo />
            </Paper>
          )}

          {tabValue === 3 && (
            <CredentialDemo walletAddress={selectedAccount?.address || null} />
          )}
        </Box>
      )}
    </Container>
  );
}