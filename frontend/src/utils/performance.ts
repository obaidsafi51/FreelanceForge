/**
 * Performance monitoring utilities for FreelanceForge
 * Tracks dashboard load times, query response times, and rendering performance
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private isEnabled: boolean;

  constructor() {
    // Enable performance monitoring in development or when explicitly enabled
    this.isEnabled = process.env.NODE_ENV === 'development' || 
                     localStorage.getItem('freelanceforge_perf_monitoring') === 'true';
  }

  /**
   * Start measuring a performance metric
   */
  start(name: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata,
    };

    this.metrics.set(name, metric);
  }

  /**
   * End measuring a performance metric
   */
  end(name: string, additionalMetadata?: Record<string, any>): number | null {
    if (!this.isEnabled) return null;

    const metric = this.metrics.get(name);
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

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 Performance: ${name} took ${duration.toFixed(2)}ms`, metric.metadata);
    }

    // Report slow operations
    if (duration > 2000) { // 2 seconds threshold
      console.warn(`⚠️ Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * Measure a function execution time
   */
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

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values()).filter(m => m.duration !== undefined);
  }

  /**
   * Get metrics summary
   */
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

    // Convert to final format with averages
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

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Enable/disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (enabled) {
      localStorage.setItem('freelanceforge_perf_monitoring', 'true');
    } else {
      localStorage.removeItem('freelanceforge_perf_monitoring');
    }
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for measuring component render performance
 */
export function usePerformanceMonitor(componentName: string, dependencies?: any[]) {
  const renderCount = React.useRef(0);
  
  React.useEffect(() => {
    renderCount.current++;
    const metricName = `${componentName}_render`;
    
    performanceMonitor.start(metricName, {
      renderCount: renderCount.current,
      dependencies: dependencies?.length || 0,
    });
    
    // End measurement on next tick to capture render time
    setTimeout(() => {
      performanceMonitor.end(metricName);
    }, 0);
  });
}

/**
 * Higher-order component for measuring component performance
 */
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  const MemoizedComponent = React.memo((props: P) => {
    usePerformanceMonitor(displayName);
    return React.createElement(WrappedComponent, props);
  });
  
  MemoizedComponent.displayName = `withPerformanceMonitoring(${displayName})`;
  
  return MemoizedComponent;
}

/**
 * Performance metrics for specific operations
 */
export const PerformanceMetrics = {
  // Dashboard operations
  DASHBOARD_LOAD: 'dashboard_load',
  CREDENTIALS_QUERY: 'credentials_query',
  TRUST_SCORE_CALCULATION: 'trust_score_calculation',
  
  // Timeline operations
  TIMELINE_RENDER: 'timeline_render',
  TIMELINE_FILTER: 'timeline_filter',
  TIMELINE_SORT: 'timeline_sort',
  
  // Card operations
  CARD_RENDER: 'card_render',
  
  // API operations
  API_MINT_CREDENTIAL: 'api_mint_credential',
  API_UPDATE_CREDENTIAL: 'api_update_credential',
  API_DELETE_CREDENTIAL: 'api_delete_credential',
  API_GET_CREDENTIALS: 'api_get_credentials',
} as const;

/**
 * Performance thresholds (in milliseconds)
 */
export const PerformanceThresholds = {
  DASHBOARD_LOAD: 2000,
  CREDENTIALS_QUERY: 1000,
  TRUST_SCORE_CALCULATION: 100,
  TIMELINE_RENDER: 500,
  TIMELINE_FILTER: 200,
  CARD_RENDER: 50,
  API_OPERATIONS: 3000,
} as const;

// Re-export React for the hook
import React from 'react';