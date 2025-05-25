import { execute } from '../../../../nodes/Hotmart/v1/actions/product/getAll.operation';
import { createMockExecuteFunctions } from '../../../helpers/testHelpers';
import * as requestTyped from '../../../../nodes/Hotmart/v1/transport/requestTyped';
import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

// Mock dos módulos
jest.mock('../../../../nodes/Hotmart/v1/transport/requestTyped');

// Mock do console.log
global.console.log = jest.fn();

describe('Product - Get All Operation', () => {
  let mockThis: IExecuteFunctions;
  let mockHotmartApiRequestTyped: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockThis = createMockExecuteFunctions();
    mockThis.getNode = jest.fn().mockReturnValue({ name: 'Hotmart' });
    mockThis.continueOnFail = jest.fn().mockReturnValue(false);
    
    // Mock logger
    mockThis.logger = {
      debug: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
    };
    
    // Mock hotmartApiRequestTyped
    mockHotmartApiRequestTyped = requestTyped.hotmartApiRequestTyped as jest.Mock;
  });

  describe('execute', () => {
    const testItems: INodeExecutionData[] = [{ json: {} }];

    it('should fetch products with returnAll=false', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(false) // returnAll
        .mockReturnValueOnce({}) // filters
        .mockReturnValueOnce(10); // limit

      const mockResponse = {
        items: [
          { id: 'prod_1', name: 'Product 1' },
          { id: 'prod_2', name: 'Product 2' }
        ]
      };

      mockHotmartApiRequestTyped.mockResolvedValueOnce(mockResponse);

      const result = await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequestTyped).toHaveBeenCalledTimes(1);
      expect(mockHotmartApiRequestTyped).toHaveBeenCalledWith(
        mockThis,
        'GET',
        '/products/api/v1/products',
        {},
        { max_results: 50 }
      );

      expect(result).toEqual([[
        { json: mockResponse.items[0], pairedItem: { item: 0 } },
        { json: mockResponse.items[1], pairedItem: { item: 0 } }
      ]]);
    });

    it('should apply isEvent filter', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(false) // returnAll
        .mockReturnValueOnce({ 
          isEvent: true 
        }) // filters
        .mockReturnValueOnce(50); // limit

      mockHotmartApiRequestTyped.mockResolvedValueOnce({ items: [] });

      await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequestTyped).toHaveBeenCalledWith(
        mockThis,
        'GET',
        '/products/api/v1/products',
        {},
        {
          max_results: 50
        }
      );
    });

    it('should handle returnAll=true with manual pagination', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(true) // returnAll
        .mockReturnValueOnce({}); // filters

      // Simular duas páginas com paginação manual
      const page1 = {
        items: [{ id: 'prod_1' }, { id: 'prod_2' }],
        page_info: { next_page_token: 'token123' }
      };
      const page2 = {
        items: [{ id: 'prod_3' }],
        page_info: { next_page_token: null }
      };

      mockHotmartApiRequestTyped
        .mockResolvedValueOnce(page1)
        .mockResolvedValueOnce(page2);

      const result = await execute.call(mockThis, testItems);

      // Verificar chamadas para hotmartApiRequestTyped
      expect(mockHotmartApiRequestTyped).toHaveBeenCalledTimes(2);

      // Verificar resultado
      expect(result[0]).toHaveLength(3);
      expect(mockThis.logger.debug).toHaveBeenCalledWith(
        '\n[Paginação manual] Total de itens: 3'
      );
    });

    it('should handle errors with continueOnFail=true', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(false) // returnAll
        .mockReturnValueOnce({}) // filters
        .mockReturnValueOnce(50); // limit
      mockThis.continueOnFail = jest.fn().mockReturnValue(true);

      const error = new Error('API Error');
      mockHotmartApiRequestTyped.mockRejectedValueOnce(error);

      const result = await execute.call(mockThis, testItems);

      expect(result).toEqual([[
        {
          json: { error: 'API Error' },
          pairedItem: { item: 0 }
        }
      ]]);
    });

    it('should handle empty response', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(false) // returnAll
        .mockReturnValueOnce({}) // filters
        .mockReturnValueOnce(50); // limit

      mockHotmartApiRequestTyped.mockResolvedValueOnce({ items: [] });

      const result = await execute.call(mockThis, testItems);

      expect(result).toEqual([[]]);
    });

    it('should handle manual pagination with single page', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(true) // returnAll
        .mockReturnValueOnce({}); // filters

      // Simular página única sem next_page_token
      const singlePage = {
        items: [{ id: 'prod_1' }, { id: 'prod_2' }],
        page_info: { next_page_token: null }
      };

      mockHotmartApiRequestTyped.mockResolvedValueOnce(singlePage);

      const result = await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequestTyped).toHaveBeenCalledTimes(1);
      expect(result[0]).toHaveLength(2);
      expect(mockThis.logger.debug).toHaveBeenCalledWith(
        '\n[Paginação manual] Fim da paginação'
      );
    });

    it('should handle manual pagination with response without page_info', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(true) // returnAll
        .mockReturnValueOnce({}); // filters

      // Simular resposta sem page_info
      const responseWithoutPageInfo = {
        items: [{ id: 'prod_1' }, { id: 'prod_2' }]
        // sem page_info
      };

      mockHotmartApiRequestTyped.mockResolvedValueOnce(responseWithoutPageInfo);

      const result = await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequestTyped).toHaveBeenCalledTimes(1);
      expect(result[0]).toHaveLength(2);
    });

    it('should handle manual product selection mode', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockImplementation((param: string, index: number, defaultValue?: any) => {
          if (param === 'returnAll') return false;
          if (param === 'filters') return {
            productSelectionMode: 'manual',
            idManual: 'prod_manual_123'
          };
          if (param === 'limit') return 10;
          if (param === 'productSelectionMode') return 'manual';
          return defaultValue;
        });

      mockHotmartApiRequestTyped.mockResolvedValueOnce({ items: [] });

      await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequestTyped).toHaveBeenCalledWith(
        mockThis,
        'GET',
        '/products/api/v1/products',
        {},
        expect.objectContaining({
          id: 'prod_manual_123',
          max_results: 10
        })
      );
    });

    it('should handle dropdown product selection mode', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockImplementation((param: string, index: number, defaultValue?: any) => {
          if (param === 'returnAll') return false;
          if (param === 'filters') return {
            productSelectionMode: 'dropdown',
            id: 'prod_dropdown_456'
          };
          if (param === 'limit') return 10;
          if (param === 'productSelectionMode') return 'dropdown';
          return defaultValue;
        });

      mockHotmartApiRequestTyped.mockResolvedValueOnce({ items: [] });

      await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequestTyped).toHaveBeenCalledWith(
        mockThis,
        'GET',
        '/products/api/v1/products',
        {},
        expect.objectContaining({
          id: 'prod_dropdown_456',
          max_results: 10
        })
      );
    });

    it('should delete id when neither manual nor dropdown mode has id', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockImplementation((param: string, index: number, defaultValue?: any) => {
          if (param === 'returnAll') return false;
          if (param === 'productSelectionMode') return 'all';
          if (param === 'filters') return {
            id: 'should_be_deleted',
            idManual: 'should_also_be_deleted'
          };
          if (param === 'limit') return 10;
          return defaultValue;
        });

      mockHotmartApiRequestTyped.mockResolvedValueOnce({ items: [] });

      await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequestTyped).toHaveBeenCalledWith(
        mockThis,
        'GET',
        '/products/api/v1/products',
        {},
        expect.objectContaining({
          max_results: 10
        })
      );
      
      // Verificar que id e idManual foram removidos
      const callArgs = mockHotmartApiRequestTyped.mock.calls[0][4];
      expect(callArgs).not.toHaveProperty('id');
      expect(callArgs).not.toHaveProperty('idManual');
    });

    it('should throw error when continueOnFail is false', async () => {
      mockThis.continueOnFail = jest.fn().mockReturnValue(false);
      mockThis.getNodeParameter = jest.fn()
        .mockImplementation((param: string, index: number, defaultValue?: any) => {
          if (param === 'returnAll') return false;
          if (param === 'productSelectionMode') return 'all';
          if (param === 'filters') return {};
          if (param === 'limit') return 10;
          return defaultValue;
        });

      const error = new Error('API Error');
      mockHotmartApiRequestTyped.mockRejectedValueOnce(error);

      await expect(execute.call(mockThis, testItems)).rejects.toThrow('API Error');
    });

    it('should handle continueOnFail', async () => {
      mockThis.continueOnFail = jest.fn().mockReturnValue(true);
      mockThis.getNodeParameter = jest.fn()
        .mockImplementation((param: string, index: number, defaultValue?: any) => {
          if (param === 'returnAll') return false;
          if (param === 'filters') return {};
          if (param === 'limit') return 10;
          return defaultValue;
        });

      const error = new Error('API Error');
      mockHotmartApiRequestTyped.mockRejectedValueOnce(error);

      const result = await execute.call(mockThis, testItems);

      expect(result[0]).toHaveLength(1);
      expect(result[0][0].json).toEqual({ error: 'API Error' });
      expect(result[0][0].pairedItem).toEqual({ item: 0 });
    });
  });
});