import { convertToTimestamp } from '../../../nodes/Hotmart/v1/helpers/dateUtils';

describe('DateUtils', () => {
  describe('convertToTimestamp', () => {
    it('should return number timestamps as-is', () => {
      const timestamp = 1704067200000;
      expect(convertToTimestamp(timestamp)).toBe(timestamp);
    });

    it('should convert ISO date strings to timestamp', () => {
      const dateString = '2024-01-01T00:00:00Z';
      const expectedTimestamp = 1704067200000;
      expect(convertToTimestamp(dateString)).toBe(expectedTimestamp);
    });

    it('should convert date strings without timezone to UTC', () => {
      const dateString = '2024-01-01 00:00:00';
      const expectedTimestamp = 1704067200000;
      expect(convertToTimestamp(dateString)).toBe(expectedTimestamp);
    });

    it('should handle dates with timezone offset', () => {
      const dateString = '2024-01-01T00:00:00-03:00';
      const expectedTimestamp = 1704078000000; // 3 hours ahead
      expect(convertToTimestamp(dateString)).toBe(expectedTimestamp);
    });

    it('should return undefined for invalid date strings', () => {
      expect(convertToTimestamp('invalid-date')).toBeUndefined();
      expect(convertToTimestamp('2024-13-01')).toBeUndefined(); // Invalid month
      expect(convertToTimestamp('2024-01-32')).toBeUndefined(); // Invalid day
    });

    it('should handle edge cases', () => {
      expect(convertToTimestamp('')).toBeUndefined();
      expect(convertToTimestamp(0)).toBe(0); // Epoch timestamp as number
      expect(convertToTimestamp('1970-01-01T00:00:00Z')).toBe(0); // Epoch as date string
    });

    it('should handle different date formats', () => {
      // Without timezone indicator - should add Z
      expect(convertToTimestamp('2024-01-01T12:00:00')).toBe(1704110400000);
      
      // With lowercase z
      expect(convertToTimestamp('2024-01-01T00:00:00z')).toBe(1704067200000);
      
      // With uppercase Z
      expect(convertToTimestamp('2024-01-01T00:00:00Z')).toBe(1704067200000);
    });

    it('should return undefined for non-string and non-number inputs', () => {
      // Testing line 34 - when input is neither string nor number
      expect(convertToTimestamp(null as any)).toBeUndefined();
      expect(convertToTimestamp(undefined as any)).toBeUndefined();
      expect(convertToTimestamp({} as any)).toBeUndefined();
      expect(convertToTimestamp([] as any)).toBeUndefined();
      expect(convertToTimestamp(true as any)).toBeUndefined();
      expect(convertToTimestamp(false as any)).toBeUndefined();
    });
  });
});