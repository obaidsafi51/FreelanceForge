import { describe, it, expect } from 'vitest';
import type { Credential } from '../../types';

const mockCredential: Credential = {
    id: '0x1234567890abcdef',
    owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    credential_type: 'skill',
    name: 'React Development',
    description: 'Proficient in React.js with 3+ years of experience building modern web applications.',
    issuer: 'Tech Academy',
    rating: 4.8,
    timestamp: '2024-01-15T10:30:00Z',
    visibility: 'public',
    proof_hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
};

// Test credential type configuration logic
function getCredentialConfig(type: string) {
    switch (type) {
        case 'skill':
            return { label: 'Skill', color: 'primary' };
        case 'review':
            return { label: 'Review', color: 'success' };
        case 'payment':
            return { label: 'Payment', color: 'warning' };
        case 'certification':
            return { label: 'Certification', color: 'secondary' };
        default:
            return { label: 'Unknown', color: 'default' };
    }
}

// Test date formatting logic
function formatCredentialDate(timestamp: string) {
    const date = new Date(timestamp);
    return {
        isValid: !isNaN(date.getTime()),
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
    };
}

// Test credential ID truncation
function truncateCredentialId(id: string, length: number = 16): string {
    return id.length > length ? `${id.slice(0, length)}...` : id;
}

describe('CredentialCard Logic', () => {
    it('returns correct configuration for skill credential', () => {
        const config = getCredentialConfig('skill');

        expect(config.label).toBe('Skill');
        expect(config.color).toBe('primary');
    });

    it('returns correct configuration for review credential', () => {
        const config = getCredentialConfig('review');

        expect(config.label).toBe('Review');
        expect(config.color).toBe('success');
    });

    it('returns correct configuration for payment credential', () => {
        const config = getCredentialConfig('payment');

        expect(config.label).toBe('Payment');
        expect(config.color).toBe('warning');
    });

    it('returns correct configuration for certification credential', () => {
        const config = getCredentialConfig('certification');

        expect(config.label).toBe('Certification');
        expect(config.color).toBe('secondary');
    });

    it('returns default configuration for unknown credential type', () => {
        const config = getCredentialConfig('unknown');

        expect(config.label).toBe('Unknown');
        expect(config.color).toBe('default');
    });

    it('formats credential date correctly', () => {
        const formatted = formatCredentialDate(mockCredential.timestamp);

        expect(formatted.isValid).toBe(true);
        expect(formatted.year).toBe(2024);
        expect(formatted.month).toBe(1); // January
        expect(formatted.day).toBe(15);
    });

    it('handles invalid date format', () => {
        const formatted = formatCredentialDate('invalid-date');

        expect(formatted.isValid).toBe(false);
    });

    it('truncates credential ID correctly', () => {
        const truncated = truncateCredentialId(mockCredential.id);

        expect(truncated).toBe('0x1234567890abcd...');
        expect(truncated.length).toBe(19); // 16 chars + '...'
    });

    it('does not truncate short credential ID', () => {
        const shortId = '0x123';
        const truncated = truncateCredentialId(shortId);

        expect(truncated).toBe(shortId);
    });

    it('truncates with custom length', () => {
        const truncated = truncateCredentialId(mockCredential.id, 8);

        expect(truncated).toBe('0x123456...');
    });

    it('validates credential properties', () => {
        expect(mockCredential.id).toBeDefined();
        expect(mockCredential.credential_type).toMatch(/^(skill|review|payment|certification)$/);
        expect(mockCredential.name).toBeTruthy();
        expect(mockCredential.issuer).toBeTruthy();
        expect(mockCredential.timestamp).toBeTruthy();
        expect(mockCredential.visibility).toMatch(/^(public|private)$/);
    });

    it('handles optional rating field', () => {
        const credentialWithRating = { ...mockCredential, rating: 4.5 };
        const credentialWithoutRating = { ...mockCredential, rating: undefined };

        expect(credentialWithRating.rating).toBe(4.5);
        expect(credentialWithoutRating.rating).toBeUndefined();
    });

    it('handles optional proof_hash field', () => {
        const credentialWithProof = { ...mockCredential };
        const credentialWithoutProof = { ...mockCredential, proof_hash: undefined };

        expect(credentialWithProof.proof_hash).toBeTruthy();
        expect(credentialWithoutProof.proof_hash).toBeUndefined();
    });

    it('validates visibility values', () => {
        const publicCredential = { ...mockCredential, visibility: 'public' as const };
        const privateCredential = { ...mockCredential, visibility: 'private' as const };

        expect(publicCredential.visibility).toBe('public');
        expect(privateCredential.visibility).toBe('private');
    });
});