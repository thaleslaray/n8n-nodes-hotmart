import { execute } from '../../../../nodes/Hotmart/v1/actions/coupon/delete.operation';
import { createMockExecuteFunctions } from '../../../helpers/testHelpers';
import * as request from '../../../../nodes/Hotmart/v1/transport/request';
import { IExecuteFunctions } from 'n8n-workflow';

jest.mock('../../../../nodes/Hotmart/v1/transport/request');

describe('Coupon - delete', () => {
  let mockThis: IExecuteFunctions;
  let mockHotmartApiRequest: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockThis = createMockExecuteFunctions();
    mockThis.getNode = jest.fn().mockReturnValue({ name: 'Hotmart' });
    mockThis.continueOnFail = jest.fn().mockReturnValue(false);

    mockHotmartApiRequest = request.hotmartApiRequest as jest.Mock;
  });

  it('deve deletar cupom com sucesso', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'coupon_id') return 'DESCONTO10';
      return defaultValue;
    });

    const mockResponse = {
      message: 'Coupon deleted successfully',
      coupon_code: 'DESCONTO10',
      deleted_at: '2024-01-15T10:30:00Z'
    };

    mockHotmartApiRequest.mockResolvedValue(mockResponse);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'DELETE',
      '/products/api/v1/coupon/DESCONTO10'
    );

    expect(result[0]).toHaveLength(1);
    expect(result[0][0].json).toMatchObject({
      message: 'Coupon deleted successfully',
      coupon_code: 'DESCONTO10'
    });
  });

  it('deve deletar cupom por ID', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'coupon_id') return '12345';
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({ message: 'Deleted' });

    await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'DELETE',
      '/products/api/v1/coupon/12345'
    );
  });

  it('deve tratar erro de cupom não encontrado', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'coupon_id') return 'INEXISTENTE';
      return defaultValue;
    });

    const mockError = new Error('Coupon not found');
    mockHotmartApiRequest.mockRejectedValue(mockError);

    await expect(execute.call(mockThis, [{ json: {} }])).rejects.toThrow('Coupon not found');
  });

  it('deve tratar erro de cupom já usado', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'coupon_id') return 'USADO10';
      return defaultValue;
    });

    const mockError = new Error('Cannot delete used coupon');
    mockHotmartApiRequest.mockRejectedValue(mockError);

    await expect(execute.call(mockThis, [{ json: {} }])).rejects.toThrow('Cannot delete used coupon');
  });

  it('deve continuar em caso de erro com continueOnFail', async () => {
    mockThis.continueOnFail = jest.fn().mockReturnValue(true);
    
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'coupon_id') return 'PROTEGIDO';
      return defaultValue;
    });

    const mockError = new Error('Permission denied');
    mockHotmartApiRequest.mockRejectedValue(mockError);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result[0]).toHaveLength(1);
    expect(result[0][0].json.error).toBe('Permission denied');
  });

  it('deve processar sem itens de entrada', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'coupon_id') return 'DESCONTO10';
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({ message: 'Deleted' });

    const result = await execute.call(mockThis, []);

    expect(mockHotmartApiRequest).toHaveBeenCalled();
    expect(result[0]).toHaveLength(1);
  });

  it('deve lidar com códigos que contêm caracteres especiais', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'coupon_id') return 'DESC-50%';
      return defaultValue;
    });

    mockHotmartApiRequest.mockResolvedValue({ message: 'Deleted' });

    await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'DELETE',
      '/products/api/v1/coupon/DESC-50%'
    );
  });

  it('deve confirmar operação de exclusão', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'coupon_id') return 'DELETE_ME';
      return defaultValue;
    });

    const mockResponse = {
      message: 'Coupon deleted successfully',
      coupon_code: 'DELETE_ME',
      deleted_at: '2024-01-15T10:30:00Z',
      was_used: false,
      usage_count: 0
    };

    mockHotmartApiRequest.mockResolvedValue(mockResponse);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result[0][0].json).toMatchObject({
      message: 'Coupon deleted successfully',
      coupon_code: 'DELETE_ME',
      was_used: false,
      usage_count: 0
    });
  });

  it('deve lidar com resposta vazia da API', async () => {
    (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
      if (param === 'coupon_id') return 'EMPTY_RESPONSE';
      return defaultValue;
    });

    // API retorna null/undefined
    mockHotmartApiRequest.mockResolvedValue(null);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(mockHotmartApiRequest).toHaveBeenCalledWith(
      'DELETE',
      '/products/api/v1/coupon/EMPTY_RESPONSE'
    );
    
    // Deve retornar objeto vazio quando response é null
    expect(result[0]).toHaveLength(1);
    expect(result[0][0].json).toEqual({});
  });
});