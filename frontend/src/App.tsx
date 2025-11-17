

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { WalletProvider } from './contexts/WalletContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { QueryProvider } from './providers/QueryProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotificationProvider } from './components/NotificationSystem';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { MintCredential } from './pages/MintCredential';
import { ExportPortfolio } from './pages/ExportPortfolio';
import { PublicPortfolio } from './pages/PublicPortfolio';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NotificationProvider>
          <QueryProvider>
            <WalletProvider>
              <Router>
                <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
                  <Navigation />
                  <ErrorBoundary>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/mint" element={<MintCredential />} />
                      <Route path="/export" element={<ExportPortfolio />} />
                      <Route path="/portfolio/:walletAddress" element={<PublicPortfolio />} />
                    </Routes>
                  </ErrorBoundary>
                </Box>
              </Router>
            </WalletProvider>
          </QueryProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
