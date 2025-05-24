import { HotmartTrigger } from '../../../nodes/Hotmart/HotmartTrigger.node';
import { IWebhookFunctions } from 'n8n-workflow';

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
    it('should process PURCHASE_OUT_OF_SHOPPING_CART (event 0) correctly', async () => {
      // Arrange
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
        event: 'PURCHASE_OUT_OF_SHOPPING_CART',
        data: { purchase: { transaction: 'TEST123' } }
      });
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        const params: any = {
          triggerMode: 'standard',
          event: '*',
          useHotTokToken: false
        };
        return params[name];
      });

      // Act
      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);

      // Assert
      expect(result.workflowData).toBeDefined();
      expect(result.workflowData![0][0].json).toMatchObject({
        eventName: 'Abandono de Carrinho',
        eventType: 'PURCHASE_OUT_OF_SHOPPING_CART',
        eventCategory: 'purchase'
      });
    });

    it('should reject unknown events', async () => {
      // Arrange
      const responseObj = {
        status: jest.fn().mockReturnValue({ send: jest.fn() })
      };
      (mockWebhookFunctions.getResponseObject as jest.Mock).mockReturnValue(responseObj);
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
        event: 'UNKNOWN_EVENT'
      });
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockReturnValue('standard');

      // Act
      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);

      // Assert
      expect(responseObj.status).toHaveBeenCalledWith(400);
      expect(result.noWebhookResponse).toBe(true);
    });

    it('should reject empty event', async () => {
      // Arrange
      const responseObj = {
        status: jest.fn().mockReturnValue({ send: jest.fn() })
      };
      (mockWebhookFunctions.getResponseObject as jest.Mock).mockReturnValue(responseObj);
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
        event: ''
      });
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockReturnValue('standard');

      // Act
      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);

      // Assert
      expect(responseObj.status).toHaveBeenCalledWith(400);
      expect(result.noWebhookResponse).toBe(true);
    });
  });

  describe('Standard Mode - New System', () => {
    beforeEach(() => {
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        const params: any = {
          triggerMode: 'standard',
          useHotTokToken: false
        };
        return params[name];
      });
    });

    it('should process specific event when selected', async () => {
      // Arrange
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
        event: 'PURCHASE_APPROVED',
        data: { purchase: { transaction: 'TEST456' } }
      });
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        const params: any = {
          triggerMode: 'standard',
          event: 'PURCHASE_APPROVED',
          useHotTokToken: false
        };
        return params[name];
      });

      // Act
      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);

      // Assert
      expect(result.workflowData).toBeDefined();
      expect(result.workflowData![0][0].json).toMatchObject({
        eventName: 'Compra Aprovada',
        eventType: 'PURCHASE_APPROVED',
        eventCategory: 'purchase'
      });
    });

    it('should reject event when not matching selected event', async () => {
      // Arrange
      const responseObj = {
        status: jest.fn().mockReturnValue({ send: jest.fn() })
      };
      (mockWebhookFunctions.getResponseObject as jest.Mock).mockReturnValue(responseObj);
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
        event: 'PURCHASE_CANCELED'
      });
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        const params: any = {
          triggerMode: 'standard',
          event: 'PURCHASE_APPROVED', // Different event selected
          useHotTokToken: false
        };
        return params[name];
      });

      // Act
      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);

      // Assert
      expect(responseObj.status).toHaveBeenCalledWith(400);
      expect(result.noWebhookResponse).toBe(true);
    });

    it('should include all metadata in response', async () => {
      // Arrange
      const headerData = { 'x-hotmart-hottok': 'test-token' };
      (mockWebhookFunctions.getHeaderData as jest.Mock).mockReturnValue(headerData);
      (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
        event: 'SUBSCRIPTION_CANCELLATION',
        data: { 
          subscription: { 
            subscriber: { code: 'SUB123' },
            status: 'CANCELLED'
          } 
        }
      });
      (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
        const params: any = {
          triggerMode: 'standard',
          event: '*',
          useHotTokToken: false
        };
        return params[name];
      });

      // Act
      const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);

      // Assert
      expect(result.workflowData).toBeDefined();
      const returnedData = result.workflowData![0][0].json;
      expect(returnedData).toMatchObject({
        eventName: 'Assinatura Cancelada',
        eventType: 'SUBSCRIPTION_CANCELLATION',
        eventCategory: 'subscription',
        isSubscription: true,
        metadata: {
          hottok: 'test-token',
          headers: headerData
        }
      });
      expect(returnedData.receivedAt).toBeDefined();
    });
  });

  describe('Event Categories', () => {
    it('should correctly categorize purchase events', async () => {
      const purchaseEvents = [
        'PURCHASE_OUT_OF_SHOPPING_CART',
        'PURCHASE_APPROVED',
        'PURCHASE_COMPLETE',
        'PURCHASE_CANCELED',
        'PURCHASE_REFUNDED'
      ];

      for (const event of purchaseEvents) {
        (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
          event,
          data: {}
        });
        (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
          const params: any = {
            triggerMode: 'standard',
            event: '*',
            useHotTokToken: false
          };
          return params[name];
        });

        const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);
        expect(result.workflowData![0][0].json.eventCategory).toBe('purchase');
      }
    });

    it('should correctly categorize subscription events', async () => {
      const subscriptionEvents = [
        'SUBSCRIPTION_CANCELLATION',
        'SWITCH_PLAN',
        'UPDATE_SUBSCRIPTION_CHARGE_DATE'
      ];

      for (const event of subscriptionEvents) {
        (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
          event,
          data: {}
        });
        (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
          const params: any = {
            triggerMode: 'standard',
            event: '*',
            useHotTokToken: false
          };
          return params[name];
        });

        const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);
        expect(result.workflowData![0][0].json.eventCategory).toBe('subscription');
      }
    });

    it('should correctly categorize club events', async () => {
      const clubEvents = [
        'CLUB_FIRST_ACCESS',
        'CLUB_MODULE_COMPLETED'
      ];

      for (const event of clubEvents) {
        (mockWebhookFunctions.getBodyData as jest.Mock).mockReturnValue({
          event,
          data: {}
        });
        (mockWebhookFunctions.getNodeParameter as jest.Mock).mockImplementation((name) => {
          const params: any = {
            triggerMode: 'standard',
            event: '*',
            useHotTokToken: false
          };
          return params[name];
        });

        const result = await hotmartTrigger.webhook.call(mockWebhookFunctions as IWebhookFunctions);
        expect(result.workflowData![0][0].json.eventCategory).toBe('club');
      }
    });
  });
});