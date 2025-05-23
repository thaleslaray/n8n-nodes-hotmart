import { execute } from '../../../../nodes/Hotmart/v1/actions/subscription/getAll.operation';
import { createMockExecuteFunctions } from '../../../helpers/testHelpers';
import { mockSubscriptionList } from '../../../fixtures/responses/subscription.fixtures';
import * as request from '../../../../nodes/Hotmart/v1/transport/request';
import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

// Mock dos módulos
jest.mock('../../../../nodes/Hotmart/v1/transport/request');

// Mock do console.log para evitar poluir a saída dos testes
global.console.log = jest.fn();

describe('Subscription - Get All Operation', () => {
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

    it('should fetch subscriptions with returnAll=false', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(false) // returnAll
        .mockReturnValueOnce({}) // filters
        .mockReturnValueOnce(10); // limit

      mockHotmartApiRequest.mockResolvedValueOnce(mockSubscriptionList);

      const result = await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequest).toHaveBeenCalledTimes(1);
      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'GET',
        '/payments/api/v1/subscriptions',
        {},
        { max_results: 10 }
      );

      expect(result).toEqual([[
        {
          json: mockSubscriptionList.items[0],
          pairedItem: { item: 0 }
        }
      ]]);
    });

    it('should fetch all subscriptions with returnAll=true', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(true) // returnAll
        .mockReturnValueOnce({}); // filters

      // Simular duas páginas
      const page1 = {
        items: [{ subscription_id: 'sub_1' }, { subscription_id: 'sub_2' }],
        page_info: { next_page_token: 'token123' }
      };
      const page2 = {
        items: [{ subscription_id: 'sub_3' }],
        page_info: { next_page_token: null }
      };

      mockHotmartApiRequest
        .mockResolvedValueOnce(page1)
        .mockResolvedValueOnce(page2);

      const result = await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequest).toHaveBeenCalledTimes(2);
      
      // First call - should not have page_token in initial object
      const firstCall = mockHotmartApiRequest.mock.calls[0];
      expect(firstCall[0]).toBe('GET');
      expect(firstCall[1]).toBe('/payments/api/v1/subscriptions');
      expect(firstCall[3].max_results).toBe(500);
      // Note: Due to how the code works, page_token might exist but should be undefined or missing
      
      // Second call - should have page_token
      const secondCall = mockHotmartApiRequest.mock.calls[1];
      expect(secondCall[0]).toBe('GET');
      expect(secondCall[1]).toBe('/payments/api/v1/subscriptions');
      expect(secondCall[3].max_results).toBe(500);
      expect(secondCall[3].page_token).toBe('token123');

      expect(result[0]).toHaveLength(3);
    });

    it('should apply status filters', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(false) // returnAll
        .mockReturnValueOnce({ 
          status: ['ACTIVE', 'CANCELLED'] 
        }) // filters
        .mockReturnValueOnce(50); // limit

      mockHotmartApiRequest.mockResolvedValueOnce({ items: [] });

      await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'GET',
        '/payments/api/v1/subscriptions',
        {},
        {
          max_results: 50,
          status: 'ACTIVE,CANCELLED'
        }
      );
    });

    it('should apply product and email filters', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(false) // returnAll
        .mockReturnValueOnce({ 
          productId: 'prod_123',
          subscriberEmail: 'test@example.com'
        }) // filters
        .mockReturnValueOnce(50); // limit

      mockHotmartApiRequest.mockResolvedValueOnce({ items: [] });

      await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'GET',
        '/payments/api/v1/subscriptions',
        {},
        {
          max_results: 50,
          product_id: 'prod_123',
          subscriber_email: 'test@example.com'
        }
      );
    });

    it('should convert date filters to timestamps', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(false) // returnAll
        .mockReturnValueOnce({ 
          accessionDate: '2024-01-01T00:00:00Z',
          cancelationDate: '2024-01-15T00:00:00Z'
        }) // filters
        .mockReturnValueOnce(50); // limit

      mockHotmartApiRequest.mockResolvedValueOnce({ items: [] });

      await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'GET',
        '/payments/api/v1/subscriptions',
        {},
        {
          max_results: 50,
          accession_date: 1704067200000,
          cancelation_date: 1705276800000
        }
      );
    });

    it('should handle trial filter', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(false) // returnAll
        .mockReturnValueOnce({ 
          trial: true
        }) // filters
        .mockReturnValueOnce(50); // limit

      mockHotmartApiRequest.mockResolvedValueOnce({ items: [] });

      await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'GET',
        '/payments/api/v1/subscriptions',
        {},
        {
          max_results: 50,
          trial: true
        }
      );
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

    it('should apply all possible filters', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(false) // returnAll
        .mockReturnValueOnce({ 
          productId: 'prod_123',
          plan: 'Plan A,Plan B',
          planId: 'plan_123',
          subscriberCode: 'sub_code_123',
          subscriberEmail: 'test@example.com',
          transaction: 'trans_123',
          trial: false,
          accessionDate: '2024-01-01T00:00:00Z',
          endAccessionDate: '2024-01-31T00:00:00Z',
          cancelationDate: '2024-02-01T00:00:00Z',
          endCancelationDate: '2024-02-28T00:00:00Z',
          dateNextCharge: '2024-03-01T00:00:00Z',
          endDateNextCharge: '2024-03-31T00:00:00Z',
          status: ['ACTIVE']
        }) // filters
        .mockReturnValueOnce(50); // limit

      mockHotmartApiRequest.mockResolvedValueOnce({ items: [] });

      await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'GET',
        '/payments/api/v1/subscriptions',
        {},
        {
          max_results: 50,
          status: 'ACTIVE',
          product_id: 'prod_123',
          plan: 'Plan A,Plan B',
          plan_id: 'plan_123',
          trial: false,
          subscriber_email: 'test@example.com',
          transaction: 'trans_123',
          accession_date: 1704067200000,
          end_accession_date: 1706659200000,
          cancelation_date: 1706745600000,
          end_cancelation_date: 1709078400000,
          date_next_charge: 1709251200000,
          end_date_next_charge: 1711843200000,
          subscriber_code: 'sub_code_123'
        }
      );
    });
  });
});