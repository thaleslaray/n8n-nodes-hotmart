import { execute } from '../../../../nodes/Hotmart/v1/actions/club/getProgress.operation';
import { createMockExecuteFunctions } from '../../../helpers/testHelpers';
import * as request from '../../../../nodes/Hotmart/v1/transport/request';
import { IExecuteFunctions } from 'n8n-workflow';

jest.mock('../../../../nodes/Hotmart/v1/transport/request');

describe('Club - getProgress', () => {
  let mockThis: IExecuteFunctions;
  let mockHotmartApiRequest: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockThis = createMockExecuteFunctions();
    mockThis.getNode = jest.fn().mockReturnValue({ name: 'Hotmart' });
    mockThis.continueOnFail = jest.fn().mockReturnValue(false);

    mockHotmartApiRequest = request.hotmartApiRequest as jest.Mock;
  });

  it('deve buscar progresso do aluno com sucesso', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subdomain') return 'meusite';
      if (param === 'user_id') return 'usr_123456789';
      return defaultValue;
    });

    const mockResponse = {
      lessons: [
        {
          id: 'lesson_1',
          title: 'Introdução',
          completed: true,
          progress_percentage: 100,
          watched_duration: 300
        },
        {
          id: 'lesson_2', 
          title: 'Conceitos Básicos',
          completed: false,
          progress_percentage: 45,
          watched_duration: 120
        }
      ]
    };

    mockHotmartApiRequest.mockResolvedValue(mockResponse);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/club/api/v1/users/usr_123456789/lessons',
      {},
      {
        subdomain: 'meusite',
      }
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(2);
    expect(result[0][0].json).toEqual(mockResponse.lessons[0]);
    expect(result[0][1].json).toEqual(mockResponse.lessons[1]);
  });

  it('deve processar aluno diferente', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subdomain') return 'outra-area';
      if (param === 'user_id') return 'usr_987654321';
      return defaultValue;
    });

    const mockResponse = { lessons: [] };

    mockHotmartApiRequest.mockResolvedValue(mockResponse);

    await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/club/api/v1/users/usr_987654321/lessons',
      {},
      {
        subdomain: 'outra-area',
      }
    );
  });

  it('deve processar sem itens de entrada', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subdomain') return 'teste';
      if (param === 'user_id') return 'usr_test';
      return defaultValue;
    });

    const mockResponse = { lessons: [] };

    mockHotmartApiRequest.mockResolvedValue(mockResponse);

    const result = await execute.call(mockThis, []);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/club/api/v1/users/usr_test/lessons',
      {},
      {
        subdomain: 'teste',
      }
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(0);
  });

  it('deve processar resposta sem campo lessons (undefined)', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subdomain') return 'teste';
      if (param === 'user_id') return 'usr_test';
      return defaultValue;
    });

    // Resposta sem o campo lessons
    const mockResponse = {};

    mockHotmartApiRequest.mockResolvedValue(mockResponse);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(0); // Deve retornar array vazio
  });

  it('deve retornar progresso detalhado', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subdomain') return 'escola';
      if (param === 'user_id') return 'usr_aluno123';
      return defaultValue;
    });

    const mockResponse = {
      lessons: [
        {
          id: 'lesson_video',
          title: 'Aula em Vídeo',
          completed: true,
          progress_percentage: 100,
          watched_duration: 1800,
          start_date: '2024-01-15T10:00:00Z',
          completion_date: '2024-01-15T10:30:00Z'
        }
      ]
    };

    mockHotmartApiRequest.mockResolvedValue(mockResponse);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result[0][0].json).toEqual(mockResponse.lessons[0]);
    expect(result[0][0].json).toHaveProperty('completed', true);
    expect(result[0][0].json).toHaveProperty('progress_percentage', 100);
    expect(result[0][0].json).toHaveProperty('watched_duration', 1800);
  });

  it('deve tratar erro de API', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subdomain') return 'invalid_subdomain';
      if (param === 'user_id') return 'usr_invalid';
      return defaultValue;
    });

    const mockError = new Error('User not found');
    mockHotmartApiRequest.mockRejectedValue(mockError);

    await expect(execute.call(mockThis, [{ json: {} }])).rejects.toThrow('User not found');
  });

  it('deve continuar em caso de erro com continueOnFail', async () => {
    mockThis.continueOnFail = jest.fn().mockReturnValue(true);
    
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subdomain') return 'invalid_subdomain';
      if (param === 'user_id') return 'usr_invalid';
      return defaultValue;
    });

    const mockError = new Error('Access denied');
    mockHotmartApiRequest.mockRejectedValue(mockError);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result[0]).toHaveLength(1);
    expect(result[0][0].json.error).toBe('Access denied');
  });

  it('deve processar múltiplos itens', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'subdomain') return index === 0 ? 'site1' : 'site2';
      if (param === 'user_id') return index === 0 ? 'usr_111' : 'usr_222';
      return defaultValue;
    });

    const mockResponse1 = {
      lessons: [{ id: 'lesson_1', completed: true }]
    };

    const mockResponse2 = {
      lessons: [{ id: 'lesson_2', completed: false }]
    };

    mockHotmartApiRequest.mockResolvedValueOnce(mockResponse1);
    mockHotmartApiRequest.mockResolvedValueOnce(mockResponse2);

    const result = await execute.call(mockThis, [{ json: {} }, { json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledTimes(2);
    expect(result[0]).toHaveLength(2);
  });
});