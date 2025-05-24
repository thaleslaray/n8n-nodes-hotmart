import { execute } from '../../../../nodes/Hotmart/v1/actions/club/getPages.operation';
import { createMockExecuteFunctions } from '../../../helpers/testHelpers';
import * as request from '../../../../nodes/Hotmart/v1/transport/request';
import { IExecuteFunctions } from 'n8n-workflow';

jest.mock('../../../../nodes/Hotmart/v1/transport/request');

describe('Club - getPages', () => {
  let mockThis: IExecuteFunctions;
  let mockHotmartApiRequest: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockThis = createMockExecuteFunctions();
    mockThis.getNode = jest.fn().mockReturnValue({ name: 'Hotmart' });
    mockThis.continueOnFail = jest.fn().mockReturnValue(false);

    mockHotmartApiRequest = request.hotmartApiRequest as jest.Mock;
  });

  it('deve buscar páginas de um módulo com sucesso', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string) => {
      if (param === 'product_id') return 'prod_123';
      if (param === 'module_id') return 'mod_456';
      return undefined;
    });

    const mockResponse = [
      {
        page_id: 'page_001',
        title: 'Aula 1 - Introdução',
        type: 'video',
        duration: 1200,
        order: 1,
        is_available: true
      },
      {
        page_id: 'page_002',
        title: 'Aula 2 - Conceitos Básicos',
        type: 'video',
        duration: 1800,
        order: 2,
        is_available: true
      },
      {
        page_id: 'page_003',
        title: 'Quiz - Teste seus conhecimentos',
        type: 'quiz',
        order: 3,
        is_available: false
      }
    ];

    mockHotmartApiRequest.mockResolvedValue(mockResponse);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/club/api/v2/modules/mod_456/pages',
      {},
      { product_id: 'prod_123' }
    );

    expect(result[0]).toHaveLength(3);
    expect(result[0][0].json).toEqual(mockResponse[0]);
    expect(result[0][1].json).toEqual(mockResponse[1]);
    expect(result[0][2].json).toEqual(mockResponse[2]);
  });

  it('deve lidar com resposta vazia', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string) => {
      if (param === 'product_id') return 'prod_123';
      if (param === 'module_id') return 'mod_empty';
      return undefined;
    });

    mockHotmartApiRequest.mockResolvedValue([]);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/club/api/v2/modules/mod_empty/pages',
      {},
      { product_id: 'prod_123' }
    );

    expect(result[0]).toHaveLength(0);
  });

  it('deve processar múltiplos itens', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number) => {
      if (param === 'product_id') return 'prod_123';
      if (param === 'module_id') return index === 0 ? 'mod_001' : 'mod_002';
      return undefined;
    });

    const mockResponse1 = [{ page_id: 'page_001', title: 'Página 1' }];
    const mockResponse2 = [{ page_id: 'page_002', title: 'Página 2' }];

    mockHotmartApiRequest
      .mockResolvedValueOnce(mockResponse1)
      .mockResolvedValueOnce(mockResponse2);

    const result = await execute.call(mockThis, [{ json: {} }, { json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledTimes(2);
    expect(mockHotmartApiRequest).toHaveBeenNthCalledWith(
      1,
      'GET',
      '/club/api/v2/modules/mod_001/pages',
      {},
      { product_id: 'prod_123' }
    );
    expect(mockHotmartApiRequest).toHaveBeenNthCalledWith(
      2,
      'GET',
      '/club/api/v2/modules/mod_002/pages',
      {},
      { product_id: 'prod_123' }
    );

    expect(result[0]).toHaveLength(2);
  });

  it('deve tratar erro de módulo não encontrado', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string) => {
      if (param === 'product_id') return 'prod_123';
      if (param === 'module_id') return 'mod_invalid';
      return undefined;
    });

    const mockError = new Error('Module not found');
    mockHotmartApiRequest.mockRejectedValue(mockError);

    await expect(execute.call(mockThis, [{ json: {} }])).rejects.toThrow('Module not found');
  });

  it('deve continuar em caso de erro com continueOnFail', async () => {
    mockThis.continueOnFail = jest.fn().mockReturnValue(true);
    
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string) => {
      if (param === 'product_id') return 'prod_123';
      if (param === 'module_id') return 'mod_error';
      return undefined;
    });

    const mockError = new Error('Access denied');
    mockHotmartApiRequest.mockRejectedValue(mockError);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result[0]).toHaveLength(1);
    expect(result[0][0].json.error).toBe('Access denied');
  });

  it('deve processar sem itens de entrada', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string) => {
      if (param === 'product_id') return 'prod_123';
      if (param === 'module_id') return 'mod_456';
      return undefined;
    });

    mockHotmartApiRequest.mockResolvedValue([{ page_id: 'page_001' }]);

    const result = await execute.call(mockThis, []);

    expect(mockHotmartApiRequest).toHaveBeenCalled();
    expect(result[0]).toHaveLength(1);
  });

  it('deve lidar com resposta null', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string) => {
      if (param === 'product_id') return 'prod_123';
      if (param === 'module_id') return 'mod_456';
      return undefined;
    });

    mockHotmartApiRequest.mockResolvedValue(null);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result[0]).toHaveLength(0);
  });

  it('deve buscar páginas de diferentes tipos', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string) => {
      if (param === 'product_id') return 'prod_123';
      if (param === 'module_id') return 'mod_456';
      return undefined;
    });

    const mockResponse = [
      {
        page_id: 'page_001',
        title: 'Vídeo Aula',
        type: 'video',
        duration: 3600
      },
      {
        page_id: 'page_002',
        title: 'Material de Apoio',
        type: 'pdf',
        file_size: 2048576
      },
      {
        page_id: 'page_003',
        title: 'Texto Explicativo',
        type: 'text',
        word_count: 1500
      },
      {
        page_id: 'page_004',
        title: 'Teste de Conhecimento',
        type: 'quiz',
        questions_count: 10
      }
    ];

    mockHotmartApiRequest.mockResolvedValue(mockResponse);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result[0]).toHaveLength(4);
    expect(result[0].map((item: any) => item.json.type)).toEqual(['video', 'pdf', 'text', 'quiz']);
  });

  it('deve processar módulo com muitas páginas', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string) => {
      if (param === 'product_id') return 'prod_123';
      if (param === 'module_id') return 'mod_large';
      return undefined;
    });

    // Criar array com 50 páginas
    const mockResponse = Array.from({ length: 50 }, (_, i) => ({
      page_id: `page_${String(i + 1).padStart(3, '0')}`,
      title: `Aula ${i + 1}`,
      type: 'video',
      order: i + 1
    }));

    mockHotmartApiRequest.mockResolvedValue(mockResponse);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result[0]).toHaveLength(50);
    expect(result[0][0].json.page_id).toBe('page_001');
    expect(result[0][49].json.page_id).toBe('page_050');
  });

  it('deve lidar com caracteres especiais nos IDs', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string) => {
      if (param === 'product_id') return 'prod_abc-123_XYZ';
      if (param === 'module_id') return 'mod_def-456_UVW';
      return undefined;
    });

    mockHotmartApiRequest.mockResolvedValue([]);

    await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/club/api/v2/modules/mod_def-456_UVW/pages',
      {},
      { product_id: 'prod_abc-123_XYZ' }
    );
  });
});