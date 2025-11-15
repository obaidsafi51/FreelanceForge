import type { CredentialMetadata } from './api';

// Platform-specific data interfaces
export interface UpworkData {
  jobs?: Array<{
    title: string;
    description: string;
    client_name: string;
    client_rating?: number;
    earnings?: number;
    start_date: string;
    end_date?: string;
    skills?: string[];
  }>;
  skills?: Array<{
    name: string;
    level?: string;
    verified?: boolean;
  }>;
  earnings?: Array<{
    amount: number;
    client: string;
    date: string;
    project: string;
  }>;
}

export interface LinkedInData {
  skills?: Array<{
    name: string;
    endorsements?: number;
    verified?: boolean;
  }>;
  recommendations?: Array<{
    text: string;
    recommender: string;
    position?: string;
    date: string;
    rating?: number;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
    credential_id?: string;
    url?: string;
  }>;
}

export interface StripeData {
  transactions?: Array<{
    amount: number;
    currency: string;
    customer_email?: string;
    customer_name?: string;
    description: string;
    date: string;
    status: string;
  }>;
  customers?: Array<{
    name: string;
    email: string;
    total_spent: number;
    first_transaction: string;
    last_transaction: string;
  }>;
}

// Generic platform data interface
export interface PlatformData {
  platform: 'upwork' | 'linkedin' | 'stripe' | 'manual';
  data: UpworkData | LinkedInData | StripeData | any;
}

// Transformation result interface
export interface TransformationResult {
  credentials: CredentialMetadata[];
  errors: string[];
  warnings: string[];
  summary: {
    total: number;
    byType: {
      skill: number;
      review: number;
      payment: number;
      certification: number;
    };
  };
}

/**
 * Transform Upwork data into credentials
 */
