import { execute } from '../../../../nodes/Hotmart/v1/actions/club/getAll.operation';
import { createMockExecuteFunctions } from '../../../helpers/testHelpers';
import * as request from '../../../../nodes/Hotmart/v1/transport/request';
import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

// Mock dos módulos
jest.mock('../../../../nodes/Hotmart/v1/transport/request');

// Mock do console.log
global.console.log = jest.fn();

describe('Club - Get All Operation', () => {
  let mockThis: IExecuteFunctions;
  let mockHotmartApiRequest: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockThis = createMockExecuteFunctions();
    mockThis.getNode = jest.fn().mockReturnValue({ name: 'Hotmart' });
    mockThis.continueOnFail = jest.fn().mockReturnValue(false);
    
    // Mock hotmartApiRequest
    mockHotmartApiRequest = request.hotmartApiRequest as jest.Mock;
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

      mockHotmartApiRequest.mockResolvedValueOnce(mockResponse);

      const result = await execute.call(mockThis, testItems);

      expect(mockHotmartApiRequest).toHaveBeenCalledTimes(1);
      expect(mockHotmartApiRequest).toHaveBeenCalledWith(
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
      mockHotmartApiRequest.mockRejectedValueOnce(error);

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
      mockHotmartApiRequest.mockRejectedValueOnce(error);

      await expect(execute.call(mockThis, testItems)).rejects.toThrow('API Error');
    });

    it('should handle empty response', async () => {
      mockThis.getNodeParameter = jest.fn()
        .mockReturnValueOnce(false) // returnAll
        .mockReturnValueOnce('club_123') // subdomain
        .mockReturnValueOnce({}) // filters
        .mockReturnValueOnce(10); // limit

      mockHotmartApiRequest.mockResolvedValueOnce({ items: [] });

      const result = await execute.call(mockThis, testItems);

      expect(result).toEqual([[]]);
    });
  });
});