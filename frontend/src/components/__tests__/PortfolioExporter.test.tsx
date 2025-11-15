import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PortfolioExporter } from '../PortfolioExporter';
import type { Credential } from '../../types';

// Mock MUI icons
vi.mock('@mui/icons-material', () => ({
    Download: () => 'DownloadIcon',
    Assessment: () => 'AssessmentIcon',
    Storage: () => 'StorageIcon',
    Security: () => 'SecurityIcon',
    CheckCircle: () => 'CheckCircleIcon',
    CircularProgress: () => 'CircularProgressIcon',
}));

// Mock the hooks and utilities
vi.mock('../../hooks/useCredentials', () => ({
    useCredentials: vi.fn(),
}));

vi.mock('../../hooks/useTrustScore', () => ({
    useTrustScore: vi.fn(),
}));

vi.mock('../../utils/exportUtils', () => ({
    generatePortfolioExport: vi.fn(),
    generateExportStats: vi.fn(),
    downloadPortfolioExport: vi.fn(),
    validateExportData: vi.fn(),
}));

import { useCredentials } from '../../hooks/useCredentials';
import { useTrustScore } from '../../hooks/useTrustScore';
import {
    generatePortfolioExport,
    generateExportStats,
    downloadPortfolioExport,
    validateExportData,
} from '../../utils/exportUtils';

const mockUseCredentials = vi.mocked(useCredentials);
const mockUseTrustScore = vi.mocked(useTrustScore);
const mockGeneratePortfolioExport = vi.mocked(generatePortfolioExport);
const mockGenerateExportStats = vi.mocked(generateExportStats);
const mockDownloadPortfolioExport = vi.mocked(downloadPortfolioExport);
const mockValidateExportData = vi.mocked(validateExportData);

const mockCredentials: Credential[] = [
    {
        id: 'cred1',
        owner: 'wallet123',
        credential_type: 'skill',
        name: 'JavaScript Development',
        description: 'Expert in JavaScript and React',
        issuer: 'TechCorp',
        timestamp: '2024-01-15T10:00:00Z',
        visibility: 'public',
    },
    {
        id: 'cred2',
        owner: 'wallet123',
        credential_type: 'review',
        name: 'Client Review',
        description: 'Excellent work on project',
        issuer: 'ClientCorp',
        rating: 5,
        timestamp: '2024-01-10T10:00:00Z',
        visibility: 'private',
    },
];

const mockTrustScore = {
    total: 75,
    tier: 'Gold' as const,
    breakdown: {
        review_score: 60,
        skill_score: 15,
        payment_score: 0,
    },
};

const mockExportData = {
    wallet_address: 'wallet123',
    export_timestamp: '2024-01-15T10:00:00Z',
    trust_score: mockTrustScore,
    credentials: mockCredentials,
    blockchain_verification: {
        network: 'Local' as const,
        explorer_url: 'https://polkadot.js.org/apps',
        account_url: 'https://polkadot.js.org/apps/?rpc=ws://localhost:9944#/accounts',
        total_credentials: 2,
        credential_transactions: [],
    },
    metadata: {
        app_version: '1.0.0',
        export_format_version: '1.0',
        file_size_bytes: 1024,
    },
};

const mockExportStats = {
    total_credentials: 2,
    public_credentials: 1,
    private_credentials: 1,
    file_size_bytes: 1024,
    file_size_formatted: '1.0 KB',
};

function renderWithQueryClient(component: React.ReactElement) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            {component}
        </QueryClientProvider>
    );
}

