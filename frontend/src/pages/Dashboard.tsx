
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
import { CredentialTimeline } from '../components/CredentialTimeline';
import { PortfolioSharing } from '../components/PortfolioSharing';
import { TrustScoreWidget, TrustScoreBreakdown } from '../components';
import { useWallet } from '../contexts/WalletContext';
import { useCredentials } from '../hooks/useCredentials';
import { useTrustScore } from '../hooks/useTrustScore';
import { useState } from 'react';
import { SimpleErrorBoundary } from '../components/SimpleErrorBoundary';


export function Dashboard() {
  const [tabValue, setTabValue] = useState(0);

  // Safely get wallet state with error handling
  let isConnected = false;
  let selectedAccount = null;

  try {
    const walletState = useWallet();
    isConnected = walletState?.isConnected || false;
    selectedAccount = walletState?.selectedAccount || null;
  } catch (error) {
    console.error('Error accessing wallet state:', error);
    // Continue with default values
  }

  // Fetch credentials for the connected account (only when connected)
  let credentials = [];
  let credentialsLoading = false;
  let credentialsError = null;

  try {
    const credentialsQuery = useCredentials(isConnected ? selectedAccount?.address || null : null);
    credentials = credentialsQuery.data || [];
    credentialsLoading = credentialsQuery.isLoading || false;
    credentialsError = credentialsQuery.error || null;
  } catch (error) {
    console.error('Error fetching credentials:', error);
    credentialsError = error;
  }

  const displayCredentials = credentials;

  // Calculate trust score from credentials (with error handling)
  const trustScore = useTrustScore(displayCredentials || []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <SimpleErrorBoundary>
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
                <Tab label="Share Portfolio" />
              </Tabs>
            </Paper>

            {tabValue === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 3, minHeight: 400 }}>
                    <CredentialTimeline
                      credentials={displayCredentials}
                      loading={credentialsLoading}
                      error={credentialsError?.message || null}
                      walletAddress={selectedAccount?.address}
                      showVisibilityToggle={true}
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
              <PortfolioSharing
                walletAddress={selectedAccount?.address || ''}
                credentials={displayCredentials}
                trustScore={trustScore}
              />
            )}
          </Box>
        )}
      </Container>
    </SimpleErrorBoundary>
  );
}