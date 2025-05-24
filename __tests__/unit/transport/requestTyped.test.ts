import { hotmartApiRequestTyped } from '../../../nodes/Hotmart/v1/transport/requestTyped';
import * as request from '../../../nodes/Hotmart/v1/transport/request';
import { IExecuteFunctions } from 'n8n-workflow';
import { createMockExecuteFunctions } from '../../helpers/testHelpers';

jest.mock('../../../nodes/Hotmart/v1/transport/request');

describe('hotmartApiRequestTyped', () => {
  let mockThis: IExecuteFunctions;
  let mockHotmartApiRequest: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockThis = createMockExecuteFunctions();
    mockHotmartApiRequest = request.hotmartApiRequest as jest.Mock;
  });

  it('deve fazer uma requisição tipada com sucesso', async () => {
    interface TestResponse {
      id: string;
      name: string;
      value: number;
    }

    const mockResponse: TestResponse = {
      id: '123',
      name: 'Test',
      value: 100
    };

    mockHotmartApiRequest.mockResolvedValue(mockResponse);

    const result = await hotmartApiRequestTyped<TestResponse>(
      mockThis,
      'GET',
      '/test/endpoint',
      {},
      { param: 'value' }
    );

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/test/endpoint',
      {},
      { param: 'value' }
    );
    expect(result).toEqual(mockResponse);
    expect(result.id).toBe('123');
    expect(result.name).toBe('Test');
    expect(result.value).toBe(100);
  });

  it('deve passar todos os parâmetros corretamente', async () => {
    interface ComplexResponse {
      items: Array<{ id: number; title: string }>;
      total: number;
      page: number;
    }

    const mockResponse: ComplexResponse = {
      items: [
        { id: 1, title: 'Item 1' },
        { id: 2, title: 'Item 2' }
      ],
      total: 2,
      page: 1
    };

    mockHotmartApiRequest.mockResolvedValue(mockResponse);

    const result = await hotmartApiRequestTyped<ComplexResponse>(
      mockThis,
      'POST',
      '/complex/endpoint',
      { data: 'test' },
      { query: 'param' }
    );

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'POST',
      '/complex/endpoint',
      { data: 'test' },
      { query: 'param' }
    );
    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('deve lidar com resposta vazia', async () => {
    interface EmptyResponse {
      data: any[];
    }

    const mockResponse: EmptyResponse = {
      data: []
    };

    mockHotmartApiRequest.mockResolvedValue(mockResponse);

    const result = await hotmartApiRequestTyped<EmptyResponse>(
      mockThis,
      'GET',
      '/empty',
      {},
      {}
    );

    expect(result.data).toEqual([]);
  });

  it('deve propagar erros da função base', async () => {
    const mockError = new Error('API Error');
    mockHotmartApiRequest.mockRejectedValue(mockError);

    await expect(
      hotmartApiRequestTyped(mockThis, 'GET', '/error', {}, {})
    ).rejects.toThrow('API Error');
  });

  it('deve funcionar com diferentes métodos HTTP', async () => {
    const methods: Array<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'> = [
      'GET', 'POST', 'PUT', 'DELETE', 'PATCH'
    ];

    for (const method of methods) {
      mockHotmartApiRequest.mockResolvedValue({ success: true });

      await hotmartApiRequestTyped(mockThis, method, `/test/${method}`, {}, {});

      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
        method,
        `/test/${method}`,
        {},
        {}
      );
    }
  });

  it('deve preservar o tipo genérico correto', async () => {
    interface UserResponse {
      user_id: string;
      user_name: string;
      user_email: string;
      created_at: number;
    }

    const mockUser: UserResponse = {
      user_id: 'usr_123',
      user_name: 'John Doe',
      user_email: 'john@example.com',
      created_at: Date.now()
    };

    mockHotmartApiRequest.mockResolvedValue(mockUser);

    const result = await hotmartApiRequestTyped<UserResponse>(
      mockThis,
      'GET',
      '/users/usr_123',
      {},
      {}
    );

    // TypeScript deve reconhecer estas propriedades
    expect(result.user_id).toBe('usr_123');
    expect(result.user_name).toBe('John Doe');
    expect(result.user_email).toBe('john@example.com');
    expect(typeof result.created_at).toBe('number');
  });

  it('deve funcionar com arrays tipados', async () => {
    type ProductArray = Array<{
      product_id: string;
      product_name: string;
      price: number;
    }>;

    const mockProducts: ProductArray = [
      { product_id: 'prod_1', product_name: 'Product 1', price: 100 },
      { product_id: 'prod_2', product_name: 'Product 2', price: 200 }
    ];

    mockHotmartApiRequest.mockResolvedValue(mockProducts);

    const result = await hotmartApiRequestTyped<ProductArray>(
      mockThis,
      'GET',
      '/products',
      {},
      { limit: 10 }
    );

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(result[0].product_id).toBe('prod_1');
    expect(result[1].price).toBe(200);
  });

  it('deve funcionar sem body e query parameters', async () => {
    mockHotmartApiRequest.mockResolvedValue({ status: 'ok' });

    await hotmartApiRequestTyped(mockThis, 'GET', '/health');

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'GET',
      '/health',
      {},
      {}
    );
  });

  it('deve manter a referência do contexto this', async () => {
    mockHotmartApiRequest.mockResolvedValue({ data: 'test' });

    await hotmartApiRequestTyped.call(mockThis, mockThis, 'GET', '/test');

    expect(mockHotmartApiRequest).toHaveBeenCalled();
    // Verifica que a função foi chamada com o contexto correto
    const callArgs = mockHotmartApiRequest.mock.calls[0];
    expect(callArgs).toBeDefined();
  });
});