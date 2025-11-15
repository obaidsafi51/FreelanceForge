import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTrustScore, useTrustScoreStats } from '../useTrustScore';
import type { Credential } from '../../types';

const mockCredentials: Credential[] = [
  {
    id: '1',
    owner: 'test-address',
    credential_type: 'review',
    name: 'Great Work',
    description: 'Excellent project delivery',
    issuer: 'Client A',
    rating: 5,
    timestamp: '2024-01-15T10:00:00Z',
    visibility: 'public',
  },
  {
    id: '2',
    owner: 'test-address',
    credential_type: 'skill',
    name: 'React.js',
    description: 'Advanced React skills',
    issuer: 'Self-verified',
    timestamp: '2024-01-10T09:00:00Z',
    visibility: 'public',
  },
  {
    id: '3',
    owner: 'test-address',
    credential_type: 'certification',
    name: 'AWS Certified',
    description: 'Cloud certification',
    issuer: 'AWS',
    timestamp: '2024-01-05T16:00:00Z',
    visibility: 'public',
  },
  {
    id: '4',
    owner: 'test-address',
    credential_type: 'payment',
    name: 'Project Payment - $1500',
    description: 'Payment for development work',
    issuer: 'Client B',
    timestamp: '2024-02-01T12:00:00Z',
    visibility: 'public',
  },
];

describe('useTrustScore', () => {
  it('should calculate trust score from credentials', () => {
    const { result } = renderHook(() => useTrustScore(mockCredentials));
    
    expect(result.current).toHaveProperty('total');
    expect(result.current).toHaveProperty('tier');
    expect(result.current).toHaveProperty('breakdown');
    expect(result.current.breakdown).toHaveProperty('review_score');
    expect(result.current.breakdown).toHaveProperty('skill_score');
    expect(result.current.breakdown).toHaveProperty('payment_score');
    
    expect(typeof result.current.total).toBe('number');
    expect(result.current.total).toBeGreaterThanOrEqual(0);
    expect(result.current.total).toBeLessThanOrEqual(100);
  });

  it('should return zero scores for empty credentials', () => {
    const { result } = renderHook(() => useTrustScore([]));
    
    expect(result.current.total).toBe(0);
    expect(result.current.tier).toBe('Bronze');
    expect(result.current.breakdown.review_score).toBe(0);
    expect(result.current.breakdown.skill_score).toBe(0);
    expect(result.current.breakdown.payment_score).toBe(0);
  });

  it('should memoize results for same credentials', () => {
    const { result, rerender } = renderHook(
      ({ credentials }) => useTrustScore(credentials),
      { initialProps: { credentials: mockCredentials } }
    );
    
    const firstResult = result.current;
    
    // Rerender with same credentials
    rerender({ credentials: mockCredentials });
    
    // Should be the same object reference due to memoization
    expect(result.current).toBe(firstResult);
  });

  it('should recalculate when credentials change', () => {
    const { result, rerender } = renderHook(
      ({ credentials }) => useTrustScore(credentials),
      { initialProps: { credentials: mockCredentials } }
    );
    
    const firstResult = result.current;
    
    // Rerender with different credentials
    const newCredentials = [...mockCredentials, {
      id: '5',
      owner: 'test-address',
      credential_type: 'review' as const,
      name: 'Another Review',
      description: 'More excellent work',
      issuer: 'Client C',
      rating: 4,
      timestamp: '2024-03-01T10:00:00Z',
      visibility: 'public' as const,
    }];
    
    rerender({ credentials: newCredentials });
    
    // Should be different due to changed credentials
    expect(result.current).not.toBe(firstResult);
    expect(result.current.total).not.toBe(firstResult.total);
  });
});

describe('useTrustScoreStats', () => {
  it('should provide comprehensive statistics', () => {
    const { result } = renderHook(() => useTrustScoreStats(mockCredentials));
    
    expect(result.current).toHaveProperty('trustScore');
    expect(result.current).toHaveProperty('credentialCounts');
    expect(result.current).toHaveProperty('averageRating');
    expect(result.current).toHaveProperty('hasCredentials');
    
    expect(result.current.credentialCounts.total).toBe(4);
    expect(result.current.credentialCounts.reviews).toBe(1);
    expect(result.current.credentialCounts.skills).toBe(1);
    expect(result.current.credentialCounts.certifications).toBe(1);
    expect(result.current.credentialCounts.payments).toBe(1);
    
    expect(result.current.averageRating).toBe(5);
    expect(result.current.hasCredentials).toBe(true);
  });

  it('should handle empty credentials correctly', () => {
    const { result } = renderHook(() => useTrustScoreStats([]));
    
    expect(result.current.credentialCounts.total).toBe(0);
    expect(result.current.averageRating).toBe(0);
    expect(result.current.hasCredentials).toBe(false);
  });

  it('should calculate correct average rating', () => {
    const credentialsWithMultipleRatings: Credential[] = [
      {
        id: '1',
        owner: 'test-address',
        credential_type: 'review',
        name: 'Review 1',
        description: 'Good work',
        issuer: 'Client A',
        rating: 4,
        timestamp: '2024-01-15T10:00:00Z',
        visibility: 'public',
      },
      {
        id: '2',
        owner: 'test-address',
        credential_type: 'review',
        name: 'Review 2',
        description: 'Excellent work',
        issuer: 'Client B',
        rating: 5,
        timestamp: '2024-01-20T10:00:00Z',
        visibility: 'public',
      },
      {
        id: '3',
        owner: 'test-address',
        credential_type: 'review',
        name: 'Review 3',
        description: 'Great work',
        issuer: 'Client C',
        rating: 3,
        timestamp: '2024-01-25T10:00:00Z',
        visibility: 'public',
      },
    ];

    const { result } = renderHook(() => useTrustScoreStats(credentialsWithMultipleRatings));
    
    // Average of 4, 5, 3 = 4
    expect(result.current.averageRating).toBe(4);
  });
});