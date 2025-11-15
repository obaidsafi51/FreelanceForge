// Test setup file for vitest
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock @polkadot/extension-dapp
vi.mock('@polkadot/extension-dapp', () => ({
  web3Enable: vi.fn().mockResolvedValue([]),
  web3FromAddress: vi.fn().mockResolvedValue({
    signer: {
      signPayload: vi.fn(),
      signRaw: vi.fn(),
    },
  }),
}));

// Mock MUI icons to avoid ES module issues
vi.mock('@mui/icons-material', () => ({
  EmojiEvents: () => 'EmojiEvents',
  Star: () => 'Star',
  TrendingUp: () => 'TrendingUp',
  Reviews: () => 'Reviews',
  Psychology: () => 'Psychology',
  Payment: () => 'Payment',
  Info: () => 'Info',
}));

// Global test utilities
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;