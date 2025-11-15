/**
 * Performance test utilities tests
 */

import { describe, it, expect } from 'vitest';
import { generateMockCredentials, PerformanceTestSuite } from '../performanceTest';

describe('Performance Test Utilities', () => {
  describe('generateMockCredentials', () => {
    it('should generate the correct number of credentials', () => {
      const credentials = generateMockCredentials(10);
      expect(credentials).toHaveLength(10);
    });

    it('should generate credentials with all required fields', () => {
      const credentials = generateMockCredentials(5);
      
      credentials.forEach(credential => {
        expect(credential).toHaveProperty('id');
        expect(credential).toHaveProperty('owner');
        expect(credential).toHaveProperty('credential_type');
        expect(credential).toHaveProperty('name');
        expect(credential).toHaveProperty('description');
        expect(credential).toHaveProperty('issuer');
        expect(credential).toHaveProperty('timestamp');
        expect(credential).toHaveProperty('visibility');
        
        // Validate credential types
        expect(['skill', 'review', 'payment', 'certification']).toContain(credential.credential_type);
        
        // Validate visibility
        expect(['public', 'private']).toContain(credential.visibility);
        
        // Validate timestamp format
        expect(new Date(credential.timestamp)).toBeInstanceOf(Date);
        expect(new Date(credential.timestamp).getTime()).not.toBeNaN();
      });
    });

    it('should generate review credentials with ratings', () => {
      const credentials = generateMockCredentials(50);
      const reviewCredentials = credentials.filter(c => c.credential_type === 'review');
      
      reviewCredentials.forEach(credential => {
        expect(credential.rating).toBeDefined();
        expect(credential.rating).toBeGreaterThanOrEqual(3);
        expect(credential.rating).toBeLessThanOrEqual(5);
      });
    });

    it('should generate credentials sorted by timestamp (newest first)', () => {
      const credentials = generateMockCredentials(20);
      
      for (let i = 1; i < credentials.length; i++) {
        const currentTime = new Date(credentials[i].timestamp).getTime();
        const previousTime = new Date(credentials[i - 1].timestamp).getTime();
        expect(currentTime).toBeLessThanOrEqual(previousTime);
      }
    });

    it('should generate unique credential IDs', () => {
      const credentials = generateMockCredentials(100);
      const ids = credentials.map(c => c.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(credentials.length);
    });

    it('should generate realistic descriptions based on credential type', () => {
      const credentials = generateMockCredentials(20);
      
      const skillCredentials = credentials.filter(c => c.credential_type === 'skill');
      const reviewCredentials = credentials.filter(c => c.credential_type === 'review');
      const paymentCredentials = credentials.filter(c => c.credential_type === 'payment');
      const certificationCredentials = credentials.filter(c => c.credential_type === 'certification');
      
      // Check that descriptions contain relevant keywords
      skillCredentials.forEach(cred => {
        expect(cred.description.toLowerCase()).toMatch(/skill|proficiency|experience|developer|expertise|development/);
      });
      
      reviewCredentials.forEach(cred => {
        expect(cred.description.toLowerCase()).toMatch(/excellent|outstanding|professional|quality|project/);
      });
      
      paymentCredentials.forEach(cred => {
        expect(cred.description.toLowerCase()).toMatch(/payment|received|\$|compensation|project/);
      });
      
      certificationCredentials.forEach(cred => {
        expect(cred.description.toLowerCase()).toMatch(/certification|certified|training|competency|score/);
      });
    });

    it('should generate some credentials with proof hashes', () => {
      const credentials = generateMockCredentials(100);
      const credentialsWithProof = credentials.filter(c => c.proof_hash);
      
      // Should have some credentials with proof (around 50% based on random generation)
      expect(credentialsWithProof.length).toBeGreaterThan(20);
      expect(credentialsWithProof.length).toBeLessThan(80);
      
      // Validate proof hash format (64 character hex string)
      credentialsWithProof.forEach(cred => {
        expect(cred.proof_hash).toMatch(/^[a-f0-9]{64}$/);
      });
    });

    it('should distribute credential types reasonably', () => {
      const credentials = generateMockCredentials(200);
      
      const typeCounts = credentials.reduce((counts, cred) => {
        counts[cred.credential_type] = (counts[cred.credential_type] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);
      
      // Each type should have at least some representation
      expect(typeCounts.skill).toBeGreaterThan(20);
      expect(typeCounts.review).toBeGreaterThan(20);
      expect(typeCounts.payment).toBeGreaterThan(20);
      expect(typeCounts.certification).toBeGreaterThan(20);
    });
  });

  describe('PerformanceTestSuite', () => {
    it('should create a test suite instance', () => {
      const testSuite = new PerformanceTestSuite();
      expect(testSuite).toBeInstanceOf(PerformanceTestSuite);
    });

    it('should have all required test methods', () => {
      const testSuite = new PerformanceTestSuite();
      
      expect(typeof testSuite.testTimelinePerformance).toBe('function');
      expect(typeof testSuite.testSearchFilterPerformance).toBe('function');
      expect(typeof testSuite.testTrustScorePerformance).toBe('function');
      expect(typeof testSuite.testMemoryUsage).toBe('function');
      expect(typeof testSuite.generateReport).toBe('function');
      expect(typeof testSuite.runAllTests).toBe('function');
    });
  });
});