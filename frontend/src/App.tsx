
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { WalletProvider } from './contexts/WalletContext';
import { QueryProvider } from './providers/QueryProvider';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { MintCredential } from './pages/MintCredential';
import { ExportPortfolio } from './pages/ExportPortfolio';
import { PublicPortfolio } from './pages/PublicPortfolio';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h3: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <QueryProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <WalletProvider>
          <Router>
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
              <Navigation />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/mint" element={<MintCredential />} />
                <Route path="/export" element={<ExportPortfolio />} />
                <Route path="/portfolio/:walletAddress" element={<PublicPortfolio />} />
              </Routes>
            </Box>
          </Router>
        </WalletProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}

export default App;
