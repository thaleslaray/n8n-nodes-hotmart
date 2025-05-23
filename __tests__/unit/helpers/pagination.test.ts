import { getAllItems } from '../../../nodes/Hotmart/v1/helpers/pagination';
import { createMockExecuteFunctions } from '../../helpers/testHelpers';
import { IExecuteFunctions } from 'n8n-workflow';
import * as request from '../../../nodes/Hotmart/v1/transport/request';

// Mock do módulo de request
jest.mock('../../../nodes/Hotmart/v1/transport/request');

describe('Pagination Helper', () => {
  let mockThis: IExecuteFunctions;
  let mockHotmartApiRequest: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockThis = createMockExecuteFunctions();
    mockThis.getNode = jest.fn().mockReturnValue({ name: 'Hotmart' });
    
    // Mock hotmartApiRequest
    mockHotmartApiRequest = request.hotmartApiRequest as jest.Mock;
  });

  describe('getAllItems', () => {
    it('should handle single page response', async () => {
      const mockResponse = {
        items: [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }],
        page_info: { next_page_token: null }
      };

      mockHotmartApiRequest.mockResolvedValueOnce(mockResponse);

      const result = await getAllItems.call(mockThis, {
        maxResults: 100,
        resource: 'subscription',
        operation: 'getAll'
      });

      expect(mockHotmartApiRequest).toHaveBeenCalledTimes(1);
      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'GET',
        '/payments/api/v1/subscriptions',
        {},
        { max_results: 500 } // Sempre usa 500 para eficiência
      );
      expect(result).toEqual(mockResponse.items);
    });

    it('should handle multiple pages', async () => {
      const mockPage1 = {
        items: [{ id: 1 }, { id: 2 }],
        page_info: { next_page_token: 'token123' }
      };
      const mockPage2 = {
        items: [{ id: 3 }, { id: 4 }],
        page_info: { next_page_token: null }
      };

      mockHotmartApiRequest
        .mockResolvedValueOnce(mockPage1)
        .mockResolvedValueOnce(mockPage2);

      const result = await getAllItems.call(mockThis, {
        maxResults: 100,
        resource: 'subscription',
        operation: 'getAll'
      });

      expect(mockHotmartApiRequest).toHaveBeenCalledTimes(2);
      expect(mockHotmartApiRequest).toHaveBeenNthCalledWith(
        1,
        'GET',
        '/payments/api/v1/subscriptions',
        {},
        { max_results: 500 }
      );
      expect(mockHotmartApiRequest).toHaveBeenNthCalledWith(
        2,
        'GET',
        '/payments/api/v1/subscriptions',
        {},
        { max_results: 500, page_token: 'token123' }
      );
      expect(result).toHaveLength(4);
      expect(result).toEqual([...mockPage1.items, ...mockPage2.items]);
    });

    it('should handle empty response', async () => {
      const mockResponse = {
        items: [],
        page_info: { next_page_token: null }
      };

      mockHotmartApiRequest.mockResolvedValueOnce(mockResponse);

      const result = await getAllItems.call(mockThis, {
        maxResults: 100,
        resource: 'subscription',
        operation: 'getAll'
      });

      expect(result).toEqual([]);
    });

    it('should pass query parameters', async () => {
      const mockResponse = {
        items: [{ id: 1 }],
        page_info: { next_page_token: null }
      };

      mockHotmartApiRequest.mockResolvedValueOnce(mockResponse);

      const queryParams = { status: 'ACTIVE', product_id: 'prod_123' };

      await getAllItems.call(mockThis, {
        maxResults: 100,
        resource: 'subscription',
        operation: 'getAll',
        query: queryParams
      });

      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'GET',
        '/payments/api/v1/subscriptions',
        {},
        { ...queryParams, max_results: 500 }
      );
    });

    it('should handle different resource/operation combinations', async () => {
      const mockResponse = {
        items: [{ id: 1 }],
        page_info: { next_page_token: null }
      };

      mockHotmartApiRequest.mockResolvedValue(mockResponse);

      // Test sales history
      await getAllItems.call(mockThis, {
        maxResults: 100,
        resource: 'sales',
        operation: 'getHistoricoVendas'
      });

      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'GET',
        '/payments/api/v1/sales/history',
        {},
        { max_results: 500 }
      );

      // Test products
      await getAllItems.call(mockThis, {
        maxResults: 100,
        resource: 'product',
        operation: 'getAll'
      });

      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'GET',
        '/products/api/v1/products',
        {},
        { max_results: 500 }
      );
    });

    it('should use default endpoint for known resources when operation not found', async () => {
      const mockResponse = {
        items: [{ id: 1 }],
        page_info: { next_page_token: null }
      };

      mockHotmartApiRequest.mockResolvedValueOnce(mockResponse);

      await getAllItems.call(mockThis, {
        maxResults: 100,
        resource: 'subscription',
        operation: 'unknownOperation'
      });

      // Should use default endpoint for subscription
      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'GET',
        '/payments/api/v1/subscriptions',
        {},
        { max_results: 500 }
      );
    });

    it('should throw error for unknown resource', async () => {
      await expect(
        getAllItems.call(mockThis, {
          maxResults: 100,
          resource: 'unknownResource',
          operation: 'getAll'
        })
      ).rejects.toThrow("Endpoint not found for resource 'unknownResource' and operation 'getAll'");
    });

    it('should handle non-standard response format', async () => {
      // Response without items array
      const mockResponse = {
        data: [{ id: 1 }],
        page_info: { next_page_token: null }
      };

      mockHotmartApiRequest.mockResolvedValueOnce(mockResponse);

      const result = await getAllItems.call(mockThis, {
        maxResults: 100,
        resource: 'subscription',
        operation: 'getAll'
      });

      expect(result).toEqual([]); // Should return empty array when items is not found
    });

    it('should implement rate limit delay between pages', async () => {
      const mockPage1 = {
        items: [{ id: 1 }],
        page_info: { next_page_token: 'token123' }
      };
      const mockPage2 = {
        items: [{ id: 2 }],
        page_info: { next_page_token: null }
      };

      mockHotmartApiRequest
        .mockResolvedValueOnce(mockPage1)
        .mockResolvedValueOnce(mockPage2);

      const startTime = Date.now();
      
      await getAllItems.call(mockThis, {
        maxResults: 100,
        resource: 'subscription',
        operation: 'getAll'
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should have at least 100ms delay between requests
      expect(duration).toBeGreaterThanOrEqual(100);
    });
  });
});