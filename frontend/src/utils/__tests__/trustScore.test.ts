import { describe, it, expect } from 'vitest';
import { calculateTrustScore, getTierColor, getTierDescription, WEIGHTS, TIER_BOUNDARIES } from '../trustScore';
import type { Credential } from '../../types';

// Mock credentials for testing
const mockCredentials: Credential[] = [
  // Review credentials
  {
    id: '1',
    owner: 'test-address',
    credential_type: 'review',
    name: 'Excellent React Developer',
    description: 'Outstanding work on our e-commerce platform',
    issuer: 'TechCorp Inc',
    rating: 5,
    timestamp: '2024-01-15T10:00:00Z',
    visibility: 'public',
  },
  {
    id: '2',
    owner: 'test-address',
    credential_type: 'review',
    name: 'Great UI/UX Work',
    description: 'Delivered beautiful designs on time',
    issuer: 'DesignStudio',
    rating: 4,
    timestamp: '2024-02-20T14:30:00Z',
    visibility: 'public',
  },
  // Skill credentials
  {
    id: '3',
    owner: 'test-address',
    credential_type: 'skill',
    name: 'React.js',
    description: 'Advanced React development skills',
    issuer: 'Self-verified',
    timestamp: '2024-01-10T09:00:00Z',
    visibility: 'public',
  },
  {
    id: '4',
    owner: 'test-address',
    credential_type: 'skill',
    name: 'TypeScript',
    description: 'Strong TypeScript programming skills',
    issuer: 'Self-verified',
    timestamp: '2024-01-12T11:00:00Z',
    visibility: 'public',
  },
  // Certification credentials
  {
    id: '5',
    owner: 'test-address',
    credential_type: 'certification',
    name: 'AWS Certified Developer',
    description: 'Amazon Web Services certification',
    issuer: 'Amazon Web Services',
    timestamp: '2024-01-05T16:00:00Z',
    visibility: 'public',
  },
  // Payment credentials
  {
    id: '6',
    owner: 'test-address',
    credential_type: 'payment',
    name: 'Project Payment - $2500',
    description: 'Payment received for React development project worth $2500',
    issuer: 'ClientCorp',
    timestamp: '2024-03-01T12:00:00Z',
    visibility: 'public',
  },
  {
    id: '7',
    owner: 'test-address',
    credential_type: 'payment',
    name: 'Consulting Fee',
    description: 'Received $1200 for technical consulting',
    issuer: 'StartupXYZ',
    timestamp: '2023-06-15T10:00:00Z', // Older payment for recency testing
    visibility: 'public',
  },
];

