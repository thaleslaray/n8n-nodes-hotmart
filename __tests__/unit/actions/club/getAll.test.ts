import { execute } from '../../../../nodes/Hotmart/v1/actions/club/getAll.operation';
import { createMockExecuteFunctions } from '../../../helpers/testHelpers';
import * as requestTyped from '../../../../nodes/Hotmart/v1/transport/requestTyped';
import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

// Mock dos módulos
jest.mock('../../../../nodes/Hotmart/v1/transport/requestTyped');

// Mock do console.log
global.console.log = jest.fn();

describe('Club - Get All Operation', () => {
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

    it('should fetch club students', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(false) // returnAll
        .mockReturnValueOnce('club_123') // subdomain
        .mockReturnValueOnce({}) // filters
        .mockReturnValueOnce(10); // limit

      const mockResponse = {
        items: [
          { id: 'student_1', name: 'Student 1' },
          { id: 'student_2', name: 'Student 2' }
        ]
      };

      mockHotmartApiRequestTyped.mockResolvedValueOnce(mockResponse);

      const result = await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequestTyped).toHaveBeenCalledTimes(1);
      expect(mockHotmartApiRequestTyped).toHaveBeenCalledWith(
        mockThis,
        'GET',
        '/club/api/v1/users',
        {},
        { 
          subdomain: 'club_123',
          max_results: 10
        }
      );

      expect(result).toEqual([[
        { json: mockResponse.items[0], pairedItem: { item: 0 } },
        { json: mockResponse.items[1], pairedItem: { item: 0 } }
      ]]);
    });

    it('should handle errors with continueOnFail=true', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(false) // returnAll
        .mockReturnValueOnce('club_123') // subdomain
        .mockReturnValueOnce({}) // filters
        .mockReturnValueOnce(10); // limit
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

    it('should throw error with continueOnFail=false', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(false) // returnAll
        .mockReturnValueOnce('club_123') // subdomain
        .mockReturnValueOnce({}) // filters
        .mockReturnValueOnce(10); // limit
      mockThis.continueOnFail = jest.fn().mockReturnValue(false);

      const error = new Error('API Error');
      mockHotmartApiRequestTyped.mockRejectedValueOnce(error);

      await expect(execute.call(mockThis, testItems)).rejects.toThrow('API Error');
    });

    it('should handle empty response', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(false) // returnAll
        .mockReturnValueOnce('club_123') // subdomain
        .mockReturnValueOnce({}) // filters
        .mockReturnValueOnce(10); // limit

      mockHotmartApiRequestTyped.mockResolvedValueOnce({ items: [] });

      const result = await execute.call(mockThis, testItems);

      expect(result).toEqual([[]]);
    });

    it('should handle returnAll with pagination', async () => {
      mockThis.getNodeParameter = jest.fn().mockImplementation((param: string) => {
        if (param === 'returnAll') return true;
        if (param === 'subdomain') return 'club_123';
        if (param === 'filters') return {};
        return undefined;
      });

      const mockResponse1 = {
        items: [
          { id: 'student_1', name: 'Student 1' },
          { id: 'student_2', name: 'Student 2' }
        ],
        page_info: {
          next_page_token: 'page2',
          results_per_page: 2
        }
      };

      const mockResponse2 = {
        items: [
          { id: 'student_3', name: 'Student 3' }
        ],
        page_info: {
          next_page_token: null,
          results_per_page: 1
        }
      };

      mockHotmartApiRequestTyped
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      const result = await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequestTyped).toHaveBeenCalledTimes(2);
      
      // Verificar primeira chamada
      const firstCall = mockHotmartApiRequestTyped.mock.calls[0];
      expect(firstCall[1]).toBe('GET');
      expect(firstCall[2]).toBe('/club/api/v1/users');
      expect(firstCall[4]).toMatchObject({
        subdomain: 'club_123',
        max_results: 500
      });
      
      // Verificar segunda chamada tem page_token
      const secondCall = mockHotmartApiRequestTyped.mock.calls[1];
      expect(secondCall[4]).toHaveProperty('page_token');

      expect(result[0]).toHaveLength(3);
      expect(mockThis.logger.debug).toHaveBeenCalled();
    });

    it('should handle returnAll without page_info', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(true) // returnAll
        .mockReturnValueOnce('club_123') // subdomain
        .mockReturnValueOnce({}); // filters

      const mockResponse = {
        items: [
          { id: 'student_1', name: 'Student 1' },
          { id: 'student_2', name: 'Student 2' }
        ]
        // No page_info
      };

      mockHotmartApiRequestTyped.mockResolvedValueOnce(mockResponse);

      const result = await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequestTyped).toHaveBeenCalledTimes(1);
      expect(result[0]).toHaveLength(2);
    });

    it('should handle returnAll with no items in response', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(true) // returnAll
        .mockReturnValueOnce('club_123') // subdomain
        .mockReturnValueOnce({}); // filters

      const mockResponse = {
        page_info: {
          next_page_token: null,
          results_per_page: 0
        }
        // No items
      };

      mockHotmartApiRequestTyped.mockResolvedValueOnce(mockResponse);

      const result = await execute.call(mockThis, testItems);

      expect(result[0]).toHaveLength(0);
    });

    it('should handle returnAll with filters', async () => {
      mockThis.getNodeParameter = jest.fn().mockImplementation((param: string) => {
        if (param === 'returnAll') return true;
        if (param === 'subdomain') return 'club_123';
        if (param === 'filters') return {
          email: 'test@example.com'
        };
        return undefined;
      });

      const mockResponse = {
        items: [{ id: 'student_1', name: 'Student 1' }],
        page_info: { next_page_token: null }
      };

      mockHotmartApiRequestTyped.mockResolvedValueOnce(mockResponse);

      const result = await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequestTyped).toHaveBeenCalledWith(
        mockThis,
        'GET',
        '/club/api/v1/users',
        {},
        {
          subdomain: 'club_123',
          max_results: 500,
          email: 'test@example.com'
        }
      );
      expect(result[0]).toHaveLength(1);
    });
  });
});