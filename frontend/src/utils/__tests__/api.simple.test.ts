import { describe, it, expect } from 'vitest';
import { ApiError, ApiErrorType, type CredentialMetadata } from '../api';

describe('API Utilities', () => {
  describe('ApiError', () => {
    it('should create ApiError with correct properties', () => {
      const error = new ApiError(
        ApiErrorType.VALIDATION_ERROR,
        'Test error message'
      );

      expect(error.type).toBe(ApiErrorType.VALIDATION_ERROR);
      expect(error.message).toBe('Test error message');
      expect(error.name).toBe('ApiError');
    });

    it('should include original error when provided', () => {
      const originalError = new Error('Original error');
      const apiError = new ApiError(
        ApiErrorType.NETWORK_ERROR,
        'Network failed',
        originalError
      );

      expect(apiError.originalError).toBe(originalError);
    });
  });

  describe('Credential Metadata Validation', () => {
    it('should validate credential metadata structure', () => {
      const validMetadata: CredentialMetadata = {
        credential_type: 'skill',
        name: 'React Development',
        description: 'Expert in React.js development',
        issuer: 'Tech Company',
        timestamp: new Date().toISOString(),
        visibility: 'public',
      };

      // Test that all required fields are present
      expect(validMetadata.credential_type).toBeDefined();
      expect(validMetadata.name).toBeDefined();
      expect(validMetadata.description).toBeDefined();
      expect(validMetadata.issuer).toBeDefined();
      expect(validMetadata.timestamp).toBeDefined();
      expect(validMetadata.visibility).toBeDefined();
    });

    it('should validate credential types', () => {
      const validTypes = ['skill', 'review', 'payment', 'certification'];
      
      validTypes.forEach(type => {
        const metadata: CredentialMetadata = {
          credential_type: type as any,
          name: 'Test',
          description: 'Test description',
          issuer: 'Test issuer',
          timestamp: new Date().toISOString(),
          visibility: 'public',
        };
        
        expect(['skill', 'review', 'payment', 'certification']).toContain(metadata.credential_type);
      });
    });

    it('should validate visibility options', () => {
      const validVisibilities = ['public', 'private'];
      
      validVisibilities.forEach(visibility => {
        const metadata: CredentialMetadata = {
          credential_type: 'skill',
          name: 'Test',
          description: 'Test description',
          issuer: 'Test issuer',
          timestamp: new Date().toISOString(),
          visibility: visibility as any,
        };
        
        expect(['public', 'private']).toContain(metadata.visibility);
      });
    });

    it('should validate metadata size limits', () => {
      const metadata: CredentialMetadata = {
        credential_type: 'skill',
        name: 'Test Credential',
        description: 'A test credential for size validation',
        issuer: 'Test Issuer',
        timestamp: new Date().toISOString(),
        visibility: 'public',
      };

      const jsonString = JSON.stringify(metadata);
      const sizeInBytes = new TextEncoder().encode(jsonString).length;
      const maxSize = 4096; // 4KB limit

      expect(sizeInBytes).toBeLessThan(maxSize);
    });

    it('should handle optional fields correctly', () => {
      const metadataWithOptionals: CredentialMetadata = {
        credential_type: 'review',
        name: 'Client Review',
        description: 'Excellent work on the project',
        issuer: 'Client Name',
        rating: 4.5,
        timestamp: new Date().toISOString(),
        visibility: 'public',
        proof_hash: 'abc123def456',
        metadata: {
          platform: 'Upwork',
          external_id: 'job_12345',
          verification_url: 'https://upwork.com/verify/12345',
        },
      };

      expect(metadataWithOptionals.rating).toBe(4.5);
      expect(metadataWithOptionals.proof_hash).toBe('abc123def456');
      expect(metadataWithOptionals.metadata?.platform).toBe('Upwork');
    });
  });

  describe('Error Types', () => {
    it('should have all required error types', () => {
      const expectedErrorTypes = [
        'CONNECTION_FAILED',
        'TRANSACTION_FAILED',
        'INSUFFICIENT_BALANCE',
        'CREDENTIAL_ALREADY_EXISTS',
        'METADATA_TOO_LARGE',
        'TOO_MANY_CREDENTIALS',
        'CREDENTIAL_NOT_FOUND',
        'NOT_CREDENTIAL_OWNER',
        'NETWORK_ERROR',
        'VALIDATION_ERROR',
      ];

      expectedErrorTypes.forEach(errorType => {
        expect(ApiErrorType[errorType as keyof typeof ApiErrorType]).toBeDefined();
      });
    });
  });
});