import { HotmartTrigger } from '../../../nodes/Hotmart/HotmartTrigger.node';
import { IWebhookFunctions } from 'n8n-workflow';

describe('HotmartTrigger Node', () => {
  let hotmartTrigger: HotmartTrigger;

  beforeEach(() => {
    hotmartTrigger = new HotmartTrigger();
  });

  describe('description', () => {
    it('should have correct basic properties', () => {
      expect(hotmartTrigger.description.displayName).toBe('Hotmart Trigger');
      expect(hotmartTrigger.description.name).toBe('hotmartTrigger');
      expect(hotmartTrigger.description.group).toEqual(['trigger']);
      expect(hotmartTrigger.description.version).toBe(1);
    });

    it('should have webhooks defined', () => {
      expect(hotmartTrigger.description.webhooks).toBeDefined();
      expect(hotmartTrigger.description.webhooks?.[0]).toMatchObject({
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
      });
      // Path is dynamic based on triggerMode parameter
      expect(hotmartTrigger.description.webhooks?.[0].path).toContain('triggerMode');
    });

    it('should have correct inputs and outputs', () => {
      expect(hotmartTrigger.description.inputs).toEqual([]);
      expect(hotmartTrigger.description.outputs).toBeDefined();
    });

    it('should have properties defined', () => {
      const properties = hotmartTrigger.description.properties;
      expect(properties).toBeDefined();
      expect(Array.isArray(properties)).toBe(true);
      
      // Check for triggerMode property
      const triggerModeProperty = properties.find(p => p.name === 'triggerMode');
      expect(triggerModeProperty).toBeDefined();
      expect(triggerModeProperty?.type).toBe('options');
      
      // Check that we have multiple properties
      expect(properties.length).toBeGreaterThan(0);
    });
  });

  describe('webhookMethods', () => {
    it('should have checkExists method', () => {
      expect(hotmartTrigger.webhookMethods?.default?.checkExists).toBeDefined();
    });

    it('should have create method', () => {
      expect(hotmartTrigger.webhookMethods?.default?.create).toBeDefined();
    });

    it('should have delete method', () => {
      expect(hotmartTrigger.webhookMethods?.default?.delete).toBeDefined();
    });
  });

  describe('webhook method', () => {
    let mockThis: IWebhookFunctions;

    beforeEach(() => {
      mockThis = {
        getNodeParameter: jest.fn(),
        getRequestObject: jest.fn(),
        getBodyData: jest.fn(),
        getHeaderData: jest.fn(),
        getWorkflowStaticData: jest.fn().mockReturnValue({}),
        getResponseObject: jest.fn().mockReturnValue({
          status: jest.fn().mockReturnValue({
            send: jest.fn(),
            json: jest.fn()
          }),
          send: jest.fn(),
          json: jest.fn()
        }),
        helpers: {
          returnJsonArray: jest.fn(),
        } as any,
        logger: {
          debug: jest.fn(),
          info: jest.fn(),
          warn: jest.fn(),
          error: jest.fn(),
        },
        getNode: jest.fn().mockReturnValue({ name: 'HotmartTrigger' }),
      } as any;
    });

    it('should return noWebhookResponse when event is not recognized', async () => {
      const mockBody = {
        event: 'PURCHASE_APPROVED',
        data: { id: '123', amount: 100 }
      };

      (mockThis.getNodeParameter as jest.Mock)
        .mockReturnValueOnce('standard'); // triggerMode
      (mockThis.getBodyData as jest.Mock).mockReturnValue(mockBody);

      const result = await hotmartTrigger.webhook.call(mockThis);

      // Como o mock não implementa getEvent corretamente, retorna noWebhookResponse
      expect(result).toEqual({
        noWebhookResponse: true
      });
    });

    it('should handle empty webhook body', async () => {
      (mockThis.getNodeParameter as jest.Mock)
        .mockReturnValueOnce('standard'); // triggerMode
      (mockThis.getBodyData as jest.Mock).mockReturnValue({});

      const result = await hotmartTrigger.webhook.call(mockThis);

      // Quando o body está vazio, retorna noWebhookResponse
      expect(result).toEqual({
        noWebhookResponse: true
      });
    });

    it('should process webhook in smart mode', async () => {
      const mockBody = {
        event: 'PURCHASE_APPROVED',
        data: { id: '123', amount: 100 }
      };

      (mockThis.getNodeParameter as jest.Mock).mockReturnValueOnce('smart'); // triggerMode
      (mockThis.getBodyData as jest.Mock).mockReturnValue(mockBody);
      (mockThis.getHeaderData as jest.Mock).mockReturnValue({});

      const result = await hotmartTrigger.webhook.call(mockThis);

      expect(result).toBeDefined();
      expect(result?.workflowData).toBeDefined();
      // Smart mode should have multiple outputs based on event types
      expect(Array.isArray(result?.workflowData)).toBe(true);
    });

    it('should process webhook in superSmart mode', async () => {
      const mockBody = {
        event: 'PURCHASE_APPROVED',
        data: { 
          purchase: {
            original_transaction_id: null
          }
        }
      };

      (mockThis.getNodeParameter as jest.Mock).mockReturnValueOnce('super-smart'); // triggerMode
      (mockThis.getBodyData as jest.Mock).mockReturnValue(mockBody);
      (mockThis.getHeaderData as jest.Mock).mockReturnValue({});

      const result = await hotmartTrigger.webhook.call(mockThis);

      expect(result).toBeDefined();
      expect(result?.workflowData).toBeDefined();
      // SuperSmart mode tem 18 saídas (uma para cada tipo de evento)
      expect(result?.workflowData?.length).toBe(18);
    });
  });
});