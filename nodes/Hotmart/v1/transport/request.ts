import {
  IExecuteFunctions,
  IHookFunctions,
  IWebhookFunctions,
  IHttpRequestOptions,
  IDataObject,
  IHttpRequestMethods,
  ILoadOptionsFunctions,
} from 'n8n-workflow';

/**
 * Makes an authenticated HTTP request to the Hotmart API
 * @param {IExecuteFunctions | IHookFunctions | IWebhookFunctions | ILoadOptionsFunctions} this - n8n execution context
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {string} endpoint - API endpoint path (e.g., '/payments/api/v1/subscriptions')
 * @param {any} [body={}] - Request body for POST/PUT requests
 * @param {object} [query={}] - Query parameters to append to the URL
 * @returns {Promise<any>} Response data from the API
 * @throws {NodeApiError} When the API request fails with error details
 * @description Handles OAuth2 authentication automatically using stored credentials.
 * Selects the appropriate base URL based on environment (production/sandbox).
 * @example
 * // GET request
 * const subscriptions = await hotmartApiRequest.call(
 *   this, 'GET', '/payments/api/v1/subscriptions', {}, { max_results: 10 }
 * );
 *
 * @example
 * // POST request
 * const result = await hotmartApiRequest.call(
 *   this, 'POST', '/products/api/v1/coupons', { code: 'DISCOUNT10', discount_type: 'PERCENTAGE' }
 * );
 */
export async function hotmartApiRequest<T>(
  this: IExecuteFunctions | IHookFunctions | IWebhookFunctions | ILoadOptionsFunctions,
  method: string,
  endpoint: string,
  body: IDataObject = {},
  query: IDataObject = {}
): Promise<T> {
  const credentials = await this.getCredentials('hotmartOAuth2Api');
  const baseUrl =
    credentials.environment === 'production'
      ? 'https://developers.hotmart.com'
      : 'https://sandbox.hotmart.com';

  const options: IHttpRequestOptions = {
    method: method as IHttpRequestMethods,
    url: `${baseUrl}${endpoint}`,
    qs: query as IDataObject,
    returnFullResponse: true, // Adiciona esta opção para receber o status code
  };

  if (Object.keys(body).length > 0) {
    options.body = body;
    options.headers = {
      'Content-Type': 'application/json',
    };
  }

  try {
    // Log da requisição
    this.logger.debug('\n[Hotmart API Request]', {
      url: options.url,
      method: options.method,
      queryParams: options.qs,
      body: options.body || undefined
    });

    const fullResponse = await this.helpers.httpRequestWithAuthentication.call(
      this,
      'hotmartOAuth2Api',
      options
    );

    // Log da resposta
    this.logger.debug('\n[Hotmart API Response]', {
      status: fullResponse?.statusCode || 'N/A',
      headers: fullResponse?.headers || {},
      body: fullResponse?.body || {}
    });

    return fullResponse && fullResponse.body ? fullResponse.body : {} as T;
  } catch (error) {
    this.logger.debug('\n[Hotmart API Error]');
    this.logger.debug('Error:', error);
    throw error;
  }
}

// Removed refreshToken function as updateCredentials is not available
// and httpRequestWithAuthentication should handle standard OAuth2 refresh.
// If custom refresh logic is needed later, it would require a different approach.
