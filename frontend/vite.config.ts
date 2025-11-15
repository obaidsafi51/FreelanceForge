/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  build: {
    // Production build optimizations
    target: 'es2020',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'polkadot-api': ['@polkadot/api', '@polkadot/extension-dapp', '@polkadot/typegen'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'query-vendor': ['@tanstack/react-query'],
          // App chunks
          'utils': ['date-fns', 'yup', 'qrcode.react'],
        },
        // Optimize chunk file names for caching
        chunkFileNames: () => {
          return `assets/[name]-[hash].js`;
        },
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Optimize bundle size
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      '@polkadot/api',
      '@polkadot/extension-dapp',
      '@mui/material',
      '@mui/icons-material',
      '@tanstack/react-query',
      'react',
      'react-dom',
      'react-router-dom',
    ],
  },
  // @ts-ignore - Vitest configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    testTimeout: 10000,
    deps: {
      optimizer: {
        web: {
          include: ['@mui/material', '@mui/icons-material'],
        },
      },
    },
  },
})
