import { execute } from '../../../../nodes/Hotmart/v1/actions/subscription/getPurchases.operation';
import { createMockExecuteFunction } from '../../../helpers/mocks';
import type { IExecuteFunctions } from 'n8n-workflow';

// Mock the request modules
jest.mock('../../../../nodes/Hotmart/v1/transport/request', () => ({
  hotmartApiRequest: jest.fn(),
}));

import { hotmartApiRequest } from '../../../../nodes/Hotmart/v1/transport/request';

describe('Subscription getPurchases operation', () => {
  let mockThis: IExecuteFunctions;

  beforeEach(() => {
    mockThis = createMockExecuteFunction();
    jest.clearAllMocks();
  });

  it('should get subscription purchases successfully', async () => {
    const mockPurchases = [
      {
        transaction_id: 'TRX-001',
        product_name: 'Curso Node.js Avançado',
        purchase_date: '2025-01-15T10:30:00.000Z',
        value: 197.00,
        currency: 'BRL',
        payment_method: 'CREDIT_CARD',
        status: 'APPROVED'
      },
      {
        transaction_id: 'TRX-002',
        product_name: 'Mentoria Express.js',
        purchase_date: '2025-02-10T15:45:00.000Z',
        value: 497.00,
        currency: 'BRL',
        payment_method: 'PIX',
        status: 'APPROVED'
      }
    ];

    // Mock all getNodeParameter calls in order
    (mockThis.getNodeParameter as jest.Mock)
      .mockReturnValueOnce('SUB-123456'); // subscriberCode

    // Mock the API request
    (hotmartApiRequest as jest.Mock).mockResolvedValueOnce(mockPurchases);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(2);
    expect(result[0][0].json.transaction_id).toBe('TRX-001');
    expect(result[0][1].json.transaction_id).toBe('TRX-002');
    
    expect(hotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/payments/api/v1/subscriptions/SUB-123456/purchases'
    );
  });

  it('should handle subscription not found error', async () => {
    (mockThis.getNodeParameter as jest.Mock)
      .mockReturnValueOnce('SUB-INVALID'); // subscriberCode

    (hotmartApiRequest as jest.Mock).mockRejectedValueOnce(new Error('Subscription not found'));
    (mockThis.continueOnFail as jest.Mock).mockReturnValueOnce(true);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(1);
    expect(result[0][0].json.error).toBe('Subscription not found');
  });

  it('should throw error when unauthorized', async () => {
    (mockThis.getNodeParameter as jest.Mock)
      .mockReturnValueOnce('SUB-PRIVATE'); // subscriberCode

    (hotmartApiRequest as jest.Mock).mockRejectedValueOnce(new Error('Unauthorized'));
    (mockThis.continueOnFail as jest.Mock).mockReturnValueOnce(false);

    await expect(execute.call(mockThis, [{ json: {} }])).rejects.toThrow('Unauthorized');
  });

  it('should handle empty purchases list', async () => {
    const mockEmptyPurchases: any[] = [];

    (mockThis.getNodeParameter as jest.Mock)
      .mockReturnValueOnce('SUB-NOPURCHASES'); // subscriberCode

    (hotmartApiRequest as jest.Mock).mockResolvedValueOnce(mockEmptyPurchases);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(0);
  });

  it('should handle empty items array input', async () => {
    const mockPurchases = [
      {
        transaction_id: 'TRX-EMPTY-001',
        product_name: 'Test Product',
        value: 50.00
      }
    ];

    (mockThis.getNodeParameter as jest.Mock)
      .mockReturnValueOnce('SUB-EMPTY-ITEMS'); // subscriberCode

    (hotmartApiRequest as jest.Mock).mockResolvedValueOnce(mockPurchases);

    // Passar array vazio de items
    const result = await execute.call(mockThis, []);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(1);
    expect(result[0][0].json.transaction_id).toBe('TRX-EMPTY-001');
  });
});