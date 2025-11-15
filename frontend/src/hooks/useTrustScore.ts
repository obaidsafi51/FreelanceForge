import { useMemo } from 'react';
import type { Credential, TrustScore } from '../types';
import { calculateTrustScore } from '../utils/trustScore';

/**
 * Custom hook for calculating trust score from credentials
 * Memoizes the calculation to prevent unnecessary recalculations
 * Uses deep comparison for credentials array to avoid recalculation on reference changes
 */
export function useTrustScore(credentials: Credential[]): TrustScore {
  return useMemo(() => {
    // Early return for empty credentials
    if (!credentials || credentials.length === 0) {
      return {
        total: 0,
        tier: 'Bronze',
        breakdown: {
          review_score: 0,
          skill_score: 0,
          payment_score: 0,
        },
      };
    }
    
    return calculateTrustScore(credentials);
  }, [
    // Use JSON.stringify for deep comparison to prevent unnecessary recalculations
    // when credentials array reference changes but content is the same
    JSON.stringify(credentials.map(c => ({
      id: c.id,
      credential_type: c.credential_type,
      rating: c.rating,
      timestamp: c.timestamp,
    })))
  ]);
}

/**
 * Hook for getting trust score statistics with optimized calculations
 */
export function useTrustScoreStats(credentials: Credential[]) {
  return useMemo(() => {
    // Early return for empty credentials
    if (!credentials || credentials.length === 0) {
      return {
        trustScore: {
          total: 0,
          tier: 'Bronze' as const,
          breakdown: {
            review_score: 0,
            skill_score: 0,
            payment_score: 0,
          },
        },
        credentialCounts: {
          total: 0,
          reviews: 0,
          skills: 0,
          payments: 0,
          certifications: 0,
        },
        averageRating: 0,
        hasCredentials: false,
      };
    }

    const trustScore = calculateTrustScore(credentials);
    
    // Calculate credential counts by type in a single pass
    const credentialCounts = credentials.reduce((counts, credential) => {
      counts.total++;
      switch (credential.credential_type) {
        case 'review':
          counts.reviews++;
          break;
        case 'skill':
          counts.skills++;
          break;
        case 'payment':
          counts.payments++;
          break;
        case 'certification':
          counts.certifications++;
          break;
      }
      return counts;
    }, {
      total: 0,
      reviews: 0,
      skills: 0,
      payments: 0,
      certifications: 0,
    });
    
    // Calculate average rating from reviews in a single pass
    const { totalRating, reviewCount } = credentials.reduce((acc, credential) => {
      if (credential.credential_type === 'review' && credential.rating) {
        acc.totalRating += credential.rating;
        acc.reviewCount++;
      }
      return acc;
    }, { totalRating: 0, reviewCount: 0 });
    
    const averageRating = reviewCount > 0 
      ? Math.round((totalRating / reviewCount) * 100) / 100 
      : 0;
    
    return {
      trustScore,
      credentialCounts,
      averageRating,
      hasCredentials: credentials.length > 0,
    };
  }, [
    // Use optimized dependency to prevent unnecessary recalculations
    credentials.length,
    JSON.stringify(credentials.map(c => ({
      credential_type: c.credential_type,
      rating: c.rating,
    })))
  ]);
}