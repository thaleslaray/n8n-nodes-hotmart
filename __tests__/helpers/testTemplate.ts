// Template for creating Quick Win tests

export const testTemplate = `
import { execute } from '../../../../nodes/Hotmart/v1/actions/RESOURCE/OPERATION.operation';
import { createMockExecuteFunction } from '../../../helpers/mocks';
import type { IExecuteFunctions } from 'n8n-workflow';

// Mock the request modules
jest.mock('../../../../nodes/Hotmart/v1/transport/request', () => ({
  hotmartApiRequest: jest.fn(),
}));

jest.mock('../../../../nodes/Hotmart/v1/transport/requestTyped', () => ({
  hotmartApiRequestTyped: jest.fn(),
}));

import { hotmartApiRequest } from '../../../../nodes/Hotmart/v1/transport/request';

describe('RESOURCE OPERATION operation', () => {
  let mockThis: IExecuteFunctions;

  beforeEach(() => {
    mockThis = createMockExecuteFunction();
    jest.clearAllMocks();
  });

  it('should execute successfully', async () => {
    const mockResponse = {
      // Add mock response data
    };

    // Mock all getNodeParameter calls in order
    (mockThis.getNodeParameter as jest.Mock)
      .mockReturnValueOnce('PARAM1_VALUE'); // param1

    // Mock the API request
    (hotmartApiRequest as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(1);
    
    expect(hotmartApiRequest).toHaveBeenCalledWith(
      'METHOD',
      '/path',
      {},
      {}
    );
  });

  it('should handle error with continueOnFail=true', async () => {
    (mockThis.getNodeParameter as jest.Mock)
      .mockReturnValueOnce('PARAM1_VALUE'); // param1

    (hotmartApiRequest as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
    (mockThis.continueOnFail as jest.Mock).mockReturnValueOnce(true);

    const result = await execute.call(mockThis, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(1);
    expect(result[0][0].json.error).toBe('API Error');
  });

  it('should throw error with continueOnFail=false', async () => {
    (mockThis.getNodeParameter as jest.Mock)
      .mockReturnValueOnce('PARAM1_VALUE'); // param1

    (hotmartApiRequest as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
    (mockThis.continueOnFail as jest.Mock).mockReturnValueOnce(false);

    await expect(execute.call(mockThis, [{ json: {} }])).rejects.toThrow('API Error');
  });
});
`;