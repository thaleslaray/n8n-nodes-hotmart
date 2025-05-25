import type { IWebhookResponseData, IDataObject } from 'n8n-workflow';
import { BaseWebhookHandler } from './BaseHandler';

/**
 * Handler for standard mode (single output)
 */
export class StandardModeHandler extends BaseWebhookHandler {
  async process(): Promise<IWebhookResponseData> {
    // Validate request
    const validation = await this.validate();
    if (!validation.success) {
      return validation.error!;
    }

    // Check if event matches selection
    const selectedEvent = this.context.getNodeParameter('event') as string;
    const currentEvent = this.bodyData.event as string;

    if (selectedEvent !== '*' && selectedEvent !== currentEvent) {
      this.logDebug('Event does not match subscription', { 
        selected: selectedEvent, 
        received: currentEvent 
      });
      return this.badRequest('Evento não corresponde à inscrição');
    }

    // Process the event
    const enrichedData = this.enrichEventData();
    
    // Log event info
    this.logDebug('Event processed', {
      event: enrichedData.eventName,
      type: enrichedData.eventType,
      isSubscription: enrichedData.isSubscription,
    });

    return {
      workflowData: [this.context.helpers.returnJsonArray(enrichedData)],
    };
  }

  /**
   * Enrich event data with additional metadata
   */
  private enrichEventData(): IDataObject {
    const eventInfo = this.getEventInfo();
    const isSubscription = this.isSubscriptionEvent();
    const hottok = this.headerData['x-hotmart-hottok'] as string;

    return {
      ...this.bodyData,
      eventName: eventInfo?.displayName || this.bodyData.event,
      eventType: this.bodyData.event,
      eventCategory: eventInfo?.category,
      receivedAt: new Date().toISOString(),
      isSubscription,
      metadata: {
        hottok,
        headers: this.headerData,
      },
    };
  }
}