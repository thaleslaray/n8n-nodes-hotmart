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
      if (param === 'options') return {};
      return defaultValue;
    });

    const mockResponse = {
      total_sales: 100,
      total_amount: 50000.00,
      total_commission: 15000.00,
      conversion_rate: 0.25,
      period: {
        start_date: '2024-01-01',
        end_date: '2024-01-31'
      }
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
    });
  });

  it('deve aplicar filtros de data', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'options') return {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({});

    await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/payments/api/v1/sales/summary',
      {},
      expect.objectContaining({
        start_date: '2024-01-01',
        end_date: '2024-01-31'
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
});