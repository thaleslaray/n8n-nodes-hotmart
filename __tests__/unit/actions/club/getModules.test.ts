import { execute } from '../../../../nodes/Hotmart/v1/actions/club/getModules.operation';
import { createMockExecuteFunctions } from '../../../helpers/testHelpers';
import * as request from '../../../../nodes/Hotmart/v1/transport/request';
import { IExecuteFunctions } from 'n8n-workflow';

jest.mock('../../../../nodes/Hotmart/v1/transport/request');

describe('Club - getModules', () => {
  let mockThis: IExecuteFunctions;
  let mockHotmartApiRequest: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockThis = createMockExecuteFunctions();
    mockThis.getNode = jest.fn().mockReturnValue({ name: 'Hotmart' });
    mockThis.continueOnFail = jest.fn().mockReturnValue(false);

    mockHotmartApiRequest = request.hotmartApiRequest as jest.Mock;
  });

  it('deve buscar módulos com sucesso', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subdomain') return 'meusite';
      if (param === 'is_extra') return false;
      return defaultValue;
    });

    const mockResponse = [
      {
        id: 'module_1',
        name: 'Módulo 1: Introdução',
        description: 'Introdução ao curso',
        order: 1,
        is_published: true,
        is_extra: false
      },
      {
        id: 'module_2',
        name: 'Módulo 2: Avançado',
        description: 'Conteúdo avançado',
        order: 2,
        is_published: true,
        is_extra: false
      }
    ];

    mockHotmartApiRequest.mockResolvedValue(mockResponse);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/club/api/v1/modules',
      {},
      {
        subdomain: 'meusite',
      }
    );

    expect(result[0]).toHaveLength(2);
    expect(result[0][0].json).toEqual(mockResponse[0]);
    expect(result[0][1].json).toEqual(mockResponse[1]);
  });

  it('deve buscar apenas módulos extras quando is_extra é true', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subdomain') return 'meusite';
      if (param === 'is_extra') return true;
      return defaultValue;
    });

    const mockResponse = [
      {
        id: 'module_extra_1',
        name: 'Bônus: Material Extra',
        is_extra: true
      }
    ];

    mockHotmartApiRequest.mockResolvedValue(mockResponse);

    await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/club/api/v1/modules',
      {},
      {
        subdomain: 'meusite',
        is_extra: true,
      }
    );
  });

  it('deve processar múltiplos subdomínios', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subdomain') return index === 0 ? 'site1' : 'site2';
      if (param === 'is_extra') return false;
      return defaultValue;
    });

    const mockResponse1 = [{ id: 'module_1' }];
    const mockResponse2 = [{ id: 'module_2' }];

    mockHotmartApiRequest
      .mockResolvedValueOnce(mockResponse1)
      .mockResolvedValueOnce(mockResponse2);

    const result = await execute.call(mockThis, [{ json: {} }, { json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledTimes(2);
    expect(result[0]).toHaveLength(2);
  });

  it('deve tratar erro de API', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subdomain') return 'invalid';
      if (param === 'is_extra') return false;
      return defaultValue;
    });

    const mockError = new Error('Subdomain not found');
    mockHotmartApiRequest.mockRejectedValue(mockError);

    await expect(execute.call(mockThis, [{ json: {} }])).rejects.toThrow('Subdomain not found');
  });

  it('deve continuar em caso de erro com continueOnFail', async () => {
    mockThis.continueOnFail = jest.fn().mockReturnValue(true);
    
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subdomain') return 'invalid';
      if (param === 'is_extra') return false;
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
      if (param === 'subdomain') return 'meusite';
      if (param === 'is_extra') return false;
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue([]);

    const result = await execute.call(mockThis, []);

    expect(mockHotmartApiRequest).toHaveBeenCalled();
    expect(result[0]).toHaveLength(0);
  });

  it('deve tratar resposta vazia', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subdomain') return 'meusite';
      if (param === 'is_extra') return false;
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue(null);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result[0]).toHaveLength(0);
  });

  it('deve tratar diferentes valores de is_extra', async () => {
    // Teste com is_extra undefined (deve usar default false)
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subdomain') return 'meusite';
      if (param === 'is_extra') return defaultValue;
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue([]);

    await execute.call(mockThis, [{ json: {} }]);

    // Não deve incluir is_extra quando é false
    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/club/api/v1/modules',
      {},
      {
        subdomain: 'meusite',
      }
    );
  });
});