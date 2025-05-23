/**
 * Date utility functions for Hotmart API integration
 * @module dateUtils
 * @description Provides functions to handle date conversions between different formats
 * used by Hotmart API and n8n
 */

/**
 * Converts a date string or timestamp to Unix timestamp in milliseconds
 * @param {string | number} date - Date to convert. Can be ISO string, date string, or timestamp
 * @returns {number | undefined} Unix timestamp in milliseconds or undefined if invalid
 * @description Handles various date formats and ensures timezone consistency.
 * If no timezone is specified in string dates, assumes UTC.
 * @example
 * // Convert ISO date string
 * convertToTimestamp('2024-01-01T00:00:00Z') // Returns: 1704067200000
 *
 * @example
 * // Convert date without timezone (assumes UTC)
 * convertToTimestamp('2024-01-01 00:00:00') // Returns: 1704067200000
 *
 * @example
 * // Pass through existing timestamp
 * convertToTimestamp(1704067200000) // Returns: 1704067200000
 */
export function convertToTimestamp(date: string | number): number | undefined {
  if (typeof date === 'number') return date;
  if (typeof date === 'string') {
    const hasTimezone = /[zZ]|[+-]\d{2}:\d{2}$/.test(date);
    const dateWithTz = hasTimezone ? date : date.replace(' ', 'T') + 'Z';
    const ts = Date.parse(dateWithTz);
    return isNaN(ts) ? undefined : ts;
  }
  return undefined;
}
