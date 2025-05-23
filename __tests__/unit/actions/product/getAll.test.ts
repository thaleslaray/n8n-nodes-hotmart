import { execute } from '../../../../nodes/Hotmart/v1/actions/product/getAll.operation';
import { createMockExecuteFunctions } from '../../../helpers/testHelpers';
import * as request from '../../../../nodes/Hotmart/v1/transport/request';
import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

// Mock dos módulos
jest.mock('../../../../nodes/Hotmart/v1/transport/request');

// Mock do console.log
global.console.log = jest.fn();

describe('Product - Get All Operation', () => {
  let mockThis: IExecuteFunctions;
  let mockHotmartApiRequest: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockThis = createMockExecuteFunctions();
    mockThis.getNode = jest.fn().mockReturnValue({ name: 'Hotmart' });
    mockThis.continueOnFail = jest.fn().mockReturnValue(false);
    
    // Mock hotmartApiRequest
    mockHotmartApiRequest = request.hotmartApiRequest as jest.Mock;
  });

  describe('execute', () => {
    const testItems: INodeExecutionData[] = [{ json: {} }];

    it('should fetch products with returnAll=false', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(false) // returnAll
        .mockReturnValueOnce({}) // filters
        .mockReturnValueOnce(10); // limit

      const mockResponse = {
        items: [
          { id: 'prod_1', name: 'Product 1' },
          { id: 'prod_2', name: 'Product 2' }
        ]
      };

      mockHotmartApiRequest.mockResolvedValueOnce(mockResponse);

      const result = await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequest).toHaveBeenCalledTimes(1);
      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'GET',
        '/products/api/v1/products',
        {},
        { max_results: 50 }
      );

      expect(result).toEqual([[
        { json: mockResponse.items[0], pairedItem: { item: 0 } },
        { json: mockResponse.items[1], pairedItem: { item: 0 } }
      ]]);
    });

    it('should apply isEvent filter', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(false) // returnAll
        .mockReturnValueOnce({ 
          isEvent: true 
        }) // filters
        .mockReturnValueOnce(50); // limit

      mockHotmartApiRequest.mockResolvedValueOnce({ items: [] });

      await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'GET',
        '/products/api/v1/products',
        {},
        {
          max_results: 50
        }
      );
    });

    it('should handle returnAll=true with pagination', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(true) // returnAll
        .mockReturnValueOnce({}); // filters

      // Simular duas páginas
      const page1 = {
        items: [{ id: 'prod_1' }, { id: 'prod_2' }],
        page_info: { next_page_token: 'token123' }
      };
      const page2 = {
        items: [{ id: 'prod_3' }],
        page_info: { next_page_token: null }
      };

      mockHotmartApiRequest
        .mockResolvedValueOnce(page1)
        .mockResolvedValueOnce(page2);

      const result = await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequest).toHaveBeenCalledTimes(2);
      expect(result[0]).toHaveLength(3);
    });

    it('should handle errors with continueOnFail=true', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(false) // returnAll
        .mockReturnValueOnce({}) // filters
        .mockReturnValueOnce(50); // limit
      mockThis.continueOnFail = jest.fn().mockReturnValue(true);

      const error = new Error('API Error');
      mockHotmartApiRequest.mockRejectedValueOnce(error);

      const result = await execute.call(mockThis, testItems);

      expect(result).toEqual([[
        {
          json: { error: 'API Error' },
          pairedItem: { item: 0 }
        }
      ]]);
    });

    it('should handle empty response', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(false) // returnAll
        .mockReturnValueOnce({}) // filters
        .mockReturnValueOnce(50); // limit

      mockHotmartApiRequest.mockResolvedValueOnce({ items: [] });

      const result = await execute.call(mockThis, testItems);

      expect(result).toEqual([[]]);
    });
  });
});