/**
 * Demo script to test export functionality
 * This can be run in the browser console to test the export features
 */

import type { Credential, TrustScore } from '../types';
import {
  generatePortfolioExport,
  generateExportStats,
  validateExportData,
  downloadPortfolioExport,
} from './exportUtils';

// Sample credentials for testing
const sampleCredentials: Credential[] = [
  {
    id: 'demo-cred-1',
    owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    credential_type: 'skill',
    name: 'React Development',
    description: 'Expert in React.js with 5+ years of experience building scalable web applications',
    issuer: 'TechCorp Inc.',
    timestamp: '2024-01-15T10:00:00Z',
    visibility: 'public',
    proof_hash: 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890',
  },
  {
    id: 'demo-cred-2',
    owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    credential_type: 'review',
    name: 'Outstanding Project Delivery',
    description: 'Delivered a complex e-commerce platform ahead of schedule with excellent code quality',
    issuer: 'E-Commerce Solutions Ltd.',
    rating: 5,
    timestamp: '2024-01-10T10:00:00Z',
    visibility: 'public',
  },
  {
    id: 'demo-cred-3',
    owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    credential_type: 'payment',
    name: 'Project Payment - $8500',
    description: 'Payment received for full-stack development project including React frontend and Node.js backend',
    issuer: 'StartupXYZ Inc.',
    timestamp: '2024-01-12T10:00:00Z',
    visibility: 'private',
  },
  {
    id: 'demo-cred-4',
    owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    credential_type: 'certification',
    name: 'AWS Solutions Architect',
    description: 'AWS Certified Solutions Architect - Professional level certification',
    issuer: 'Amazon Web Services',
    timestamp: '2024-01-05T10:00:00Z',
    visibility: 'public',
  },
  {
    id: 'demo-cred-5',
    owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    credential_type: 'skill',
    name: 'TypeScript Development',
    description: 'Advanced TypeScript skills with experience in large-scale applications',
    issuer: 'DevBootcamp Academy',
    timestamp: '2024-01-08T10:00:00Z',
    visibility: 'public',
  },
];

const sampleTrustScore: TrustScore = {
  total: 82,
  tier: 'Platinum',
  breakdown: {
    review_score: 60,
    skill_score: 18,
    payment_score: 4,
  },
};

const sampleWalletAddress = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

/**
 * Demo function to test export generation
 */
