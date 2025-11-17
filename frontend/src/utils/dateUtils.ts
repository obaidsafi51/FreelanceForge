/**
 * Date utility functions for handling potentially invalid timestamps
 */

/**
 * Safely parse a timestamp into a Date object
 * @param timestamp - The timestamp to parse (string, number, or Date)
 * @returns A valid Date object or current date if parsing fails
 */
export function safeParseDate(timestamp: string | number | Date): Date {
  try {
    let date: Date;
    
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'number') {
      // Handle Unix timestamps (seconds or milliseconds)
      date = new Date(timestamp < 1e12 ? timestamp * 1000 : timestamp);
    } else if (typeof timestamp === 'string') {
      // Handle ISO strings or other string formats
      date = new Date(timestamp);
    } else {
      // Fallback to current date
      console.warn('Invalid timestamp type:', typeof timestamp, timestamp);
      return new Date();
    }
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp value:', timestamp);
      return new Date();
    }
    
    return date;
  } catch (error) {
    console.warn('Error parsing timestamp:', timestamp, error);
    return new Date();
  }
}

/**
 * Safely get the time value from a timestamp
 * @param timestamp - The timestamp to parse
 * @returns The time value in milliseconds or 0 if invalid
 */
export function safeGetTime(timestamp: string | number | Date): number {
  const date = safeParseDate(timestamp);
  return date.getTime();
}

/**
 * Check if a timestamp represents a recent date (within specified days)
 * @param timestamp - The timestamp to check
 * @param days - Number of days to consider as recent (default: 7)
 * @returns True if the date is recent and valid
 */
export function isRecentDate(timestamp: string | number | Date, days: number = 7): boolean {
  try {
    const date = safeParseDate(timestamp);
    const now = Date.now();
    const timeDiff = now - date.getTime();
    const daysDiff = timeDiff / (24 * 60 * 60 * 1000);
    
    return daysDiff >= 0 && daysDiff <= days;
  } catch (error) {
    console.warn('Error checking if date is recent:', timestamp, error);
    return false;
  }
}

/**
 * Compare two timestamps for sorting
 * @param a - First timestamp
 * @param b - Second timestamp
 * @returns Comparison result for sorting
 */
export function compareTimestamps(a: string | number | Date, b: string | number | Date): number {
  try {
    const timeA = safeGetTime(a);
    const timeB = safeGetTime(b);
    return timeA - timeB;
  } catch (error) {
    console.warn('Error comparing timestamps:', a, b, error);
    return 0;
  }
}