describe('Trust Score Calculation', () => {
  describe('calculateTrustScore', () => {
    it('should calculate correct trust score with all credential types', () => {
      const result = calculateTrustScore(mockCredentials);
      
      // Expected calculations:
      // Review Score: ((5 + 4) / 2) / 5 * 100 * 0.6 = 4.5 / 5 * 100 * 0.6 = 54
      // Skill Score: (2 skills * 5 + 1 cert * 10) * 0.3 = 20 * 0.3 = 6
      // Payment Score: Approximately (3700 / 1000 * 10) * recency * 0.1 = ~3.7 * 0.1 = ~0.37
      // Total: ~60.37
      
      expect(result.total).toBeGreaterThan(50);
      expect(result.total).toBeLessThan(70);
      expect(result.tier).toBe('Gold'); // Should be in Gold tier (51-75)
      expect(result.breakdown.review_score).toBeCloseTo(54, 1);
      expect(result.breakdown.skill_score).toBeCloseTo(6, 1);
      expect(result.breakdown.payment_score).toBeGreaterThan(0);
    });

    it('should handle empty credentials array', () => {
      const result = calculateTrustScore([]);
      
      expect(result.total).toBe(0);
      expect(result.tier).toBe('Bronze');
      expect(result.breakdown.review_score).toBe(0);
      expect(result.breakdown.skill_score).toBe(0);
      expect(result.breakdown.payment_score).toBe(0);
    });

    it('should handle credentials with only reviews', () => {
      const reviewOnlyCredentials = mockCredentials.filter(c => c.credential_type === 'review');
      const result = calculateTrustScore(reviewOnlyCredentials);
      
      expect(result.breakdown.review_score).toBeCloseTo(54, 1);
      expect(result.breakdown.skill_score).toBe(0);
      expect(result.breakdown.payment_score).toBe(0);
      expect(result.total).toBeCloseTo(54, 1);
    });

    it('should cap skill score at maximum points', () => {
      // Create many skills to test the cap
      const manySkills: Credential[] = Array.from({ length: 25 }, (_, i) => ({
        id: `skill-${i}`,
        owner: 'test-address',
        credential_type: 'skill' as const,
        name: `Skill ${i}`,
        description: `Description ${i}`,
        issuer: 'Self-verified',
        timestamp: '2024-01-01T00:00:00Z',
        visibility: 'public' as const,
      }));

      const result = calculateTrustScore(manySkills);
      
      // Should be capped at 100 points before weight: 100 * 0.3 = 30
      expect(result.breakdown.skill_score).toBe(30);
    });
  });

  describe('Tier Calculation', () => {
    it('should assign Bronze tier for low scores', () => {
      const lowScoreCredentials: Credential[] = [{
        id: '1',
        owner: 'test-address',
        credential_type: 'review',
        name: 'Basic Work',
        description: 'Simple task completion',
        issuer: 'Client',
        rating: 1,
        timestamp: '2024-01-01T00:00:00Z',
        visibility: 'public',
      }];

      const result = calculateTrustScore(lowScoreCredentials);
      expect(result.tier).toBe('Bronze');
      expect(result.total).toBeLessThanOrEqual(TIER_BOUNDARIES.BRONZE.max);
    });

    it('should assign Platinum tier for high scores', () => {
      // Create credentials that should result in high score
      const highScoreCredentials: Credential[] = [
        // Perfect reviews
        ...Array.from({ length: 10 }, (_, i) => ({
          id: `review-${i}`,
          owner: 'test-address',
          credential_type: 'review' as const,
          name: `Perfect Project ${i}`,
          description: 'Outstanding work',
          issuer: `Client ${i}`,
          rating: 5,
          timestamp: '2024-01-01T00:00:00Z',
          visibility: 'public' as const,
        })),
        // Many skills
        ...Array.from({ length: 15 }, (_, i) => ({
          id: `skill-${i}`,
          owner: 'test-address',
          credential_type: 'skill' as const,
          name: `Skill ${i}`,
          description: `Advanced skill ${i}`,
          issuer: 'Self-verified',
          timestamp: '2024-01-01T00:00:00Z',
          visibility: 'public' as const,
        })),
        // Certifications
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `cert-${i}`,
          owner: 'test-address',
          credential_type: 'certification' as const,
          name: `Certification ${i}`,
          description: `Professional certification ${i}`,
          issuer: 'Authority',
          timestamp: '2024-01-01T00:00:00Z',
          visibility: 'public' as const,
        })),
        // High-value payments
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `payment-${i}`,
          owner: 'test-address',
          credential_type: 'payment' as const,
          name: `Large Project Payment - $${5000 + i * 1000}`,
          description: `Payment for major project worth $${5000 + i * 1000}`,
          issuer: `BigClient ${i}`,
          timestamp: '2024-01-01T00:00:00Z',
          visibility: 'public' as const,
        })),
      ];

      const result = calculateTrustScore(highScoreCredentials);
      expect(result.total).toBeGreaterThanOrEqual(TIER_BOUNDARIES.PLATINUM.min);
      expect(result.tier).toBe('Platinum');
    });
  });

  describe('Weight Distribution', () => {
    it('should use correct weights for each component', () => {
      expect(WEIGHTS.REVIEW).toBe(0.60);
      expect(WEIGHTS.SKILL).toBe(0.30);
      expect(WEIGHTS.PAYMENT).toBe(0.10);
      expect(WEIGHTS.REVIEW + WEIGHTS.SKILL + WEIGHTS.PAYMENT).toBeCloseTo(1.0, 10);
    });
  });

  describe('Utility Functions', () => {
    it('should return correct tier colors', () => {
      expect(getTierColor('Bronze')).toBe('#CD7F32');
      expect(getTierColor('Silver')).toBe('#C0C0C0');
      expect(getTierColor('Gold')).toBe('#FFD700');
      expect(getTierColor('Platinum')).toBe('#E5E4E2');
    });

    it('should return correct tier descriptions', () => {
      expect(getTierDescription('Bronze')).toContain('0-25');
      expect(getTierDescription('Silver')).toContain('26-50');
      expect(getTierDescription('Gold')).toContain('51-75');
      expect(getTierDescription('Platinum')).toContain('76-100');
    });
  });
});