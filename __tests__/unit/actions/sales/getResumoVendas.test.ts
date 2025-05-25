import { execute } from '../../../../nodes/Hotmart/v1/actions/sales/getResumoVendas.operation';
import { createMockExecuteFunctions } from '../../../helpers/testHelpers';
import * as request from '../../../../nodes/Hotmart/v1/transport/request';
import { IExecuteFunctions } from 'n8n-workflow';

jest.mock('../../../../nodes/Hotmart/v1/transport/request');

describe('Sales - getResumoVendas', () => {
  let mockThis: IExecuteFunctions;
  let mockHotmartApiRequest: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockThis = createMockExecuteFunctions();
    mockThis.getNode = jest.fn().mockReturnValue({ name: 'Hotmart' });
    mockThis.continueOnFail = jest.fn().mockReturnValue(false);

    mockHotmartApiRequest = request.hotmartApiRequest as jest.Mock;
  });

  it('deve buscar resumo de vendas com sucesso', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'filters') return {};
      return defaultValue;
    });

    const mockResponse = {
      items: [{
        total_sales: 100,
        total_amount: 50000.00,
        total_commission: 15000.00,
        conversion_rate: 0.25,
        period: {
          start_date: '2024-01-01',
          end_date: '2024-01-31'
        }
      }]
    };

    mockHotmartApiRequest.mockResolvedValue(mockResponse);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/payments/api/v1/sales/summary',
      {},
      expect.any(Object)
    );

    expect(result[0]).toHaveLength(1);
    expect(result[0][0].json).toEqual({
      total_sales: 100,
      total_amount: 50000.00,
      total_commission: 15000.00,
      conversion_rate: 0.25,
      period: {
        start_date: '2024-01-01',
        end_date: '2024-01-31'
      }
    });
  });

  it('deve aplicar filtros de data', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'filters') return {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({ items: [] });

    await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/payments/api/v1/sales/summary',
      {},
      {
        max_results: 50,
        start_date: 1704067200000,
        end_date: 1706659200000
      }
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

  it('deve aplicar todos os filtros disponíveis', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'filters') return {
        productId: 'prod_123',
        transactionStatus: 'APPROVED',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        transaction: 'trans_123',
        salesSource: 'PRODUCER',
        affiliateName: 'John Doe',
        paymentType: 'CREDIT_CARD',
        offerCode: 'OFFER123'
      };
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({ items: [] });

    await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/payments/api/v1/sales/summary',
      {},
      expect.objectContaining({
        product_id: 'prod_123',
        transaction_status: 'APPROVED',
        start_date: expect.any(Number),
        end_date: expect.any(Number),
        transaction: 'trans_123',
        sales_source: 'PRODUCER',
        affiliate_name: 'John Doe',
        payment_type: 'CREDIT_CARD',
        offer_code: 'OFFER123'
      })
    );
  });

  it('deve buscar todos os resultados quando returnAll é true', async () => {
    const mockGetAllItems = jest.fn().mockResolvedValue([
      { total_sales: 10 },
      { total_sales: 20 },
      { total_sales: 30 }
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
      operation: 'getSummary',
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
      items: [{ total_sales: 100 }] 
    });

    const result = await execute.call(mockThis, [
      { json: { test: 1 } },
      { json: { test: 2 } }
    ]);

    expect(mockHotmartApiRequest).toHaveBeenCalledTimes(2);
    expect(result[0]).toHaveLength(2);
  });

  it('deve continuar em caso de erro quando continueOnFail é true', async () => {
    mockThis.continueOnFail = jest.fn().mockReturnValue(true);
    
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'filters') return {};
      return defaultValue;
    });

    mockHotmartApiRequest
      .mockRejectedValueOnce(new Error('API Error 1'))
      .mockResolvedValueOnce({ items: [{ total_sales: 50 }] });

    const result = await execute.call(mockThis, [
      { json: { test: 1 } },
      { json: { test: 2 } }
    ]);

    expect(result[0]).toHaveLength(2);
    expect(result[0][0].json).toEqual({ error: 'API Error 1' });
    expect(result[0][1].json).toEqual({ total_sales: 50 });
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
      '/payments/api/v1/sales/summary',
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

  it('deve processar quando não há items de entrada', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'filters') return {};
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({ items: [{ total_sales: 10 }] });

    const result = await execute.call(mockThis, []);

    expect(result[0]).toHaveLength(1);
    expect(result[0][0].json).toEqual({ total_sales: 10 });
  });
});