
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
    <Container
      maxWidth="md"
      sx={{
        py: 4,
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Box
        mb={4}
        sx={{
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)'
          }
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            transition: 'color 0.2s ease-in-out',
            '&:hover': {
              opacity: 0.8
            }
          }}
        >
          <ExportIcon
            sx={{
              mr: 2,
              verticalAlign: 'middle',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'rotate(5deg) scale(1.05)'
              }
            }}
          />
          Export Portfolio
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            transition: 'opacity 0.2s ease-in-out',
            '&:hover': {
              opacity: 0.8
            }
          }}
        >
          Export and share your verifiable credential portfolio
        </Typography>
      </Box>

      <WalletConnection variant="card" />

      {!isConnected ? (
        <Alert
          severity="info"
          sx={{
            mt: 3,
            transition: 'transform 0.15s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: 2
            }
          }}
        >
          Please connect your wallet to export your portfolio.
        </Alert>
      ) : selectedAccount ? (
        <Box
          mt={3}
          sx={{
            transition: 'transform 0.15s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)'
            }
          }}
        >
          <PortfolioExporter walletAddress={selectedAccount.address} />
        </Box>
      ) : (
        <Alert
          severity="warning"
          sx={{
            mt: 3,
            transition: 'transform 0.15s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: 2
            }
          }}
        >
          Please select an account to export your portfolio.
        </Alert>
      )}
    </Container>
  );
}