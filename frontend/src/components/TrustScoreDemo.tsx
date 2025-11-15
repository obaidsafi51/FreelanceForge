import {
    Box,
    Typography,
    Grid,
    Paper,
    Button,
    Divider,
} from '@mui/material';
import { useState } from 'react';
import { TrustScoreWidget } from './TrustScoreWidget';
import { TrustScoreBreakdown } from './TrustScoreBreakdown';
import { useTrustScore } from '../hooks/useTrustScore';
import type { Credential } from '../types';

// Demo credential sets for different scenarios
const demoCredentialSets = {
    empty: [],
    beginner: [
        {
            id: '1',
            owner: 'demo-address',
            credential_type: 'skill' as const,
            name: 'HTML/CSS',
            description: 'Basic web development skills',
            issuer: 'Self-verified',
            timestamp: '2024-01-15T10:00:00Z',
            visibility: 'public' as const,
        },
        {
            id: '2',
            owner: 'demo-address',
            credential_type: 'review' as const,
            name: 'First Project',
            description: 'Completed basic website',
            issuer: 'Local Business',
            rating: 3,
            timestamp: '2024-02-01T14:30:00Z',
            visibility: 'public' as const,
        },
    ],
    intermediate: [
        {
            id: '1',
            owner: 'demo-address',
            credential_type: 'review' as const,
            name: 'E-commerce Platform',
            description: 'Built full-stack e-commerce solution',
            issuer: 'TechCorp Inc',
            rating: 4,
            timestamp: '2024-01-15T10:00:00Z',
            visibility: 'public' as const,
        },
        {
            id: '2',
            owner: 'demo-address',
            credential_type: 'review' as const,
            name: 'Mobile App Development',
            description: 'Created React Native mobile app',
            issuer: 'StartupXYZ',
            rating: 5,
            timestamp: '2024-02-20T14:30:00Z',
            visibility: 'public' as const,
        },
        {
            id: '3',
            owner: 'demo-address',
            credential_type: 'skill' as const,
            name: 'React.js',
            description: 'Advanced React development',
            issuer: 'Self-verified',
            timestamp: '2024-01-10T09:00:00Z',
            visibility: 'public' as const,
        },
        {
            id: '4',
            owner: 'demo-address',
            credential_type: 'skill' as const,
            name: 'Node.js',
            description: 'Backend development with Node.js',
            issuer: 'Self-verified',
            timestamp: '2024-01-12T11:00:00Z',
            visibility: 'public' as const,
        },
        {
            id: '5',
            owner: 'demo-address',
            credential_type: 'certification' as const,
            name: 'AWS Certified Developer',
            description: 'Amazon Web Services certification',
            issuer: 'Amazon Web Services',
            timestamp: '2024-01-05T16:00:00Z',
            visibility: 'public' as const,
        },
        {
            id: '6',
            owner: 'demo-address',
            credential_type: 'payment' as const,
            name: 'Project Payment - $2500',
            description: 'Payment for e-commerce development',
            issuer: 'TechCorp Inc',
            timestamp: '2024-03-01T12:00:00Z',
            visibility: 'public' as const,
        },
    ],
    expert: [
        // Multiple high-rated reviews
        ...Array.from({ length: 8 }, (_, i) => ({
            id: `review-${i}`,
            owner: 'demo-address',
            credential_type: 'review' as const,
            name: `Enterprise Project ${i + 1}`,
            description: `Successfully delivered large-scale project ${i + 1}`,
            issuer: `Enterprise Client ${i + 1}`,
            rating: i < 6 ? 5 : 4, // Mix of 4s and 5s
            timestamp: `2024-0${Math.floor(i / 2) + 1}-${(i % 2) * 15 + 1}T10:00:00Z`,
            visibility: 'public' as const,
        })),
        // Multiple skills
        ...['React.js', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'GraphQL'].map((skill, i) => ({
            id: `skill-${i}`,
            owner: 'demo-address',
            credential_type: 'skill' as const,
            name: skill,
            description: `Expert-level ${skill} skills`,
            issuer: 'Self-verified',
            timestamp: '2024-01-01T00:00:00Z',
            visibility: 'public' as const,
        })),
        // Multiple certifications
        ...['AWS Solutions Architect', 'Google Cloud Professional', 'Kubernetes Certified'].map((cert, i) => ({
            id: `cert-${i}`,
            owner: 'demo-address',
            credential_type: 'certification' as const,
            name: cert,
            description: `Professional ${cert} certification`,
            issuer: 'Certification Authority',
            timestamp: '2024-01-01T00:00:00Z',
            visibility: 'public' as const,
        })),
        // High-value payments
        ...Array.from({ length: 5 }, (_, i) => ({
            id: `payment-${i}`,
            owner: 'demo-address',
            credential_type: 'payment' as const,
            name: `Enterprise Contract - $${(i + 1) * 5000}`,
            description: `Payment for enterprise-level project worth $${(i + 1) * 5000}`,
            issuer: `Fortune 500 Company ${i + 1}`,
            timestamp: `2024-0${i + 1}-01T12:00:00Z`,
            visibility: 'public' as const,
        })),
    ],
};

export function TrustScoreDemo() {
    const [selectedSet, setSelectedSet] = useState<keyof typeof demoCredentialSets>('intermediate');
    const currentCredentials = demoCredentialSets[selectedSet];
    const trustScore = useTrustScore(currentCredentials);

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Trust Score Calculation Demo
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                This demo shows how trust scores are calculated from different credential combinations.
                The algorithm uses: <strong>60% Reviews + 30% Skills + 10% Payments</strong>
            </Typography>

            {/* Demo Controls */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Demo Scenarios
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                    <Button
                        variant={selectedSet === 'empty' ? 'contained' : 'outlined'}
                        onClick={() => setSelectedSet('empty')}
                        size="small"
                    >
                        No Credentials (0 pts)
                    </Button>
                    <Button
                        variant={selectedSet === 'beginner' ? 'contained' : 'outlined'}
                        onClick={() => setSelectedSet('beginner')}
                        size="small"
                    >
                        Beginner (~20 pts)
                    </Button>
                    <Button
                        variant={selectedSet === 'intermediate' ? 'contained' : 'outlined'}
                        onClick={() => setSelectedSet('intermediate')}
                        size="small"
                    >
                        Intermediate (~60 pts)
                    </Button>
                    <Button
                        variant={selectedSet === 'expert' ? 'contained' : 'outlined'}
                        onClick={() => setSelectedSet('expert')}
                        size="small"
                    >
                        Expert (~85+ pts)
                    </Button>
                </Box>
            </Paper>

            {/* Trust Score Visualization */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <TrustScoreWidget
                        trustScore={trustScore}
                        animated={true}
                        size="large"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TrustScoreBreakdown
                        trustScore={trustScore}
                        showDetails={true}
                    />
                </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Credential Summary */}
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Current Scenario: {selectedSet.charAt(0).toUpperCase() + selectedSet.slice(1)}
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                            Total Credentials
                        </Typography>
                        <Typography variant="h6">
                            {currentCredentials.length}
                        </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                            Reviews
                        </Typography>
                        <Typography variant="h6">
                            {currentCredentials.filter(c => c.credential_type === 'review').length}
                        </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                            Skills
                        </Typography>
                        <Typography variant="h6">
                            {currentCredentials.filter(c => c.credential_type === 'skill').length}
                        </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                            Certifications
                        </Typography>
                        <Typography variant="h6">
                            {currentCredentials.filter(c => c.credential_type === 'certification').length}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
}