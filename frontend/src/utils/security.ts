import * as yup from 'yup';
import { CredentialMetadata } from './api';

// XSS Prevention utilities
export class InputSanitizer {
  /**
   * Sanitize string input to prevent XSS attacks
   */
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      // Remove HTML tags first
      .replace(/<[^>]*>/g, '')
      // Remove null bytes and control characters
      .replace(/[\x00-\x1F\x7F]/g, '')
      // Encode HTML entities
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      // Trim whitespace
      .trim();
  }

  /**
   * Sanitize credential metadata object
   */
  static sanitizeCredentialMetadata(metadata: CredentialMetadata): CredentialMetadata {
    return {
      ...metadata,
      name: this.sanitizeString(metadata.name),
      description: this.sanitizeString(metadata.description),
      issuer: this.sanitizeString(metadata.issuer),
      visibility: metadata.visibility === 'private' ? 'private' : 'public',
      metadata: metadata.metadata ? {
        platform: metadata.metadata.platform ? this.sanitizeString(metadata.metadata.platform) : undefined,
        external_id: metadata.metadata.external_id ? this.sanitizeString(metadata.metadata.external_id) : undefined,
        verification_url: metadata.metadata.verification_url ? this.sanitizeUrl(metadata.metadata.verification_url) : undefined,
      } : undefined,
    };
  }

  /**
   * Sanitize URL to prevent malicious redirects
   */
  static sanitizeUrl(url: string): string {
    if (typeof url !== 'string') {
      return '';
    }

    // Don't sanitize the URL string itself as it would break the URL format
    // Just validate the protocol and structure
    
    // Only allow http/https URLs
    if (!url.match(/^https?:\/\//)) {
      return '';
    }

    try {
      const urlObj = new URL(url);
      // Block dangerous protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return '';
      }
      return urlObj.toString();
    } catch {
      return '';
    }
  }

  /**
   * Validate and sanitize JSON input
   */
  static sanitizeJsonInput(jsonString: string): any {
    try {
      const parsed = JSON.parse(jsonString);
      return this.deepSanitizeObject(parsed);
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  }

  /**
   * Deep sanitize object properties
   */
  private static deepSanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.deepSanitizeObject(item));
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = this.sanitizeString(key);
        sanitized[sanitizedKey] = this.deepSanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  }
}

