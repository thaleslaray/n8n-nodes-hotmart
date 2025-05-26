import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { execute } from '../../../../nodes/Hotmart/v1/actions/subscription/getAll.operation';
import { hotmartApiRequestTyped } from '../../../../nodes/Hotmart/v1/transport/requestTyped';

jest.mock('../../../../nodes/Hotmart/v1/transport/requestTyped');

const mockHotmartApiRequestTyped = hotmartApiRequestTyped as jest.MockedFunction<typeof hotmartApiRequestTyped>;

describe('Subscription - Get All Operation', () => {
  let mockThis: IExecuteFunctions;
  const testItems: INodeExecutionData[] = [{ json: {} }];

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockThis = {
      getNodeParameter: jest.fn(),
      helpers: {
        constructExecutionMetaData: jest.fn((data, meta) => data),
        returnJsonArray: jest.fn((data) => data.map((item: any) => ({ json: item }))),
      },
      logger: {
        debug: jest.fn(),
      },
      continueOnFail: jest.fn().mockReturnValue(false),
    } as unknown as IExecuteFunctions;
  });

  describe('execute', () => {
    it('should handle empty items array', async () => {
      const emptyItems: INodeExecutionData[] = [];
      
      (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
        if (param === 'returnAll') return false;
        if (param === 'filters') return {};
        if (param === 'limit') return 10;
        return defaultValue;
      });

      const mockResponse = { 
        items: [
          { subscriber_code: 'SUB123', status: 'ACTIVE' },
          { subscriber_code: 'SUB456', status: 'ACTIVE' }
        ],
        page_info: { total_results: 2 }
      };
      mockHotmartApiRequestTyped.mockResolvedValueOnce(mockResponse);

      const result = await execute.call(mockThis, emptyItems);

      expect(result[0]).toHaveLength(2);
      expect(mockHotmartApiRequestTyped).toHaveBeenCalledWith(
        mockThis,
        'GET',
        '/payments/api/v1/subscriptions',
        {},
        expect.objectContaining({ max_results: 10 })
      );
    });

    it('should process subscriptions with filters', async () => {
      (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
        if (param === 'returnAll') return false;
        if (param === 'filters') return {
          status: ['ACTIVE'],
          productId: 'PROD123'
        };
        if (param === 'limit') return 5;
        return defaultValue;
      });

      const mockResponse = { 
        items: [
          { subscriber_code: 'SUB789', status: 'ACTIVE' }
        ],
        page_info: { total_results: 1 }
      };
      mockHotmartApiRequestTyped.mockResolvedValueOnce(mockResponse);

      await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequestTyped).toHaveBeenCalledWith(
        mockThis,
        'GET',
        '/payments/api/v1/subscriptions',
        {},
        expect.objectContaining({
          max_results: 5,
          status: 'ACTIVE',
          product_id: 'PROD123'
        })
      );
    });

    it('should handle returnAll option', async () => {
      (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
        if (param === 'returnAll') return true;
        if (param === 'filters') return {};
        return defaultValue;
      });

      const mockResponse1 = { 
        items: Array(50).fill({ subscriber_code: 'SUB', status: 'ACTIVE' }),
        page_info: { 
          total_results: 120,
          next_page_token: '2'
        }
      };
      const mockResponse2 = { 
        items: Array(50).fill({ subscriber_code: 'SUB', status: 'ACTIVE' }),
        page_info: { 
          total_results: 120,
          next_page_token: '3'
        }
      };
      const mockResponse3 = { 
        items: Array(20).fill({ subscriber_code: 'SUB', status: 'ACTIVE' }),
        page_info: { 
          total_results: 120
        }
      };

      mockHotmartApiRequestTyped
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2)
        .mockResolvedValueOnce(mockResponse3);

      const result = await execute.call(mockThis, testItems);

      expect(result[0]).toHaveLength(120);
      expect(mockHotmartApiRequestTyped).toHaveBeenCalledTimes(3);
    });

    it('should handle filters with plan, transaction and trial', async () => {
      (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
        if (param === 'returnAll') return false;
        if (param === 'filters') return {
          plan: 'PLAN123',
          transaction: 'TRX456',
          trial: true
        };
        if (param === 'limit') return 10;
        return defaultValue;
      });

      const mockResponse = { 
        items: [{ subscriber_code: 'SUB_TRIAL', status: 'TRIAL' }],
        page_info: { total_results: 1 }
      };
      mockHotmartApiRequestTyped.mockResolvedValueOnce(mockResponse);

      await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequestTyped).toHaveBeenCalledWith(
        mockThis,
        'GET',
        '/payments/api/v1/subscriptions',
        {},
        expect.objectContaining({
          max_results: 10,
          plan: 'PLAN123',
          transaction: 'TRX456',
          trial: true
        })
      );
    });

    it('should handle error with continueOnFail true', async () => {
      mockThis.continueOnFail = jest.fn().mockReturnValue(true);
      (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
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
      expect(mockThis.continueOnFail).toHaveBeenCalled();
    });

    it('should throw error with continueOnFail false', async () => {
      mockThis.continueOnFail = jest.fn().mockReturnValue(false);
      (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
        if (param === 'returnAll') return false;
        if (param === 'filters') return {};
        if (param === 'limit') return 10;
        return defaultValue;
      });

      const error = new Error('API Error');
      mockHotmartApiRequestTyped.mockRejectedValueOnce(error);

      await expect(execute.call(mockThis, testItems)).rejects.toThrow('API Error');
      expect(mockThis.continueOnFail).toHaveBeenCalled();
    });

    it('should handle response without items field when returnAll=false', async () => {
      (mockThis.getNodeParameter as jest.Mock).mockImplementation((param: string, index: number, defaultValue?: any) => {
        if (param === 'returnAll') return false;
        if (param === 'filters') return {};
        if (param === 'limit') return 50;
        return defaultValue;
      });

      const mockResponse = {
        // sem campo items
        page_info: { total_results: 0 }
      };

      mockHotmartApiRequestTyped.mockResolvedValueOnce(mockResponse);

      const result = await execute.call(mockThis, testItems);

      expect(result[0]).toHaveLength(0); // Deve retornar array vazio
    });
  });
});