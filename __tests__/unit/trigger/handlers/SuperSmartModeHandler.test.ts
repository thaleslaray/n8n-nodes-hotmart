import { SuperSmartModeHandler } from '../../../../nodes/Hotmart/trigger/handlers/SuperSmartModeHandler';
import { createMockWebhookFunctions } from '../../../helpers/triggerHelpers';

describe('SuperSmartModeHandler', () => {
  let handler: SuperSmartModeHandler;
  let mockWebhookFunctions: any;

  beforeEach(() => {
    mockWebhookFunctions = createMockWebhookFunctions();
    handler = new SuperSmartModeHandler(mockWebhookFunctions);
  });

  describe('process', () => {
    describe('Single Purchase Events', () => {
      it('should route PURCHASE_APPROVED without subscription to unique purchase output', async () => {
        mockWebhookFunctions.getBodyData.mockReturnValue({
          event: 'PURCHASE_APPROVED',
          data: {
            purchase: { 
              id: 'pur_123', 
              status: 'approved',
            },
            buyer: { email: 'test@example.com' },
          },
        });
        mockWebhookFunctions.getNodeParameter.mockReturnValue({});

        const result = await handler.process();

        expect(result.workflowData).toBeDefined();
        const workflowData = result.workflowData!;
        expect(workflowData).toHaveLength(4); // 4 outputs total
        expect(workflowData[0]).toHaveLength(1); // Index 0 is unique purchase
        expect(workflowData[0][0].json.event).toBe('PURCHASE_APPROVED');
        expect(workflowData[1]).toHaveLength(0);
        expect(workflowData[2]).toHaveLength(0);
        expect(workflowData[3]).toHaveLength(0);
      });

      it('should route purchase with inactive subscription to other', async () => {
        mockWebhookFunctions.getBodyData.mockReturnValue({
          event: 'PURCHASE_APPROVED',
          data: {
            subscription: { status: 'INACTIVE' },
            purchase: { id: 'pur_123' },
          },
        });
        mockWebhookFunctions.getNodeParameter.mockReturnValue({});

        const result = await handler.process();

        const workflowData = result.workflowData!;
        expect(workflowData[3]).toHaveLength(1); // INACTIVE status goes to OTHER
      });
    });

    describe('New Subscription Events', () => {
      it('should route first payment of active subscription to new subscription output', async () => {
        mockWebhookFunctions.getBodyData.mockReturnValue({
          event: 'PURCHASE_APPROVED',
          data: {
            subscription: {
              status: 'ACTIVE',
              subscriber: {
                creation_date: '2024-01-01',
              },
            },
            purchase: {
              recurrence_number: 1,
              approved_date: '2024-01-01',
            },
          },
        });
        mockWebhookFunctions.getNodeParameter.mockReturnValue({});

        const result = await handler.process();

        const workflowData = result.workflowData!;
        expect(workflowData[1]).toHaveLength(1); // Index 1 is new subscription
        expect(workflowData[0]).toHaveLength(0);
        expect(workflowData[2]).toHaveLength(0);
        expect(workflowData[3]).toHaveLength(0);
      });
    });

    describe('Subscription Renewal Events', () => {
      it('should route subsequent payments to renewal output', async () => {
        mockWebhookFunctions.getBodyData.mockReturnValue({
          event: 'PURCHASE_APPROVED',
          data: {
            subscription: {
              status: 'ACTIVE',
              first_payment_date: '2023-01-01',
            },
            purchase: {
              payment: {
                installments_number: 5, // Not first payment
              },
            },
          },
        });
        mockWebhookFunctions.getNodeParameter.mockReturnValue({});

        const result = await handler.process();

        const workflowData = result.workflowData!;
        expect(workflowData[2]).toHaveLength(1); // Index 2 is renewal
      });

      it('should detect renewal by transaction dates', async () => {
        mockWebhookFunctions.getBodyData.mockReturnValue({
          event: 'PURCHASE_APPROVED',
          data: {
            subscription: {
              status: 'ACTIVE',
            },
            purchase: {
              transaction: {
                dates: ['2023-01-01', '2023-02-01', '2023-03-01'], // Multiple dates = renewal
              },
            },
          },
        });
        mockWebhookFunctions.getNodeParameter.mockReturnValue({});

        const result = await handler.process();

        const workflowData = result.workflowData!;
        expect(workflowData[2]).toHaveLength(1);
      });
    });

    describe('Other Events', () => {
      it('should route non-purchase events to other output', async () => {
        mockWebhookFunctions.getBodyData.mockReturnValue({
          event: 'SUBSCRIPTION_CANCELLATION',
          data: {
            subscription: { id: 'sub_123' },
          },
        });
        mockWebhookFunctions.getNodeParameter.mockReturnValue({});

        const result = await handler.process();

        const workflowData = result.workflowData!;
        expect(workflowData[3]).toHaveLength(1); // Index 3 is other
      });

      it('should route PURCHASE_CANCELED to other output', async () => {
        mockWebhookFunctions.getBodyData.mockReturnValue({
          event: 'PURCHASE_CANCELED',
          data: {
            purchase: { id: 'pur_123' },
          },
        });
        mockWebhookFunctions.getNodeParameter.mockReturnValue({});

        const result = await handler.process();

        const workflowData = result.workflowData!;
        expect(workflowData[3]).toHaveLength(1);
      });

      it('should route unknown events to other output', async () => {
        mockWebhookFunctions.getBodyData.mockReturnValue({
          event: 'UNKNOWN_EVENT',
          data: { test: 'data' },
        });
        mockWebhookFunctions.getNodeParameter.mockReturnValue({});

        const result = await handler.process();

        const workflowData = result.workflowData!;
        expect(workflowData[3]).toHaveLength(1);
      });
    });

    describe('Edge Cases', () => {
      it('should handle missing data gracefully', async () => {
        mockWebhookFunctions.getBodyData.mockReturnValue({
          event: 'PURCHASE_APPROVED',
          // No data field
        });
        mockWebhookFunctions.getNodeParameter.mockReturnValue({});

        const result = await handler.process();

        const workflowData = result.workflowData!;
        expect(workflowData[0]).toHaveLength(1); // Should default to unique purchase
      });

      it('should handle subscription without status', async () => {
        mockWebhookFunctions.getBodyData.mockReturnValue({
          event: 'PURCHASE_APPROVED',
          data: {
            subscription: { id: 'sub_123' }, // No status field
          },
        });
        mockWebhookFunctions.getNodeParameter.mockReturnValue({});

        const result = await handler.process();

        const workflowData = result.workflowData!;
        expect(workflowData[0]).toHaveLength(1); // Should treat as unique purchase
      });

      it('should handle events with null purchase object', async () => {
        mockWebhookFunctions.getBodyData.mockReturnValue({
          event: 'PURCHASE_APPROVED',
          data: {
            purchase: null,
            subscription: {
              subscriber: {
                creation_date: '2024-01-01T10:00:00Z'
              }
            }
          },
        });
        mockWebhookFunctions.getNodeParameter.mockReturnValue({
          events: ['ALL_EVENTS'],
        });

        const result = await handler.process();

        const workflowData = result.workflowData!;
        expect(workflowData[0]).toHaveLength(1); // Unique purchase (no subscription status)
      });

      it('should handle events with null subscription object', async () => {
        mockWebhookFunctions.getBodyData.mockReturnValue({
          event: 'PURCHASE_APPROVED',
          data: {
            purchase: {
              payment: { type: 'CREDIT_CARD' },
              status: 'APPROVED'
            },
            subscription: null
          },
        });
        mockWebhookFunctions.getNodeParameter.mockReturnValue({
          events: ['ALL_EVENTS'],
        });

        const result = await handler.process();

        const workflowData = result.workflowData!;
        expect(workflowData[0]).toHaveLength(1); // Unique purchase
      });

      it('should detect first payment when creation_date equals approved_date', async () => {
        const testDate = '2024-01-01T10:00:00Z';
        mockWebhookFunctions.getBodyData.mockReturnValue({
          event: 'PURCHASE_APPROVED',
          data: {
            purchase: {
              payment: { type: 'CREDIT_CARD' },
              approved_date: testDate
            },
            subscription: {
              status: 'ACTIVE',
              subscriber: {
                creation_date: testDate
              }
            }
          },
        });
        mockWebhookFunctions.getNodeParameter.mockReturnValue({
          events: ['ALL_EVENTS'],
        });

        const result = await handler.process();

        const workflowData = result.workflowData!;
        expect(workflowData[1]).toHaveLength(1); // New subscription
      });

      it('should detect first payment when installments_number is 1 and no previous payments', async () => {
        mockWebhookFunctions.getBodyData.mockReturnValue({
          event: 'PURCHASE_APPROVED',
          data: {
            purchase: {
              payment: { type: 'CREDIT_CARD' },
              installments_number: 1,
              has_previous_payments: false
            },
            subscription: {
              status: 'ACTIVE'
            }
          },
        });
        mockWebhookFunctions.getNodeParameter.mockReturnValue({
          events: ['ALL_EVENTS'],
        });

        const result = await handler.process();

        const workflowData = result.workflowData!;
        expect(workflowData[1]).toHaveLength(1); // New subscription
      });
    });

    describe('Validation Integration', () => {
      it('should return error when validation fails', async () => {
        mockWebhookFunctions.getBodyData.mockReturnValue(null);

        const result = await handler.process();

        expect(result.webhookResponse).toBeDefined();
        expect(result.webhookResponse.body).toContain('Invalid webhook body');
      });

      it('should ignore test events when configured', async () => {
        mockWebhookFunctions.getBodyData.mockReturnValue({
          event: 'PURCHASE_APPROVED',
          test_mode: true,
          data: { test: 'data' },
        });
        mockWebhookFunctions.getNodeParameter.mockReturnValue({
          ignoreTestEvents: true,
        });

        const result = await handler.process();

        expect(result.workflowData).toEqual([[]]);
      });
    });
  });

  describe('getDescription', () => {
    it('should return handler description', () => {
      // Create a test class that exposes the protected method
      class TestableSuperSmartModeHandler extends SuperSmartModeHandler {
        public testGetDescription() {
          return this.getDescription();
        }
      }
      
      const testHandler = new TestableSuperSmartModeHandler(mockWebhookFunctions);
      const description = testHandler.testGetDescription();
      
      expect(description).toBe('Modo Super Smart - separando por tipo de compra');
    });
  });
});