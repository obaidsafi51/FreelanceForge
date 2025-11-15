import { describe, it, expect } from 'vitest';
import {
  transformUpworkData,
  transformLinkedInData,
  transformStripeData,
  detectPlatform,
  validateJsonFile,
  generateSampleData,
  type UpworkData,
  type LinkedInData,
  type StripeData,
} from '../mockDataTransformers';

describe('Mock Data Transformers', () => {
  describe('detectPlatform', () => {
    it('should detect Upwork data', () => {
      const upworkData = { jobs: [], skills: [], earnings: [] };
      expect(detectPlatform(upworkData)).toBe('upwork');
    });

    it('should detect LinkedIn data', () => {
      const linkedinData = { recommendations: [], certifications: [] };
      expect(detectPlatform(linkedinData)).toBe('linkedin');
    });

    it('should detect Stripe data', () => {
      const stripeData = { transactions: [], customers: [] };
      expect(detectPlatform(stripeData)).toBe('stripe');
    });

    it('should return unknown for unrecognized data', () => {
      const unknownData = { randomField: 'value' };
      expect(detectPlatform(unknownData)).toBe('unknown');
    });
  });

  describe('validateJsonFile', () => {
    it('should validate correct JSON', () => {
      const validJson = '{"test": "value"}';
      const result = validateJsonFile(validJson);
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual({ test: 'value' });
    });

    it('should reject invalid JSON', () => {
      const invalidJson = '{"test": invalid}';
      const result = validateJsonFile(invalidJson);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('transformUpworkData', () => {
    it('should transform job history to review credentials', () => {
      const upworkData: UpworkData = {
        jobs: [
          {
            title: 'React Development',
            description: 'Built a React app',
            client_name: 'TechCorp',
            client_rating: 4.5,
            earnings: 2500,
            start_date: '2024-01-01T00:00:00Z',
            end_date: '2024-02-01T00:00:00Z',
          },
        ],
      };

      const result = transformUpworkData(upworkData);
      
      expect(result.credentials).toHaveLength(1);
      expect(result.credentials[0]).toMatchObject({
        credential_type: 'review',
        name: 'Client Review: React Development',
        issuer: 'TechCorp',
        rating: 4.5,
      });
      expect(result.errors).toHaveLength(0);
    });

    it('should transform skills to skill credentials', () => {
      const upworkData: UpworkData = {
        skills: [
          { name: 'React.js', level: 'Expert', verified: true },
          { name: 'TypeScript', level: 'Advanced', verified: false },
        ],
      };

      const result = transformUpworkData(upworkData);
      
      expect(result.credentials).toHaveLength(2);
      expect(result.credentials[0]).toMatchObject({
        credential_type: 'skill',
        name: 'React.js',
        issuer: 'Upwork',
      });
      expect(result.credentials[0].description).toContain('Expert');
      expect(result.credentials[0].description).toContain('Verified');
    });

    it('should aggregate earnings by client', () => {
      const upworkData: UpworkData = {
        earnings: [
          { amount: 1000, client: 'TechCorp', date: '2024-01-01T00:00:00Z', project: 'Project 1' },
          { amount: 1500, client: 'TechCorp', date: '2024-02-01T00:00:00Z', project: 'Project 2' },
          { amount: 800, client: 'StartupXYZ', date: '2024-03-01T00:00:00Z', project: 'Project 3' },
        ],
      };

      const result = transformUpworkData(upworkData);
      
      expect(result.credentials).toHaveLength(2);
      
      const techCorpPayment = result.credentials.find(c => c.issuer === 'TechCorp');
      expect(techCorpPayment).toBeDefined();
      expect(techCorpPayment?.description).toContain('$2500.00');
      expect(techCorpPayment?.description).toContain('2 transaction');
    });

    it('should handle missing required fields gracefully', () => {
      const upworkData: UpworkData = {
        jobs: [
          {
            title: '',
            description: 'Test job',
            client_name: 'TechCorp',
            start_date: '2024-01-01T00:00:00Z',
          },
        ],
      };

      const result = transformUpworkData(upworkData);
      
      expect(result.credentials).toHaveLength(0);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('Missing required fields');
    });
  });

  describe('transformLinkedInData', () => {
    it('should transform skills to skill credentials', () => {
      const linkedinData: LinkedInData = {
        skills: [
          { name: 'JavaScript', endorsements: 25, verified: true },
          { name: 'React', endorsements: 18, verified: false },
        ],
      };

      const result = transformLinkedInData(linkedinData);
      
      expect(result.credentials).toHaveLength(2);
      expect(result.credentials[0]).toMatchObject({
        credential_type: 'skill',
        name: 'JavaScript',
        issuer: 'LinkedIn',
      });
      expect(result.credentials[0].description).toContain('25 endorsement');
    });

    it('should transform recommendations to review credentials', () => {
      const linkedinData: LinkedInData = {
        recommendations: [
          {
            text: 'John is an excellent developer',
            recommender: 'Sarah Johnson',
            position: 'CTO',
            date: '2024-01-01T00:00:00Z',
            rating: 5,
          },
        ],
      };

      const result = transformLinkedInData(linkedinData);
      
      expect(result.credentials).toHaveLength(1);
      expect(result.credentials[0]).toMatchObject({
        credential_type: 'review',
        name: 'LinkedIn Recommendation from Sarah Johnson',
        issuer: 'Sarah Johnson (CTO)',
        rating: 5,
      });
    });

    it('should transform certifications to certification credentials', () => {
      const linkedinData: LinkedInData = {
        certifications: [
          {
            name: 'AWS Certified Developer',
            issuer: 'Amazon Web Services',
            date: '2024-01-01T00:00:00Z',
            credential_id: 'AWS-123',
            url: 'https://aws.amazon.com/verify',
          },
        ],
      };

      const result = transformLinkedInData(linkedinData);
      
      expect(result.credentials).toHaveLength(1);
      expect(result.credentials[0]).toMatchObject({
        credential_type: 'certification',
        name: 'AWS Certified Developer',
        issuer: 'Amazon Web Services',
      });
      expect(result.credentials[0].description).toContain('AWS-123');
    });
  });

  describe('transformStripeData', () => {
    it('should aggregate transactions by customer', () => {
      const stripeData: StripeData = {
        transactions: [
          {
            amount: 250000, // $2500 in cents
            currency: 'usd',
            customer_name: 'TechCorp Inc.',
            description: 'Development Services',
            date: '2024-01-01T00:00:00Z',
            status: 'succeeded',
          },
          {
            amount: 150000, // $1500 in cents
            currency: 'usd',
            customer_name: 'TechCorp Inc.',
            description: 'Additional Work',
            date: '2024-02-01T00:00:00Z',
            status: 'succeeded',
          },
        ],
      };

      const result = transformStripeData(stripeData);
      
      expect(result.credentials).toHaveLength(1);
      expect(result.credentials[0]).toMatchObject({
        credential_type: 'payment',
        name: 'Payment History: TechCorp Inc.',
        issuer: 'TechCorp Inc.',
      });
      expect(result.credentials[0].description).toContain('$4000.00');
      expect(result.credentials[0].description).toContain('2 transaction');
    });

    it('should filter out failed transactions', () => {
      const stripeData: StripeData = {
        transactions: [
          {
            amount: 250000,
            currency: 'usd',
            customer_name: 'TechCorp Inc.',
            description: 'Development Services',
            date: '2024-01-01T00:00:00Z',
            status: 'succeeded',
          },
          {
            amount: 150000,
            currency: 'usd',
            customer_name: 'TechCorp Inc.',
            description: 'Failed Payment',
            date: '2024-02-01T00:00:00Z',
            status: 'failed',
          },
        ],
      };

      const result = transformStripeData(stripeData);
      
      expect(result.credentials).toHaveLength(1);
      expect(result.credentials[0].description).toContain('$2500.00');
      expect(result.credentials[0].description).toContain('1 transaction');
    });

    it('should use customer data as fallback', () => {
      const stripeData: StripeData = {
        customers: [
          {
            name: 'TechCorp Inc.',
            email: 'billing@techcorp.com',
            total_spent: 5000,
            first_transaction: '2024-01-01T00:00:00Z',
            last_transaction: '2024-06-01T00:00:00Z',
          },
        ],
      };

      const result = transformStripeData(stripeData);
      
      expect(result.credentials).toHaveLength(1);
      expect(result.credentials[0]).toMatchObject({
        credential_type: 'payment',
        name: 'Payment History: TechCorp Inc.',
        issuer: 'TechCorp Inc.',
      });
      expect(result.credentials[0].description).toContain('$5000.00');
    });
  });

  describe('generateSampleData', () => {
    it('should generate Upwork sample data', () => {
      const sampleData = generateSampleData('upwork');
      
      expect(sampleData).toHaveProperty('jobs');
      expect(sampleData).toHaveProperty('skills');
      expect(sampleData).toHaveProperty('earnings');
      expect(Array.isArray(sampleData.jobs)).toBe(true);
      expect(sampleData.jobs.length).toBeGreaterThan(0);
    });

    it('should generate LinkedIn sample data', () => {
      const sampleData = generateSampleData('linkedin');
      
      expect(sampleData).toHaveProperty('skills');
      expect(sampleData).toHaveProperty('recommendations');
      expect(sampleData).toHaveProperty('certifications');
      expect(Array.isArray(sampleData.skills)).toBe(true);
    });

    it('should generate Stripe sample data', () => {
      const sampleData = generateSampleData('stripe');
      
      expect(sampleData).toHaveProperty('transactions');
      expect(Array.isArray(sampleData.transactions)).toBe(true);
      expect(sampleData.transactions.length).toBeGreaterThan(0);
    });
  });
});