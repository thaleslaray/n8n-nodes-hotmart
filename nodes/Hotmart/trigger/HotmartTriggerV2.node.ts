import type {
  IHookFunctions,
  IWebhookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookResponseData,
} from 'n8n-workflow';

import { HandlerFactory } from './handlers/HandlerFactory';
import { HotmartTriggerDescription } from './HotmartTriggerDescription';

export class HotmartTriggerV2 implements INodeType {
  description: INodeTypeDescription = HotmartTriggerDescription;

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        const webhookData = this.getWorkflowStaticData('node');
        return webhookData.webhookId !== undefined;
      },

      async create(this: IHookFunctions): Promise<boolean> {
        const webhookUrl = this.getNodeWebhookUrl('default');
        const webhookData = this.getWorkflowStaticData('node');
        
        webhookData.webhookId = webhookUrl;
        return true;
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        const webhookData = this.getWorkflowStaticData('node');
        
        if (webhookData.webhookId !== undefined) {
          delete webhookData.webhookId;
        }
        
        return true;
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const mode = this.getNodeParameter('mode', 0) as string;
    const handler = HandlerFactory.create(mode, this);
    
    return handler.process();
  }
}