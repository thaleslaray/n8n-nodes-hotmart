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
});