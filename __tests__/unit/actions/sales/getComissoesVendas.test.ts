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
      if (param === 'options') return {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        affiliateCode: 'AFF001'
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
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        affiliate_code: 'AFF001'
      })
    );
  });

  it('deve aplicar filtro de status', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'options') return { status: 'APPROVED' };
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({ items: [] });

    await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/payments/api/v1/sales/commissions',
      {},
      expect.objectContaining({
        status: 'APPROVED'
      })
    );
  });

  it('deve aplicar filtro de produto', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'options') return { productId: 'prod_123' };
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({ items: [] });

    await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/payments/api/v1/sales/commissions',
      {},
      expect.objectContaining({
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
});