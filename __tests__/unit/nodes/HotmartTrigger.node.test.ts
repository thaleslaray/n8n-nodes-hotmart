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
      });
      // Path is dynamic based on triggerMode
      expect(hotmartTrigger.description.webhooks?.[0].path).toContain('triggerMode');
    });

    it('should have correct inputs and dynamic outputs', () => {
      expect(hotmartTrigger.description.inputs).toEqual([]);
      // Outputs são dinâmicos baseados no modo
      expect(typeof hotmartTrigger.description.outputs).toBe('string');
      expect(hotmartTrigger.description.outputs).toContain('$parameter["triggerMode"]');
    });

    it('should have webhook methods defined', () => {
      expect(hotmartTrigger.webhookMethods).toBeDefined();
      expect(hotmartTrigger.webhookMethods.default).toBeDefined();
    });

    it('should have properties defined', () => {
      const properties = hotmartTrigger.description.properties;
      expect(properties).toBeDefined();
      expect(Array.isArray(properties)).toBe(true);
      
      // Check for triggerMode property
      const triggerModeProperty = properties.find(p => p.name === 'triggerMode');
      expect(triggerModeProperty).toBeDefined();
      expect(triggerModeProperty?.type).toBe('options');
      
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
        getNodeParameter: jest.fn().mockReturnValue('standard'),
        logger: {
          debug: jest.fn(),
        },
      } as any;
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
      expect(webhookData).toHaveProperty('webhookId');
      expect((webhookData as any).webhookId).toMatch(/^manual-\d+$/);
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
        getWorkflowStaticData: jest.fn().mockReturnValue({}),
        getResponseObject: jest.fn().mockReturnValue({
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          send: jest.fn(),
        }),
        logger: {
          debug: jest.fn(),
          info: jest.fn(),
          warn: jest.fn(),
          error: jest.fn(),
        },
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

      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name, index, defaultValue) => {
        if (name === 'triggerMode') return 'standard';
        if (name === 'event') return 'PURCHASE_APPROVED';
        if (name === 'options') return {};
        return defaultValue;
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
        if (name === 'triggerMode') return 'smart';
        if (name === 'options') return {};
        return undefined;
      });
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue(mockBodyData);
      (mockWebhookFunctions.getHeaderData as jest.Mock).mockReturnValue({});

      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);

      expect(result).toHaveProperty('workflowData');
      expect(Array.isArray(result.workflowData)).toBe(true);
      // Smart mode should have 15 outputs
      expect(result.workflowData?.length).toBe(15);
    });

    it('should process webhook in superSmart mode', async () => {
      const mockBodyData = {
        event: 'PURCHASE_APPROVED',
        data: { purchase: { id: '123' } },
      };

      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        if (name === 'triggerMode') return 'super-smart';
        if (name === 'options') return {};
        return undefined;
      });
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue(mockBodyData);

      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);

      expect(result).toHaveProperty('workflowData');
      expect(Array.isArray(result.workflowData)).toBe(true);
      // Super smart mode should have 18 outputs
      expect(result.workflowData?.length).toBe(18);
    });

    it('should handle empty webhook body', async () => {
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        if (name === 'triggerMode') return 'standard';
        if (name === 'options') return {};
        return undefined;
      });
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({});

      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);

      expect(result).toHaveProperty('noWebhookResponse');
      expect(result.noWebhookResponse).toBe(true);
    });

    it('should handle invalid event', async () => {
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        if (name === 'triggerMode') return 'standard';
        if (name === 'event') return 'all';
        return undefined;
      });
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({ event: 'INVALID_EVENT' });

      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);
      
      expect(result).toHaveProperty('noWebhookResponse');
      expect(result.noWebhookResponse).toBe(true);
    });
  });

});