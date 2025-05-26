import { execute } from '../../../../nodes/Hotmart/v1/actions/sales/getComissoesVendas.operation';
import { createMockExecuteFunctions } from '../../../helpers/testHelpers';
import * as request from '../../../../nodes/Hotmart/v1/transport/request';
import { IExecuteFunctions } from 'n8n-workflow';

jest.mock('../../../../nodes/Hotmart/v1/transport/request');

describe('Sales - getComissoesVendas', () => {
  let mockThis: IExecuteFunctions;
  let mockHotmartApiRequest: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockThis = createMockExecuteFunctions();
    mockThis.getNode = jest.fn().mockReturnValue({ name: 'Hotmart' });
    mockThis.continueOnFail = jest.fn().mockReturnValue(false);

    mockHotmartApiRequest = request.hotmartApiRequest as jest.Mock;
  });

  it('deve buscar comissões de vendas com sucesso', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'options') return {};
      return defaultValue;
    });

    const mockResponse = {
      items: [
        {
          transaction_id: 'HP123456789',
          commission_value: 50.00,
          commission_percentage: 25.0,
          affiliate_code: 'AFF001',
          affiliate_name: 'João Afiliado',
          sale_date: '2024-01-15',
          product_name: 'Curso Digital',
          commission_status: 'APPROVED'
        }
      ]
    };

    mockHotmartApiRequest.mockResolvedValue(mockResponse);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/payments/api/v1/sales/commissions',
      {},
      expect.any(Object)
    );

    expect(result[0]).toHaveLength(1);
    expect(result[0][0].json).toMatchObject({
      transaction_id: 'HP123456789',
      commission_value: 50.00,
      affiliate_code: 'AFF001'
    });
  });

  it('deve aplicar filtros de data e afiliado', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'filters') return {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        transaction: 'HP123456789'
      };
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({ items: [] });

    await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/payments/api/v1/sales/commissions',
      {},
      expect.objectContaining({
        max_results: 50,
        start_date: 1704067200000,
        end_date: 1706659200000,
        transaction: 'HP123456789'
      })
    );
  });

  it('deve aplicar filtro de status', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'filters') return { transactionStatus: 'APPROVED' };
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({ items: [] });

    await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/payments/api/v1/sales/commissions',
      {},
      expect.objectContaining({
        max_results: 50,
        transaction_status: 'APPROVED'
      })
    );
  });

  it('deve aplicar filtro de produto', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'filters') return { productId: 'prod_123' };
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({ items: [] });

    await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/payments/api/v1/sales/commissions',
      {},
      expect.objectContaining({
        max_results: 50,
        product_id: 'prod_123'
      })
    );
  });

  it('deve tratar erro de API', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'options') return {};
      return defaultValue;
    });

    const mockError = new Error('API Error');
    mockHotmartApiRequest.mockRejectedValue(mockError);

    await expect(execute.call(mockThis, [{ json: {} }])).rejects.toThrow('API Error');
  });

  it('deve continuar em caso de erro com continueOnFail', async () => {
    mockThis.continueOnFail = jest.fn().mockReturnValue(true);
    
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'options') return {};
      return defaultValue;
    });

    const mockError = new Error('Commission data not found');
    mockHotmartApiRequest.mockRejectedValue(mockError);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result[0]).toHaveLength(1);
    expect(result[0][0].json.error).toBe('Commission data not found');
  });

  it('deve processar sem itens de entrada', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'options') return {};
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({ items: [] });

    const result = await execute.call(mockThis, []);

    expect(mockHotmartApiRequest).toHaveBeenCalled();
    expect(result[0]).toHaveLength(0);
  });

  it('deve aplicar filtro commissionAs', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'filters') return {
        transaction: 'HP123456789',
        commissionAs: 'AFFILIATE'
      };
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({ items: [] });

    await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/payments/api/v1/sales/commissions',
      {},
      expect.objectContaining({
        transaction: 'HP123456789',
        commission_as: 'AFFILIATE'
      })
    );
  });

  it('deve buscar todos os resultados quando returnAll é true', async () => {
    const mockGetAllItems = jest.fn().mockResolvedValue([
      { commission_value: 10 },
      { commission_value: 20 },
      { commission_value: 30 }
    ]);
    
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'returnAll') return true;
      if (param === 'maxResults') return 100;
      if (param === 'options') return {};
      return defaultValue;
    });

    jest.spyOn(require('../../../../nodes/Hotmart/v1/helpers/pagination'), 'getAllItems').mockImplementation(mockGetAllItems);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(mockGetAllItems).toHaveBeenCalledWith({
      maxResults: 100,
      resource: 'sales',
      operation: 'getComissoesVendas',
      query: expect.any(Object)
    });
    
    expect(result[0]).toHaveLength(3);
  });

  it('should handle response without items field', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'returnAll') return false;
      if (param === 'filters') return {};
      if (param === 'limit') return 50;
      return defaultValue;
    });

    const mockResponse = {
      // sem campo items
      page_info: { total_results: 0 }
    };

    mockHotmartApiRequest.mockResolvedValueOnce(mockResponse);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result[0]).toHaveLength(0); // Deve retornar array vazio
  });
});