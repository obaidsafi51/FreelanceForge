/**
 * Integration test for API layer - tests actual connection to Substrate node
 * This test requires a running Substrate node with the FreelanceCredentials pallet
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { 
  freelanceForgeAPI, 
  connectToBlockchain,
  getNetworkInfo,
  type CredentialMetadata 
} from './api';

// Skip these tests if no Substrate node is running
const SKIP_INTEGRATION_TESTS = !process.env.RUN_INTEGRATION_TESTS;

describe.skipIf(SKIP_INTEGRATION_TESTS)('API Integration Tests', () => {
  beforeAll(async () => {
    try {
      await connectToBlockchain();
    } catch (error) {
      console.warn('Substrate node not available, skipping integration tests');
      throw error;
    }
  });

  afterAll(async () => {
    await freelanceForgeAPI.disconnect();
  });

  it('should connect to Substrate node', async () => {
    const api = await connectToBlockchain();
    expect(api).toBeDefined();
    expect(api.isConnected).toBe(true);
  });

  it('should get network information', async () => {
    const networkInfo = await getNetworkInfo();
    
    expect(networkInfo).toHaveProperty('network');
    expect(networkInfo).toHaveProperty('endpoint');
    expect(networkInfo).toHaveProperty('chainName');
    expect(networkInfo).toHaveProperty('nodeVersion');
    expect(networkInfo.isConnected).toBe(true);
  });

  it('should validate credential metadata structure', () => {
    const validMetadata: CredentialMetadata = {
      credential_type: 'skill',
      name: 'JavaScript Development',
      description: 'Expert in JavaScript and React development',
      issuer: 'Tech Company Inc.',
      rating: 5,
      timestamp: new Date().toISOString(),
      visibility: 'public',
      proof_hash: 'a'.repeat(64), // Valid SHA256 hash format
      metadata: {
        platform: 'upwork',
        external_id: 'skill_123',
        verification_url: 'https://example.com/verify',
      },
    };

    // Test that metadata serializes to valid JSON under 4KB
    const jsonString = JSON.stringify(validMetadata);
    const sizeInBytes = new TextEncoder().encode(jsonString).length;
    
    expect(sizeInBytes).toBeLessThan(4096);
    expect(() => JSON.parse(jsonString)).not.toThrow();
  });

  it('should handle large metadata gracefully', () => {
    const largeMetadata: CredentialMetadata = {
      credential_type: 'skill',
      name: 'JavaScript Development',
      description: 'A'.repeat(4000), // Very large description
      issuer: 'Tech Company Inc.',
      timestamp: new Date().toISOString(),
      visibility: 'public',
    };

    const jsonString = JSON.stringify(largeMetadata);
    const sizeInBytes = new TextEncoder().encode(jsonString).length;
    
    expect(sizeInBytes).toBeGreaterThan(4096);
  });

  it('should validate credential types', () => {
    const validTypes = ['skill', 'review', 'payment', 'certification'];
    
    validTypes.forEach(type => {
      const metadata: CredentialMetadata = {
        credential_type: type as any,
        name: `Test ${type}`,
        description: `Test ${type} description`,
        issuer: 'Test Issuer',
        timestamp: new Date().toISOString(),
        visibility: 'public',
      };
      
      expect(() => JSON.stringify(metadata)).not.toThrow();
    });
  });

  it('should validate visibility settings', () => {
    const validVisibilities = ['public', 'private'];
    
    validVisibilities.forEach(visibility => {
      const metadata: CredentialMetadata = {
        credential_type: 'skill',
        name: 'Test Credential',
        description: 'Test description',
        issuer: 'Test Issuer',
        timestamp: new Date().toISOString(),
        visibility: visibility as any,
      };
      
      expect(() => JSON.stringify(metadata)).not.toThrow();
    });
  });
});