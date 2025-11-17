import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Person,
  ExitToApp,
  ExpandMore,
  ExpandLess,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useWallet } from '../contexts/WalletContext';

interface WalletConnectionProps {
  variant?: 'button' | 'card';
  showAccountDetails?: boolean;
}

export function WalletConnection({
  variant = 'button',
  showAccountDetails = true
}: WalletConnectionProps) {
  const {
    isConnected,
    isConnecting,
    accounts,
    selectedAccount,
    error,
    connectWallet,
    disconnectWallet,
    selectAccount,
  } = useWallet();

  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showAccountList, setShowAccountList] = useState(false);

  const handleConnect = async () => {
    await connectWallet();
  };

  const handleAccountSelect = (account: unknown) => {
    selectAccount(account);
    setShowAccountDialog(false);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  if (variant === 'card' && isConnected && selectedAccount) {
    return (
      <Card
        sx={{
          mb: 2,
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: (theme) => theme.shadows[8],
          },
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <Person />
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {selectedAccount.meta.name || 'Unnamed Account'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatAddress(selectedAccount.address)}
                </Typography>
                <Chip
                  label={selectedAccount.meta.source}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              {accounts.length > 1 && (
                <Tooltip title="Switch Account">
                  <IconButton
                    onClick={() => setShowAccountDialog(true)}
                    size="small"
                    sx={{
                      transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                      },
                    }}
                  >
                    <ExpandMore />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Disconnect Wallet">
                <IconButton
                  onClick={disconnectWallet}
                  size="small"
                  color="error"
                  sx={{
                    transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      backgroundColor: 'error.main',
                      color: 'error.contrastText',
                    },
                  }}
                >
                  <ExitToApp />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {showAccountDetails && (
            <Box mt={2}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowAccountList(!showAccountList)}
                endIcon={showAccountList ? <ExpandLess /> : <ExpandMore />}
                sx={{
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: (theme) => theme.shadows[2],
                  },
                }}
              >
                Account Details
              </Button>
              {showAccountList && (
                <Box
                  mt={1}
                  p={2}
                  sx={{
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                    borderRadius: 1,
                    animation: 'fadeIn 0.3s ease-in-out',
                    '@keyframes fadeIn': {
                      from: { opacity: 0, transform: 'translateY(-10px)' },
                      to: { opacity: 1, transform: 'translateY(0)' },
                    },
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    <strong>Full Address:</strong> {selectedAccount.address}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    <strong>Source:</strong> {selectedAccount.meta.source}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Box>
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            icon={<ErrorIcon />}
            action={
              <Button color="inherit" size="small" onClick={handleConnect}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {!isConnected ? (
          <Button
            variant="contained"
            size="large"
            onClick={handleConnect}
            disabled={isConnecting}
            startIcon={
              isConnecting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <AccountBalanceWallet />
              )
            }
            sx={{
              minWidth: 200,
              py: 1.5,
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: (theme) => theme.shadows[8],
              },
              '&:active': {
                transform: 'translateY(0px)',
              },
            }}
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        ) : (
          <Box display="flex" alignItems="center" gap={2}>
            <Chip
              avatar={<Avatar><Person /></Avatar>}
              label={`${selectedAccount?.meta.name || 'Account'} (${formatAddress(selectedAccount?.address || '')})`}
              color="primary"
              variant="outlined"
              onClick={() => accounts.length > 1 && setShowAccountDialog(true)}
              clickable={accounts.length > 1}
              sx={{
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: accounts.length > 1 ? 'scale(1.05)' : 'none',
                  boxShadow: accounts.length > 1 ? (theme) => theme.shadows[4] : 'none',
                },
              }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={disconnectWallet}
              startIcon={<ExitToApp />}
              sx={{
                transition: 'transform 0.2s ease-in-out, border-color 0.2s ease-in-out, color 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  borderColor: 'error.main',
                  color: 'error.main',
                },
              }}
            >
              Disconnect
            </Button>
          </Box>
        )}
      </Box>

      {/* Account Selection Dialog */}
      <Dialog
        open={showAccountDialog}
        onClose={() => setShowAccountDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Select Account</DialogTitle>
        <DialogContent>
          <List>
            {accounts.map((account, index) => (
              <ListItem key={account.address} disablePadding>
                <ListItemButton
                  onClick={() => handleAccountSelect(account)}
                  selected={selectedAccount?.address === account.address}
                  sx={{
                    transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateX(8px)',
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar>
                      <Person />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={account.meta.name || `Account ${index + 1}`}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {formatAddress(account.address)}
                        </Typography>
                        <Chip
                          label={account.meta.source}
                          size="small"
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
}