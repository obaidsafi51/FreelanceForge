// Test setup file for vitest
import { vi } from 'vitest';

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

// Global test utilities
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;