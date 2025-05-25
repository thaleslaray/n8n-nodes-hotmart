import { execute } from '../../../../nodes/Hotmart/v1/actions/sales/getParticipantesVendas.operation';
import { createMockExecuteFunctions } from '../../../helpers/testHelpers';
import * as request from '../../../../nodes/Hotmart/v1/transport/request';
import { IExecuteFunctions } from 'n8n-workflow';

jest.mock('../../../../nodes/Hotmart/v1/transport/request');

describe('Sales - getParticipantesVendas', () => {
  let mockThis: IExecuteFunctions;
  let mockHotmartApiRequest: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockThis = createMockExecuteFunctions();
    mockThis.getNode = jest.fn().mockReturnValue({ name: 'Hotmart' });
    mockThis.continueOnFail = jest.fn().mockReturnValue(false);

    mockHotmartApiRequest = request.hotmartApiRequest as jest.Mock;
  });

  it('deve buscar participantes de vendas com sucesso', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'filters') return {};
      return defaultValue;
    });

    const mockResponse = {
      items: [
        {
          participant_id: 'part_123',
          name: 'João Silva',
          email: 'joao@email.com',
          role: 'BUYER',
          transaction_id: 'HP123456789',
          participation_date: '2024-01-15',
          commission_earned: 25.50
        }
      ]
    };

    mockHotmartApiRequest.mockResolvedValue(mockResponse);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result[0]).toHaveLength(1);
    expect(result[0][0].json).toMatchObject({
      participant_id: 'part_123',
      name: 'João Silva',
      role: 'BUYER'
    });
  });

  it('deve aplicar filtros de transação', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'filters') return { transaction: 'HP123456789' };
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({ items: [] });

    await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/payments/api/v1/sales/users',
      {},
      expect.objectContaining({
        transaction: 'HP123456789',
        max_results: 50
      })
    );
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
      '/payments/api/v1/sales/users',
      {},
      expect.objectContaining({
        start_date: 1704067200000,
        end_date: 1706659200000,
        max_results: 50
      })
    );
  });

  it('deve filtrar por role', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'filters') return { commissionAs: 'AFFILIATE' };
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({ items: [] });

    await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/payments/api/v1/sales/users',
      {},
      expect.objectContaining({
        commission_as: 'AFFILIATE',
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

  it('deve aplicar todos os filtros disponíveis', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'filters') return {
        productId: 'prod_123',
        transactionStatus: 'APPROVED',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        transaction: 'trans_123',
        buyerName: 'John Doe',
        affiliateName: 'Jane Smith',
        commissionAs: 'AFFILIATE',
        buyerEmail: 'john@example.com',
        salesSource: 'PRODUCER'
      };
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({ items: [] });

    await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/payments/api/v1/sales/users',
      {},
      expect.objectContaining({
        product_id: 'prod_123',
        transaction_status: 'APPROVED',
        start_date: expect.any(Number),
        end_date: expect.any(Number),
        transaction: 'trans_123',
        buyer_name: 'John Doe',
        affiliate_name: 'Jane Smith',
        commission_as: 'AFFILIATE',
        buyer_email: 'john@example.com',
        sales_source: 'PRODUCER'
      })
    );
  });

  it('deve buscar todos os resultados quando returnAll é true', async () => {
    const mockGetAllItems = jest.fn().mockResolvedValue([
      { participant_id: 'part_1' },
      { participant_id: 'part_2' },
      { participant_id: 'part_3' }
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
      operation: 'getParticipants',
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
      items: [{ participant_id: 'part_123' }] 
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
      .mockResolvedValueOnce({ items: [{ participant_id: 'part_123' }] });

    const result = await execute.call(mockThis, [
      { json: { test: 1 } },
      { json: { test: 2 } }
    ]);

    expect(result[0]).toHaveLength(2);
    expect(result[0][0].json).toEqual({ error: 'API Error 1' });
    expect(result[0][1].json).toEqual({ participant_id: 'part_123' });
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
      '/payments/api/v1/sales/users',
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

    mockHotmartApiRequest.mockResolvedValue({ items: [{ participant_id: 'part_123' }] });

    const result = await execute.call(mockThis, []);

    expect(result[0]).toHaveLength(1);
    expect(result[0][0].json).toEqual({ participant_id: 'part_123' });
  });
});