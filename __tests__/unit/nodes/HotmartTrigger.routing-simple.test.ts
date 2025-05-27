import { HotmartTrigger } from '../../../nodes/Hotmart/HotmartTrigger.node';
import type { IWebhookFunctions } from 'n8n-workflow';

describe('HotmartTrigger - Teste Simples de Roteamento', () => {
  let node: HotmartTrigger;
  let mockWebhookFunctions: jest.Mocked<IWebhookFunctions>;

  beforeEach(() => {
    node = new HotmartTrigger();
    
    mockWebhookFunctions = {
      getBodyData: jest.fn(),
      getHeaderData: jest.fn().mockReturnValue({}),
      getNodeParameter: jest.fn(),
      getWorkflowStaticData: jest.fn().mockReturnValue({}),
      getResponseObject: jest.fn().mockReturnValue({
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      }),
      helpers: {
        returnJsonArray: jest.fn((data) => [{ json: data }]),
      },
      logger: {
        debug: jest.fn(),
      },
    } as any;
  });

  test('Smart Mode - PURCHASE_DELAYED (saída 5) deve funcionar', async () => {
    mockWebhookFunctions.getNodeParameter.mockImplementation((param) => {
      if (param === 'triggerMode') return 'smart';
      if (param === 'options') return {};
      return undefined;
    });

    mockWebhookFunctions.getBodyData.mockReturnValue({
      event: 'PURCHASE_DELAYED',
      data: { purchase: { status: 'delayed' } },
      version: '2.0.0',
    });

    const result = await node.webhook.call(mockWebhookFunctions);
    
    console.log('Result:', result);
    console.log('workflowData type:', typeof result.workflowData);
    console.log('workflowData length:', result.workflowData?.length);
    
    if (result.workflowData) {
      const workflowData = result.workflowData;
      console.log('Output 5:', workflowData[5]);
      console.log('Output 8:', workflowData[8]);
    }
  });
});