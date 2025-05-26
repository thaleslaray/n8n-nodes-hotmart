import { HotmartTrigger } from '../../../nodes/Hotmart/HotmartTrigger.node';
import { IWebhookFunctions, IHookFunctions } from 'n8n-workflow';

describe('HotmartTrigger Node - Comprehensive Coverage', () => {
  let hotmartTrigger: HotmartTrigger;

  beforeEach(() => {
    hotmartTrigger = new HotmartTrigger();
  });

  describe('configureOutputNames function coverage', () => {
    let mockHookFunctions: Partial<IHookFunctions>;

    beforeEach(() => {
      mockHookFunctions = {
        getWorkflowStaticData: jest.fn().mockReturnValue({}),
        getNodeWebhookUrl: jest.fn().mockReturnValue('https://example.com/webhook'),
        logger: {
          debug: jest.fn(),
        },
      } as any;
    });

    it('should handle super-smart mode with customized outputs', async () => {
      (mockHookFunctions.getNodeParameter as jest.Mock) = jest.fn().mockImplementation((name) => {
        if (name === 'triggerMode') return 'super-smart';
        if (name === 'customizeOutputs') return true;
        if (name === 'outputNameSuper0') return 'Custom Single';
        if (name === 'outputNameSuper1') return 'Custom Subscription';
        if (name === 'outputNameSuper17') return 'Custom PIX';
        if (name === 'options') return {};
        return undefined;
      });

      const result = await hotmartTrigger.webhookMethods.default.create.call(
        mockHookFunctions as IHookFunctions
      );

      expect(result).toBe(true);
    });

    it('should handle super-smart mode with default outputs', async () => {
      (mockHookFunctions.getNodeParameter as jest.Mock) = jest.fn().mockImplementation((name) => {
        if (name === 'triggerMode') return 'super-smart';
        if (name === 'customizeOutputs') return false;
        if (name === 'options') return {};
        return undefined;
      });

      const result = await hotmartTrigger.webhookMethods.default.create.call(
        mockHookFunctions as IHookFunctions
      );

      expect(result).toBe(true);
    });

    it('should handle smart mode with customized outputs', async () => {
      (mockHookFunctions.getNodeParameter as jest.Mock) = jest.fn().mockImplementation((name) => {
        if (name === 'triggerMode') return 'smart';
        if (name === 'customizeOutputs') return true;
        if (name === 'outputName0') return 'Custom Approved';
        if (name === 'outputName1') return 'Custom Complete';
        if (name === 'options') return {};
        return undefined;
      });

      const result = await hotmartTrigger.webhookMethods.default.create.call(
        mockHookFunctions as IHookFunctions
      );

      expect(result).toBe(true);
    });

    it('should handle smart mode with default outputs', async () => {
      (mockHookFunctions.getNodeParameter as jest.Mock) = jest.fn().mockImplementation((name) => {
        if (name === 'triggerMode') return 'smart';
        if (name === 'customizeOutputs') return false;
        if (name === 'options') return {};
        return undefined;
      });

      const result = await hotmartTrigger.webhookMethods.default.create.call(
        mockHookFunctions as IHookFunctions
      );

      expect(result).toBe(true);
    });
  });

  describe('HotTok token verification coverage', () => {
    let mockHookFunctions: Partial<IHookFunctions>;
    let mockWebhookFunctions: Partial<IWebhookFunctions>;

    beforeEach(() => {
      mockHookFunctions = {
        getWorkflowStaticData: jest.fn(),
        getNodeWebhookUrl: jest.fn().mockReturnValue('https://example.com/webhook'),
        logger: {
          debug: jest.fn(),
        },
      } as any;

      mockWebhookFunctions = {
        getNodeParameter: jest.fn(),
        getBodyData: jest.fn(),
        getHeaderData: jest.fn(),
        getWorkflowStaticData: jest.fn(),
        getResponseObject: jest.fn().mockReturnValue({
          status: jest.fn().mockReturnThis(),
          send: jest.fn(),
        }),
        logger: {
          debug: jest.fn(),
        },
        helpers: {
          returnJsonArray: jest.fn((data) => [{ json: data }]),
        },
      } as any;
    });

    it('should handle webhook creation with HotTok token enabled', async () => {
      const webhookData = {};
      (mockHookFunctions.getWorkflowStaticData as jest.Mock).mockReturnValue(webhookData);
      (mockHookFunctions.getNodeParameter as jest.Mock) = jest.fn().mockImplementation((name) => {
        if (name === 'triggerMode') return 'standard';
        if (name === 'options') return { useHotTokToken: true, hotTokToken: 'secret-token' };
        return undefined;
      });

      const result = await hotmartTrigger.webhookMethods.default.create.call(
        mockHookFunctions as IHookFunctions
      );

      expect(result).toBe(true);
      expect(webhookData).toHaveProperty('hotTokToken', 'secret-token');
    });

    it('should handle webhook creation with HotTok token enabled but empty token', async () => {
      const webhookData = {};
      (mockHookFunctions.getWorkflowStaticData as jest.Mock).mockReturnValue(webhookData);
      (mockHookFunctions.getNodeParameter as jest.Mock) = jest.fn().mockImplementation((name) => {
        if (name === 'triggerMode') return 'standard';
        if (name === 'options') return { useHotTokToken: true, hotTokToken: '' };
        return undefined;
      });

      const result = await hotmartTrigger.webhookMethods.default.create.call(
        mockHookFunctions as IHookFunctions
      );

      expect(result).toBe(true);
      expect(webhookData).not.toHaveProperty('hotTokToken');
    });

    it('should reject webhook with invalid HotTok token', async () => {
      const webhookData = { hotTokToken: 'correct-token' };
      
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        if (name === 'triggerMode') return 'standard';
        return undefined;
      });
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
        event: 'PURCHASE_APPROVED',
        data: { purchase: { id: '123' } },
      });
      (mockWebhookFunctions.getHeaderData as jest.Mock).mockReturnValue({
        'x-hotmart-hottok': 'wrong-token',
      });
      (mockWebhookFunctions.getWorkflowStaticData as jest.Mock).mockReturnValue(webhookData);

      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);

      expect(result).toHaveProperty('noWebhookResponse', true);
      expect(mockWebhookFunctions.getResponseObject).toHaveBeenCalled();
    });

    it('should accept webhook with correct HotTok token', async () => {
      const webhookData = { hotTokToken: 'correct-token' };
      
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        if (name === 'triggerMode') return 'standard';
        if (name === 'event') return 'PURCHASE_APPROVED';
        return undefined;
      });
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
        event: 'PURCHASE_APPROVED',
        data: { purchase: { id: '123' } },
      });
      (mockWebhookFunctions.getHeaderData as jest.Mock).mockReturnValue({
        'x-hotmart-hottok': 'correct-token',
      });
      (mockWebhookFunctions.getWorkflowStaticData as jest.Mock).mockReturnValue(webhookData);

      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);

      expect(result).toHaveProperty('workflowData');
      expect(Array.isArray(result.workflowData)).toBe(true);
    });
  });

  describe('Standard mode event filtering coverage', () => {
    let mockWebhookFunctions: Partial<IWebhookFunctions>;

    beforeEach(() => {
      mockWebhookFunctions = {
        getNodeParameter: jest.fn(),
        getBodyData: jest.fn(),
        getHeaderData: jest.fn().mockReturnValue({}),
        getWorkflowStaticData: jest.fn().mockReturnValue({}),
        getResponseObject: jest.fn().mockReturnValue({
          status: jest.fn().mockReturnThis(),
          send: jest.fn(),
        }),
        logger: {
          debug: jest.fn(),
        },
        helpers: {
          returnJsonArray: jest.fn((data) => [{ json: data }]),
        },
      } as any;
    });

    it('should reject non-matching event in standard mode', async () => {
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        if (name === 'triggerMode') return 'standard';
        if (name === 'event') return 'PURCHASE_APPROVED';
        return undefined;
      });
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
        event: 'PURCHASE_CANCELED',
        data: { purchase: { id: '123' } },
      });

      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);

      expect(result).toHaveProperty('noWebhookResponse', true);
      expect(mockWebhookFunctions.getResponseObject).toHaveBeenCalled();
    });

    it('should accept wildcard event in standard mode', async () => {
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        if (name === 'triggerMode') return 'standard';
        if (name === 'event') return '*';
        return undefined;
      });
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
        event: 'PURCHASE_CANCELED',
        data: { purchase: { id: '123' } },
      });

      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);

      expect(result).toHaveProperty('workflowData');
      expect(Array.isArray(result.workflowData)).toBe(true);
    });
  });

  describe('Smart mode event validation coverage', () => {
    let mockWebhookFunctions: Partial<IWebhookFunctions>;

    beforeEach(() => {
      mockWebhookFunctions = {
        getNodeParameter: jest.fn(),
        getBodyData: jest.fn(),
        getHeaderData: jest.fn().mockReturnValue({}),
        getWorkflowStaticData: jest.fn().mockReturnValue({}),
        getResponseObject: jest.fn().mockReturnValue({
          status: jest.fn().mockReturnThis(),
          send: jest.fn(),
        }),
        logger: {
          debug: jest.fn(),
        },
        helpers: {
          returnJsonArray: jest.fn((data) => [{ json: data }]),
        },
      } as any;
    });

    it('should reject unrecognized event in smart mode', async () => {
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        if (name === 'triggerMode') return 'smart';
        return undefined;
      });
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
        event: 'INVALID_EVENT_TYPE',
        data: { purchase: { id: '123' } },
      });

      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);

      expect(result).toHaveProperty('noWebhookResponse', true);
      expect(mockWebhookFunctions.getResponseObject).toHaveBeenCalled();
    });
  });

  describe('Super-smart mode event validation coverage', () => {
    let mockWebhookFunctions: Partial<IWebhookFunctions>;

    beforeEach(() => {
      mockWebhookFunctions = {
        getNodeParameter: jest.fn(),
        getBodyData: jest.fn(),
        getHeaderData: jest.fn().mockReturnValue({}),
        getWorkflowStaticData: jest.fn().mockReturnValue({}),
        getResponseObject: jest.fn().mockReturnValue({
          status: jest.fn().mockReturnThis(),
          send: jest.fn(),
        }),
        logger: {
          debug: jest.fn(),
        },
        helpers: {
          returnJsonArray: jest.fn((data) => [{ json: data }]),
        },
      } as any;
    });

    it('should reject unrecognized event in super-smart mode', async () => {
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        if (name === 'triggerMode') return 'super-smart';
        return undefined;
      });
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
        event: 'INVALID_EVENT_TYPE',
        data: { purchase: { id: '123' } },
      });

      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);

      expect(result).toHaveProperty('noWebhookResponse', true);
      expect(mockWebhookFunctions.getResponseObject).toHaveBeenCalled();
    });

    it('should handle PIX payment in PURCHASE_BILLET_PRINTED event', async () => {
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        if (name === 'triggerMode') return 'super-smart';
        return undefined;
      });
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
        event: 'PURCHASE_BILLET_PRINTED',
        data: {
          purchase: {
            id: '123',
            payment: {
              type: 'PIX',
            },
          },
        },
      });

      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);

      expect(result).toHaveProperty('workflowData');
      expect(Array.isArray(result.workflowData)).toBe(true);
      expect(result.workflowData?.length).toBe(18);
      // Should route to PIX output (index 8)
      expect(result.workflowData?.[8]).toBeDefined();
      expect(result.workflowData?.[8].length).toBeGreaterThan(0);
    });

    it('should handle BILLET payment in PURCHASE_BILLET_PRINTED event', async () => {
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        if (name === 'triggerMode') return 'super-smart';
        return undefined;
      });
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
        event: 'PURCHASE_BILLET_PRINTED',
        data: {
          purchase: {
            id: '123',
            payment: {
              type: 'BILLET',
            },
          },
        },
      });

      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);

      expect(result).toHaveProperty('workflowData');
      expect(Array.isArray(result.workflowData)).toBe(true);
      expect(result.workflowData?.length).toBe(18);
      // Should route to BILLET output (index 7)
      expect(result.workflowData?.[7]).toBeDefined();
      expect(result.workflowData?.[7].length).toBeGreaterThan(0);
    });

    it('should handle subscription purchase with renewal', async () => {
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        if (name === 'triggerMode') return 'super-smart';
        return undefined;
      });
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
        event: 'PURCHASE_APPROVED',
        data: {
          purchase: {
            id: '123',
            is_subscription: true,
            recurrence_number: 3,
          },
        },
      });

      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);

      expect(result).toHaveProperty('workflowData');
      expect(Array.isArray(result.workflowData)).toBe(true);
      // Should route to renewal output (index 2)
      expect(result.workflowData?.[2]).toBeDefined();
      expect(result.workflowData?.[2].length).toBeGreaterThan(0);
    });

    it('should handle new subscription purchase', async () => {
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        if (name === 'triggerMode') return 'super-smart';
        return undefined;
      });
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
        event: 'PURCHASE_APPROVED',
        data: {
          purchase: {
            id: '123',
            is_subscription: true,
            recurrence_number: 1,
          },
        },
      });

      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);

      expect(result).toHaveProperty('workflowData');
      expect(Array.isArray(result.workflowData)).toBe(true);
      // Should route to subscription output (index 1)
      expect(result.workflowData?.[1]).toBeDefined();
      expect(result.workflowData?.[1].length).toBeGreaterThan(0);
    });

    it('should handle single purchase (non-subscription)', async () => {
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        if (name === 'triggerMode') return 'super-smart';
        return undefined;
      });
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
        event: 'PURCHASE_APPROVED',
        data: {
          purchase: {
            id: '123',
            is_subscription: false,
          },
        },
      });

      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);

      expect(result).toHaveProperty('workflowData');
      expect(Array.isArray(result.workflowData)).toBe(true);
      // Should route to single purchase output (index 0)
      expect(result.workflowData?.[0]).toBeDefined();
      expect(result.workflowData?.[0].length).toBeGreaterThan(0);
    });
  });

  describe('All event types coverage in super-smart mode', () => {
    let mockWebhookFunctions: Partial<IWebhookFunctions>;

    beforeEach(() => {
      mockWebhookFunctions = {
        getNodeParameter: jest.fn().mockImplementation((name) => {
          if (name === 'triggerMode') return 'super-smart';
          return undefined;
        }),
        getBodyData: jest.fn(),
        getHeaderData: jest.fn().mockReturnValue({}),
        getWorkflowStaticData: jest.fn().mockReturnValue({}),
        getResponseObject: jest.fn().mockReturnValue({
          status: jest.fn().mockReturnThis(),
          send: jest.fn(),
        }),
        logger: {
          debug: jest.fn(),
        },
        helpers: {
          returnJsonArray: jest.fn((data) => [{ json: data }]),
        },
      } as any;
    });

    const testEvents = [
      'PURCHASE_COMPLETE',
      'PURCHASE_CANCELED',
      'PURCHASE_REFUNDED',
      'PURCHASE_CHARGEBACK',
      'PURCHASE_PROTEST',
      'PURCHASE_EXPIRED',
      'PURCHASE_DELAYED',
      'PURCHASE_OUT_OF_SHOPPING_CART',
      'SUBSCRIPTION_CANCELLATION',
      'SWITCH_PLAN',
      'UPDATE_SUBSCRIPTION_CHARGE_DATE',
      'CLUB_FIRST_ACCESS',
      'CLUB_MODULE_COMPLETED',
    ];

    testEvents.forEach((eventType) => {
      it(`should handle ${eventType} event`, async () => {
        (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
          event: eventType,
          data: { purchase: { id: '123' } },
        });

        const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);

        expect(result).toHaveProperty('workflowData');
        expect(Array.isArray(result.workflowData)).toBe(true);
        expect(result.workflowData?.length).toBe(18);
      });
    });
  });

  describe('Error fallback coverage', () => {
    let mockWebhookFunctions: Partial<IWebhookFunctions>;

    beforeEach(() => {
      mockWebhookFunctions = {
        getNodeParameter: jest.fn(),
        getBodyData: jest.fn(),
        getHeaderData: jest.fn().mockReturnValue({}),
        getWorkflowStaticData: jest.fn().mockReturnValue({}),
        getResponseObject: jest.fn().mockReturnValue({
          status: jest.fn().mockReturnThis(),
          send: jest.fn(),
        }),
        logger: {
          debug: jest.fn(),
        },
        helpers: {
          returnJsonArray: jest.fn((data) => [{ json: data }]),
        },
      } as any;
    });

    it('should handle internal error fallback', async () => {
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        if (name === 'triggerMode') return 'unknown-mode';
        return undefined;
      });
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
        event: 'PURCHASE_APPROVED',
        data: { purchase: { id: '123' } },
      });

      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);

      expect(result).toHaveProperty('noWebhookResponse', true);
      expect(mockWebhookFunctions.getResponseObject).toHaveBeenCalled();
    });
  });
});