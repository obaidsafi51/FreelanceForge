import { useMemo } from 'react';
import type { Credential, TrustScore } from '../types';
import { calculateTrustScore } from '../utils/trustScore';

/**
 * Custom hook for calculating trust score from credentials
 * Memoizes the calculation to prevent unnecessary recalculations
 */
export function useTrustScore(credentials: Credential[]): TrustScore {
  return useMemo(() => {
    return calculateTrustScore(credentials);
  }, [credentials]);
}

/**
 * Hook for getting trust score statistics
 */
export function useTrustScoreStats(credentials: Credential[]) {
  return useMemo(() => {
    const trustScore = calculateTrustScore(credentials);
    
    // Calculate credential counts by type
    const credentialCounts = {
      total: credentials.length,
      reviews: credentials.filter(c => c.credential_type === 'review').length,
      skills: credentials.filter(c => c.credential_type === 'skill').length,
      payments: credentials.filter(c => c.credential_type === 'payment').length,
      certifications: credentials.filter(c => c.credential_type === 'certification').length,
    };
    
    // Calculate average rating from reviews
    const reviewCredentials = credentials.filter(c => c.credential_type === 'review' && c.rating);
    const averageRating = reviewCredentials.length > 0
      ? reviewCredentials.reduce((sum, cred) => sum + (cred.rating || 0), 0) / reviewCredentials.length
      : 0;
    
    return {
      trustScore,
      credentialCounts,
      averageRating: Math.round(averageRating * 100) / 100,
      hasCredentials: credentials.length > 0,
    };
  }, [credentials]);
}