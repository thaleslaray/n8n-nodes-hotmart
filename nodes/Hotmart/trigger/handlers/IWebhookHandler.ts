import type { IWebhookResponseData } from 'n8n-workflow';

/**
 * Interface for webhook handlers
 */
export interface IWebhookHandler {
  /**
   * Validate the incoming webhook request
   */
  validate(): Promise<ValidationResult>;
  
  /**
   * Process the webhook and return the response
   */
  process(): Promise<IWebhookResponseData>;
  
  /**
   * Handle errors gracefully
   */
  handleError(error: Error): IWebhookResponseData;
}

/**
 * Validation result
 */
export interface ValidationResult {
  success: boolean;
  error?: IWebhookResponseData;
}