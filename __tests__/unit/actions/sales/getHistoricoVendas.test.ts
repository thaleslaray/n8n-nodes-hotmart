import { execute } from '../../../../nodes/Hotmart/v1/actions/sales/getHistoricoVendas.operation';
import { createMockExecuteFunctions } from '../../../helpers/testHelpers';
import * as request from '../../../../nodes/Hotmart/v1/transport/request';
import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

// Mock dos módulos
jest.mock('../../../../nodes/Hotmart/v1/transport/request');

// Mock do console.log
global.console.log = jest.fn();

describe('Sales - Get Historico Vendas Operation', () => {
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

    it('should fetch sales history with returnAll=false', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(false) // returnAll
        .mockReturnValueOnce({}) // filters
        .mockReturnValueOnce(10); // limit

      const mockResponse = {
        items: [
          { transaction_id: 'trans_1', value: 100 },
          { transaction_id: 'trans_2', value: 200 }
        ]
      };

      mockHotmartApiRequest.mockResolvedValueOnce(mockResponse);

      const result = await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequest).toHaveBeenCalledTimes(1);
      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'GET',
        '/payments/api/v1/sales/history',
        {},
        { max_results: 10 }
      );

      expect(result).toEqual([[
        { json: mockResponse.items[0], pairedItem: { item: 0 } },
        { json: mockResponse.items[1], pairedItem: { item: 0 } }
      ]]);
    });

    it('should apply transaction status filter', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(false) // returnAll
        .mockReturnValueOnce({ 
          transactionStatus: ['APPROVED', 'CANCELED'] 
        }) // filters
        .mockReturnValueOnce(50); // limit

      mockHotmartApiRequest.mockResolvedValueOnce({ items: [] });

      await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'GET',
        '/payments/api/v1/sales/history',
        {},
        {
          max_results: 50,
          transaction_status: ['APPROVED', 'CANCELED']
        }
      );
    });

    it('should apply date filters', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(false) // returnAll
        .mockReturnValueOnce({ 
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-31T23:59:59Z'
        }) // filters
        .mockReturnValueOnce(50); // limit

      mockHotmartApiRequest.mockResolvedValueOnce({ items: [] });

      await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'GET',
        '/payments/api/v1/sales/history',
        {},
        {
          max_results: 50,
          start_date: 1704067200000,
          end_date: 1706745599000
        }
      );
    });

    it('should apply all filters', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(false) // returnAll
        .mockReturnValueOnce({ 
          productId: 'prod_123',
          buyerEmail: 'buyer@example.com',
          transactionStatus: ['APPROVED'],
          paymentType: 'CREDIT_CARD',
          commissionAs: 'PRODUCER',
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-31T23:59:59Z'
        }) // filters
        .mockReturnValueOnce(50); // limit

      mockHotmartApiRequest.mockResolvedValueOnce({ items: [] });

      await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'GET',
        '/payments/api/v1/sales/history',
        {},
        {
          max_results: 50,
          product_id: 'prod_123',
          buyer_email: 'buyer@example.com',
          transaction_status: ['APPROVED'],
          payment_type: 'CREDIT_CARD',
          commission_as: 'PRODUCER',
          start_date: 1704067200000,
          end_date: 1706745599000
        }
      );
    });

    it('should handle returnAll=true with pagination', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(true) // returnAll
        .mockReturnValueOnce({}); // filters

      // Simular duas páginas
      const page1 = {
        items: [{ transaction_id: 'trans_1' }, { transaction_id: 'trans_2' }],
        page_info: { next_page_token: 'token123' }
      };
      const page2 = {
        items: [{ transaction_id: 'trans_3' }],
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

    it('should throw error with continueOnFail=false', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(false) // returnAll
        .mockReturnValueOnce({}) // filters
        .mockReturnValueOnce(50); // limit
      mockThis.continueOnFail = jest.fn().mockReturnValue(false);

      const error = new Error('API Error');
      mockHotmartApiRequest.mockRejectedValueOnce(error);

      await expect(execute.call(mockThis, testItems)).rejects.toThrow('API Error');
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

    it('should handle empty items array', async () => {
      const emptyItems: INodeExecutionData[] = [];
      
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(false) // returnAll
        .mockReturnValueOnce({}) // filters
        .mockReturnValueOnce(10); // limit

      mockHotmartApiRequest.mockResolvedValueOnce({ 
        items: [{ transaction: 'HP123', status: 'approved' }] 
      });

      const result = await execute.call(mockThis, emptyItems);

      expect(result[0]).toHaveLength(1);
      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'GET',
        '/payments/api/v1/sales/history',
        {},
        expect.objectContaining({ max_results: 10 })
      );
    });

    it('should handle filter with transaction field', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(false) // returnAll
        .mockReturnValueOnce({ 
          transaction: 'HP999888777'
        }) // filters
        .mockReturnValueOnce(10); // limit

      mockHotmartApiRequest.mockResolvedValueOnce({ 
        items: [{ transaction: 'HP999888777', status: 'approved' }] 
      });

      await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'GET',
        '/payments/api/v1/sales/history',
        {},
        expect.objectContaining({ 
          max_results: 10,
          transaction: 'HP999888777'
        })
      );
    });

    it('should handle response without items array', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(false) // returnAll
        .mockReturnValueOnce({}) // filters
        .mockReturnValueOnce(10); // limit

      mockHotmartApiRequest.mockResolvedValueOnce({}); // Response without items

      const result = await execute.call(mockThis, testItems);

      expect(result).toEqual([[]]);
    });
  });
});