describe('PortfolioExporter', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock implementations
        mockUseCredentials.mockReturnValue({
            data: mockCredentials,
            isLoading: false,
            error: null,
        } as any);

        mockUseTrustScore.mockReturnValue(mockTrustScore);

        mockGenerateExportStats.mockReturnValue(mockExportStats);

        mockGeneratePortfolioExport.mockResolvedValue(mockExportData);

        mockValidateExportData.mockReturnValue({
            isValid: true,
            errors: [],
        });
    });

    it('should render portfolio summary with credentials', () => {
        renderWithQueryClient(<PortfolioExporter walletAddress="wallet123" />);

        expect(screen.getByText('Export Portfolio')).toBeInTheDocument();
        expect(screen.getByText('Portfolio Summary')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument(); // Total credentials
        expect(screen.getByText('75')).toBeInTheDocument(); // Trust score
        expect(screen.getByText('Gold')).toBeInTheDocument(); // Tier
        expect(screen.getByText('1')).toBeInTheDocument(); // Public credentials
    });

    it('should show loading state when credentials are loading', () => {
        mockUseCredentials.mockReturnValue({
            data: [],
            isLoading: true,
            error: null,
        } as any);

        renderWithQueryClient(<PortfolioExporter walletAddress="wallet123" />);

        expect(screen.getByText('Loading credentials...')).toBeInTheDocument();
    });

    it('should show error state when credentials fail to load', () => {
        const error = new Error('Failed to load credentials');
        mockUseCredentials.mockReturnValue({
            data: [],
            isLoading: false,
            error,
        } as any);

        renderWithQueryClient(<PortfolioExporter walletAddress="wallet123" />);

        expect(screen.getByText(/Failed to load credentials/)).toBeInTheDocument();
    });

    it('should show info message when no credentials exist', () => {
        mockUseCredentials.mockReturnValue({
            data: [],
            isLoading: false,
            error: null,
        } as any);

        renderWithQueryClient(<PortfolioExporter walletAddress="wallet123" />);

        expect(screen.getByText(/You don't have any credentials to export yet/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Generate Export/ })).toBeDisabled();
    });

    it('should generate export when button is clicked', async () => {
        renderWithQueryClient(<PortfolioExporter walletAddress="wallet123" />);

        const exportButton = screen.getByRole('button', { name: /Generate Export/ });
        expect(exportButton).toBeEnabled();

        fireEvent.click(exportButton);

        await waitFor(() => {
            expect(mockGeneratePortfolioExport).toHaveBeenCalledWith(
                'wallet123',
                mockCredentials,
                mockTrustScore
            );
        });
    });

    it('should show export preview modal after generation', async () => {
        renderWithQueryClient(<PortfolioExporter walletAddress="wallet123" />);

        const exportButton = screen.getByRole('button', { name: /Generate Export/ });
        fireEvent.click(exportButton);

        await waitFor(() => {
            expect(screen.getByText('Export Preview')).toBeInTheDocument();
        });

        expect(screen.getByText('Export Summary')).toBeInTheDocument();
        expect(screen.getByText('wallet123')).toBeInTheDocument();
        expect(screen.getByText('JSON Structure Preview')).toBeInTheDocument();
    });

    it('should handle export generation errors', async () => {
        const error = new Error('Export generation failed');
        mockGeneratePortfolioExport.mockRejectedValue(error);

        renderWithQueryClient(<PortfolioExporter walletAddress="wallet123" />);

        const exportButton = screen.getByRole('button', { name: /Generate Export/ });
        fireEvent.click(exportButton);

        await waitFor(() => {
            expect(screen.getByText(/Export generation failed/)).toBeInTheDocument();
        });
    });

    it('should handle validation errors', async () => {
        mockValidateExportData.mockReturnValue({
            isValid: false,
            errors: ['Validation failed'],
        });

        renderWithQueryClient(<PortfolioExporter walletAddress="wallet123" />);

        const exportButton = screen.getByRole('button', { name: /Generate Export/ });
        fireEvent.click(exportButton);

        await waitFor(() => {
            expect(screen.getByText(/Export validation failed: Validation failed/)).toBeInTheDocument();
        });
    });

    it('should download export when confirmed in modal', async () => {
        renderWithQueryClient(<PortfolioExporter walletAddress="wallet123" />);

        // Generate export
        const exportButton = screen.getByRole('button', { name: /Generate Export/ });
        fireEvent.click(exportButton);

        // Wait for modal to appear
        await waitFor(() => {
            expect(screen.getByText('Export Preview')).toBeInTheDocument();
        });

        // Confirm download
        const downloadButton = screen.getByRole('button', { name: /Download JSON/ });
        fireEvent.click(downloadButton);

        await waitFor(() => {
            expect(mockDownloadPortfolioExport).toHaveBeenCalledWith(
                mockExportData,
                'wallet123'
            );
        });
    });

    it('should show success message after successful export', async () => {
        renderWithQueryClient(<PortfolioExporter walletAddress="wallet123" />);

        // Generate and download export
        const exportButton = screen.getByRole('button', { name: /Generate Export/ });
        fireEvent.click(exportButton);

        await waitFor(() => {
            expect(screen.getByText('Export Preview')).toBeInTheDocument();
        });

        const downloadButton = screen.getByRole('button', { name: /Download JSON/ });
        fireEvent.click(downloadButton);

        await waitFor(() => {
            expect(screen.getByText(/Portfolio exported successfully!/)).toBeInTheDocument();
        });
    });

    it('should close modal when cancel is clicked', async () => {
        renderWithQueryClient(<PortfolioExporter walletAddress="wallet123" />);

        // Generate export
        const exportButton = screen.getByRole('button', { name: /Generate Export/ });
        fireEvent.click(exportButton);

        // Wait for modal to appear
        await waitFor(() => {
            expect(screen.getByText('Export Preview')).toBeInTheDocument();
        });

        // Cancel
        const cancelButton = screen.getByRole('button', { name: /Cancel/ });
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(screen.queryByText('Export Preview')).not.toBeInTheDocument();
        });
    });
});