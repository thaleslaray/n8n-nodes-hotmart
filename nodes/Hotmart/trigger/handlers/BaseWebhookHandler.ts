import type { 
  IWebhookFunctions, 
  IWebhookResponseData,
  IDataObject 
} from 'n8n-workflow';

export abstract class BaseWebhookHandler {
  constructor(protected webhookFunctions: IWebhookFunctions) {}

  abstract process(): Promise<IWebhookResponseData>;
  
  protected abstract getDescription(): string;

  async validate(): Promise<{ success: boolean; error?: IWebhookResponseData }> {
    const body = this.webhookFunctions.getBodyData();
    
    if (!body || typeof body !== 'object') {
      return {
        success: false,
        error: {
          webhookResponse: {
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ error: 'Invalid webhook body' }),
            statusCode: 400,
          },
        },
      };
    }

    const options = (this.webhookFunctions.getNodeParameter('options', 0, {}) || {}) as IDataObject;
    
    if (options.ignoreTestEvents && this.isTestEvent(body)) {
      return {
        success: false,
        error: { workflowData: [[]] }, // Retorna vazio para eventos de teste
      };
    }

    return { success: true };
  }

  protected isTestEvent(body: any): boolean {
    // Verifica se é um evento de teste baseado em vários critérios
    if (body.test_mode === true) return true;
    if (body.data?.test === true) return true;
    if (body.data?.buyer?.email?.includes('test@')) return true;
    
    return false;
  }

  protected logDebug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[HotmartTrigger] ${message}`, data || '');
    }
  }

  handleError(error: Error): IWebhookResponseData {
    const errorMessage = error.message || 'Unknown error occurred';
    return {
      webhookResponse: JSON.stringify({ error: errorMessage }),
      workflowData: [
        [
          {
            json: {
              error: errorMessage,
              timestamp: new Date().toISOString(),
            },
          },
        ],
      ],
    };
  }
}