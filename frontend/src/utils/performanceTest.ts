/**
 * Performance testing utilities for FreelanceForge
 * Generates mock data and tests application performance with large datasets
 */

import type { Credential } from '../types';
import { performanceMonitor, PerformanceMetrics } from './performance';

/**
 * Generate mock credentials for performance testing
 */
export function generateMockCredentials(count: number): Credential[] {
  const credentials: Credential[] = [];
  const types: Array<'skill' | 'review' | 'payment' | 'certification'> = ['skill', 'review', 'payment', 'certification'];
  const issuers = [
    'Upwork', 'Fiverr', 'LinkedIn', 'Coursera', 'Udemy', 'GitHub', 'Stack Overflow',
    'AWS', 'Google', 'Microsoft', 'Meta', 'Apple', 'Netflix', 'Spotify'
  ];
  const skillNames = [
    'React Development', 'Node.js', 'TypeScript', 'Python', 'Machine Learning',
    'UI/UX Design', 'Project Management', 'Data Analysis', 'DevOps', 'Blockchain',
    'Mobile Development', 'Cloud Architecture', 'Cybersecurity', 'AI/ML', 'Database Design'
  ];

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const issuer = issuers[Math.floor(Math.random() * issuers.length)];
    const skillName = skillNames[Math.floor(Math.random() * skillNames.length)];
    
    // Generate timestamp within last 2 years
    const now = new Date();
    const twoYearsAgo = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);
    const randomTime = twoYearsAgo.getTime() + Math.random() * (now.getTime() - twoYearsAgo.getTime());
    
    const credential: Credential = {
      id: `mock_credential_${i}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      owner: 'mock_owner_address',
      credential_type: type,
      name: type === 'skill' ? skillName : `${type.charAt(0).toUpperCase() + type.slice(1)} from ${issuer}`,
      description: generateMockDescription(type, skillName, issuer),
      issuer,
      rating: type === 'review' ? Math.random() * 2 + 3 : undefined, // 3-5 rating for reviews
      timestamp: new Date(randomTime).toISOString(),
      visibility: Math.random() > 0.3 ? 'public' : 'private', // 70% public, 30% private
      proof_hash: Math.random() > 0.5 ? generateMockHash() : undefined,
    };

    credentials.push(credential);
  }

  // Sort by timestamp (newest first) for realistic data
  return credentials.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Generate mock description based on credential type
 */
function generateMockDescription(type: string, skillName: string, issuer: string): string {
  const descriptions = {
    skill: [
      `Demonstrated proficiency in ${skillName} through multiple projects and assessments.`,
      `Advanced ${skillName} skills with ${Math.floor(Math.random() * 5) + 1} years of experience.`,
      `Certified ${skillName} developer with expertise in modern frameworks and best practices.`,
      `Professional ${skillName} development with focus on scalable and maintainable code.`,
    ],
    review: [
      `Excellent work on ${skillName} project. Delivered on time with high quality results.`,
      `Outstanding ${skillName} implementation. Great communication and problem-solving skills.`,
      `Professional ${skillName} development services. Highly recommended for future projects.`,
      `Exceptional ${skillName} expertise demonstrated throughout the project lifecycle.`,
    ],
    payment: [
      `Payment received for ${skillName} consulting services totaling $${Math.floor(Math.random() * 5000) + 500}.`,
      `Completed ${skillName} project with payment of $${Math.floor(Math.random() * 3000) + 1000} USD.`,
      `Freelance ${skillName} work compensation: $${Math.floor(Math.random() * 2000) + 800}.`,
      `Project milestone payment for ${skillName} development: $${Math.floor(Math.random() * 4000) + 1200}.`,
    ],
    certification: [
      `${skillName} certification from ${issuer} demonstrating advanced competency.`,
      `Professional ${skillName} certification with score of ${Math.floor(Math.random() * 20) + 80}%.`,
      `Industry-recognized ${skillName} certification from ${issuer} training program.`,
      `Advanced ${skillName} certification with practical project completion.`,
    ],
  };

  const typeDescriptions = descriptions[type as keyof typeof descriptions] || descriptions.skill;
  return typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];
}

/**
 * Generate mock hash for proof documents
 */
function generateMockHash(): string {
  return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

/**
 * Performance test suite
 */
export class PerformanceTestSuite {
  private testResults: Map<string, number[]> = new Map();

  /**
   * Test timeline rendering performance with different credential counts
   */
  async testTimelinePerformance(credentialCounts: number[] = [10, 50, 100, 200, 500]): Promise<void> {
    console.log('🧪 Starting timeline performance tests...');

    for (const count of credentialCounts) {
      const credentials = generateMockCredentials(count);
      const testName = `timeline_render_${count}_credentials`;
      
      // Warm up
      this.simulateTimelineRender(credentials);
      
      // Run multiple tests
      const times: number[] = [];
      for (let i = 0; i < 5; i++) {
        performanceMonitor.start(testName);
        this.simulateTimelineRender(credentials);
        const duration = performanceMonitor.end(testName);
        if (duration) times.push(duration);
      }
      
      this.testResults.set(testName, times);
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      
      console.log(`📊 ${count} credentials: ${avgTime.toFixed(2)}ms average (${Math.min(...times).toFixed(2)}ms - ${Math.max(...times).toFixed(2)}ms)`);
    }
  }

  /**
   * Test search and filter performance
   */
  async testSearchFilterPerformance(): Promise<void> {
    console.log('🔍 Testing search and filter performance...');
    
    const credentials = generateMockCredentials(500);
    const searchTerms = ['React', 'Python', 'Design', 'Management', 'Development'];
    const filterTypes: Array<'all' | 'skill' | 'review' | 'payment' | 'certification'> = ['all', 'skill', 'review', 'payment', 'certification'];

    // Test search performance
    for (const term of searchTerms) {
      const testName = `search_${term}`;
      performanceMonitor.start(testName);
      this.simulateSearch(credentials, term);
      performanceMonitor.end(testName);
    }

    // Test filter performance
    for (const filterType of filterTypes) {
      const testName = `filter_${filterType}`;
      performanceMonitor.start(testName);
      this.simulateFilter(credentials, filterType);
      performanceMonitor.end(testName);
    }
  }

  /**
   * Test trust score calculation performance
   */
  async testTrustScorePerformance(): Promise<void> {
    console.log('🎯 Testing trust score calculation performance...');
    
    const credentialCounts = [10, 50, 100, 200, 500, 1000];
    
    for (const count of credentialCounts) {
      const credentials = generateMockCredentials(count);
      const testName = `trust_score_${count}_credentials`;
      
      const times: number[] = [];
      for (let i = 0; i < 10; i++) {
        performanceMonitor.start(testName);
        this.simulateTrustScoreCalculation(credentials);
        const duration = performanceMonitor.end(testName);
        if (duration) times.push(duration);
      }
      
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      console.log(`🎯 ${count} credentials: ${avgTime.toFixed(2)}ms average`);
    }
  }

  /**
   * Test memory usage with large datasets
   */
  async testMemoryUsage(): Promise<void> {
    console.log('💾 Testing memory usage...');
    
    if ('memory' in performance) {
      const initialMemory = (performance as any).memory.usedJSHeapSize;
      
      // Generate large dataset
      const credentials = generateMockCredentials(1000);
      
      const afterGenerationMemory = (performance as any).memory.usedJSHeapSize;
      const memoryIncrease = (afterGenerationMemory - initialMemory) / 1024 / 1024; // MB
      
      console.log(`💾 Memory increase for 1000 credentials: ${memoryIncrease.toFixed(2)}MB`);
      
      // Test garbage collection
      credentials.length = 0; // Clear array
      
      // Force garbage collection if available
      if ('gc' in window) {
        (window as any).gc();
      }
      
      setTimeout(() => {
        const afterCleanupMemory = (performance as any).memory.usedJSHeapSize;
        const memoryRecovered = (afterGenerationMemory - afterCleanupMemory) / 1024 / 1024; // MB
        console.log(`♻️ Memory recovered after cleanup: ${memoryRecovered.toFixed(2)}MB`);
      }, 1000);
    } else {
      console.log('💾 Memory API not available in this browser');
    }
  }

  /**
   * Generate performance report
   */
  generateReport(): void {
    console.log('\n📈 Performance Test Report');
    console.log('========================');
    
    const summary = performanceMonitor.getSummary();
    
    Object.entries(summary).forEach(([name, stats]) => {
      console.log(`${name}:`);
      console.log(`  Average: ${stats.avgDuration.toFixed(2)}ms`);
      console.log(`  Max: ${stats.maxDuration.toFixed(2)}ms`);
      console.log(`  Count: ${stats.count}`);
      console.log('');
    });

    // Performance recommendations
    console.log('💡 Performance Recommendations:');
    
    Object.entries(summary).forEach(([name, stats]) => {
      if (stats.avgDuration > 100 && name.includes('render')) {
        console.log(`⚠️ ${name} is slow (${stats.avgDuration.toFixed(2)}ms). Consider virtualization.`);
      }
      if (stats.avgDuration > 50 && name.includes('filter')) {
        console.log(`⚠️ ${name} is slow (${stats.avgDuration.toFixed(2)}ms). Consider debouncing or web workers.`);
      }
      if (stats.avgDuration > 10 && name.includes('trust_score')) {
        console.log(`⚠️ ${name} is slow (${stats.avgDuration.toFixed(2)}ms). Consider memoization.`);
      }
    });
  }

  /**
   * Run all performance tests
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting comprehensive performance test suite...\n');
    
    await this.testTimelinePerformance();
    await this.testSearchFilterPerformance();
    await this.testTrustScorePerformance();
    await this.testMemoryUsage();
    
    this.generateReport();
  }

  // Simulation methods (these would normally interact with actual components)
  private simulateTimelineRender(credentials: Credential[]): void {
    // Simulate the filtering and sorting logic from CredentialTimeline
    const filtered = credentials.filter(c => c.visibility === 'public');
    const sorted = filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    // Simulate DOM operations
    sorted.slice(0, 20); // Simulate pagination
  }

  private simulateSearch(credentials: Credential[], searchTerm: string): Credential[] {
    const searchLower = searchTerm.toLowerCase();
    return credentials.filter(credential =>
      credential.name.toLowerCase().includes(searchLower) ||
      credential.description.toLowerCase().includes(searchLower) ||
      credential.issuer.toLowerCase().includes(searchLower)
    );
  }

  private simulateFilter(credentials: Credential[], filterType: string): Credential[] {
    if (filterType === 'all') return credentials;
    return credentials.filter(credential => credential.credential_type === filterType);
  }

  private simulateTrustScoreCalculation(credentials: Credential[]): void {
    // Simulate trust score calculation logic
    const reviewCredentials = credentials.filter(c => c.credential_type === 'review' && c.rating);
    const skillCredentials = credentials.filter(c => c.credential_type === 'skill');
    const paymentCredentials = credentials.filter(c => c.credential_type === 'payment');
    
    // Simulate calculations
    if (reviewCredentials.length > 0) {
      reviewCredentials.reduce((sum, cred) => sum + (cred.rating || 0), 0) / reviewCredentials.length;
    }
    
    skillCredentials.length * 5;
    paymentCredentials.length * 100;
  }
}

// Export singleton instance
export const performanceTestSuite = new PerformanceTestSuite();

// Development helper to run tests from console
if (process.env.NODE_ENV === 'development') {
  (window as any).runPerformanceTests = () => performanceTestSuite.runAllTests();
  (window as any).generateMockCredentials = generateMockCredentials;
  (window as any).performanceMonitor = performanceMonitor;
}