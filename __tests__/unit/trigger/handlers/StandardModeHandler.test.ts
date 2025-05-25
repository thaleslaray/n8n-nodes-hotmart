import { StandardModeHandler } from '../../../../nodes/Hotmart/trigger/handlers/StandardModeHandler';
import type { IWebhookFunctions, IDataObject } from 'n8n-workflow';
import { EVENT_CONFIG } from '../../../../nodes/Hotmart/trigger/constants/events';

// Mock the webhook context
function createMockWebhookContext(overrides?: Partial<IWebhookFunctions>): IWebhookFunctions {
  return {
    getBodyData: jest.fn().mockReturnValue({ event: 'PURCHASE_APPROVED', data: {} }),
    getHeaderData: jest.fn().mockReturnValue({ 'x-hotmart-hottok': 'valid-token' }),
    getWorkflowStaticData: jest.fn().mockReturnValue({ hotTokToken: 'valid-token' }),
    getNodeParameter: jest.fn().mockImplementation((name: string, defaultValue?: any) => {
      const params: IDataObject = {
        mode: 'standard',
        event: 'all',
        options: {},
      };
      return params[name] ?? defaultValue;
    }),
    getResponseObject: jest.fn().mockReturnValue({
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    }),
    logger: {
      debug: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
    },
    helpers: {
      returnJsonArray: jest.fn((data) => [{ json: data }]),
    },
    ...overrides,
  } as unknown as IWebhookFunctions;
}