// JSON Schema validation using Yup
export const credentialMetadataSchema = yup.object({
  credential_type: yup
    .string()
    .oneOf(['skill', 'review', 'payment', 'certification'], 'Invalid credential type')
    .required('Credential type is required'),
  
  name: yup
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .matches(/^[a-zA-Z0-9\s\-_.():,&/+'"@#]+$/, 'Name contains invalid characters')
    .required('Name is required'),
  
  description: yup
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be 500 characters or less')
    .required('Description is required'),
  
  issuer: yup
    .string()
    .min(1, 'Issuer is required')
    .max(100, 'Issuer must be 100 characters or less')
    .matches(/^[a-zA-Z0-9\s\-_.():,&/+'"@#]+$/, 'Issuer contains invalid characters')
    .required('Issuer is required'),
  
  rating: yup
    .number()
    .min(0, 'Rating must be between 0 and 5')
    .max(5, 'Rating must be between 0 and 5')
    .nullable()
    .optional(),
  
  timestamp: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, 'Invalid timestamp format')
    .required('Timestamp is required'),
  
  visibility: yup
    .string()
    .oneOf(['public', 'private'], 'Invalid visibility setting')
    .required('Visibility is required'),
  
  proof_hash: yup
    .string()
    .matches(/^[a-fA-F0-9]{64}$/, 'Invalid proof hash format')
    .optional(),
  
  metadata: yup
    .object({
      platform: yup.string().max(50, 'Platform name too long').optional(),
      external_id: yup.string().max(100, 'External ID too long').optional(),
      verification_url: yup.string().url('Invalid verification URL').optional(),
    })
    .optional(),
}).strict();

// File upload security validation
export class FileValidator {
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'application/json',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  private static readonly ALLOWED_EXTENSIONS = [
    '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.txt', '.json', '.doc', '.docx'
  ];

  /**
   * Validate file upload security
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`
      };
    }

    // Check MIME type
    if (!this.ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: `Unsupported file type: ${file.type}. Allowed types: PDF, images, documents`
      };
    }

    // Check file extension
    const extension = this.getFileExtension(file.name);
    if (!this.ALLOWED_EXTENSIONS.includes(extension)) {
      return {
        isValid: false,
        error: `Unsupported file extension: ${extension}`
      };
    }

    // Check for suspicious file names
    if (this.hasSuspiciousFileName(file.name)) {
      return {
        isValid: false,
        error: 'File name contains suspicious characters'
      };
    }

    return { isValid: true };
  }

  /**
   * Scan file content for basic security issues
   */
  static async scanFileContent(file: File): Promise<{ isSafe: boolean; error?: string }> {
    try {
      // For text files, check for suspicious content
      if (file.type.startsWith('text/') || file.type === 'application/json') {
        let text: string;
        
        // Handle different environments (browser vs test)
        if (typeof file.text === 'function') {
          text = await file.text();
        } else {
          // Fallback for test environment
          const reader = new FileReader();
          text = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
          });
        }
        
        // Check for script tags or suspicious patterns
        const suspiciousPatterns = [
          /<script[^>]*>/i,
          /javascript:/i,
          /vbscript:/i,
          /onload\s*=/i,
          /onerror\s*=/i,
          /eval\s*\(/i,
          /document\.cookie/i,
          /window\.location/i,
        ];

        for (const pattern of suspiciousPatterns) {
          if (pattern.test(text)) {
            return {
              isSafe: false,
              error: 'File contains potentially malicious content'
            };
          }
        }

        // For JSON files, validate structure
        if (file.type === 'application/json') {
          try {
            const parsed = JSON.parse(text);
            
            // Check for excessively deep nesting (potential DoS)
            if (this.getObjectDepth(parsed) > 10) {
              return {
                isSafe: false,
                error: 'JSON structure too deeply nested'
              };
            }
            
            // Check for excessively large arrays
            if (this.hasLargeArrays(parsed, 1000)) {
              return {
                isSafe: false,
                error: 'JSON contains arrays that are too large'
              };
            }
          } catch {
            return {
              isSafe: false,
              error: 'Invalid JSON format'
            };
          }
        }
      }

      return { isSafe: true };
    } catch (error) {
      return {
        isSafe: false,
        error: 'Failed to scan file content'
      };
    }
  }

  private static getFileExtension(filename: string): string {
    return filename.toLowerCase().substring(filename.lastIndexOf('.'));
  }

  private static hasSuspiciousFileName(filename: string): boolean {
    // Check for null bytes, path traversal, and other suspicious patterns
    const suspiciousPatterns = [
      /\x00/,           // Null bytes
      /\.\./,           // Path traversal
      /[<>:"|?*]/,      // Windows invalid characters
      /^\./,            // Hidden files (but allow .txt, .pdf etc)
      /\.(exe|bat|cmd|scr|pif|com)$/i, // Executable extensions
    ];

    // Allow files that start with . but have valid extensions
    if (filename.match(/^\.[a-zA-Z0-9]+$/)) {
      return false;
    }

    return suspiciousPatterns.some(pattern => pattern.test(filename));
  }

  private static getObjectDepth(obj: any, depth = 0): number {
    if (depth > 20) return depth; // Prevent stack overflow
    
    if (obj && typeof obj === 'object') {
      return 1 + Math.max(
        0,
        ...Object.values(obj).map(value => this.getObjectDepth(value, depth + 1))
      );
    }
    return 0;
  }

  private static hasLargeArrays(obj: any, maxSize: number): boolean {
    if (Array.isArray(obj)) {
      if (obj.length > maxSize) return true;
      return obj.some(item => this.hasLargeArrays(item, maxSize));
    }
    
    if (obj && typeof obj === 'object') {
      return Object.values(obj).some(value => this.hasLargeArrays(value, maxSize));
    }
    
    return false;
  }
}

// Rate limiting for credential minting
export class RateLimiter {
  private static readonly MINUTE_LIMIT = 10;
  private static readonly HOUR_LIMIT = 100;
  private static readonly STORAGE_KEY = 'freelanceforge_rate_limits';

  private static getRateLimitData(): {
    minuteTimestamps: number[];
    hourTimestamps: number[];
  } {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to parse rate limit data:', error);
    }
    
    return {
      minuteTimestamps: [],
      hourTimestamps: [],
    };
  }

  private static saveRateLimitData(data: {
    minuteTimestamps: number[];
    hourTimestamps: number[];
  }): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save rate limit data:', error);
    }
  }

  /**
   * Check if action is allowed under rate limits
   */
  static checkRateLimit(): {
    allowed: boolean;
    minuteCount: number;
    hourCount: number;
    nextAllowedTime?: number;
  } {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;

    const data = this.getRateLimitData();

    // Clean old timestamps
    data.minuteTimestamps = data.minuteTimestamps.filter(ts => ts > oneMinuteAgo);
    data.hourTimestamps = data.hourTimestamps.filter(ts => ts > oneHourAgo);

    const minuteCount = data.minuteTimestamps.length;
    const hourCount = data.hourTimestamps.length;

    // Check limits
    if (minuteCount >= this.MINUTE_LIMIT) {
      const oldestMinuteTimestamp = Math.min(...data.minuteTimestamps);
      return {
        allowed: false,
        minuteCount,
        hourCount,
        nextAllowedTime: oldestMinuteTimestamp + 60 * 1000,
      };
    }

    if (hourCount >= this.HOUR_LIMIT) {
      const oldestHourTimestamp = Math.min(...data.hourTimestamps);
      return {
        allowed: false,
        minuteCount,
        hourCount,
        nextAllowedTime: oldestHourTimestamp + 60 * 60 * 1000,
      };
    }

    return {
      allowed: true,
      minuteCount,
      hourCount,
    };
  }

  /**
   * Record a new action (call after successful operation)
   */
  static recordAction(): void {
    const now = Date.now();
    const data = this.getRateLimitData();

    data.minuteTimestamps.push(now);
    data.hourTimestamps.push(now);

    this.saveRateLimitData(data);
  }

  /**
   * Get warning message when approaching limits
   */
  static getWarningMessage(minuteCount: number, hourCount: number): string | null {
    if (minuteCount >= this.MINUTE_LIMIT * 0.8) {
      return `Approaching rate limit: ${minuteCount}/${this.MINUTE_LIMIT} credentials minted in the last minute`;
    }
    
    if (hourCount >= this.HOUR_LIMIT * 0.8) {
      return `Approaching rate limit: ${hourCount}/${this.HOUR_LIMIT} credentials minted in the last hour`;
    }
    
    return null;
  }

  /**
   * Format time until next allowed action
   */
  static formatTimeUntilAllowed(nextAllowedTime: number): string {
    const now = Date.now();
    const diff = Math.max(0, nextAllowedTime - now);
    
    if (diff < 60 * 1000) {
      return `${Math.ceil(diff / 1000)} seconds`;
    } else {
      return `${Math.ceil(diff / (60 * 1000))} minutes`;
    }
  }
}

