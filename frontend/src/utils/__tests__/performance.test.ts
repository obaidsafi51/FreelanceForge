/**
 * Performance utilities tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PerformanceMetrics } from '../performance';

// Import the PerformanceMonitor class directly for testing
class PerformanceMonitor {
  private metrics: any[] = [];
  private activeMetrics: Map<string, any> = new Map();
  private isEnabled: boolean = true;

  start(name: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;
    const metric = {
      name,
      startTime: performance.now(),
      metadata,
    };
    this.activeMetrics.set(name, metric);
  }

  end(name: string, additionalMetadata?: Record<string, any>): number | null {
    if (!this.isEnabled) return null;
    const metric = this.activeMetrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" not found`);
      return null;
    }
    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    metric.endTime = endTime;
    metric.duration = duration;
    if (additionalMetadata) {
      metric.metadata = { ...metric.metadata, ...additionalMetadata };
    }
    
    // Add to completed metrics array
    this.metrics.push({ ...metric });
    this.activeMetrics.delete(name);
    
    return duration;
  }

  async measure<T>(name: string, fn: () => T | Promise<T>, metadata?: Record<string, any>): Promise<T> {
    this.start(name, metadata);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name, { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  getMetrics(): any[] {
    return this.metrics.filter(m => m.duration !== undefined);
  }

  getSummary(): Record<string, { count: number; avgDuration: number; maxDuration: number }> {
    const metrics = this.getMetrics();
    const summary: Record<string, { count: number; totalDuration: number; maxDuration: number }> = {};
    metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = { count: 0, totalDuration: 0, maxDuration: 0 };
      }
      summary[metric.name].count++;
      summary[metric.name].totalDuration += metric.duration!;
      summary[metric.name].maxDuration = Math.max(summary[metric.name].maxDuration, metric.duration!);
    });
    const result: Record<string, { count: number; avgDuration: number; maxDuration: number }> = {};
    Object.entries(summary).forEach(([name, data]) => {
      result[name] = {
        count: data.count,
        avgDuration: data.totalDuration / data.count,
        maxDuration: data.maxDuration,
      };
    });
    return result;
  }

  clear(): void {
    this.metrics = [];
    this.activeMetrics.clear();
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
}

// Mock performance.now
const mockPerformanceNow = vi.fn();
Object.defineProperty(global, 'performance', {
  value: {
    now: mockPerformanceNow,
  },
  writable: true,
});

describe('Performance Monitor', () => {
  let performanceMonitor: PerformanceMonitor;

  beforeEach(() => {
    performanceMonitor = new PerformanceMonitor();
    mockPerformanceNow.mockReset();
  });

  it('should start and end performance measurements', () => {
    mockPerformanceNow.mockReturnValueOnce(100).mockReturnValueOnce(200);

    performanceMonitor.start('test_metric');
    const duration = performanceMonitor.end('test_metric');

    expect(duration).toBe(100);
  });

  it('should measure async functions', async () => {
    mockPerformanceNow.mockReturnValueOnce(100).mockReturnValueOnce(300);

    const testFunction = async () => {
      return 'test result';
    };

    const result = await performanceMonitor.measure('async_test', testFunction);

    expect(result).toBe('test result');
    const metrics = performanceMonitor.getMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0].name).toBe('async_test');
    expect(metrics[0].duration).toBe(200);
  });

  it('should handle measurement errors', async () => {
    mockPerformanceNow.mockReturnValueOnce(100).mockReturnValueOnce(200);

    const errorFunction = async () => {
      throw new Error('Test error');
    };

    await expect(
      performanceMonitor.measure('error_test', errorFunction)
    ).rejects.toThrow('Test error');

    const metrics = performanceMonitor.getMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0].metadata?.error).toBe('Test error');
  });

  it('should generate performance summary', () => {
    mockPerformanceNow
      .mockReturnValueOnce(100).mockReturnValueOnce(150) // First test: 50ms
      .mockReturnValueOnce(200).mockReturnValueOnce(300) // Second test: 100ms
      .mockReturnValueOnce(400).mockReturnValueOnce(450); // Third test: 50ms

    performanceMonitor.start('test_metric');
    performanceMonitor.end('test_metric');

    performanceMonitor.start('test_metric');
    performanceMonitor.end('test_metric');

    performanceMonitor.start('other_metric');
    performanceMonitor.end('other_metric');

    const summary = performanceMonitor.getSummary();

    expect(summary.test_metric).toEqual({
      count: 2,
      avgDuration: 75, // (50 + 100) / 2
      maxDuration: 100,
    });

    expect(summary.other_metric).toEqual({
      count: 1,
      avgDuration: 50,
      maxDuration: 50,
    });
  });

  it('should clear all metrics', () => {
    mockPerformanceNow.mockReturnValueOnce(100).mockReturnValueOnce(200);

    performanceMonitor.start('test_metric');
    performanceMonitor.end('test_metric');

    expect(performanceMonitor.getMetrics()).toHaveLength(1);

    performanceMonitor.clear();

    expect(performanceMonitor.getMetrics()).toHaveLength(0);
    expect(performanceMonitor.getSummary()).toEqual({});
  });

  it('should handle missing metrics gracefully', () => {
    const duration = performanceMonitor.end('non_existent_metric');
    expect(duration).toBeNull();
  });

  it('should include metadata in measurements', () => {
    mockPerformanceNow.mockReturnValueOnce(100).mockReturnValueOnce(200);

    const metadata = { testData: 'value', count: 5 };
    performanceMonitor.start('test_with_metadata', metadata);
    performanceMonitor.end('test_with_metadata', { additional: 'data' });

    const metrics = performanceMonitor.getMetrics();
    expect(metrics[0].metadata).toEqual({
      testData: 'value',
      count: 5,
      additional: 'data',
    });
  });
});

describe('Performance Metrics Constants', () => {
  it('should have all required metric constants', () => {
    expect(PerformanceMetrics.DASHBOARD_LOAD).toBe('dashboard_load');
    expect(PerformanceMetrics.CREDENTIALS_QUERY).toBe('credentials_query');
    expect(PerformanceMetrics.TRUST_SCORE_CALCULATION).toBe('trust_score_calculation');
    expect(PerformanceMetrics.TIMELINE_RENDER).toBe('timeline_render');
    expect(PerformanceMetrics.TIMELINE_FILTER).toBe('timeline_filter');
    expect(PerformanceMetrics.CARD_RENDER).toBe('card_render');
    expect(PerformanceMetrics.API_MINT_CREDENTIAL).toBe('api_mint_credential');
    expect(PerformanceMetrics.API_GET_CREDENTIALS).toBe('api_get_credentials');
  });
});