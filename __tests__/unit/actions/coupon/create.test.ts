import { execute } from '../../../../nodes/Hotmart/v1/actions/coupon/create.operation';
import { createMockExecuteFunctions } from '../../../helpers/testHelpers';
import * as request from '../../../../nodes/Hotmart/v1/transport/request';
import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

// Mock dos módulos
jest.mock('../../../../nodes/Hotmart/v1/transport/request');

// Mock do console.log
global.console.log = jest.fn();

describe('Coupon - Create Operation', () => {
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

    it('should create a percentage coupon', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce('prod_123') // product_id
        .mockReturnValueOnce('DISCOUNT10') // code
        .mockReturnValueOnce(10) // discount
        .mockReturnValueOnce({}); // options

      const mockResponse = {
        code: 'DISCOUNT10',
        discount_type: 'PERCENTAGE',
        discount_value: 10,
        expiration_date: 1735689599000
      };

      mockHotmartApiRequest.mockResolvedValueOnce(mockResponse);

      const result = await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequest).toHaveBeenCalledTimes(1);
      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'POST',
        '/products/api/v1/product/prod_123/coupon',
        {
          code: 'DISCOUNT10',
          discount: 0.1,
          offer_ids: []
        }
      );

      expect(result).toEqual([[
        { json: mockResponse, pairedItem: { item: 0 } }
      ]]);
    });

    it('should create a fixed amount coupon with options', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce('prod_456') // product_id
        .mockReturnValueOnce('FIXED50') // code
        .mockReturnValueOnce(50) // discount
        .mockReturnValueOnce({}); // options

      const mockResponse = {
        code: 'FIXED50',
        discount_type: 'FIXED',
        discount_value: 50
      };

      mockHotmartApiRequest.mockResolvedValueOnce(mockResponse);

      await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'POST',
        '/products/api/v1/product/prod_456/coupon',
        {
          code: 'FIXED50',
          discount: 0.5,
          offer_ids: []
        }
      );
    });

    it('should handle errors with continueOnFail=true', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce('prod_123') // product_id
        .mockReturnValueOnce('DISCOUNT10') // code
        .mockReturnValueOnce(10) // discount
        .mockReturnValueOnce({}); // options
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
        .mockReturnValueOnce('prod_123') // product_id
        .mockReturnValueOnce('DISCOUNT10') // code
        .mockReturnValueOnce(10) // discount
        .mockReturnValueOnce({}); // options
      mockThis.continueOnFail = jest.fn().mockReturnValue(false);

      const error = new Error('API Error');
      mockHotmartApiRequest.mockRejectedValueOnce(error);

      await expect(execute.call(mockThis, testItems)).rejects.toThrow('API Error');
    });

    it('should create coupon with all optional fields', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce('prod_789') // product_id
        .mockReturnValueOnce('SPECIAL20') // code
        .mockReturnValueOnce(20) // discount
        .mockReturnValueOnce({ 
          start_date: '2024-01-01T00:00:00',
          end_date: '2024-12-31T23:59:59',
          affiliate: 'affiliate@example.com',
          offer_ids: 'offer1, offer2, offer3'
        }); // options with all optional fields

      const mockResponse = {
        code: 'SPECIAL20',
        discount_type: 'PERCENTAGE',
        discount_value: 20
      };

      mockHotmartApiRequest.mockResolvedValueOnce(mockResponse);

      const result = await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'POST',
        '/products/api/v1/product/prod_789/coupon',
        {
          code: 'SPECIAL20',
          discount: 0.2,
          start_date: 1704067200000, // 2024-01-01T00:00:00 em timestamp
          end_date: 1735689599000, // 2024-12-31T23:59:59 em timestamp
          affiliate: 'affiliate@example.com',
          offer_ids: ['offer1', 'offer2', 'offer3']
        }
      );

      expect(result).toEqual([[
        { json: mockResponse, pairedItem: { item: 0 } }
      ]]);
    });

    it('should handle empty offer_ids string', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce('prod_999') // product_id
        .mockReturnValueOnce('EMPTY_OFFERS') // code
        .mockReturnValueOnce(15) // discount
        .mockReturnValueOnce({ 
          offer_ids: '   ' // empty/whitespace string
        }); // options

      const mockResponse = {
        code: 'EMPTY_OFFERS',
        discount_type: 'PERCENTAGE',
        discount_value: 15
      };

      mockHotmartApiRequest.mockResolvedValueOnce(mockResponse);

      await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'POST',
        '/products/api/v1/product/prod_999/coupon',
        {
          code: 'EMPTY_OFFERS',
          discount: 0.15,
          offer_ids: []
        }
      );
    });

    it('should handle just some optional fields', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce('prod_555') // product_id
        .mockReturnValueOnce('PARTIAL') // code
        .mockReturnValueOnce(25) // discount
        .mockReturnValueOnce({ 
          start_date: '2024-06-01T00:00:00',
          // no end_date
          affiliate: 'partner@test.com',
          // no offer_ids
        }); // options with partial fields

      const mockResponse = {
        code: 'PARTIAL',
        discount_type: 'PERCENTAGE',
        discount_value: 25
      };

      mockHotmartApiRequest.mockResolvedValueOnce(mockResponse);

      await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'POST',
        '/products/api/v1/product/prod_555/coupon',
        {
          code: 'PARTIAL',
          discount: 0.25,
          start_date: 1717200000000, // 2024-06-01T00:00:00 em timestamp
          affiliate: 'partner@test.com',
          offer_ids: []
        }
      );
    });
  });
});