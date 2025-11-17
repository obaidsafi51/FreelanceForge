import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

type PaletteMode = 'light' | 'dark';
import { CssBaseline } from '@mui/material';
import { createFreelanceForgeTheme } from '../theme';

interface ThemeContextType {
    mode: PaletteMode;
    toggleColorMode: () => void;
    isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    // Initialize theme mode from localStorage or system preference
    const [mode, setMode] = useState<PaletteMode>(() => {
        // Check localStorage first
        const savedMode = localStorage.getItem('freelanceforge-theme-mode');
        if (savedMode === 'light' || savedMode === 'dark') {
            return savedMode;
        }

        // Fall back to system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        return 'light';
    });

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e: MediaQueryListEvent) => {
            // Only update if user hasn't manually set a preference
            const savedMode = localStorage.getItem('freelanceforge-theme-mode');
            if (!savedMode) {
                setMode(e.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Save theme preference to localStorage
    useEffect(() => {
        localStorage.setItem('freelanceforge-theme-mode', mode);
    }, [mode]);

    const toggleColorMode = () => {
        setMode((prevMode: PaletteMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    const theme = createFreelanceForgeTheme(mode);
    const isDarkMode = mode === 'dark';

    const contextValue: ThemeContextType = {
        mode,
        toggleColorMode,
        isDarkMode,
    };

    return (
        <ThemeContext.Provider value={contextValue}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

// Hook for accessing MUI theme
export { useTheme as useMuiTheme } from '@mui/material/styles';