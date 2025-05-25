import type { IWebhookFunctions, IWebhookResponseData, IDataObject } from 'n8n-workflow';
import type { IWebhookHandler, ValidationResult } from './IWebhookHandler';
import { isValidEvent, getEventConfig } from '../constants/events';

/**
 * Base handler with common webhook functionality
 */
export abstract class BaseWebhookHandler implements IWebhookHandler {
  protected bodyData: IDataObject;
  protected headerData: IDataObject;
  protected webhookData: IDataObject;
  protected nodeName: string;

  constructor(protected context: IWebhookFunctions) {
    this.bodyData = context.getBodyData();
    this.headerData = context.getHeaderData();
    this.webhookData = context.getWorkflowStaticData('node');
    
    const triggerMode = context.getNodeParameter('triggerMode', 'standard') as string;
    this.nodeName = triggerMode === 'standard' ? 'HotmartTrigger' : 'HotmartSmartTrigger';
  }

  /**
   * Validate token and event
   */
  async validate(): Promise<ValidationResult> {
    // Validate token if configured
    const useHotTok = this.context.getNodeParameter('useHotTokToken', false) as boolean;
    if (useHotTok) {
      const hottok = this.headerData['x-hotmart-hottok'] as string;
      const expectedToken = this.webhookData.hotTokToken as string;
      
      if (expectedToken && hottok !== expectedToken) {
        this.context.logger.debug(`[${this.nodeName}] Token validation failed`);
        return {
          success: false,
          error: this.unauthorized('Token inv�lido'),
        };
      }
    }

    // Validate event
    const eventName = this.bodyData.event as string;
    if (!eventName || !isValidEvent(eventName)) {
      this.context.logger.debug(`[${this.nodeName}] Unknown event: ${eventName || 'undefined'}`);
      return {
        success: false,
        error: this.badRequest('Evento desconhecido'),
      };
    }

    return { success: true };
  }

  /**
   * Process the webhook - must be implemented by subclasses
   */
  abstract process(): Promise<IWebhookResponseData>;

  /**
   * Handle errors
   */
  handleError(error: Error): IWebhookResponseData {
    this.context.logger.error(`[${this.nodeName}] Webhook error:`, { error: error.message });
    return this.serverError('Internal server error');
  }

  /**
   * Helper methods for responses
   */
  protected unauthorized(message: string): IWebhookResponseData {
    const res = this.context.getResponseObject();
    res.status(401).send(message);
    return { noWebhookResponse: true };
  }

  protected badRequest(message: string): IWebhookResponseData {
    const res = this.context.getResponseObject();
    res.status(400).send(message);
    return { noWebhookResponse: true };
  }

  protected serverError(message: string): IWebhookResponseData {
    const res = this.context.getResponseObject();
    res.status(500).send(message);
    return { noWebhookResponse: true };
  }

  /**
   * Log debug information
   */
  protected logDebug(message: string, data?: any) {
    this.context.logger.debug(`[${this.nodeName}] ${message}`, data);
  }

  /**
   * Detect if event is a subscription
   */
  protected isSubscriptionEvent(): boolean {
    const data = (this.bodyData.data as IDataObject) || {};
    const eventName = this.bodyData.event as string;
    
    return Boolean(
      (data.subscription && 
        ((data.subscription as IDataObject)?.subscriber as IDataObject)?.code) ||
      (data.purchase && (data.purchase as IDataObject)?.is_subscription) ||
      ['SUBSCRIPTION_CANCELLATION', 'SWITCH_PLAN', 'UPDATE_SUBSCRIPTION_CHARGE_DATE'].includes(eventName)
    );
  }

  /**
   * Get event configuration
   */
  protected getEventInfo() {
    const eventName = this.bodyData.event as string;
    return getEventConfig(eventName);
  }
}