describe('StandardModeHandler', () => {
  let handler: StandardModeHandler;
  let mockContext: IWebhookFunctions;

  beforeEach(() => {
    mockContext = createMockWebhookContext();
    handler = new StandardModeHandler(mockContext);
  });

  describe('process method', () => {
    it('should process valid webhook body', async () => {
      const bodyData = {
        event: 'PURCHASE_APPROVED',
        data: { 
          purchase: { id: '123' },
          buyer: { email: 'test@example.com' }
        }
      };

      (mockContext.getBodyData as jest.Mock).mockReturnValue(bodyData);
      
      const result = await handler.process();
      
      expect(result.workflowData).toBeDefined();
      expect(result.workflowData![0]).toHaveLength(1);
      expect(result.workflowData![0][0].json).toMatchObject({
        event: 'PURCHASE_APPROVED',
        eventName: 'Compra Aprovada',
        eventType: 'PURCHASE_APPROVED',
        eventCategory: 'purchase',
      });
    });

    it('should return error for invalid body', async () => {
      (mockContext.getBodyData as jest.Mock).mockReturnValue(null);
      
      const result = await handler.process();
      
      expect(result.webhookResponse).toBeDefined();
      expect(result.webhookResponse!.statusCode).toBe(400);
      expect(result.webhookResponse!.body).toContain('Invalid webhook body');
    });

    it('should filter events when specific event is selected', async () => {
      (mockContext.getNodeParameter as jest.Mock).mockImplementation((name) => {
        if (name === 'mode') return 'standard';
        if (name === 'event') return 'PURCHASE_COMPLETE';
        if (name === 'options') return {};
        return undefined;
      });

      const bodyData = {
        event: 'PURCHASE_APPROVED', // Different event
        data: { test: true }
      };

      (mockContext.getBodyData as jest.Mock).mockReturnValue(bodyData);
      
      const result = await handler.process();
      
      expect(result.webhookResponse).toBeDefined();
      expect(result.webhookResponse!.statusCode).toBe(200);
      expect(result.webhookResponse!.body).toContain('Event ignored');
    });

    it('should process all events when "all" is selected', async () => {
      const events = ['PURCHASE_APPROVED', 'PURCHASE_CANCELED', 'SUBSCRIPTION_CANCELLATION'];
      
      for (const event of events) {
        const bodyData = { event, data: { test: true } };
        (mockContext.getBodyData as jest.Mock).mockReturnValue(bodyData);
        
        const result = await handler.process();
        
        expect(result.workflowData).toBeDefined();
        expect(result.workflowData![0][0].json.event).toBe(event);
      }
    });

    it('should enrich event data with metadata', async () => {
      const bodyData = {
        event: 'PURCHASE_APPROVED',
        data: { purchase: { id: '123' } }
      };
      
      const headers = { 
        'x-hotmart-hottok': 'test-token',
        'content-type': 'application/json'
      };

      (mockContext.getBodyData as jest.Mock).mockReturnValue(bodyData);
      (mockContext.getHeaderData as jest.Mock).mockReturnValue(headers);
      
      const result = await handler.process();
      const enrichedData = result.workflowData![0][0].json;
      
      expect(enrichedData).toHaveProperty('metadata');
      expect(enrichedData.metadata).toHaveProperty('hottok', 'test-token');
      expect(enrichedData.metadata).toHaveProperty('headers');
      expect(enrichedData).toHaveProperty('receivedAt');
      expect(enrichedData).toHaveProperty('isSubscription', false);
    });

    it('should detect subscription events', async () => {
      const bodyData = {
        event: 'PURCHASE_APPROVED',
        data: { 
          purchase: { id: '123' },
          subscription: {
            status: 'ACTIVE',
            subscriber_code: 'SUB123'
          }
        }
      };

      (mockContext.getBodyData as jest.Mock).mockReturnValue(bodyData);
      
      const result = await handler.process();
      const enrichedData = result.workflowData![0][0].json;
      
      expect(enrichedData.isSubscription).toBe(true);
    });

    it('should ignore test events when configured', async () => {
      (mockContext.getNodeParameter as jest.Mock).mockImplementation((name) => {
        if (name === 'mode') return 'standard';
        if (name === 'event') return 'all';
        if (name === 'options') return { ignoreTestEvents: true };
        return undefined;
      });

      const bodyData = {
        event: 'PURCHASE_APPROVED',
        test_mode: true,
        data: { test: true }
      };

      (mockContext.getBodyData as jest.Mock).mockReturnValue(bodyData);
      
      const result = await handler.process();
      
      expect(result.workflowData).toBeDefined();
      expect(result.workflowData![0]).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('should handle missing event data gracefully', async () => {
      const bodyData = {
        // No event field
        data: { test: true }
      };

      (mockContext.getBodyData as jest.Mock).mockReturnValue(bodyData);
      
      const result = await handler.process();
      
      expect(result.workflowData).toBeDefined();
      expect(result.workflowData![0][0].json).toHaveProperty('eventName', undefined);
      expect(result.workflowData![0][0].json).toHaveProperty('eventType', undefined);
    });

    it('should handle body without data field', async () => {
      const bodyData = {
        event: 'PURCHASE_APPROVED',
        // No data field
      };

      (mockContext.getBodyData as jest.Mock).mockReturnValue(bodyData);
      
      const result = await handler.process();
      
      expect(result.workflowData).toBeDefined();
      expect(result.workflowData![0][0].json.isSubscription).toBe(false);
    });
  });

  describe('performance', () => {
    it('should use cache for repeated event lookups', async () => {
      // First call - should populate cache
      const bodyData = {
        event: 'PURCHASE_APPROVED',
        data: { test: true }
      };

      (mockContext.getBodyData as jest.Mock).mockReturnValue(bodyData);
      
      await handler.process();
      
      // Second call - should use cache
      const start = Date.now();
      await handler.process();
      const duration = Date.now() - start;
      
      // Should be very fast due to cache
      expect(duration).toBeLessThan(10);
    });

    it('should handle all webhook events efficiently', async () => {
      const start = Date.now();
      
      // Process multiple events
      for (const event of Object.keys(EVENT_CONFIG)) {
        const bodyData = { event, data: { test: true } };
        (mockContext.getBodyData as jest.Mock).mockReturnValue(bodyData);
        await handler.process();
      }
      
      const duration = Date.now() - start;
      
      // Should process all events quickly
      expect(duration).toBeLessThan(100);
    });
  });
});