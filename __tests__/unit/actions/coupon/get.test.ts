import { execute } from '../../../../nodes/Hotmart/v1/actions/coupon/get.operation';
import { createMockExecuteFunction } from '../../../helpers/mocks';
import type { IExecuteFunctions } from 'n8n-workflow';

// Mock the request module
jest.mock('../../../../nodes/Hotmart/v1/transport/request', () => ({
  hotmartApiRequest: jest.fn(),
}));

jest.mock('../../../../nodes/Hotmart/v1/transport/requestTyped', () => ({
  hotmartApiRequestTyped: jest.fn(),
}));

import { hotmartApiRequest } from '../../../../nodes/Hotmart/v1/transport/request';
import { hotmartApiRequestTyped } from '../../../../nodes/Hotmart/v1/transport/requestTyped';

describe('Coupon get operation', () => {
  let mockThis: IExecuteFunctions;

  beforeEach(() => {
    mockThis = createMockExecuteFunction();
    jest.clearAllMocks();
  });

  it('should get coupons successfully', async () => {
    const mockCoupons = {
      items: [
        {
          coupon_code: 'DESCONTO20',
          discount: 0.2,
          status: 'ACTIVE',
          created_at: '2025-01-15T10:00:00.000Z'
        }
      ]
    };

    // Mock all getNodeParameter calls in order
    (mockThis.getNodeParameter as jest.Mock)
      .mockReturnValueOnce(false) // returnAll
      .mockReturnValueOnce(50) // maxResults
      .mockReturnValueOnce('PROD-123') // product_id
      .mockReturnValueOnce({}) // filters
      .mockReturnValueOnce(50); // limit

    // Mock the API request
    (hotmartApiRequest as jest.Mock).mockResolvedValueOnce(mockCoupons);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(1);
    expect(result[0][0].json.coupon_code).toBe('DESCONTO20');
    expect(result[0][0].json.discount_percentage).toBe('20%');
    expect(result[0][0].json.coupon_info).toBe('DESCONTO20 - 20% (ACTIVE)');
    
    expect(hotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/products/api/v1/coupon/product/PROD-123',
      {},
      { max_results: 50 }
    );
  });

  it('should handle error with continueOnFail=true', async () => {
    (mockThis.getNodeParameter as jest.Mock)
      .mockReturnValueOnce(false) // returnAll
      .mockReturnValueOnce(50) // maxResults
      .mockReturnValueOnce('PROD-INVALID') // product_id
      .mockReturnValueOnce({}) // filters
      .mockReturnValueOnce(50); // limit

    (hotmartApiRequest as jest.Mock).mockRejectedValueOnce(new Error('Product not found'));

    (mockThis.continueOnFail as jest.Mock).mockReturnValueOnce(true);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(1);
    expect(result[0][0].json.error).toBe('Product not found');
  });

  it('should throw error with continueOnFail=false', async () => {
    (mockThis.getNodeParameter as jest.Mock)
      .mockReturnValueOnce(false) // returnAll
      .mockReturnValueOnce(50) // maxResults
      .mockReturnValueOnce('PROD-INVALID') // product_id
      .mockReturnValueOnce({}) // filters
      .mockReturnValueOnce(50); // limit

    (hotmartApiRequest as jest.Mock).mockRejectedValueOnce(new Error('Product not found'));

    (mockThis.continueOnFail as jest.Mock).mockReturnValueOnce(false);

    await expect(execute.call(mockThis, [{ json: {} }])).rejects.toThrow('Product not found');
  });

  it('should handle return all with pagination', async () => {
    const mockFirstPage = {
      items: [
        { coupon_code: 'COUPON1', discount: 0.1, status: 'ACTIVE' },
        { coupon_code: 'COUPON2', discount: 0.15, status: 'ACTIVE' }
      ],
      page_info: {
        next_page_token: 'token123'
      }
    };

    const mockSecondPage = {
      items: [
        { coupon_code: 'COUPON3', discount: 0.2, status: 'ACTIVE' }
      ],
      page_info: {
        next_page_token: undefined
      }
    };

    (mockThis.getNodeParameter as jest.Mock)
      .mockReturnValueOnce(true) // returnAll
      .mockReturnValueOnce(2) // maxResults
      .mockReturnValueOnce('PROD-123') // product_id
      .mockReturnValueOnce({}); // filters

    (hotmartApiRequestTyped as jest.Mock)
      .mockResolvedValueOnce(mockFirstPage)
      .mockResolvedValueOnce(mockSecondPage);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(3);
    expect(result[0][0].json.coupon_code).toBe('COUPON1');
    expect(result[0][1].json.coupon_code).toBe('COUPON2');
    expect(result[0][2].json.coupon_code).toBe('COUPON3');

    expect(hotmartApiRequestTyped).toHaveBeenCalledTimes(2);
  });

  it('should handle empty items array', async () => {
    // Test when called with empty items array (lines 88)
    (mockThis.getNodeParameter as jest.Mock)
      .mockReturnValueOnce(false) // returnAll
      .mockReturnValueOnce(50) // maxResults
      .mockReturnValueOnce('PROD-123') // product_id
      .mockReturnValueOnce({}) // filters
      .mockReturnValueOnce(50); // limit

    const mockCoupons = {
      items: [
        {
          coupon_code: 'EMPTY_TEST',
          discount: 0.3,
          status: 'ACTIVE'
        }
      ]
    };

    (hotmartApiRequest as jest.Mock).mockResolvedValueOnce(mockCoupons);

    // Call with empty items array
    const result = await execute.call(mockThis, []);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(1);
    expect(result[0][0].json.coupon_code).toBe('EMPTY_TEST');
  });

  it('should handle coupons without discount field', async () => {
    const mockCoupons = {
      items: [
        {
          coupon_code: 'NO_DISCOUNT',
          // no discount field
          status: 'ACTIVE'
        }
      ]
    };

    (mockThis.getNodeParameter as jest.Mock)
      .mockReturnValueOnce(false) // returnAll
      .mockReturnValueOnce(50) // maxResults
      .mockReturnValueOnce('PROD-123') // product_id
      .mockReturnValueOnce({}) // filters
      .mockReturnValueOnce(50); // limit

    (hotmartApiRequest as jest.Mock).mockResolvedValueOnce(mockCoupons);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(1);
    expect(result[0][0].json.coupon_code).toBe('NO_DISCOUNT');
    // Should not have discount_percentage or coupon_info
    expect(result[0][0].json.discount_percentage).toBeUndefined();
    expect(result[0][0].json.coupon_info).toBeUndefined();
  });

  it('should handle coupons without status field', async () => {
    const mockCoupons = {
      items: [
        {
          coupon_code: 'NO_STATUS',
          discount: 0.25,
          // no status field
        }
      ]
    };

    (mockThis.getNodeParameter as jest.Mock)
      .mockReturnValueOnce(false) // returnAll
      .mockReturnValueOnce(50) // maxResults
      .mockReturnValueOnce('PROD-123') // product_id
      .mockReturnValueOnce({}) // filters
      .mockReturnValueOnce(50); // limit

    (hotmartApiRequest as jest.Mock).mockResolvedValueOnce(mockCoupons);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(1);
    expect(result[0][0].json.coupon_code).toBe('NO_STATUS');
    expect(result[0][0].json.discount_percentage).toBe('25%');
    // Should have coupon_info with 'unknown' status
    expect(result[0][0].json.coupon_info).toBe('NO_STATUS - 25% (unknown)');
  });

  it('should handle pagination without page_info', async () => {
    const mockPage = {
      items: [
        { coupon_code: 'COUPON1', discount: 0.1, status: 'ACTIVE' }
      ]
      // no page_info
    };

    (mockThis.getNodeParameter as jest.Mock)
      .mockReturnValueOnce(true) // returnAll
      .mockReturnValueOnce(50) // maxResults
      .mockReturnValueOnce('PROD-123') // product_id
      .mockReturnValueOnce({}); // filters

    (hotmartApiRequestTyped as jest.Mock).mockResolvedValueOnce(mockPage);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(1);
    expect(hotmartApiRequestTyped).toHaveBeenCalledTimes(1);
  });
});