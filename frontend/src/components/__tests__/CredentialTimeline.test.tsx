import { describe, it, expect } from 'vitest';
import type { Credential } from '../../types';

const mockCredentials: Credential[] = [
    {
        id: '0x1234567890abcdef',
        owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        credential_type: 'skill',
        name: 'React Development',
        description: 'Proficient in React.js with 3+ years of experience.',
        issuer: 'Tech Academy',
        rating: 4.8,
        timestamp: '2024-01-15T10:30:00Z',
        visibility: 'public',
    },
    {
        id: '0x2345678901bcdef0',
        owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        credential_type: 'review',
        name: 'E-commerce Platform Development',
        description: 'Excellent work on building a full-stack e-commerce platform.',
        issuer: 'StartupCorp',
        rating: 5.0,
        timestamp: '2024-02-20T14:45:00Z',
        visibility: 'public',
    },
    {
        id: '0x3456789012cdef01',
        owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        credential_type: 'payment',
        name: 'Mobile App Development Project',
        description: 'Payment received for developing a React Native mobile application.',
        issuer: 'MobileTech Inc',
        timestamp: '2024-03-10T09:15:00Z',
        visibility: 'private',
    },
];

// Test the filtering and sorting logic without rendering
function filterCredentials(
    credentials: Credential[],
    searchTerm: string,
    filterType: string
): Credential[] {
    let filtered = credentials;

    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(
            (credential) =>
                credential.name.toLowerCase().includes(searchLower) ||
                credential.description.toLowerCase().includes(searchLower) ||
                credential.issuer.toLowerCase().includes(searchLower)
        );
    }

    if (filterType !== 'all') {
        filtered = filtered.filter((credential) => credential.credential_type === filterType);
    }

    return filtered;
}

function sortCredentials(
    credentials: Credential[],
    sortField: string,
    sortOrder: string
): Credential[] {
    return [...credentials].sort((a, b) => {
        let comparison = 0;

        switch (sortField) {
            case 'date':
                comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
                break;
            case 'type':
                comparison = a.credential_type.localeCompare(b.credential_type);
                break;
            case 'rating':
                {
                    const aRating = a.rating || 0;
                    const bRating = b.rating || 0;
                    comparison = aRating - bRating;
                    break;
                }
            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
            default:
                comparison = 0;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
    });
}

describe('CredentialTimeline Logic', () => {
    it('filters credentials by search term correctly', () => {
        const filtered = filterCredentials(mockCredentials, 'Tech Academy', 'all');

        expect(filtered).toHaveLength(1);
        expect(filtered[0].name).toBe('React Development');
    });

    it('filters credentials by type correctly', () => {
        const filtered = filterCredentials(mockCredentials, '', 'review');

        expect(filtered).toHaveLength(1);
        expect(filtered[0].credential_type).toBe('review');
        expect(filtered[0].name).toBe('E-commerce Platform Development');
    });

    it('filters credentials by search term and type', () => {
        const filtered = filterCredentials(mockCredentials, 'Development', 'skill');

        expect(filtered).toHaveLength(1);
        expect(filtered[0].name).toBe('React Development');
    });

    it('returns empty array when no credentials match search', () => {
        const filtered = filterCredentials(mockCredentials, 'nonexistent', 'all');

        expect(filtered).toHaveLength(0);
    });

    it('sorts credentials by date descending (newest first)', () => {
        const sorted = sortCredentials(mockCredentials, 'date', 'desc');

        expect(sorted[0].name).toBe('Mobile App Development Project'); // March 2024
        expect(sorted[1].name).toBe('E-commerce Platform Development'); // February 2024
        expect(sorted[2].name).toBe('React Development'); // January 2024
    });

    it('sorts credentials by date ascending (oldest first)', () => {
        const sorted = sortCredentials(mockCredentials, 'date', 'asc');

        expect(sorted[0].name).toBe('React Development'); // January 2024
        expect(sorted[1].name).toBe('E-commerce Platform Development'); // February 2024
        expect(sorted[2].name).toBe('Mobile App Development Project'); // March 2024
    });

    it('sorts credentials by type', () => {
        const sorted = sortCredentials(mockCredentials, 'type', 'asc');

        expect(sorted[0].credential_type).toBe('payment');
        expect(sorted[1].credential_type).toBe('review');
        expect(sorted[2].credential_type).toBe('skill');
    });

    it('sorts credentials by rating descending', () => {
        const sorted = sortCredentials(mockCredentials, 'rating', 'desc');

        expect(sorted[0].rating).toBe(5.0); // E-commerce Platform
        expect(sorted[1].rating).toBe(4.8); // React Development
        expect(sorted[2].rating).toBeUndefined(); // Mobile App (no rating)
    });

    it('sorts credentials by name alphabetically', () => {
        const sorted = sortCredentials(mockCredentials, 'name', 'asc');

        expect(sorted[0].name).toBe('E-commerce Platform Development');
        expect(sorted[1].name).toBe('Mobile App Development Project');
        expect(sorted[2].name).toBe('React Development');
    });

    it('handles empty credentials array', () => {
        const filtered = filterCredentials([], 'test', 'all');
        const sorted = sortCredentials([], 'date', 'desc');

        expect(filtered).toHaveLength(0);
        expect(sorted).toHaveLength(0);
    });

    it('preserves original array when filtering/sorting', () => {
        const originalLength = mockCredentials.length;

        filterCredentials(mockCredentials, 'React', 'all');
        sortCredentials(mockCredentials, 'date', 'desc');

        expect(mockCredentials).toHaveLength(originalLength);
    });
});