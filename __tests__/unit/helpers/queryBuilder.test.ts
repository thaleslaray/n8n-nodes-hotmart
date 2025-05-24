import { buildQueryParams, COMMON_FIELD_MAPPING } from '../../../nodes/Hotmart/v1/helpers/queryBuilder';

describe('queryBuilder', () => {
  describe('buildQueryParams', () => {
    it('should build basic query parameters', () => {
      const filters = {
        buyerEmail: 'test@example.com',
        productId: '123',
      };

      const result = buildQueryParams(filters);

      expect(result).toEqual({
        buyerEmail: 'test@example.com',
        productId: '123',
      });
    });

    it('should apply field mapping', () => {
      const filters = {
        buyerEmail: 'test@example.com',
        productId: '123',
      };

      const mapping = {
        buyerEmail: 'buyer_email',
        productId: 'product_id',
      };

      const result = buildQueryParams(filters, mapping);

      expect(result).toEqual({
        buyer_email: 'test@example.com',
        product_id: '123',
      });
    });

    it('should ignore undefined, null and empty values', () => {
      const filters = {
        buyerEmail: 'test@example.com',
        productId: undefined,
        buyerName: null,
        affiliateName: '',
        validField: 'value',
      };

      const result = buildQueryParams(filters);

      expect(result).toEqual({
        buyerEmail: 'test@example.com',
        validField: 'value',
      });
    });

    it('should convert date fields to timestamps', () => {
      const filters = {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
        normalField: 'value',
      };

      const mapping = {
        startDate: 'start_date',
        endDate: 'end_date',
      };

      const dateFields = ['startDate', 'endDate'];

      const result = buildQueryParams(filters, mapping, dateFields);

      expect(result).toEqual({
        start_date: 1704067200000, // 2024-01-01 00:00:00 UTC in milliseconds
        end_date: 1735689599000, // 2024-12-31 23:59:59 UTC in milliseconds
        normalField: 'value',
      });
    });

    it('should handle invalid dates gracefully', () => {
      const filters = {
        startDate: 'invalid-date',
        endDate: '2024-12-31T23:59:59Z',
      };

      const dateFields = ['startDate', 'endDate'];

      const result = buildQueryParams(filters, {}, dateFields);

      // Invalid date should be ignored
      expect(result).toEqual({
        endDate: 1735689599000,
      });
    });

    it('should work with common field mapping constant', () => {
      const filters = {
        buyerEmail: 'test@example.com',
        productId: '123',
        subscriberCode: 'sub_123',
      };

      const result = buildQueryParams(filters, COMMON_FIELD_MAPPING);

      expect(result).toEqual({
        buyer_email: 'test@example.com',
        product_id: '123',
        subscriber_code: 'sub_123',
      });
    });

    it('should handle complex scenario with all features', () => {
      const filters = {
        buyerEmail: 'test@example.com',
        productId: undefined,
        startDate: '2024-01-01T00:00:00Z',
        subscriberCode: 'sub_123',
        emptyField: '',
      };

      const mapping = {
        buyerEmail: 'buyer_email',
        startDate: 'start_date',
        subscriberCode: 'subscriber_code',
      };

      const dateFields = ['startDate'];

      const result = buildQueryParams(filters, mapping, dateFields);

      expect(result).toEqual({
        buyer_email: 'test@example.com',
        start_date: 1704067200000,
        subscriber_code: 'sub_123',
      });
    });
  });
});