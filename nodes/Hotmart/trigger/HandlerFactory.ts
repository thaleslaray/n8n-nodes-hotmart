import type { IWebhookFunctions } from 'n8n-workflow';
import type { IWebhookHandler } from './handlers/IWebhookHandler';
import { StandardModeHandler } from './handlers/StandardModeHandler';
// Import other handlers when implemented
// import { SmartModeHandler } from './handlers/SmartModeHandler';
// import { SuperSmartModeHandler } from './handlers/SuperSmartModeHandler';

/**
 * Factory to create appropriate handler based on trigger mode
 */
export class HandlerFactory {
  static create(context: IWebhookFunctions): IWebhookHandler {
    const mode = context.getNodeParameter('triggerMode', 'standard') as string;

    switch (mode) {
      case 'standard':
        return new StandardModeHandler(context);
      
      // TODO: Implement these handlers in next iterations
      // case 'smart':
      //   return new SmartModeHandler(context);
      
      // case 'super-smart':
      //   return new SuperSmartModeHandler(context);
      
      default:
        // For now, default to standard mode
        return new StandardModeHandler(context);
    }
  }
}