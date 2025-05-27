import { hotmartApiRequest } from '../../../nodes/Hotmart/v1/transport/request';
import { IExecuteFunctions } from 'n8n-workflow';
import { createMockExecuteFunctions } from '../../helpers/testHelpers';

describe('Transport - Request', () => {
  let mockThis: IExecuteFunctions;
  let mockHttpRequestWithAuthentication: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockThis = createMockExecuteFunctions();
    
    // Mock logger
    mockThis.logger = {
      debug: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
    };

    // Mock getCredentials
    mockThis.getCredentials = jest.fn().mockResolvedValue({
      environment: 'production'
    });

    // Mock getNode
    mockThis.getNode = jest.fn().mockReturnValue({ name: 'Hotmart' });

    // Mock httpRequestWithAuthentication
    mockHttpRequestWithAuthentication = jest.fn();
    mockThis.helpers.httpRequestWithAuthentication = mockHttpRequestWithAuthentication;
  });

  describe('hotmartApiRequest', () => {
    it('deve fazer requisição GET com sucesso', async () => {
      const mockResponse = {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: { items: [{ id: 1 }] }
      };

      mockHttpRequestWithAuthentication.mockResolvedValue(mockResponse);

      const result = await hotmartApiRequest.call(
        mockThis,
        'GET',
        '/api/v1/test'
      );

      expect(mockHttpRequestWithAuthentication).toHaveBeenCalledWith(
        'hotmartOAuth2Api',
        {
          method: 'GET',
          url: 'https://developers.hotmart.com/api/v1/test',
          qs: {},
          returnFullResponse: true
        }
      );
      expect(result).toEqual({ items: [{ id: 1 }] });
      expect(mockThis.logger.debug).toHaveBeenCalledWith(
        '\n[Hotmart API Request]',
        expect.any(Object)
      );
      expect(mockThis.logger.debug).toHaveBeenCalledWith(
        '\n[Hotmart API Response]',
        expect.objectContaining({
          status: 200,
          headers: { 'content-type': 'application/json' },
          body: { items: [{ id: 1 }] }
        })
      );
    });

    it('deve fazer requisição POST com body', async () => {
      const mockResponse = {
        statusCode: 201,
        headers: { 'content-type': 'application/json' },
        body: { success: true }
      };

      mockHttpRequestWithAuthentication.mockResolvedValue(mockResponse);

      const body = { name: 'Test', value: 123 };
      const result = await hotmartApiRequest.call(
        mockThis,
        'POST',
        '/api/v1/test',
        body
      );

      expect(mockHttpRequestWithAuthentication).toHaveBeenCalledWith(
        'hotmartOAuth2Api',
        {
          method: 'POST',
          url: 'https://developers.hotmart.com/api/v1/test',
          qs: {},
          body,
          headers: {
            'Content-Type': 'application/json'
          },
          returnFullResponse: true
        }
      );
      expect(result).toEqual({ success: true });
    });

    it('deve fazer requisição com query parameters', async () => {
      const mockResponse = {
        statusCode: 200,
        headers: {},
        body: { data: [] }
      };

      mockHttpRequestWithAuthentication.mockResolvedValue(mockResponse);

      const query = { page: 1, limit: 10 };
      const result = await hotmartApiRequest.call(
        mockThis,
        'GET',
        '/api/v1/test',
        {},
        query
      );

      expect(mockHttpRequestWithAuthentication).toHaveBeenCalledWith(
        'hotmartOAuth2Api',
        {
          method: 'GET',
          url: 'https://developers.hotmart.com/api/v1/test',
          qs: query,
          returnFullResponse: true
        }
      );
      expect(result).toEqual({ data: [] });
    });

    it('deve tratar erro na requisição', async () => {
      const mockError = new Error('API Error');

      mockHttpRequestWithAuthentication.mockRejectedValue(mockError);

      await expect(
        hotmartApiRequest.call(mockThis, 'GET', '/api/v1/test')
      ).rejects.toThrow('API Error');

      expect(mockThis.logger.debug).toHaveBeenCalledWith('\n[Hotmart API Error]', expect.objectContaining({
        message: 'API Error',
        statusCode: undefined,
        response: undefined
      }));
    });

    it('deve retornar objeto vazio quando resposta não tem body', async () => {
      const mockResponse = {
        statusCode: 204,
        headers: {}
        // sem body
      };

      mockHttpRequestWithAuthentication.mockResolvedValue(mockResponse);

      const result = await hotmartApiRequest.call(
        mockThis,
        'DELETE',
        '/api/v1/test/123'
      );

      expect(result).toEqual({});
    });

    it('deve retornar objeto vazio quando fullResponse é falsy', async () => {
      mockHttpRequestWithAuthentication.mockResolvedValue(null);

      const result = await hotmartApiRequest.call(
        mockThis,
        'GET',
        '/api/v1/test'
      );

      expect(result).toEqual({});
    });

    it('deve tratar resposta sem statusCode', async () => {
      const mockResponse = {
        // sem statusCode
        headers: { 'x-custom': 'header' },
        body: { test: true }
      };

      mockHttpRequestWithAuthentication.mockResolvedValue(mockResponse);

      const result = await hotmartApiRequest.call(
        mockThis,
        'GET',
        '/api/v1/test'
      );

      expect(mockThis.logger.debug).toHaveBeenCalledWith(
        '\n[Hotmart API Response]',
        expect.objectContaining({
          status: 'N/A',
          headers: { 'x-custom': 'header' },
          body: { test: true }
        })
      );
      expect(result).toEqual({ test: true });
    });

    it('deve tratar resposta sem headers', async () => {
      const mockResponse = {
        statusCode: 200,
        // sem headers
        body: { data: 'test' }
      };

      mockHttpRequestWithAuthentication.mockResolvedValue(mockResponse);

      const result = await hotmartApiRequest.call(
        mockThis,
        'GET',
        '/api/v1/test'
      );

      expect(mockThis.logger.debug).toHaveBeenCalledWith(
        '\n[Hotmart API Response]',
        expect.objectContaining({
          status: 200,
          headers: {},
          body: { data: 'test' }
        })
      );
      expect(result).toEqual({ data: 'test' });
    });

    it('deve tratar resposta completamente vazia', async () => {
      const mockResponse = {
        // sem statusCode, headers ou body
      };

      mockHttpRequestWithAuthentication.mockResolvedValue(mockResponse);

      const result = await hotmartApiRequest.call(
        mockThis,
        'GET',
        '/api/v1/test'
      );

      expect(mockThis.logger.debug).toHaveBeenCalledWith(
        '\n[Hotmart API Response]',
        expect.objectContaining({
          status: 'N/A',
          headers: {},
          body: {}
        })
      );
      expect(result).toEqual({});
    });

    it('deve incluir headers customizados em requisições com body', async () => {
      const mockResponse = {
        statusCode: 200,
        headers: {},
        body: { ok: true }
      };

      mockHttpRequestWithAuthentication.mockResolvedValue(mockResponse);

      await hotmartApiRequest.call(
        mockThis,
        'POST',
        '/api/v1/test',
        { data: 'test' },
        {}
      );

      const calledOptions = mockHttpRequestWithAuthentication.mock.calls[0][1];
      expect(calledOptions.headers).toEqual({
        'Content-Type': 'application/json'
      });
    });

    it('deve fazer requisição PATCH', async () => {
      const mockResponse = {
        statusCode: 200,
        headers: {},
        body: { updated: true }
      };

      mockHttpRequestWithAuthentication.mockResolvedValue(mockResponse);

      const result = await hotmartApiRequest.call(
        mockThis,
        'PATCH',
        '/api/v1/test/123',
        { field: 'newValue' }
      );

      expect(mockHttpRequestWithAuthentication).toHaveBeenCalledWith(
        'hotmartOAuth2Api',
        {
          method: 'PATCH',
          url: 'https://developers.hotmart.com/api/v1/test/123',
          qs: {},
          body: { field: 'newValue' },
          headers: {
            'Content-Type': 'application/json'
          },
          returnFullResponse: true
        }
      );
      expect(result).toEqual({ updated: true });
    });

    it('deve fazer requisição PUT', async () => {
      const mockResponse = {
        statusCode: 200,
        headers: {},
        body: { replaced: true }
      };

      mockHttpRequestWithAuthentication.mockResolvedValue(mockResponse);

      const result = await hotmartApiRequest.call(
        mockThis,
        'PUT',
        '/api/v1/test/123',
        { complete: 'object' }
      );

      expect(mockHttpRequestWithAuthentication).toHaveBeenCalledWith(
        'hotmartOAuth2Api',
        {
          method: 'PUT',
          url: 'https://developers.hotmart.com/api/v1/test/123',
          qs: {},
          body: { complete: 'object' },
          headers: {
            'Content-Type': 'application/json'
          },
          returnFullResponse: true
        }
      );
      expect(result).toEqual({ replaced: true });
    });

    it('deve usar URL sandbox quando environment não é production', async () => {
      // Mock credentials com sandbox
      (mockThis.getCredentials as jest.Mock).mockResolvedValue({
        environment: 'sandbox'
      });

      const mockResponse = {
        statusCode: 200,
        headers: {},
        body: { test: true }
      };

      mockHttpRequestWithAuthentication.mockResolvedValue(mockResponse);

      await hotmartApiRequest.call(
        mockThis,
        'GET',
        '/api/v1/test'
      );

      expect(mockHttpRequestWithAuthentication).toHaveBeenCalledWith(
        'hotmartOAuth2Api',
        expect.objectContaining({
          url: 'https://sandbox.hotmart.com/api/v1/test'
        })
      );
    });

    it('deve usar URL sandbox quando environment é undefined', async () => {
      // Mock credentials sem environment
      (mockThis.getCredentials as jest.Mock).mockResolvedValue({});

      const mockResponse = {
        statusCode: 200,
        headers: {},
        body: { test: true }
      };

      mockHttpRequestWithAuthentication.mockResolvedValue(mockResponse);

      await hotmartApiRequest.call(
        mockThis,
        'GET',
        '/api/v1/test'
      );

      expect(mockHttpRequestWithAuthentication).toHaveBeenCalledWith(
        'hotmartOAuth2Api',
        expect.objectContaining({
          url: 'https://sandbox.hotmart.com/api/v1/test'
        })
      );
    });
  });
});