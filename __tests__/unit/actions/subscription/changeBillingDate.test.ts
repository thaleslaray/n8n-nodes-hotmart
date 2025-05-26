import { execute } from '../../../../nodes/Hotmart/v1/actions/subscription/changeBillingDate.operation';
import { createMockExecuteFunctions } from '../../../helpers/testHelpers';
import * as request from '../../../../nodes/Hotmart/v1/transport/request';
import { IExecuteFunctions } from 'n8n-workflow';

jest.mock('../../../../nodes/Hotmart/v1/transport/request');

describe('Subscription - changeBillingDate', () => {
  let mockThis: IExecuteFunctions;
  let mockHotmartApiRequest: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockThis = createMockExecuteFunctions();
    mockThis.getNode = jest.fn().mockReturnValue({ name: 'Hotmart' });
    mockThis.continueOnFail = jest.fn().mockReturnValue(false);

    mockHotmartApiRequest = request.hotmartApiRequest as jest.Mock;
  });

  it('deve alterar data de cobrança com sucesso', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subscriberCode') return 'sub_12345';
      if (param === 'dueDay') return 15;
      return defaultValue;
    });

    const mockResponse = {
      success: true,
      subscriber_code: 'sub_12345',
      due_day: 15,
      message: 'Billing date updated successfully'
    };

    mockHotmartApiRequest.mockResolvedValue(mockResponse);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'PATCH',
      '/payments/api/v1/subscriptions/sub_12345',
      {
        due_day: 15
      }
    );

    expect(result[0]).toHaveLength(1);
    expect(result[0][0].json).toEqual(mockResponse);
  });

  it('deve alterar data de cobrança para diferentes dias', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subscriberCode') return 'sub_99999';
      if (param === 'dueDay') return 28;
      return defaultValue;
    });

    const mockResponse = {
      success: true,
      due_day: 28
    };

    mockHotmartApiRequest.mockResolvedValue(mockResponse);

    await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'PATCH',
      '/payments/api/v1/subscriptions/sub_99999',
      {
        due_day: 28
      }
    );
  });

  it('deve tratar erro de assinatura não encontrada', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subscriberCode') return 'sub_invalid';
      if (param === 'dueDay') return 15;
      return defaultValue;
    });

    const mockError = new Error('Subscription not found');
    mockHotmartApiRequest.mockRejectedValue(mockError);

    await expect(execute.call(mockThis, [{ json: {} }])).rejects.toThrow('Subscription not found');
  });

  it('deve tratar erro de data inválida', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subscriberCode') return 'sub_12345';
      if (param === 'dueDay') return 31;
      return defaultValue;
    });

    const mockError = new Error('Invalid billing date. Must be between 1 and 28');
    mockHotmartApiRequest.mockRejectedValue(mockError);

    await expect(execute.call(mockThis, [{ json: {} }])).rejects.toThrow('Invalid billing date');
  });

  it('deve continuar em caso de erro com continueOnFail', async () => {
    mockThis.continueOnFail = jest.fn().mockReturnValue(true);
    
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subscriberCode') return 'sub_error';
      if (param === 'dueDay') return 15;
      return defaultValue;
    });

    const mockError = new Error('API Error');
    mockHotmartApiRequest.mockRejectedValue(mockError);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result[0]).toHaveLength(1);
    expect(result[0][0].json.error).toBe('API Error');
  });

  it('deve processar múltiplas assinaturas', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subscriberCode') {
        return index === 0 ? 'sub_111' : 'sub_222';
      }
      if (param === 'dueDay') {
        return index === 0 ? 10 : 20;
      }
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({});

    const result = await execute.call(mockThis, [{ json: {} }, { json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledTimes(2);
    expect(mockHotmartApiRequest).toHaveBeenNthCalledWith(
      1,
      'PATCH',
      '/payments/api/v1/subscriptions/sub_111',
      { due_day: 10 }
    );
    expect(mockHotmartApiRequest).toHaveBeenNthCalledWith(
      2,
      'PATCH',
      '/payments/api/v1/subscriptions/sub_222',
      { due_day: 20 }
    );

    expect(result[0]).toHaveLength(2);
  });

  it('deve processar sem itens de entrada', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subscriberCode') return 'sub_12345';
      if (param === 'dueDay') return 5;
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({});

    const result = await execute.call(mockThis, []);

    expect(mockHotmartApiRequest).toHaveBeenCalled();
    expect(result[0]).toHaveLength(1);
  });

  it('deve aceitar datas de 1 a 28', async () => {
    const validDates = [1, 5, 10, 15, 20, 25, 28];
    
    for (const date of validDates) {
      jest.clearAllMocks();
      
      (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
        if (param === 'subscriberCode') return 'sub_test';
        if (param === 'dueDay') return date;
        return defaultValue;
      });

      mockHotmartApiRequest.mockResolvedValue({});

      await execute.call(mockThis, [{ json: {} }]);

      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        'PATCH',
        '/payments/api/v1/subscriptions/sub_test',
        {
          due_day: date
        }
      );
    }
  });

  it('should handle undefined response', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subscriberCode') return 'sub_123';
      if (param === 'newChargeDate') return '28';
      return defaultValue;
    });

    // Mock retorna undefined
    mockHotmartApiRequest.mockResolvedValueOnce(undefined);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result[0][0].json).toEqual({});
  });
});