import type { IExecuteFunctions, IHookFunctions, IWebhookFunctions, ILoadOptionsFunctions, IDataObject } from 'n8n-workflow';
import { hotmartApiRequest } from './request';

/**
 * Type-safe wrapper for Hotmart API requests
 * This wrapper ensures proper typing for API responses
 */
export async function hotmartApiRequestTyped<T = unknown>(
  context: IExecuteFunctions | IHookFunctions | IWebhookFunctions | ILoadOptionsFunctions,
  method: string,
  endpoint: string,
  body: IDataObject = {},
  query: IDataObject = {}
): Promise<T> {
  const response = await hotmartApiRequest.call(context, method, endpoint, body, query);
  return response as T;
}

// Tipos de resposta comuns
export interface ApiListResponse<T> {
  items: T[];
  page_info?: {
    next_page_token?: string;
    prev_page_token?: string;
    total_results?: number;
    results_per_page?: number;
  };
}