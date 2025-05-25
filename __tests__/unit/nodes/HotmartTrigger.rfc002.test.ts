import { HotmartTrigger } from '../../../nodes/Hotmart/HotmartTrigger.node';
import { IWebhookFunctions } from 'n8n-workflow';
import { WEBHOOK_EVENTS, EVENT_CONFIG } from '../../../nodes/Hotmart/trigger/constants/events';

describe('HotmartTrigger - RFC-002 New Event System', () => {
  let hotmartTrigger: HotmartTrigger;
  let mockWebhookFunctions: Partial<IWebhookFunctions>;

  beforeEach(() => {
    hotmartTrigger = new HotmartTrigger();
    
    // Mock básico do IWebhookFunctions
    mockWebhookFunctions = {
      getBodyData: jest.fn(),
      getHeaderData: jest.fn().mockReturnValue({}),
      getNodeParameter: jest.fn(),
      getWorkflowStaticData: jest.fn().mockReturnValue({}),
      getResponseObject: jest.fn().mockReturnValue({
        status: jest.fn().mockReturnValue({ send: jest.fn() })
      }),
      helpers: {
        returnJsonArray: jest.fn((data) => [{ json: data }])
      } as any,
      logger: {
        debug: jest.fn()
      } as any
    };
  });

  describe('Event Validation', () => {
    it('should process PURCHASE_OUT_OF_SHOPPING_CART correctly', async () => {
      // Arrange
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
        event: 'PURCHASE_OUT_OF_SHOPPING_CART',
        data: { purchase: { transaction: 'TEST123' } }
      });
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        if (name === 'mode') return 'standard';
        if (name === 'event') return 'all';
        if (name === 'options') return {};
        return undefined;
      });

      // Act
      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);

      // Assert
      expect(result.workflowData).toBeDefined();
      expect(result.workflowData![0][0].json.event).toBe('PURCHASE_OUT_OF_SHOPPING_CART');
      expect(result.workflowData![0][0].json.eventName).toBe('Abandono de Carrinho');
    });

    it('should handle all defined webhook events', async () => {
      // Test each event in WEBHOOK_EVENTS
      for (const event of WEBHOOK_EVENTS) {
        (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
          event,
          data: { test: true }
        });
        
        (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
          if (name === 'mode') return 'standard';
          if (name === 'event') return 'all';
          if (name === 'options') return {};
          return undefined;
        });

        const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);
        
        expect(result.workflowData).toBeDefined();
        expect(result.workflowData![0][0].json.event).toBe(event);
        
        const eventConfig = EVENT_CONFIG[event as keyof typeof EVENT_CONFIG];
        expect(result.workflowData![0][0].json.eventName).toBe(eventConfig.displayName);
      }
    });
  });

  describe('Smart Mode Event Routing', () => {
    it('should route events to correct outputs in smart mode', async () => {
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        if (name === 'mode') return 'smart';
        if (name === 'options') return {};
        return undefined;
      });

      // Test each event routes to its correct output
      for (const [eventName, config] of Object.entries(EVENT_CONFIG)) {
        (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
          event: eventName,
          data: { test: true }
        });

        const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);
        
        expect(result.workflowData).toBeDefined();
        expect(result.workflowData).toHaveLength(Object.keys(EVENT_CONFIG).length);
        
        // Check event is in correct output index
        expect(result.workflowData![config.smartIndex]).toHaveLength(1);
        expect(result.workflowData![config.smartIndex][0].json.event).toBe(eventName);
      }
    });
  });

  describe('Super Smart Mode Purchase Type Detection', () => {
    beforeEach(() => {
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        if (name === 'mode') return 'superSmart';
        if (name === 'options') return {};
        return undefined;
      });
    });

    it('should detect unique purchase (no subscription)', async () => {
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
        event: 'PURCHASE_APPROVED',
        data: {
          purchase: {
            transaction: 'UNIQUE123',
            value: 97.0,
            installments_number: 1
          }
          // No subscription data
        }
      });

      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);
      
      expect(result.workflowData![0]).toHaveLength(1); // Unique purchase
      expect(result.workflowData![1]).toHaveLength(0); // New subscription
      expect(result.workflowData![2]).toHaveLength(0); // Renewal
      expect(result.workflowData![3]).toHaveLength(0); // Others
    });

    it('should detect new subscription (first payment)', async () => {
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
        event: 'PURCHASE_APPROVED',
        data: {
          purchase: {
            transaction: 'SUB123',
            recurrence_number: 1,
            approved_date: '2023-01-01T10:00:00.000Z'
          },
          subscription: {
            subscriber_code: 'SUB123',
            status: 'ACTIVE',
            subscriber: {
              creation_date: '2023-01-01T10:00:00.000Z'
            }
          }
        }
      });

      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);
      
      expect(result.workflowData![0]).toHaveLength(0); // Unique purchase
      expect(result.workflowData![1]).toHaveLength(1); // New subscription
      expect(result.workflowData![2]).toHaveLength(0); // Renewal
      expect(result.workflowData![3]).toHaveLength(0); // Others
    });

    it('should detect subscription renewal', async () => {
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
        event: 'PURCHASE_APPROVED',
        data: {
          purchase: {
            transaction: 'RENEW123',
            recurrence_number: 5,
            approved_date: '2023-05-01T10:00:00.000Z'
          },
          subscription: {
            subscriber_code: 'SUB123',
            status: 'ACTIVE',
            subscriber: {
              creation_date: '2023-01-01T10:00:00.000Z'
            }
          }
        }
      });

      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);
      
      expect(result.workflowData![0]).toHaveLength(0); // Unique purchase
      expect(result.workflowData![1]).toHaveLength(0); // New subscription
      expect(result.workflowData![2]).toHaveLength(1); // Renewal
      expect(result.workflowData![3]).toHaveLength(0); // Others
    });

    it('should route non-purchase events to others output', async () => {
      const nonPurchaseEvents = [
        'PURCHASE_CANCELED',
        'PURCHASE_REFUNDED',
        'PURCHASE_CHARGEBACK',
        'SUBSCRIPTION_CANCELLATION',
        'CLUB_FIRST_ACCESS'
      ];

      for (const event of nonPurchaseEvents) {
        (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
          event,
          data: { test: true }
        });

        const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);
        
        expect(result.workflowData![0]).toHaveLength(0); // Unique purchase
        expect(result.workflowData![1]).toHaveLength(0); // New subscription
        expect(result.workflowData![2]).toHaveLength(0); // Renewal
        expect(result.workflowData![3]).toHaveLength(1); // Others
      }
    });
  });

  describe('Event Filtering in Standard Mode', () => {
    it('should filter specific events when configured', async () => {
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        if (name === 'mode') return 'standard';
        if (name === 'event') return 'PURCHASE_APPROVED';
        if (name === 'options') return {};
        return undefined;
      });

      // Send a different event
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
        event: 'PURCHASE_CANCELED',
        data: { test: true }
      });

      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);
      
      // Should return webhook response but no workflow data
      expect(result.webhookResponse).toBeDefined();
      expect(result.webhookResponse?.statusCode).toBe(200);
    });

    it('should process matching events', async () => {
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        if (name === 'mode') return 'standard';
        if (name === 'event') return 'PURCHASE_APPROVED';
        if (name === 'options') return {};
        return undefined;
      });

      // Send matching event
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
        event: 'PURCHASE_APPROVED',
        data: { test: true }
      });

      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);
      
      expect(result.workflowData).toBeDefined();
      expect(result.workflowData![0]).toHaveLength(1);
      expect(result.workflowData![0][0].json.event).toBe('PURCHASE_APPROVED');
    });
  });

  describe('Test Event Handling', () => {
    it('should ignore test events when option is enabled', async () => {
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        if (name === 'mode') return 'standard';
        if (name === 'event') return 'all';
        if (name === 'options') return { ignoreTestEvents: true };
        return undefined;
      });

      const testCases = [
        { test_mode: true },
        { data: { test: true } },
        { data: { buyer: { email: 'test@hotmart.com' } } }
      ];

      for (const testData of testCases) {
        (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
          event: 'PURCHASE_APPROVED',
          ...testData
        });

        const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);
        
        expect(result.workflowData).toBeDefined();
        expect(result.workflowData![0]).toHaveLength(0);
      }
    });

    it('should process test events when option is disabled', async () => {
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        if (name === 'mode') return 'standard';
        if (name === 'event') return 'all';
        if (name === 'options') return { ignoreTestEvents: false };
        return undefined;
      });

      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
        event: 'PURCHASE_APPROVED',
        test_mode: true,
        data: { test: true }
      });

      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);
      
      expect(result.workflowData).toBeDefined();
      expect(result.workflowData![0]).toHaveLength(1);
    });
  });
});