export async function demoExportGeneration() {
  console.log('🚀 Starting export demo...');
  
  try {
    // Generate export stats
    console.log('📊 Generating export statistics...');
    const stats = generateExportStats(sampleCredentials);
    console.log('Export Stats:', stats);
    
    // Generate full export data
    console.log('📦 Generating portfolio export...');
    const exportData = await generatePortfolioExport(
      sampleWalletAddress,
      sampleCredentials,
      sampleTrustScore
    );
    console.log('Export Data:', exportData);
    
    // Validate export data
    console.log('✅ Validating export data...');
    const validation = validateExportData(exportData);
    console.log('Validation Result:', validation);
    
    if (validation.isValid) {
      console.log('✅ Export data is valid!');
      
      // Optionally trigger download (uncomment to test)
      // console.log('💾 Triggering download...');
      // downloadPortfolioExport(exportData, sampleWalletAddress);
      
      return {
        success: true,
        exportData,
        stats,
        validation,
      };
    } else {
      console.error('❌ Export validation failed:', validation.errors);
      return {
        success: false,
        errors: validation.errors,
      };
    }
  } catch (error) {
    console.error('❌ Export demo failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Demo function to test different credential combinations
 */
export async function demoVariousCredentialCombinations() {
  console.log('🧪 Testing various credential combinations...');
  
  const testCases = [
    {
      name: 'Empty credentials',
      credentials: [],
      expectValid: false,
    },
    {
      name: 'Single skill credential',
      credentials: [sampleCredentials[0]],
      expectValid: true,
    },
    {
      name: 'Only reviews',
      credentials: sampleCredentials.filter(c => c.credential_type === 'review'),
      expectValid: true,
    },
    {
      name: 'Mixed public/private',
      credentials: sampleCredentials,
      expectValid: true,
    },
    {
      name: 'Only private credentials',
      credentials: sampleCredentials.map(c => ({ ...c, visibility: 'private' as const })),
      expectValid: true,
    },
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    console.log(`\n🔍 Testing: ${testCase.name}`);
    
    try {
      const stats = generateExportStats(testCase.credentials);
      console.log(`  Stats: ${stats.total_credentials} total, ${stats.public_credentials} public`);
      
      if (testCase.credentials.length > 0) {
        const exportData = await generatePortfolioExport(
          sampleWalletAddress,
          testCase.credentials,
          sampleTrustScore
        );
        
        const validation = validateExportData(exportData);
        const isValid = validation.isValid;
        
        console.log(`  Validation: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
        if (!isValid) {
          console.log(`  Errors: ${validation.errors.join(', ')}`);
        }
        
        results.push({
          testCase: testCase.name,
          expected: testCase.expectValid,
          actual: isValid,
          passed: testCase.expectValid === isValid,
          stats,
        });
      } else {
        // Test empty credentials validation directly
        const validation = validateExportData({
          wallet_address: sampleWalletAddress,
          credentials: [],
          trust_score: sampleTrustScore,
          metadata: { file_size_bytes: 1000 },
        } as any);
        
        const isValid = validation.isValid;
        console.log(`  Validation: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
        
        results.push({
          testCase: testCase.name,
          expected: testCase.expectValid,
          actual: isValid,
          passed: testCase.expectValid === isValid,
          stats,
        });
      }
    } catch (error) {
      console.error(`  ❌ Error: ${error}`);
      results.push({
        testCase: testCase.name,
        expected: testCase.expectValid,
        actual: false,
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  
  console.log('\n📋 Test Results Summary:');
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`  ${status} ${result.testCase}: Expected ${result.expected}, Got ${result.actual}`);
  });
  
  const passedTests = results.filter(r => r.passed).length;
  console.log(`\n🎯 ${passedTests}/${results.length} tests passed`);
  
  return results;
}

/**
 * Demo function to test edge cases
 */
export async function demoEdgeCases() {
  console.log('🔬 Testing edge cases...');
  
  // Test with very long credential names/descriptions
  const longCredential: Credential = {
    id: 'long-cred',
    owner: sampleWalletAddress,
    credential_type: 'skill',
    name: 'A'.repeat(200), // Very long name
    description: 'B'.repeat(1000), // Very long description
    issuer: 'C'.repeat(100), // Long issuer name
    timestamp: '2024-01-15T10:00:00Z',
    visibility: 'public',
  };
  
  console.log('📏 Testing with very long credential data...');
  try {
    const exportData = await generatePortfolioExport(
      sampleWalletAddress,
      [longCredential],
      sampleTrustScore
    );
    
    const validation = validateExportData(exportData);
    console.log(`  File size: ${exportData.metadata.file_size_bytes} bytes`);
    console.log(`  Validation: ${validation.isValid ? '✅ Valid' : '❌ Invalid'}`);
  } catch (error) {
    console.error(`  ❌ Error with long credential: ${error}`);
  }
  
  // Test with special characters
  const specialCharCredential: Credential = {
    id: 'special-cred',
    owner: sampleWalletAddress,
    credential_type: 'review',
    name: 'Special chars: 🚀 ñáéíóú "quotes" & <tags>',
    description: 'Testing special characters: @#$%^&*()[]{}|\\:";\'<>?,./',
    issuer: 'Unicode Corp 🌍',
    rating: 4.5,
    timestamp: '2024-01-15T10:00:00Z',
    visibility: 'public',
  };
  
  console.log('🔤 Testing with special characters...');
  try {
    const exportData = await generatePortfolioExport(
      sampleWalletAddress,
      [specialCharCredential],
      sampleTrustScore
    );
    
    const validation = validateExportData(exportData);
    console.log(`  Validation: ${validation.isValid ? '✅ Valid' : '❌ Invalid'}`);
    
    // Test JSON parsing
    const jsonString = JSON.stringify(exportData);
    const parsed = JSON.parse(jsonString);
    console.log(`  JSON parsing: ${parsed.credentials[0].name === specialCharCredential.name ? '✅ Valid' : '❌ Invalid'}`);
  } catch (error) {
    console.error(`  ❌ Error with special characters: ${error}`);
  }
}

// Export demo functions for use in browser console
if (typeof window !== 'undefined') {
  (window as any).exportDemo = {
    demoExportGeneration,
    demoVariousCredentialCombinations,
    demoEdgeCases,
    sampleCredentials,
    sampleTrustScore,
    sampleWalletAddress,
  };
  
  console.log('🎮 Export demo functions available on window.exportDemo');
  console.log('  - demoExportGeneration()');
  console.log('  - demoVariousCredentialCombinations()');
  console.log('  - demoEdgeCases()');
}