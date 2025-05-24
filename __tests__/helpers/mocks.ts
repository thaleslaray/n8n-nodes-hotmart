import { IExecuteFunctions } from 'n8n-workflow';

/**
 * Creates a mock IExecuteFunctions context for testing
 */
export function createMockExecuteFunction(
  overrides?: Partial<IExecuteFunctions>
): IExecuteFunctions {
  return {
    getNodeParameter: jest.fn(),
    getInputData: jest.fn().mockReturnValue([{ json: {} }]),
    helpers: {
      httpRequestWithAuthentication: jest.fn(),
      returnJsonArray: jest.fn((data) => data),
      constructExecutionMetaData: jest.fn((data, meta) => 
        data.map((item: any, index: number) => ({ 
          json: item, 
          pairedItem: { item: index } 
        }))
      ),
    },
    // Adding getInputConnectionData which is used by operations
    getInputConnectionData: jest.fn().mockReturnValue([{ json: {} }]),
    continueOnFail: jest.fn().mockReturnValue(false),
    getCredentials: jest.fn().mockResolvedValue({
      environment: 'production'
    }),
    ...overrides,
  } as unknown as IExecuteFunctions;
}

/**
 * Helper to test error handling for operations
 */
export async function testErrorHandling(
  operation: any,
  mockContext: IExecuteFunctions,
  requiredParams: Record<string, any>
) {
  describe('error handling', () => {
    it('should handle errors with continueOnFail=true', async () => {
      // Setup params
      Object.values(requiredParams).forEach((value) => {
        (mockContext.getNodeParameter as jest.Mock).mockReturnValueOnce(value);
      });
      (mockContext.getNodeParameter as jest.Mock).mockReturnValueOnce({}); // additionalFields
      (mockContext.getNodeParameter as jest.Mock).mockReturnValueOnce(true); // continueOnFail

      const error = new Error('API Error');
      (mockContext.helpers.httpRequestWithAuthentication as jest.Mock).mockRejectedValueOnce(
        error
      );

      const result = await operation.execute.call(mockContext, 0);

      expect(result).toEqual([{ error: error.message }]);
    });

    it('should throw error with continueOnFail=false', async () => {
      // Setup params
      Object.values(requiredParams).forEach((value) => {
        (mockContext.getNodeParameter as jest.Mock).mockReturnValueOnce(value);
      });
      (mockContext.getNodeParameter as jest.Mock).mockReturnValueOnce({}); // additionalFields
      (mockContext.getNodeParameter as jest.Mock).mockReturnValueOnce(false); // continueOnFail

      const error = new Error('API Error');
      (mockContext.helpers.httpRequestWithAuthentication as jest.Mock).mockRejectedValueOnce(
        error
      );

      await expect(operation.execute.call(mockContext, 0)).rejects.toThrow('API Error');
    });
  });
}

/**
 * Helper to test basic GET operations with more flexible interface
 */
export async function testBasicGetOperation(options: {
  mockThis: IExecuteFunctions;
  operation: any;
  resource: string;
  method: string;
  expectedPath: string;
  mockResponse: any;
  setupMocks: () => void;
}) {
  const { mockThis, operation, resource, method, expectedPath, mockResponse, setupMocks } = options;
  
  // Setup mocks
  setupMocks();
  
  (mockThis.getNodeParameter as jest.Mock)
    .mockReturnValueOnce(resource); // resource
    
  (mockThis.helpers.httpRequestWithAuthentication as jest.Mock)
    .mockResolvedValueOnce(mockResponse);
    
  (mockThis.helpers.returnJsonArray as jest.Mock)
    .mockReturnValueOnce([mockResponse]);
    
  const result = await operation.call(mockThis, [{ json: {} }]);
  
  expect(result).toEqual([[mockResponse]]);
  expect(mockThis.helpers.httpRequestWithAuthentication).toHaveBeenCalledWith(
    'hotmartOAuth2Api',
    expect.objectContaining({
      method,
      url: expect.stringContaining(expectedPath),
    })
  );
}

/**
 * Helper to test basic GET operations (legacy interface)
 */
export function testBasicGetOperationLegacy(
  operation: any,
  operationName: string,
  requiredParams: Record<string, any>,
  expectedUrl: string,
  mockResponse: any = { success: true }
) {
  describe(`${operationName}`, () => {
    let mockContext: IExecuteFunctions;

    beforeEach(() => {
      mockContext = createMockExecuteFunction();
      jest.clearAllMocks();
    });

    it('should execute successfully', async () => {
      // Setup params
      Object.values(requiredParams).forEach((value) => {
        (mockContext.getNodeParameter as jest.Mock).mockReturnValueOnce(value);
      });

      (mockContext.helpers.httpRequestWithAuthentication as jest.Mock).mockResolvedValueOnce(
        mockResponse
      );

      const result = await operation.execute.call(mockContext, 0);

      expect(result).toEqual([mockResponse]);
      expect(mockContext.helpers.httpRequestWithAuthentication).toHaveBeenCalledWith(
        'hotmartOAuth2Api',
        expect.objectContaining({
          method: 'GET',
          url: expect.stringContaining(expectedUrl),
        })
      );
    });
  });
}

/**
 * Helper to test basic DELETE operations
 */
export function testBasicDeleteOperation(
  operation: any,
  operationName: string,
  requiredParams: Record<string, any>,
  expectedUrl: string
) {
  describe(`${operationName}`, () => {
    let mockContext: IExecuteFunctions;

    beforeEach(() => {
      mockContext = createMockExecuteFunction();
      jest.clearAllMocks();
    });

    it('should delete successfully', async () => {
      // Setup params
      Object.values(requiredParams).forEach((value) => {
        (mockContext.getNodeParameter as jest.Mock).mockReturnValueOnce(value);
      });

      const mockResponse = { success: true, message: 'Deleted successfully' };
      (mockContext.helpers.httpRequestWithAuthentication as jest.Mock).mockResolvedValueOnce(
        mockResponse
      );

      const result = await operation.execute.call(mockContext, 0);

      expect(result).toEqual([mockResponse]);
      expect(mockContext.helpers.httpRequestWithAuthentication).toHaveBeenCalledWith(
        'hotmartOAuth2Api',
        expect.objectContaining({
          method: 'DELETE',
          url: expect.stringContaining(expectedUrl),
        })
      );
    });
  });
}