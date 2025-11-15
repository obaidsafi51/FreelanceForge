
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Alert,
  Chip,
  Grid,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  Public as PublicIcon,
  Verified,
  Launch as LaunchIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useCredentials } from '../hooks/useCredentials';
import { useTrustScore } from '../hooks/useTrustScore';
import { CredentialTimeline } from '../components/CredentialTimeline';
import { TrustScoreWidget, TrustScoreBreakdown } from '../components';
import {
  filterPublicCredentials,
  isValidWalletAddress,
  formatWalletAddress,
  getExplorerUrl,
  generateVerificationBadge,
} from '../utils/sharingUtils';

export function PublicPortfolio() {
  const { walletAddress } = useParams<{ walletAddress: string }>();

  // Validate wallet address
  const isValidAddress = walletAddress && isValidWalletAddress(walletAddress);

  // Fetch credentials for the wallet address
  const {
    data: allCredentials = [],
    isLoading: credentialsLoading,
    error: credentialsError,
  } = useCredentials(isValidAddress ? walletAddress : null);

  // Filter to show only public credentials
  const publicCredentials = filterPublicCredentials(allCredentials);

  // Calculate trust score from public credentials only
  const trustScore = useTrustScore(publicCredentials);

  // Generate verification badge
  const verificationBadge = generateVerificationBadge(publicCredentials.length, trustScore);
  const explorerUrl = getExplorerUrl(walletAddress || '');

  if (!walletAddress) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          No wallet address provided in URL.
        </Alert>
      </Container>
    );
  }

  if (!isValidAddress) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Invalid wallet address format. Please check the URL and try again.
        </Alert>
      </Container>
    );
  }

  if (credentialsLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
          <CircularProgress sx={{ mr: 2 }} />
          <Typography>Loading portfolio...</Typography>
        </Box>
      </Container>
    );
  }

  if (credentialsError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Failed to load portfolio: {credentialsError.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h3" component="h1">
            <PublicIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
            Public Portfolio
          </Typography>

          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            href="/"
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            FreelanceForge
          </Button>
        </Box>

        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Chip
            icon={<Verified />}
            label={`Wallet: ${formatWalletAddress(walletAddress)}`}
            color="primary"
            variant="outlined"
          />

          <Chip
            label={verificationBadge.badgeText}
            color={verificationBadge.badgeColor as any}
            size="small"
          />

          <Chip
            label={`${publicCredentials.length} Public Credentials`}
            color="info"
            size="small"
          />

          {explorerUrl !== '#' && (
            <Button
              size="small"
              startIcon={<LaunchIcon />}
              onClick={() => window.open(explorerUrl, '_blank')}
            >
              View on Explorer
            </Button>
          )}
        </Box>
      </Box>

      {publicCredentials.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            No Public Credentials
          </Typography>
          <Typography color="text.secondary" paragraph>
            This freelancer hasn't made any credentials public yet.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Wallet: {walletAddress}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Main Portfolio Content */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <CredentialTimeline
                credentials={publicCredentials}
                loading={false}
                error={null}
              />
            </Paper>
          </Grid>

          {/* Sidebar with Trust Score */}
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

            {/* Portfolio Stats */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Portfolio Stats
              </Typography>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Public Credentials
                </Typography>
                <Typography variant="h4" color="primary">
                  {publicCredentials.length}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Trust Score
                </Typography>
                <Typography variant="h4" color="primary">
                  {trustScore.total}/100
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Tier
                </Typography>
                <Chip
                  label={trustScore.tier}
                  color={verificationBadge.badgeColor as any}
                  size="medium"
                />
              </Box>

              <Box mt={3}>
                <Typography variant="body2" color="text.secondary">
                  All credentials are verified on the Polkadot blockchain and cannot be tampered with.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Footer */}
      <Box mt={4} pt={3} borderTop={1} borderColor="divider" textAlign="center">
        <Typography variant="body2" color="text.secondary">
          Powered by FreelanceForge • Built on Polkadot
        </Typography>
      </Box>
    </Container>
  );
}