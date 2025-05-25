import type { IWebhookResponseData, IDataObject } from 'n8n-workflow';
import { BaseWebhookHandler } from './BaseWebhookHandler';
import { EVENT_CONFIG } from '../constants/events';

export class StandardModeHandler extends BaseWebhookHandler {
  async process(): Promise<IWebhookResponseData> {
    const validation = await this.validate();
    if (!validation.success) {
      return validation.error!;
    }

    const body = this.webhookFunctions.getBodyData() as any;
    const selectedEvent = this.webhookFunctions.getNodeParameter('event', 0) as string;
    const currentEvent = body.event as string;

    // Verifica se o evento corresponde ao selecionado
    if (selectedEvent !== 'all' && selectedEvent !== currentEvent) {
      this.logDebug('Event does not match selection', { 
        selected: selectedEvent, 
        received: currentEvent 
      });
      
      return {
        webhookResponse: {
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ message: 'Event ignored' }),
          statusCode: 200,
        },
      };
    }

    // Enriquece os dados do evento
    const enrichedData = this.enrichEventData(body);
    
    return {
      workflowData: [this.webhookFunctions.helpers.returnJsonArray(enrichedData)],
    };
  }

  protected getDescription(): string {
    return 'Standard mode - single output';
  }

  private enrichEventData(body: IDataObject): IDataObject {
    const event = body.event as string;
    const eventConfig = EVENT_CONFIG[event as keyof typeof EVENT_CONFIG];
    const headers = this.webhookFunctions.getHeaderData();
    
    return {
      ...body,
      eventName: eventConfig?.displayName || event,
      eventType: event,
      eventCategory: eventConfig?.category,
      receivedAt: new Date().toISOString(),
      isSubscription: this.isSubscriptionEvent(body),
      metadata: {
        hottok: headers['x-hotmart-hottok'],
        headers,
      },
    };
  }

  private isSubscriptionEvent(body: IDataObject): boolean {
    const data = body.data as IDataObject;
    if (!data) return false;
    
    const subscription = data.subscription as IDataObject;
    return Boolean(subscription && subscription.status);
  }
}