// Credential count validation
export class CredentialLimitValidator {
  private static readonly MAX_CREDENTIALS = 500;

  /**
   * Check if user is approaching or at credential limit
   */
  static checkCredentialLimit(currentCount: number): {
    allowed: boolean;
    warning?: string;
    error?: string;
  } {
    if (currentCount >= this.MAX_CREDENTIALS) {
      return {
        allowed: false,
        error: `Maximum credential limit reached (${this.MAX_CREDENTIALS}). Please delete some credentials before minting new ones.`,
      };
    }

    if (currentCount >= this.MAX_CREDENTIALS * 0.9) {
      return {
        allowed: true,
        warning: `Approaching credential limit: ${currentCount}/${this.MAX_CREDENTIALS} credentials`,
      };
    }

    return { allowed: true };
  }

  /**
   * Check if batch minting would exceed limit
   */
  static checkBatchLimit(currentCount: number, batchSize: number): {
    allowed: boolean;
    warning?: string;
    error?: string;
  } {
    const newTotal = currentCount + batchSize;

    if (newTotal > this.MAX_CREDENTIALS) {
      return {
        allowed: false,
        error: `Batch would exceed credential limit. Current: ${currentCount}, Batch: ${batchSize}, Limit: ${this.MAX_CREDENTIALS}`,
      };
    }

    if (newTotal >= this.MAX_CREDENTIALS * 0.9) {
      return {
        allowed: true,
        warning: `Batch will bring you close to the limit: ${newTotal}/${this.MAX_CREDENTIALS} credentials`,
      };
    }

    return { allowed: true };
  }
}