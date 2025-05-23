import { hotmartApiRequest } from '../../nodes/Hotmart/v1/transport/request';
import { createMockExecuteFunctions } from '../helpers/testHelpers';
import { IExecuteFunctions } from 'n8n-workflow';

// Mock do console.log para evitar poluir a saída dos testes
global.console.log = jest.fn();

describe('OAuth Integration', () => {
  let mockThis: IExecuteFunctions;
  let mockHttpRequestWithAuthentication: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockThis = createMockExecuteFunctions();
    
    // Mock getCredentials
    mockThis.getCredentials = jest.fn().mockResolvedValue({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      environment: 'sandbox'
    });

    // Mock httpRequestWithAuthentication
    mockHttpRequestWithAuthentication = jest.fn();
    mockThis.helpers.httpRequestWithAuthentication = mockHttpRequestWithAuthentication;
  });

  describe('hotmartApiRequest', () => {
    it('should make authenticated request with correct base URL for sandbox', async () => {
      const mockResponse = {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: { data: 'test' }
      };

      mockHttpRequestWithAuthentication.mockResolvedValueOnce(mockResponse);

      const result = await hotmartApiRequest.call(
        mockThis,
        'GET',
        '/products/api/v1/products'
      );

      expect(mockHttpRequestWithAuthentication).toHaveBeenCalledWith(
        'hotmartOAuth2Api',
        expect.objectContaining({
          method: 'GET',
          url: 'https://sandbox.hotmart.com/products/api/v1/products',
          qs: {},
          returnFullResponse: true
        })
      );

      expect(result).toEqual({ data: 'test' });
    });

    it('should use production URL when environment is production', async () => {
      mockThis.getCredentials = jest.fn().mockResolvedValue({
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        environment: 'production'
      });

      const mockResponse = {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: { data: 'test' }
      };

      mockHttpRequestWithAuthentication.mockResolvedValueOnce(mockResponse);

      await hotmartApiRequest.call(
        mockThis,
        'GET',
        '/products/api/v1/products'
      );

      expect(mockHttpRequestWithAuthentication).toHaveBeenCalledWith(
        'hotmartOAuth2Api',
        expect.objectContaining({
          url: 'https://developers.hotmart.com/products/api/v1/products'
        })
      );
    });

    it('should include query parameters', async () => {
      const mockResponse = {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: { items: [] }
      };

      mockHttpRequestWithAuthentication.mockResolvedValueOnce(mockResponse);

      const queryParams = {
        status: 'ACTIVE',
        max_results: 50
      };

      await hotmartApiRequest.call(
        mockThis,
        'GET',
        '/payments/api/v1/subscriptions',
        {},
        queryParams
      );

      expect(mockHttpRequestWithAuthentication).toHaveBeenCalledWith(
        'hotmartOAuth2Api',
        expect.objectContaining({
          qs: queryParams
        })
      );
    });

    it('should include body and headers for POST requests', async () => {
      const mockResponse = {
        statusCode: 201,
        headers: { 'content-type': 'application/json' },
        body: { id: 'created_id' }
      };

      mockHttpRequestWithAuthentication.mockResolvedValueOnce(mockResponse);

      const body = {
        name: 'Test Product',
        price: 99.90
      };

      await hotmartApiRequest.call(
        mockThis,
        'POST',
        '/products/api/v1/products',
        body
      );

      expect(mockHttpRequestWithAuthentication).toHaveBeenCalledWith(
        'hotmartOAuth2Api',
        expect.objectContaining({
          method: 'POST',
          body: body,
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );
    });

    it('should handle authentication errors', async () => {
      const authError = new Error('Authentication failed');
      authError.message = 'Authentication failed';
      (authError as any).statusCode = 401;

      mockHttpRequestWithAuthentication.mockRejectedValueOnce(authError);

      await expect(
        hotmartApiRequest.call(mockThis, 'GET', '/products/api/v1/products')
      ).rejects.toThrow('Authentication failed');
    });

    it('should handle rate limit errors', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      (rateLimitError as any).statusCode = 429;
      (rateLimitError as any).headers = {
        'retry-after': '60'
      };

      mockHttpRequestWithAuthentication.mockRejectedValueOnce(rateLimitError);

      await expect(
        hotmartApiRequest.call(mockThis, 'GET', '/products/api/v1/products')
      ).rejects.toThrow('Rate limit exceeded');
    });

    it('should handle empty response body', async () => {
      const mockResponse = {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: null
      };

      mockHttpRequestWithAuthentication.mockResolvedValueOnce(mockResponse);

      const result = await hotmartApiRequest.call(
        mockThis,
        'GET',
        '/products/api/v1/products'
      );

      expect(result).toEqual({});
    });

    it('should handle response without body property', async () => {
      const mockResponse = {
        statusCode: 200,
        headers: { 'content-type': 'application/json' }
      };

      mockHttpRequestWithAuthentication.mockResolvedValueOnce(mockResponse);

      const result = await hotmartApiRequest.call(
        mockThis,
        'GET',
        '/products/api/v1/products'
      );

      expect(result).toEqual({});
    });

    it('should handle DELETE requests without body', async () => {
      const mockResponse = {
        statusCode: 204,
        headers: {},
        body: null
      };

      mockHttpRequestWithAuthentication.mockResolvedValueOnce(mockResponse);

      await hotmartApiRequest.call(
        mockThis,
        'DELETE',
        '/products/api/v1/coupons/123'
      );

      expect(mockHttpRequestWithAuthentication).toHaveBeenCalledWith(
        'hotmartOAuth2Api',
        expect.objectContaining({
          method: 'DELETE',
          url: 'https://sandbox.hotmart.com/products/api/v1/coupons/123',
          qs: {},
          returnFullResponse: true
        })
      );

      // Should not include body or Content-Type header for DELETE
      expect(mockHttpRequestWithAuthentication).toHaveBeenCalledWith(
        'hotmartOAuth2Api',
        expect.not.objectContaining({
          body: expect.anything(),
          headers: expect.anything()
        })
      );
    });

    it('should handle PATCH requests with partial data', async () => {
      const mockResponse = {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: { id: '123', status: 'UPDATED' }
      };

      mockHttpRequestWithAuthentication.mockResolvedValueOnce(mockResponse);

      const patchData = {
        status: 'ACTIVE'
      };

      const result = await hotmartApiRequest.call(
        mockThis,
        'PATCH',
        '/payments/api/v1/subscriptions/123',
        patchData
      );

      expect(mockHttpRequestWithAuthentication).toHaveBeenCalledWith(
        'hotmartOAuth2Api',
        expect.objectContaining({
          method: 'PATCH',
          body: patchData,
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );

      expect(result).toEqual({ id: '123', status: 'UPDATED' });
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      (networkError as any).code = 'ECONNREFUSED';

      mockHttpRequestWithAuthentication.mockRejectedValueOnce(networkError);

      await expect(
        hotmartApiRequest.call(mockThis, 'GET', '/products/api/v1/products')
      ).rejects.toThrow('Network error');
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      (timeoutError as any).code = 'ETIMEDOUT';

      mockHttpRequestWithAuthentication.mockRejectedValueOnce(timeoutError);

      await expect(
        hotmartApiRequest.call(mockThis, 'GET', '/products/api/v1/products')
      ).rejects.toThrow('Request timeout');
    });
  });
});