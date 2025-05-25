import { execute } from '../../../../nodes/Hotmart/v1/actions/sales/getDetalhamentoPrecos.operation';
import { createMockExecuteFunctions } from '../../../helpers/testHelpers';
import * as request from '../../../../nodes/Hotmart/v1/transport/request';
import { IExecuteFunctions } from 'n8n-workflow';

jest.mock('../../../../nodes/Hotmart/v1/transport/request');

describe('Sales - getDetalhamentoPrecos', () => {
  let mockThis: IExecuteFunctions;
  let mockHotmartApiRequest: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockThis = createMockExecuteFunctions();
    mockThis.getNode = jest.fn().mockReturnValue({ name: 'Hotmart' });
    mockThis.continueOnFail = jest.fn().mockReturnValue(false);

    mockHotmartApiRequest = request.hotmartApiRequest as jest.Mock;
  });

  it('deve buscar detalhamento de preços com sucesso', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'filters') return {};
      return defaultValue;
    });

    const mockResponse = {
      items: [
        {
          product_id: 'prod_123',
          product_name: 'Curso Digital',
          original_price: 197.00,
          current_price: 147.00,
          discount_percentage: 25.38,
          payment_methods: ['CREDIT_CARD', 'PIX', 'BILLET'],
          currency: 'BRL'
        }
      ]
    };

    mockHotmartApiRequest.mockResolvedValue(mockResponse);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result[0]).toHaveLength(1);
    expect(result[0][0].json).toMatchObject({
      product_id: 'prod_123',
      original_price: 197.00,
      current_price: 147.00,
    });
  });

  it('deve aplicar filtros de produto', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'filters') return { productId: 'prod_123' };
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({ items: [] });

    await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/payments/api/v1/sales/price/details',
      {},
      expect.objectContaining({
        product_id: 'prod_123',
        max_results: 50
      })
    );
  });

  it('deve tratar erro de API', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'filters') return {};
      return defaultValue;
    });

    const mockError = new Error('API Error');
    mockHotmartApiRequest.mockRejectedValue(mockError);

    await expect(execute.call(mockThis, [{ json: {} }])).rejects.toThrow('API Error');
  });

  it('deve aplicar todos os tipos de filtros', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'filters') return {
        productId: 'prod_123',
        transactionStatus: 'APPROVED',
        paymentType: 'CREDIT_CARD',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        transaction: 'trans_123'
      };
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({ items: [] });

    await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/payments/api/v1/sales/price/details',
      {},
      expect.objectContaining({
        product_id: 'prod_123',
        transaction_status: 'APPROVED',
        payment_type: 'CREDIT_CARD',
        start_date: expect.any(Number),
        end_date: expect.any(Number),
        transaction: 'trans_123',
        max_results: 50
      })
    );
  });

  it('deve buscar todos os resultados quando returnAll é true', async () => {
    const mockGetAllItems = jest.fn().mockResolvedValue([
      { product_id: 'prod_1' },
      { product_id: 'prod_2' },
      { product_id: 'prod_3' }
    ]);
    
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'returnAll') return true;
      if (param === 'filters') return {};
      if (param === 'maxResults') return 100;
      return defaultValue;
    });

    jest.spyOn(require('../../../../nodes/Hotmart/v1/helpers/pagination'), 'getAllItems').mockImplementation(mockGetAllItems);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(mockGetAllItems).toHaveBeenCalledWith({
      maxResults: 100,
      resource: 'sales',
      operation: 'getDetalhamentoPrecos',
      query: {}
    });
    
    expect(result[0]).toHaveLength(3);
  });

  it('deve processar múltiplos items', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'filters') return {};
      if (param === 'limit') return 10;
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({ 
      items: [
        { product_id: 'prod_123' },
        { product_id: 'prod_456' }
      ] 
    });

    const result = await execute.call(mockThis, [
      { json: { test: 1 } },
      { json: { test: 2 } }
    ]);

    expect(mockHotmartApiRequest).toHaveBeenCalledTimes(2);
    expect(result[0]).toHaveLength(4); // 2 items x 2 inputs
  });

  it('deve continuar em caso de erro quando continueOnFail é true', async () => {
    mockThis.continueOnFail = jest.fn().mockReturnValue(true);
    
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'filters') return {};
      return defaultValue;
    });

    mockHotmartApiRequest
      .mockRejectedValueOnce(new Error('API Error 1'))
      .mockResolvedValueOnce({ items: [{ product_id: 'prod_123' }] });

    const result = await execute.call(mockThis, [
      { json: { test: 1 } },
      { json: { test: 2 } }
    ]);

    expect(result[0]).toHaveLength(2);
    expect(result[0][0].json).toEqual({ error: 'API Error 1' });
    expect(result[0][1].json).toEqual({ product_id: 'prod_123' });
  });

  it('deve usar limit personalizado quando returnAll é false', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'returnAll') return false;
      if (param === 'limit') return 25;
      if (param === 'filters') return {};
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({ items: [] });

    await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/payments/api/v1/sales/price/details',
      {},
      expect.objectContaining({
        max_results: 25
      })
    );
  });

  it('deve tratar resposta sem items', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'filters') return {};
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({});

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result[0]).toHaveLength(0);
  });
});