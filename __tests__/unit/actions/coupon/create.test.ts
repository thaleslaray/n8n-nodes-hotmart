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
        .mockReturnValueOnce('DISCOUNT10') // code
        .mockReturnValueOnce('PERCENTAGE') // discountType
        .mockReturnValueOnce(10) // discountValue
        .mockReturnValueOnce('2024-12-31T23:59:59') // expirationDate
        .mockReturnValueOnce({}); // additionalFields

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
        '/products/api/v1/product/DISCOUNT10/coupon',
        {
          code: 'PERCENTAGE',
          discount: 0.1,
          offer_ids: []
        }
      );

      expect(result).toEqual([[
        { json: mockResponse, pairedItem: { item: 0 } }
      ]]);
    });

    it('should create a fixed amount coupon with additional fields', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce('FIXED50') // code
        .mockReturnValueOnce('FIXED') // discountType
        .mockReturnValueOnce(50) // discountValue
        .mockReturnValueOnce('2024-12-31T23:59:59') // expirationDate
        .mockReturnValueOnce({ 
          maxUses: 100,
          productId: 'prod_123',
          description: 'Special discount'
        }); // additionalFields

      const mockResponse = {
        code: 'FIXED50',
        discount_type: 'FIXED',
        discount_value: 50
      };

      mockHotmartApiRequest.mockResolvedValueOnce(mockResponse);

      await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'POST',
        '/products/api/v1/product/FIXED50/coupon',
        {
          code: 'FIXED',
          discount: 0.5,
          offer_ids: []
        }
      );
    });

    it('should handle errors with continueOnFail=true', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce('DISCOUNT10') // code
        .mockReturnValueOnce('PERCENTAGE') // discountType
        .mockReturnValueOnce(10) // discountValue
        .mockReturnValueOnce('2024-12-31T23:59:59') // expirationDate
        .mockReturnValueOnce({}); // additionalFields
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
        .mockReturnValueOnce('DISCOUNT10') // code
        .mockReturnValueOnce('PERCENTAGE') // discountType
        .mockReturnValueOnce(10) // discountValue
        .mockReturnValueOnce('2024-12-31T23:59:59') // expirationDate
        .mockReturnValueOnce({}); // additionalFields
      mockThis.continueOnFail = jest.fn().mockReturnValue(false);

      const error = new Error('API Error');
      mockHotmartApiRequest.mockRejectedValueOnce(error);

      await expect(execute.call(mockThis, testItems)).rejects.toThrow('API Error');
    });
  });
});