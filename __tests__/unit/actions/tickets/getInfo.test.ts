import { execute } from '../../../../nodes/Hotmart/v1/actions/tickets/getInfo.operation';
import { createMockExecuteFunctions } from '../../../helpers/testHelpers';
import * as request from '../../../../nodes/Hotmart/v1/transport/request';
import { IExecuteFunctions } from 'n8n-workflow';

jest.mock('../../../../nodes/Hotmart/v1/transport/request');

describe('Tickets - getInfo', () => {
  let mockThis: IExecuteFunctions;
  let mockHotmartApiRequest: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockThis = createMockExecuteFunctions();
    mockThis.getNode = jest.fn().mockReturnValue({ name: 'Hotmart' });
    mockThis.continueOnFail = jest.fn().mockReturnValue(false);

    mockHotmartApiRequest = request.hotmartApiRequest as jest.Mock;
  });

  it('deve buscar informações de evento com sucesso', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'event_id') return 'event123';
      return defaultValue;
    });

    const mockResponse = {
      id: 'event123',
      name: 'Conferência Tech 2024',
      description: 'Evento de tecnologia imperdível',
      start_date: '2024-03-15T09:00:00Z',
      end_date: '2024-03-15T18:00:00Z',
      location: {
        name: 'Centro de Convenções',
        address: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP'
      },
      capacity: 500,
      tickets_sold: 350,
      lots: [
        {
          id: 'lot1',
          name: 'Ingresso Básico',
          price: 150.00,
          currency: 'BRL',
          available: 100
        }
      ]
    };

    mockHotmartApiRequest.mockResolvedValue(mockResponse);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/events/api/v1/event123/info'
    );

    expect(result[0]).toHaveLength(1);
    expect(result[0][0].json).toEqual(mockResponse);
    expect(result[0][0].json).toHaveProperty('name', 'Conferência Tech 2024');
    expect(result[0][0].json).toHaveProperty('capacity', 500);
  });

  it('deve buscar informações de evento diferente', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'event_id') return 'event456';
      return defaultValue;
    });

    const mockResponse = {
      id: 'event456',
      name: 'Workshop Avançado',
      description: 'Workshop para profissionais',
      capacity: 50,
      tickets_sold: 45
    };

    mockHotmartApiRequest.mockResolvedValue(mockResponse);

    await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/events/api/v1/event456/info'
    );
  });

  it('deve processar informações detalhadas do evento', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'event_id') return 'detailed_event';
      return defaultValue;
    });

    const mockResponse = {
      id: 'detailed_event',
      name: 'Mega Evento 2024',
      organizer: {
        name: 'EventCorp',
        email: 'contato@eventcorp.com'
      },
      location: {
        name: 'Estádio Central',
        coordinates: { lat: -23.5505, lng: -46.6333 }
      },
      lots: [
        {
          id: 'vip',
          name: 'VIP',
          price: 500.00,
          benefits: ['Acesso exclusivo', 'Catering']
        },
        {
          id: 'basic',
          name: 'Básico',
          price: 100.00,
          benefits: ['Acesso geral']
        }
      ],
      stats: {
        total_capacity: 1000,
        tickets_sold: 750,
        revenue: 325000.00
      }
    };

    mockHotmartApiRequest.mockResolvedValue(mockResponse);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result[0][0].json).toHaveProperty('organizer');
    expect(result[0][0].json).toHaveProperty('lots');
    expect(result[0][0].json.lots).toHaveLength(2);
    expect(result[0][0].json.stats).toHaveProperty('revenue', 325000.00);
  });

  it('deve tratar erro de evento não encontrado', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'event_id') return 'nonexistent_event';
      return defaultValue;
    });

    const mockError = new Error('Event not found');
    mockHotmartApiRequest.mockRejectedValue(mockError);

    await expect(execute.call(mockThis, [{ json: {} }])).rejects.toThrow('Event not found');
  });

  it('deve continuar em caso de erro com continueOnFail', async () => {
    mockThis.continueOnFail = jest.fn().mockReturnValue(true);
    
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'event_id') return 'access_denied_event';
      return defaultValue;
    });

    const mockError = new Error('Access denied');
    mockHotmartApiRequest.mockRejectedValue(mockError);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result[0]).toHaveLength(1);
    expect(result[0][0].json.error).toBe('Access denied');
  });

  it('deve processar sem itens de entrada', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'event_id') return 'empty_event';
      return defaultValue;
    });

    const mockResponse = { id: 'empty_event', name: 'Evento Vazio' };

    mockHotmartApiRequest.mockResolvedValue(mockResponse);

    const result = await execute.call(mockThis, []);

    expect(mockHotmartApiRequest).toHaveBeenCalled();
    expect(result[0]).toHaveLength(1);
    expect(result[0][0].json).toEqual(mockResponse);
  });

  it('deve processar múltiplos eventos', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'event_id') return index === 0 ? 'event1' : 'event2';
      return defaultValue;
    });

    const mockResponse1 = { id: 'event1', name: 'Evento 1' };
    const mockResponse2 = { id: 'event2', name: 'Evento 2' };

    mockHotmartApiRequest
      .mockResolvedValueOnce(mockResponse1)
      .mockResolvedValueOnce(mockResponse2);

    const result = await execute.call(mockThis, [{ json: {} }, { json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledTimes(2);
    expect(result[0]).toHaveLength(2);
    expect(result[0][0].json).toEqual(mockResponse1);
    expect(result[0][1].json).toEqual(mockResponse2);
  });

  it('deve retornar evento com status e configurações', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'event_id') return 'configured_event';
      return defaultValue;
    });

    const mockResponse = {
      id: 'configured_event',
      status: 'ACTIVE',
      registration_open: true,
      allow_transfers: true,
      refund_policy: 'NO_REFUND',
      check_in_enabled: true,
      certificates_enabled: false,
      streaming_url: null
    };

    mockHotmartApiRequest.mockResolvedValue(mockResponse);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result[0][0].json).toHaveProperty('status', 'ACTIVE');
    expect(result[0][0].json).toHaveProperty('registration_open', true);
    expect(result[0][0].json).toHaveProperty('refund_policy', 'NO_REFUND');
  });

  it('deve tratar resposta nula ou undefined', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'event_id') return 'null_event';
      return defaultValue;
    });

    // Mock retornando null
    mockHotmartApiRequest.mockResolvedValue(null);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result[0]).toHaveLength(1);
    expect(result[0][0].json).toEqual({});
  });

  it('deve tratar resposta undefined', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'event_id') return 'undefined_event';
      return defaultValue;
    });

    // Mock retornando undefined
    mockHotmartApiRequest.mockResolvedValue(undefined);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result[0]).toHaveLength(1);
    expect(result[0][0].json).toEqual({});
  });
});