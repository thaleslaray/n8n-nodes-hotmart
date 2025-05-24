import { execute } from '../../../../nodes/Hotmart/v1/actions/subscription/reactivateList.operation';
import { createMockExecuteFunctions } from '../../../helpers/testHelpers';
import * as request from '../../../../nodes/Hotmart/v1/transport/request';
import { IExecuteFunctions } from 'n8n-workflow';

jest.mock('../../../../nodes/Hotmart/v1/transport/request');

describe('Subscription - reactivateList', () => {
  let mockThis: IExecuteFunctions;
  let mockHotmartApiRequest: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockThis = createMockExecuteFunctions();
    mockThis.getNode = jest.fn().mockReturnValue({ name: 'Hotmart' });
    mockThis.continueOnFail = jest.fn().mockReturnValue(false);

    mockHotmartApiRequest = request.hotmartApiRequest as jest.Mock;
  });

  it('deve reativar lista de assinaturas com sucesso', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subscriberCodes') return 'sub_123,sub_456,sub_789';
      if (param === 'options') return {};
      return defaultValue;
    });

    const mockResponse = {
      success_subscriptions: ['sub_123', 'sub_456'],
      fail_subscriptions: [
        {
          subscriber_code: 'sub_789',
          error: 'Subscription not eligible for reactivation'
        }
      ]
    };

    mockHotmartApiRequest.mockResolvedValue(mockResponse);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'POST',
      '/payments/api/v1/subscriptions/reactivate',
      {
        subscriber_code: ['sub_123', 'sub_456', 'sub_789'],
        charge: true
      }
    );

    expect(result[0]).toHaveLength(1);
    expect(result[0][0].json).toMatchObject({
      success_subscriptions: ['sub_123', 'sub_456'],
      fail_subscriptions: expect.any(Array)
    });
  });

  it('deve processar string de códigos com espaços', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subscriberCodes') return 'sub_123, sub_456 , sub_789';
      if (param === 'options') return {};
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({ success_subscriptions: [], fail_subscriptions: [] });

    await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'POST',
      '/payments/api/v1/subscriptions/reactivate',
      {
        subscriber_code: ['sub_123', 'sub_456', 'sub_789'],
        charge: true
      }
    );
  });

  it('deve reativar sem realizar cobrança', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subscriberCodes') return 'sub_123';
      if (param === 'options') return { charge: false };
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({ success_subscriptions: ['sub_123'], fail_subscriptions: [] });

    await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'POST',
      '/payments/api/v1/subscriptions/reactivate',
      {
        subscriber_code: ['sub_123'],
        charge: false
      }
    );
  });

  it('deve processar múltiplos itens', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subscriberCodes') {
        return index === 0 ? 'sub_123' : 'sub_456';
      }
      if (param === 'options') return {};
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({ success_subscriptions: ['sub_123'], fail_subscriptions: [] });

    const result = await execute.call(mockThis, [{ json: {} }, { json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledTimes(2);
    expect(result[0]).toHaveLength(2);
  });

  it('deve tratar erro de API', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subscriberCodes') return 'sub_123';
      if (param === 'options') return {};
      return defaultValue;
    });

    const mockError = new Error('Batch reactivation failed');
    mockHotmartApiRequest.mockRejectedValue(mockError);

    await expect(execute.call(mockThis, [{ json: {} }])).rejects.toThrow('Batch reactivation failed');
  });

  it('deve continuar em caso de erro com continueOnFail', async () => {
    mockThis.continueOnFail = jest.fn().mockReturnValue(true);
    
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subscriberCodes') return 'sub_invalid';
      if (param === 'options') return {};
      return defaultValue;
    });

    const mockError = new Error('Invalid subscription codes');
    mockHotmartApiRequest.mockRejectedValue(mockError);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result[0]).toHaveLength(1);
    expect(result[0][0].json.error).toBe('Invalid subscription codes');
  });

  it('deve processar sem itens de entrada', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subscriberCodes') return 'sub_123,sub_456';
      if (param === 'options') return {};
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({ success_subscriptions: [], fail_subscriptions: [] });

    const result = await execute.call(mockThis, []);

    expect(mockHotmartApiRequest).toHaveBeenCalled();
    expect(result[0]).toHaveLength(1);
  });

  it('deve processar com uma única assinatura', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subscriberCodes') return 'sub_123';
      if (param === 'options') return {};
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({ 
      success_subscriptions: ['sub_123'], 
      fail_subscriptions: [] 
    });

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'POST',
      '/payments/api/v1/subscriptions/reactivate',
      {
        subscriber_code: ['sub_123'],
        charge: true
      }
    );
    expect(result[0][0].json.success_subscriptions).toEqual(['sub_123']);
  });

  it('deve processar lista vazia de assinaturas', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subscriberCodes') return '';
      if (param === 'options') return {};
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({ 
      success_subscriptions: [], 
      fail_subscriptions: [] 
    });

    await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'POST',
      '/payments/api/v1/subscriptions/reactivate',
      {
        subscriber_code: [''],
        charge: true
      }
    );
  });

  it('deve processar resposta com todas as assinaturas falhando', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subscriberCodes') return 'sub_123,sub_456';
      if (param === 'options') return { charge: true };
      return defaultValue;
    });

    const mockResponse = {
      success_subscriptions: [],
      fail_subscriptions: [
        {
          subscriber_code: 'sub_123',
          error: 'Subscription already active'
        },
        {
          subscriber_code: 'sub_456',
          error: 'Subscription not found'
        }
      ]
    };

    mockHotmartApiRequest.mockResolvedValue(mockResponse);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result[0][0].json.fail_subscriptions).toHaveLength(2);
    expect(result[0][0].json.success_subscriptions).toEqual([]);
  });
});