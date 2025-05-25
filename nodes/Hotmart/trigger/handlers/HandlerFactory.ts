import type { IWebhookFunctions } from 'n8n-workflow';
import { BaseWebhookHandler } from './BaseWebhookHandler';
import { StandardModeHandler } from './StandardModeHandler';
import { SmartModeHandler } from './SmartModeHandler';
import { SuperSmartModeHandler } from './SuperSmartModeHandler';

export class HandlerFactory {
  static create(mode: string, webhookFunctions: IWebhookFunctions): BaseWebhookHandler {
    switch (mode) {
      case 'standard':
        return new StandardModeHandler(webhookFunctions);
      
      case 'smart':
        return new SmartModeHandler(webhookFunctions);
      
      case 'superSmart':
        return new SuperSmartModeHandler(webhookFunctions);
      
      default:
        throw new Error(`Modo de trigger inválido: ${mode}`);
    }
  }
}