export function transformUpworkData(data: UpworkData): TransformationResult {
  const credentials: CredentialMetadata[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Transform job history into review credentials
    if (data.jobs && Array.isArray(data.jobs)) {
      data.jobs.forEach((job, index) => {
        try {
          if (!job.title || !job.client_name) {
            warnings.push(`Job ${index + 1}: Missing required fields (title or client_name)`);
            return;
          }

          const credential: CredentialMetadata = {
            credential_type: 'review',
            name: `Client Review: ${job.title}`,
            description: job.description || `Project completed for ${job.client_name}`,
            issuer: job.client_name,
            rating: job.client_rating,
            timestamp: job.end_date || job.start_date || new Date().toISOString(),
            visibility: 'public',
            metadata: {
              platform: 'upwork',
              external_id: `job_${index}`,
            },
          };

          credentials.push(credential);
        } catch (error) {
          errors.push(`Job ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });
    }

    // Transform skills into skill credentials
    if (data.skills && Array.isArray(data.skills)) {
      data.skills.forEach((skill, index) => {
        try {
          if (!skill.name) {
            warnings.push(`Skill ${index + 1}: Missing skill name`);
            return;
          }

          const credential: CredentialMetadata = {
            credential_type: 'skill',
            name: skill.name,
            description: `${skill.level || 'Professional'} level skill${skill.verified ? ' (Verified)' : ''}`,
            issuer: 'Upwork',
            timestamp: new Date().toISOString(),
            visibility: 'public',
            metadata: {
              platform: 'upwork',
              external_id: `skill_${index}`,
              verification_url: skill.verified ? 'https://upwork.com/skills' : undefined,
            },
          };

          credentials.push(credential);
        } catch (error) {
          errors.push(`Skill ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });
    }

    // Transform earnings into payment credentials
    if (data.earnings && Array.isArray(data.earnings)) {
      // Group earnings by client
      const earningsByClient = data.earnings.reduce((acc, earning) => {
        const client = earning.client || 'Unknown Client';
        if (!acc[client]) {
          acc[client] = [];
        }
        acc[client].push(earning);
        return acc;
      }, {} as Record<string, typeof data.earnings>);

      Object.entries(earningsByClient).forEach(([client, clientEarnings]) => {
        try {
          const totalAmount = clientEarnings.reduce((sum, e) => sum + (e.amount || 0), 0);
          const latestDate = clientEarnings
            .map(e => new Date(e.date))
            .sort((a, b) => b.getTime() - a.getTime())[0];

          const credential: CredentialMetadata = {
            credential_type: 'payment',
            name: `Payment History: ${client}`,
            description: `Total earnings of $${totalAmount.toFixed(2)} from ${clientEarnings.length} transaction(s)`,
            issuer: client,
            timestamp: latestDate.toISOString(),
            visibility: 'public',
            metadata: {
              platform: 'upwork',
              external_id: `payment_${client.replace(/\s+/g, '_').toLowerCase()}`,
            },
          };

          credentials.push(credential);
        } catch (error) {
          errors.push(`Payment for ${client}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });
    }
  } catch (error) {
    errors.push(`General transformation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    credentials,
    errors,
    warnings,
    summary: generateSummary(credentials),
  };
}

/**
 * Transform LinkedIn data into credentials
 */
export function transformLinkedInData(data: LinkedInData): TransformationResult {
  const credentials: CredentialMetadata[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Transform skills/endorsements into skill credentials
    if (data.skills && Array.isArray(data.skills)) {
      data.skills.forEach((skill, index) => {
        try {
          if (!skill.name) {
            warnings.push(`Skill ${index + 1}: Missing skill name`);
            return;
          }

          const credential: CredentialMetadata = {
            credential_type: 'skill',
            name: skill.name,
            description: `Professional skill${skill.endorsements ? ` with ${skill.endorsements} endorsement(s)` : ''}${skill.verified ? ' (Verified)' : ''}`,
            issuer: 'LinkedIn',
            timestamp: new Date().toISOString(),
            visibility: 'public',
            metadata: {
              platform: 'linkedin',
              external_id: `skill_${index}`,
            },
          };

          credentials.push(credential);
        } catch (error) {
          errors.push(`Skill ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });
    }

    // Transform recommendations into review credentials
    if (data.recommendations && Array.isArray(data.recommendations)) {
      data.recommendations.forEach((rec, index) => {
        try {
          if (!rec.text || !rec.recommender) {
            warnings.push(`Recommendation ${index + 1}: Missing required fields (text or recommender)`);
            return;
          }

          const credential: CredentialMetadata = {
            credential_type: 'review',
            name: `LinkedIn Recommendation from ${rec.recommender}`,
            description: rec.text.length > 500 ? rec.text.substring(0, 497) + '...' : rec.text,
            issuer: rec.recommender + (rec.position ? ` (${rec.position})` : ''),
            rating: rec.rating,
            timestamp: rec.date || new Date().toISOString(),
            visibility: 'public',
            metadata: {
              platform: 'linkedin',
              external_id: `recommendation_${index}`,
            },
          };

          credentials.push(credential);
        } catch (error) {
          errors.push(`Recommendation ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });
    }

    // Transform certifications into certification credentials
    if (data.certifications && Array.isArray(data.certifications)) {
      data.certifications.forEach((cert, index) => {
        try {
          if (!cert.name || !cert.issuer) {
            warnings.push(`Certification ${index + 1}: Missing required fields (name or issuer)`);
            return;
          }

          const credential: CredentialMetadata = {
            credential_type: 'certification',
            name: cert.name,
            description: `Professional certification issued by ${cert.issuer}${cert.credential_id ? ` (ID: ${cert.credential_id})` : ''}`,
            issuer: cert.issuer,
            timestamp: cert.date || new Date().toISOString(),
            visibility: 'public',
            metadata: {
              platform: 'linkedin',
              external_id: `certification_${index}`,
              verification_url: cert.url,
            },
          };

          credentials.push(credential);
        } catch (error) {
          errors.push(`Certification ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });
    }
  } catch (error) {
    errors.push(`General transformation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    credentials,
    errors,
    warnings,
    summary: generateSummary(credentials),
  };
}

/**
 * Transform Stripe data into credentials
 */
export function transformStripeData(data: StripeData): TransformationResult {
  const credentials: CredentialMetadata[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Transform transactions into payment credentials (aggregate by customer)
    if (data.transactions && Array.isArray(data.transactions)) {
      // Group transactions by customer
      const transactionsByCustomer = data.transactions
        .filter(t => t.status === 'succeeded' || t.status === 'paid')
        .reduce((acc, transaction) => {
          const customer = transaction.customer_name || transaction.customer_email || 'Unknown Customer';
          if (!acc[customer]) {
            acc[customer] = [];
          }
          acc[customer].push(transaction);
          return acc;
        }, {} as Record<string, typeof data.transactions>);

      Object.entries(transactionsByCustomer).forEach(([customer, customerTransactions]) => {
        try {
          const totalAmount = customerTransactions.reduce((sum, t) => {
            // Convert to USD if needed (simplified conversion)
            const amount = t.currency === 'usd' ? t.amount / 100 : t.amount;
            return sum + amount;
          }, 0);

          const latestDate = customerTransactions
            .map(t => new Date(t.date))
            .sort((a, b) => b.getTime() - a.getTime())[0];

          const credential: CredentialMetadata = {
            credential_type: 'payment',
            name: `Payment History: ${customer}`,
            description: `Total payments of $${totalAmount.toFixed(2)} from ${customerTransactions.length} transaction(s)`,
            issuer: customer,
            timestamp: latestDate.toISOString(),
            visibility: 'public',
            metadata: {
              platform: 'stripe',
              external_id: `payment_${customer.replace(/\s+/g, '_').toLowerCase()}`,
            },
          };

          credentials.push(credential);
        } catch (error) {
          errors.push(`Payment for ${customer}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });
    }

    // Transform customer data into payment credentials if transactions not available
    if (data.customers && Array.isArray(data.customers) && credentials.length === 0) {
      data.customers.forEach((customer, index) => {
        try {
          if (!customer.name && !customer.email) {
            warnings.push(`Customer ${index + 1}: Missing customer identifier`);
            return;
          }

          const customerName = customer.name || customer.email;
          const credential: CredentialMetadata = {
            credential_type: 'payment',
            name: `Payment History: ${customerName}`,
            description: `Total payments of $${customer.total_spent.toFixed(2)} (${customer.first_transaction} to ${customer.last_transaction})`,
            issuer: customerName,
            timestamp: customer.last_transaction || new Date().toISOString(),
            visibility: 'public',
            metadata: {
              platform: 'stripe',
              external_id: `customer_${index}`,
            },
          };

          credentials.push(credential);
        } catch (error) {
          errors.push(`Customer ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });
    }
  } catch (error) {
    errors.push(`General transformation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    credentials,
    errors,
    warnings,
    summary: generateSummary(credentials),
  };
}

/**
 * Auto-detect platform from JSON data structure
 */
export function detectPlatform(data: any): 'upwork' | 'linkedin' | 'stripe' | 'unknown' {
  if (!data || typeof data !== 'object') {
    return 'unknown';
  }

  // Check for Upwork-specific fields
  if (data.jobs || data.skills || data.earnings) {
    return 'upwork';
  }

  // Check for LinkedIn-specific fields
  if (data.recommendations || data.certifications || (data.skills && Array.isArray(data.skills) && data.skills.some((s: any) => s.endorsements !== undefined))) {
    return 'linkedin';
  }

  // Check for Stripe-specific fields
  if (data.transactions || data.customers || (Array.isArray(data) && data.some((item: any) => item.amount && item.currency))) {
    return 'stripe';
  }

  return 'unknown';
}

/**
 * Transform platform data into credentials
 */
export function transformPlatformData(platformData: PlatformData): TransformationResult {
  switch (platformData.platform) {
    case 'upwork':
      return transformUpworkData(platformData.data as UpworkData);
    case 'linkedin':
      return transformLinkedInData(platformData.data as LinkedInData);
    case 'stripe':
      return transformStripeData(platformData.data as StripeData);
    default:
      return {
        credentials: [],
        errors: [`Unsupported platform: ${platformData.platform}`],
        warnings: [],
        summary: generateSummary([]),
      };
  }
}

/**
 * Generate summary statistics for credentials
 */
function generateSummary(credentials: CredentialMetadata[]) {
  const byType = {
    skill: 0,
    review: 0,
    payment: 0,
    certification: 0,
  };

  credentials.forEach(cred => {
    byType[cred.credential_type]++;
  });

  return {
    total: credentials.length,
    byType,
  };
}

/**
 * Validate JSON file content
 */
export function validateJsonFile(content: string): { isValid: boolean; error?: string; data?: any } {
  try {
    const data = JSON.parse(content);
    return { isValid: true, data };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Invalid JSON format',
    };
  }
}

/**
 * Generate sample data for testing
 */
export function generateSampleData(platform: 'upwork' | 'linkedin' | 'stripe'): any {
  switch (platform) {
    case 'upwork':
      return {
        jobs: [
          {
            title: 'React.js Frontend Development',
            description: 'Built a modern e-commerce frontend using React.js and TypeScript',
            client_name: 'TechCorp Inc.',
            client_rating: 4.8,
            earnings: 2500,
            start_date: '2024-01-15T00:00:00Z',
            end_date: '2024-03-15T00:00:00Z',
            skills: ['React.js', 'TypeScript', 'CSS'],
          },
          {
            title: 'Mobile App UI/UX Design',
            description: 'Designed user interface for iOS and Android mobile application',
            client_name: 'StartupXYZ',
            client_rating: 5.0,
            earnings: 1800,
            start_date: '2024-04-01T00:00:00Z',
            end_date: '2024-05-15T00:00:00Z',
          },
        ],
        skills: [
          { name: 'React.js', level: 'Expert', verified: true },
          { name: 'TypeScript', level: 'Advanced', verified: true },
          { name: 'Node.js', level: 'Intermediate', verified: false },
        ],
        earnings: [
          { amount: 2500, client: 'TechCorp Inc.', date: '2024-03-15T00:00:00Z', project: 'E-commerce Frontend' },
          { amount: 1800, client: 'StartupXYZ', date: '2024-05-15T00:00:00Z', project: 'Mobile App Design' },
        ],
      };

    case 'linkedin':
      return {
        skills: [
          { name: 'JavaScript', endorsements: 25, verified: true },
          { name: 'React', endorsements: 18, verified: true },
          { name: 'Project Management', endorsements: 12, verified: false },
        ],
        recommendations: [
          {
            text: 'John is an exceptional developer with strong technical skills and great communication. He delivered our project on time and exceeded expectations.',
            recommender: 'Sarah Johnson',
            position: 'CTO at TechCorp',
            date: '2024-03-20T00:00:00Z',
            rating: 5,
          },
          {
            text: 'Highly recommend John for any frontend development work. Professional, reliable, and produces high-quality code.',
            recommender: 'Mike Chen',
            position: 'Product Manager',
            date: '2024-05-10T00:00:00Z',
            rating: 4.5,
          },
        ],
        certifications: [
          {
            name: 'AWS Certified Developer',
            issuer: 'Amazon Web Services',
            date: '2024-02-15T00:00:00Z',
            credential_id: 'AWS-DEV-2024-001',
            url: 'https://aws.amazon.com/certification/verify',
          },
          {
            name: 'React Developer Certification',
            issuer: 'Meta',
            date: '2024-01-10T00:00:00Z',
            credential_id: 'META-REACT-2024',
          },
        ],
      };

    case 'stripe':
      return {
        transactions: [
          {
            amount: 250000, // $2500.00 in cents
            currency: 'usd',
            customer_email: 'client1@techcorp.com',
            customer_name: 'TechCorp Inc.',
            description: 'Frontend Development Services',
            date: '2024-03-15T00:00:00Z',
            status: 'succeeded',
          },
          {
            amount: 180000, // $1800.00 in cents
            currency: 'usd',
            customer_email: 'contact@startupxyz.com',
            customer_name: 'StartupXYZ',
            description: 'UI/UX Design Services',
            date: '2024-05-15T00:00:00Z',
            status: 'succeeded',
          },
          {
            amount: 120000, // $1200.00 in cents
            currency: 'usd',
            customer_email: 'billing@designco.com',
            customer_name: 'DesignCo',
            description: 'Website Redesign',
            date: '2024-06-01T00:00:00Z',
            status: 'succeeded',
          },
        ],
      };

    default:
      return {};
  }
}