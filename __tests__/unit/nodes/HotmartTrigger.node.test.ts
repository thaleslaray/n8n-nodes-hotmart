import { HotmartTrigger } from '../../../nodes/Hotmart/HotmartTrigger.node';
import { IWebhookFunctions, IHookFunctions } from 'n8n-workflow';

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
        path: 'webhook',
      });
    });

    it('should have correct inputs and dynamic outputs', () => {
      expect(hotmartTrigger.description.inputs).toEqual([]);
      // Outputs são dinâmicos baseados no modo
      expect(typeof hotmartTrigger.description.outputs).toBe('string');
      expect(hotmartTrigger.description.outputs).toContain('$parameter["mode"]');
    });

    it('should have webhook methods defined', () => {
      expect(hotmartTrigger.webhookMethods).toBeDefined();
      expect(hotmartTrigger.webhookMethods.default).toBeDefined();
    });

    it('should have properties defined', () => {
      const properties = hotmartTrigger.description.properties;
      expect(properties).toBeDefined();
      expect(Array.isArray(properties)).toBe(true);
      
      // Check for mode property (not triggerMode anymore)
      const modeProperty = properties.find(p => p.name === 'mode');
      expect(modeProperty).toBeDefined();
      expect(modeProperty?.type).toBe('options');
      
      // Check for event property
      const eventProperty = properties.find(p => p.name === 'event');
      expect(eventProperty).toBeDefined();
      
      // Check that we have multiple properties
      expect(properties.length).toBeGreaterThan(0);
    });
  });

  describe('webhookMethods', () => {
    let mockHookFunctions: Partial<IHookFunctions>;

    beforeEach(() => {
      mockHookFunctions = {
        getWorkflowStaticData: jest.fn(),
        getNodeWebhookUrl: jest.fn(),
      };
    });

    it('should check if webhook exists', async () => {
      const webhookData = { webhookId: 'test-webhook-id' };
      (mockHookFunctions.getWorkflowStaticData as jest.Mock).mockReturnValue(webhookData);

      const result = await hotmartTrigger.webhookMethods.default.checkExists.call(
        mockHookFunctions as IHookFunctions
      );

      expect(result).toBe(true);
    });

    it('should return false when webhook does not exist', async () => {
      const webhookData = {};
      (mockHookFunctions.getWorkflowStaticData as jest.Mock).mockReturnValue(webhookData);

      const result = await hotmartTrigger.webhookMethods.default.checkExists.call(
        mockHookFunctions as IHookFunctions
      );

      expect(result).toBe(false);
    });

    it('should create webhook', async () => {
      const webhookData = {};
      const webhookUrl = 'https://example.com/webhook';
      
      (mockHookFunctions.getWorkflowStaticData as jest.Mock).mockReturnValue(webhookData);
      (mockHookFunctions.getNodeWebhookUrl as jest.Mock).mockReturnValue(webhookUrl);

      const result = await hotmartTrigger.webhookMethods.default.create.call(
        mockHookFunctions as IHookFunctions
      );

      expect(result).toBe(true);
      expect(webhookData).toHaveProperty('webhookId', webhookUrl);
    });

    it('should delete webhook', async () => {
      const webhookData = { webhookId: 'test-webhook-id' };
      (mockHookFunctions.getWorkflowStaticData as jest.Mock).mockReturnValue(webhookData);

      const result = await hotmartTrigger.webhookMethods.default.delete.call(
        mockHookFunctions as IHookFunctions
      );

      expect(result).toBe(true);
      expect(webhookData).not.toHaveProperty('webhookId');
    });
  });

  describe('webhook method', () => {
    let mockWebhookFunctions: Partial<IWebhookFunctions>;

    beforeEach(() => {
      mockWebhookFunctions = {
        getNodeParameter: jest.fn(),
        getBodyData: jest.fn(),
        getHeaderData: jest.fn(),
        helpers: {
          returnJsonArray: jest.fn((data) => [{ json: data }]),
        },
      } as any;
    });

    it('should process webhook in standard mode', async () => {
      const mockBodyData = {
        event: 'PURCHASE_APPROVED',
        data: { purchase: { id: '123' } },
      };

      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        if (name === 'mode') return 'standard';
        if (name === 'event') return 'all';
        if (name === 'options') return {};
        return undefined;
      });
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue(mockBodyData);
      (mockWebhookFunctions.getHeaderData as jest.Mock).mockReturnValue({ 'x-hotmart-hottok': 'test-token' });

      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);

      expect(result).toHaveProperty('workflowData');
      expect(Array.isArray(result.workflowData)).toBe(true);
    });

    it('should process webhook in smart mode', async () => {
      const mockBodyData = {
        event: 'PURCHASE_APPROVED',
        data: { purchase: { id: '123' } },
      };

      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        if (name === 'mode') return 'smart';
        if (name === 'options') return {};
        return undefined;
      });
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue(mockBodyData);
      (mockWebhookFunctions.getHeaderData as jest.Mock).mockReturnValue({});

      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);

      expect(result).toHaveProperty('workflowData');
      expect(Array.isArray(result.workflowData)).toBe(true);
      // Smart mode should have multiple outputs
      expect(result.workflowData?.length).toBeGreaterThan(1);
    });

    it('should process webhook in superSmart mode', async () => {
      const mockBodyData = {
        event: 'PURCHASE_APPROVED',
        data: { purchase: { id: '123' } },
      };

      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        if (name === 'mode') return 'superSmart';
        if (name === 'options') return {};
        return undefined;
      });
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue(mockBodyData);

      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);

      expect(result).toHaveProperty('workflowData');
      expect(Array.isArray(result.workflowData)).toBe(true);
      // Super smart mode should have 3 outputs
      expect(result.workflowData?.length).toBe(3);
    });

    it('should handle empty webhook body', async () => {
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        if (name === 'mode') return 'standard';
        if (name === 'options') return {};
        return undefined;
      });
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue(null);

      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);

      expect(result).toHaveProperty('webhookResponse');
      expect(result.webhookResponse?.statusCode).toBe(400);
    });

    it('should handle invalid mode', async () => {
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockReturnValue('invalid-mode');

      await expect(
        hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions)
      ).rejects.toThrow('Modo de trigger inválido: invalid-mode');
    });
  });

  describe('HandlerFactory', () => {
    const mockWebhookFunctions = {
      getNodeParameter: jest.fn(),
      getBodyData: jest.fn(),
      getHeaderData: jest.fn(),
      helpers: {
        returnJsonArray: jest.fn(),
      },
    } as any;

    it('should create StandardModeHandler for standard mode', () => {
      const handler = HandlerFactory.create('standard', mockWebhookFunctions);
      expect(handler).toBeInstanceOf(StandardModeHandler);
    });

    it('should create SmartModeHandler for smart mode', () => {
      const handler = HandlerFactory.create('smart', mockWebhookFunctions);
      expect(handler).toBeInstanceOf(SmartModeHandler);
    });

    it('should create SuperSmartModeHandler for superSmart mode', () => {
      const handler = HandlerFactory.create('superSmart', mockWebhookFunctions);
      expect(handler).toBeInstanceOf(SuperSmartModeHandler);
    });

    it('should throw error for invalid mode', () => {
      expect(() => HandlerFactory.create('invalid', mockWebhookFunctions))
        .toThrow('Modo de trigger inválido: invalid');
    });
  });
});