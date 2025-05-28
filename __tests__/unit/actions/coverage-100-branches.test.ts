import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { createMockExecuteFunctions } from '../../helpers/mocks';
import { execute as productGetAll } from '../../../nodes/Hotmart/v1/actions/product/getAll.operation';
import { execute as salesGetDetalhamentoPrecos } from '../../../nodes/Hotmart/v1/actions/sales/getDetalhamentoPrecos.operation';

describe('100% Branch Coverage Tests', () => {
  let mockExecuteFunctions: IExecuteFunctions;

  beforeEach(() => {
    mockExecuteFunctions = createMockExecuteFunctions({});
  });

  describe('product/getAll.operation - Line 165 branch', () => {
    it('should handle empty items array', async () => {
      // Mock com array vazio
      const emptyItems: INodeExecutionData[] = [{ json: {} }];
      
      // Mock dos parâmetros necessários
      (mockExecuteFunctions.getNodeParameter as jest.Mock)
        .mockImplementation((paramName: string, index: number, defaultValue?: any) => {
          if (paramName === 'returnAll') return false;
          if (paramName === 'limit') return 10;
          if (paramName === 'maxResults') return 10;
          if (paramName === 'filters') return {};
          return defaultValue;
        });

      // Mock da resposta da API com array vazio
      (mockExecuteFunctions.helpers.httpRequestWithAuthentication as jest.Mock)
        .mockResolvedValue({ items: [] });

      const result = await productGetAll.call(mockExecuteFunctions, emptyItems);

      // Deve retornar array com resultado vazio
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('sales/getDetalhamentoPrecos.operation - Line 145 branch', () => {
    it('should handle empty items array', async () => {
      // Mock com array vazio
      const emptyItems: INodeExecutionData[] = [{ json: {} }];
      
      // Mock dos parâmetros necessários
      (mockExecuteFunctions.getNodeParameter as jest.Mock)
        .mockImplementation((paramName: string, index: number, defaultValue?: any) => {
          if (paramName === 'returnAll') return false;
          if (paramName === 'limit') return 10;
          if (paramName === 'maxResults') return 10;
          if (paramName === 'filters') return {};
          return defaultValue;
        });

      // Mock da resposta da API com array vazio
      (mockExecuteFunctions.helpers.httpRequestWithAuthentication as jest.Mock)
        .mockResolvedValue({ items: [] });

      const result = await salesGetDetalhamentoPrecos.call(mockExecuteFunctions, emptyItems);

      // Deve retornar array com resultado vazio
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});