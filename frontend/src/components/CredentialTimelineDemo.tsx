import React from 'react';
import { CredentialTimeline } from './CredentialTimeline';
import type { Credential } from '../types';

// Mock data for testing the timeline
const mockCredentials: Credential[] = [
    {
        id: '0x1234567890abcdef',
        owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        credential_type: 'skill',
        name: 'React Development',
        description: 'Proficient in React.js with 3+ years of experience building modern web applications. Skilled in hooks, context, and state management.',
        issuer: 'Tech Academy',
        rating: 4.8,
        timestamp: '2024-01-15T10:30:00Z',
        visibility: 'public',
        proof_hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    },
    {
        id: '0x2345678901bcdef0',
        owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        credential_type: 'review',
        name: 'E-commerce Platform Development',
        description: 'Excellent work on building a full-stack e-commerce platform. Delivered on time with clean, maintainable code.',
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
        description: 'Payment received for developing a React Native mobile application with backend integration.',
        issuer: 'MobileTech Inc',
        timestamp: '2024-03-10T09:15:00Z',
        visibility: 'private',
    },
    {
        id: '0x4567890123def012',
        owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        credential_type: 'certification',
        name: 'AWS Solutions Architect',
        description: 'Certified AWS Solutions Architect - Associate level. Demonstrates expertise in designing distributed systems on AWS.',
        issuer: 'Amazon Web Services',
        timestamp: '2024-01-05T16:20:00Z',
        visibility: 'public',
        proof_hash: '0xdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abc',
    },
    {
        id: '0x5678901234ef0123',
        owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        credential_type: 'skill',
        name: 'TypeScript Development',
        description: 'Advanced TypeScript skills including generics, decorators, and complex type definitions.',
        issuer: 'Code Institute',
        rating: 4.5,
        timestamp: '2024-02-28T11:00:00Z',
        visibility: 'public',
    },
    {
        id: '0x6789012345f01234',
        owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        credential_type: 'review',
        name: 'API Integration Specialist',
        description: 'Outstanding work integrating multiple third-party APIs. Very professional and responsive to feedback.',
        issuer: 'DataFlow Solutions',
        rating: 4.9,
        timestamp: '2024-03-25T13:30:00Z',
        visibility: 'public',
    },
];

export function CredentialTimelineDemo() {
    return (
        <CredentialTimeline
            credentials={mockCredentials}
            loading={false}
            error={null}
        />
    );
}