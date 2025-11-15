import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { TrustScoreWidget } from '../TrustScoreWidget';
import type { TrustScore } from '../../types';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
    return render(
        <ThemeProvider theme={theme}>
            {component}
        </ThemeProvider>
    );
};

const mockTrustScore: TrustScore = {
    total: 75,
    tier: 'Gold',
    breakdown: {
        review_score: 45.0,
        skill_score: 24.0,
        payment_score: 6.0,
    },
};

describe('TrustScoreWidget', () => {
    it('should render trust score and tier correctly', () => {
        renderWithTheme(<TrustScoreWidget trustScore={mockTrustScore} />);

        // Check if the score is displayed
        expect(screen.getByText('75')).toBeInTheDocument();
        expect(screen.getByText('/ 100')).toBeInTheDocument();

        // Check if the tier is displayed
        expect(screen.getByText('Gold')).toBeInTheDocument();

        // Check if the title is displayed
        expect(screen.getByText('Trust Score')).toBeInTheDocument();
    });

    it('should display score breakdown', () => {
        renderWithTheme(<TrustScoreWidget trustScore={mockTrustScore} />);

        // Check if breakdown categories are displayed
        expect(screen.getByText('Reviews (60%)')).toBeInTheDocument();
        expect(screen.getByText('Skills (30%)')).toBeInTheDocument();
        expect(screen.getByText('Payments (10%)')).toBeInTheDocument();

        // Check if breakdown values are displayed
        expect(screen.getByText('45.0')).toBeInTheDocument();
        expect(screen.getByText('24.0')).toBeInTheDocument();
        expect(screen.getByText('6.0')).toBeInTheDocument();
    });

    it('should handle Bronze tier correctly', () => {
        const bronzeTrustScore: TrustScore = {
            total: 15,
            tier: 'Bronze',
            breakdown: {
                review_score: 12.0,
                skill_score: 3.0,
                payment_score: 0.0,
            },
        };

        renderWithTheme(<TrustScoreWidget trustScore={bronzeTrustScore} />);

        expect(screen.getByText('15')).toBeInTheDocument();
        expect(screen.getByText('Bronze')).toBeInTheDocument();
    });

    it('should handle Platinum tier correctly', () => {
        const platinumTrustScore: TrustScore = {
            total: 95,
            tier: 'Platinum',
            breakdown: {
                review_score: 57.0,
                skill_score: 30.0,
                payment_score: 8.0,
            },
        };

        renderWithTheme(<TrustScoreWidget trustScore={platinumTrustScore} />);

        expect(screen.getByText('95')).toBeInTheDocument();
        expect(screen.getByText('Platinum')).toBeInTheDocument();
    });

    it('should handle zero scores correctly', () => {
        const zeroTrustScore: TrustScore = {
            total: 0,
            tier: 'Bronze',
            breakdown: {
                review_score: 0.0,
                skill_score: 0.0,
                payment_score: 0.0,
            },
        };

        renderWithTheme(<TrustScoreWidget trustScore={zeroTrustScore} />);

        expect(screen.getByText('0')).toBeInTheDocument();
        expect(screen.getByText('Bronze')).toBeInTheDocument();
        expect(screen.getAllByText('0.0')).toHaveLength(3); // Three breakdown scores
    });
});