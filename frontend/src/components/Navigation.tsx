import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  Dashboard,
  Add,
  FileDownload,
  Menu as MenuIcon,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
import { WalletConnection } from './WalletConnection';
import { useTheme } from '../contexts/ThemeContext';
import { useResponsive } from '../utils/responsive';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleColorMode, isDarkMode } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: <Dashboard /> },
    { path: '/mint', label: 'Mint Credential', icon: <Add /> },
    { path: '/export', label: 'Export Portfolio', icon: <FileDownload /> },
  ];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  // Keyboard navigation for menu
  const menuRef = useKeyboardNavigation({
    onEscape: handleMenuClose,
    enabled: Boolean(anchorEl),
  });

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backdropFilter: 'blur(8px)',
        backgroundColor: (theme) =>
          isDarkMode
            ? 'rgba(30, 30, 30, 0.9)'
            : 'rgba(255, 255, 255, 0.9)',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          sx={{
            px: { xs: 1, sm: 2 },
            minHeight: { xs: 56, sm: 64 },
          }}
        >
          {/* Logo */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 0,
              mr: { xs: 2, md: 4 },
              fontWeight: 700,
              cursor: 'pointer',
              background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
            onClick={() => navigate('/')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                navigate('/');
              }
            }}
          >
            FreelanceForge
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box
              display="flex"
              gap={1}
              sx={{ flexGrow: 1 }}
              role="navigation"
              aria-label="Main navigation"
            >
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  variant={isActivePath(item.path) ? 'outlined' : 'text'}
                  sx={{
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    fontWeight: 500,
                    borderColor: isActivePath(item.path)
                      ? 'primary.main'
                      : 'transparent',
                    color: isActivePath(item.path)
                      ? 'primary.main'
                      : 'text.primary',
                    transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      transform: 'translateY(-1px)',
                    },
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: '2px',
                    },
                  }}
                >
                  {isTablet ? null : item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Mobile Navigation */}
          {isMobile && <Box sx={{ flexGrow: 1 }} />}

          {/* Theme Toggle */}
          <Tooltip title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton
              onClick={toggleColorMode}
              sx={{
                mr: 1,
                color: 'text.primary',
                transition: 'transform 0.3s ease-in-out, background-color 0.3s ease-in-out',
                '&:hover': {
                  transform: 'rotate(180deg)',
                  backgroundColor: 'action.hover',
                },
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: '2px',
                },
              }}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="Open navigation menu"
              aria-expanded={Boolean(anchorEl)}
              aria-haspopup="true"
              onClick={handleMenuOpen}
              sx={{
                mr: 1,
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: '2px',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Wallet Connection */}
          <WalletConnection />

          {/* Mobile Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            TransitionComponent={Fade}
            sx={{
              '& .MuiPaper-root': {
                borderRadius: 2,
                minWidth: 200,
                boxShadow: (theme) =>
                  isDarkMode
                    ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                    : '0 8px 32px rgba(0, 0, 0, 0.12)',
                border: (theme) => `1px solid ${theme.palette.divider}`,
              },
            }}
            MenuListProps={{
              'aria-labelledby': 'navigation-menu-button',
              role: 'menu',
            }}
          >
            {navigationItems.map((item) => (
              <MenuItem
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                selected={isActivePath(item.path)}
                role="menuitem"
                sx={{
                  py: 1.5,
                  px: 2,
                  borderRadius: 1,
                  mx: 1,
                  mb: 0.5,
                  transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateX(4px)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  {item.icon}
                  <Typography variant="body2" fontWeight={500}>
                    {item.label}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
}