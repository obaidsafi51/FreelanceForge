import type { Credential, TrustScore } from '../types';

// Trust score calculation weights
const WEIGHTS = {
  REVIEW: 0.60,
  SKILL: 0.30,
  PAYMENT: 0.10,
} as const;

// Tier boundaries
const TIER_BOUNDARIES = {
  BRONZE: { min: 0, max: 25 },
  SILVER: { min: 26, max: 50 },
  GOLD: { min: 51, max: 75 },
  PLATINUM: { min: 76, max: 100 },
} as const;

// Recency factors for payment score calculation
const RECENCY_FACTORS = {
  RECENT: 1.0,    // Within 6 months
  MEDIUM: 0.7,    // 6-12 months
  OLD: 0.5,       // Over 12 months
} as const;

/**
 * Calculate review score component
 * Formula: (Average rating / 5) × 100 × 0.6
 */
function calculateReviewScore(credentials: Credential[]): number {
  const reviewCredentials = credentials.filter(c => c.credential_type === 'review' && c.rating);

  if (reviewCredentials.length === 0) {
    return 0;
  }

  const totalRating = reviewCredentials.reduce((sum, cred) => sum + (cred.rating || 0), 0);
  const averageRating = totalRating / reviewCredentials.length;

  // (Average rating / 5) × 100 × 0.6
  return (averageRating / 5) * 100 * WEIGHTS.REVIEW;
}

/**
 * Calculate skill score component
 * Formula: (Number of verified skills × 5) + (Certification bonus) with max 100 points, then × 0.3
 */
function calculateSkillScore(credentials: Credential[]): number {
  const skillCredentials = credentials.filter(c => c.credential_type === 'skill');
  const certificationCredentials = credentials.filter(c => c.credential_type === 'certification');

  // Base skill points: 5 points per skill
  const skillPoints = skillCredentials.length * 5;

  // Certification bonus: 10 points per certification
  const certificationBonus = certificationCredentials.length * 10;

  // Cap at 100 points before applying weight
  const totalPoints = Math.min(100, skillPoints + certificationBonus);

  return totalPoints * WEIGHTS.SKILL;
}

/**
 * Calculate recency factor based on credential timestamp
 */
function calculateRecencyFactor(timestamp: string): number {
  const credentialDate = new Date(timestamp);
  const now = new Date();
  const monthsAgo = (now.getTime() - credentialDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

  if (monthsAgo <= 6) {
    return RECENCY_FACTORS.RECENT;
  } else if (monthsAgo <= 12) {
    return RECENCY_FACTORS.MEDIUM;
  } else {
    return RECENCY_FACTORS.OLD;
  }
}

/**
 * Extract payment volume from credential description or name
 * This is a simplified implementation - in a real system, this would be structured data
 */
function extractPaymentVolume(credential: Credential): number {
  // Look for dollar amounts in the credential name or description
  const text = `${credential.name} ${credential.description}`.toLowerCase();

  // Match patterns like $1000, $1,000, $1000.00, etc.
  const dollarMatch = text.match(/\$[\d,]+(?:\.\d{2})?/);
  if (dollarMatch) {
    const amount = dollarMatch[0].replace(/[$,]/g, '');
    return parseFloat(amount) || 0;
  }

  // Match patterns like "1000 USD", "1000 dollars", etc.
  const usdMatch = text.match(/(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:usd|dollars?)/);
  if (usdMatch) {
    const amount = usdMatch[1].replace(/,/g, '');
    return parseFloat(amount) || 0;
  }

  // Default fallback - assume some base payment for payment credentials
  return 100; // $100 default
}

/**
 * Calculate payment score component
 * Formula: MIN(100, (Total payment volume / $1000) × 10) × Recency factor, then × 0.10
 */
function calculatePaymentScore(credentials: Credential[]): number {
  const paymentCredentials = credentials.filter(c => c.credential_type === 'payment');

  if (paymentCredentials.length === 0) {
    return 0;
  }

  let totalWeightedVolume = 0;

  for (const credential of paymentCredentials) {
    const volume = extractPaymentVolume(credential);
    const recencyFactor = calculateRecencyFactor(credential.timestamp);
    totalWeightedVolume += volume * recencyFactor;
  }

  // MIN(100, (Total payment volume / $1000) × 10) × 0.10
  const baseScore = Math.min(100, (totalWeightedVolume / 1000) * 10);
  return baseScore * WEIGHTS.PAYMENT;
}

/**
 * Determine tier based on total score
 */
function calculateTier(totalScore: number): TrustScore['tier'] {
  if (totalScore >= TIER_BOUNDARIES.PLATINUM.min && totalScore <= TIER_BOUNDARIES.PLATINUM.max) {
    return 'Platinum';
  } else if (totalScore >= TIER_BOUNDARIES.GOLD.min && totalScore <= TIER_BOUNDARIES.GOLD.max) {
    return 'Gold';
  } else if (totalScore >= TIER_BOUNDARIES.SILVER.min && totalScore <= TIER_BOUNDARIES.SILVER.max) {
    return 'Silver';
  } else {
    return 'Bronze';
  }
}

/**
 * Calculate complete trust score from credentials
 * Main formula: (0.60 × Review Score) + (0.30 × Skill Score) + (0.10 × Payment Score)
 */
export function calculateTrustScore(credentials: Credential[]): TrustScore {
  const reviewScore = calculateReviewScore(credentials);
  const skillScore = calculateSkillScore(credentials);
  const paymentScore = calculatePaymentScore(credentials);

  const totalScore = Math.round(reviewScore + skillScore + paymentScore);
  const tier = calculateTier(totalScore);

  return {
    total: totalScore,
    tier,
    breakdown: {
      review_score: Math.round(reviewScore * 100) / 100, // Round to 2 decimal places
      skill_score: Math.round(skillScore * 100) / 100,
      payment_score: Math.round(paymentScore * 100) / 100,
    },
  };
}

/**
 * Get tier color for UI display
 */
export function getTierColor(tier: TrustScore['tier'], isDark?: boolean): string {
  switch (tier) {
    case 'Bronze':
      return isDark ? '#CD7F32' : '#B8651F';
    case 'Silver':
      return isDark ? '#C0C0C0' : '#7A7A7A';
    case 'Gold':
      return isDark ? '#FFD700' : '#E6C200';
    case 'Platinum':
      return isDark ? '#B8B8B8' : '#2C2C2C'; // Much more contrasted
    default:
      return isDark ? '#9E9E9E' : '#6E6E6E';
  }
}

/**
 * Get tier description for tooltips
 */
export function getTierDescription(tier: TrustScore['tier']): string {
  switch (tier) {
    case 'Bronze':
      return 'Building reputation (0-25 points)';
    case 'Silver':
      return 'Established freelancer (26-50 points)';
    case 'Gold':
      return 'Highly trusted professional (51-75 points)';
    case 'Platinum':
      return 'Elite freelancer (76-100 points)';
    default:
      return 'Unknown tier';
  }
}

/**
 * Export constants for use in components
 */
export { WEIGHTS, TIER_BOUNDARIES };