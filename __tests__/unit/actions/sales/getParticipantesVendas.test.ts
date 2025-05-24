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
      if (param === 'options') return {};
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
      if (param === 'options') return { transactionId: 'HP123456789' };
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({ items: [] });

    await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/payments/api/v1/sales/users',
      {},
      expect.objectContaining({
        transaction_id: 'HP123456789'
      })
    );
  });

  it('deve aplicar filtros de data', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'options') return {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({ items: [] });

    await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/payments/api/v1/sales/participants',
      {},
      expect.objectContaining({
        start_date: '2024-01-01',
        end_date: '2024-01-31'
      })
    );
  });

  it('deve filtrar por role', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'options') return { role: 'AFFILIATE' };
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({ items: [] });

    await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/payments/api/v1/sales/participants',
      {},
      expect.objectContaining({
        role: 'AFFILIATE'
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