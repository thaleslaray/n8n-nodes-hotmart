import { SmartModeHandler } from '../../../../nodes/Hotmart/trigger/handlers/SmartModeHandler';
import { createMockWebhookFunctions } from '../../../helpers/triggerHelpers';
import { EVENT_CONFIG } from '../../../../nodes/Hotmart/trigger/constants/events';

describe('SmartModeHandler', () => {
  let handler: SmartModeHandler;
  let mockWebhookFunctions: any;

  beforeEach(() => {
    mockWebhookFunctions = createMockWebhookFunctions();
    handler = new SmartModeHandler(mockWebhookFunctions);
  });

  describe('process', () => {
    it('should process PURCHASE_APPROVED event correctly', async () => {
      mockWebhookFunctions.getBodyData.mockReturnValue({
        event: 'PURCHASE_APPROVED',
        data: {
          purchase: { id: 'pur_123', status: 'approved' },
          buyer: { email: 'test@example.com' },
        },
      });
      mockWebhookFunctions.getNodeParameter.mockReturnValue({});

      const result = await handler.process();

      expect(result.workflowData).toBeDefined();
      const workflowData = result.workflowData!;
      
      // Find the index for PURCHASE_APPROVED
      const eventIndex = EVENT_CONFIG.PURCHASE_APPROVED.smartIndex;
      expect(workflowData[eventIndex]).toHaveLength(1);
      expect(workflowData[eventIndex][0].json.event).toBe('PURCHASE_APPROVED');
      
      // Other outputs should be empty
      workflowData.forEach((output, index) => {
        if (index !== eventIndex) {
          expect(output).toHaveLength(0);
        }
      });
    });

    it('should process PURCHASE_CANCELED event correctly', async () => {
      mockWebhookFunctions.getBodyData.mockReturnValue({
        event: 'PURCHASE_CANCELED',
        data: {
          purchase: { id: 'pur_456', status: 'canceled' },
        },
      });
      mockWebhookFunctions.getNodeParameter.mockReturnValue({});

      const result = await handler.process();

      const workflowData = result.workflowData!;
      const eventIndex = EVENT_CONFIG.PURCHASE_CANCELED.smartIndex;
      
      expect(workflowData[eventIndex]).toHaveLength(1);
      expect(workflowData[eventIndex][0].json.event).toBe('PURCHASE_CANCELED');
    });

    it('should handle unknown event', async () => {
      mockWebhookFunctions.getBodyData.mockReturnValue({
        event: 'UNKNOWN_EVENT',
        data: {
          test: 'data',
        },
      });
      mockWebhookFunctions.getNodeParameter.mockReturnValue({});

      const result = await handler.process();

      // All outputs should be empty for unknown event
      const workflowData = result.workflowData!;
      workflowData.forEach(output => {
        expect(output).toHaveLength(0);
      });
    });

    it('should return error when validation fails', async () => {
      mockWebhookFunctions.getBodyData.mockReturnValue(null);

      const result = await handler.process();

      expect(result.webhookResponse).toBeDefined();
      expect(result.webhookResponse.body).toContain('Invalid webhook body');
    });

    it('should handle all configured events', async () => {
      // Test each event in EVENT_CONFIG
      const events = Object.keys(EVENT_CONFIG);
      
      for (const event of events) {
        mockWebhookFunctions.getBodyData.mockReturnValue({
          event,
          data: { test: 'data' },
        });

        const result = await handler.process();
        const workflowData = result.workflowData!;
        const expectedIndex = EVENT_CONFIG[event as keyof typeof EVENT_CONFIG].smartIndex;
        
        if (expectedIndex !== undefined) {
          expect(workflowData[expectedIndex]).toHaveLength(1);
          expect(workflowData[expectedIndex][0].json.event).toBe(event);
        }
      }
    });

    it('should have correct number of outputs', async () => {
      mockWebhookFunctions.getBodyData.mockReturnValue({
        event: 'PURCHASE_APPROVED',
        data: { test: 'data' },
      });
      mockWebhookFunctions.getNodeParameter.mockReturnValue({});

      const result = await handler.process();

      const totalOutputs = Object.keys(EVENT_CONFIG).length;
      expect(result.workflowData).toHaveLength(totalOutputs);
    });
  });

  describe('integration with validation', () => {
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

  describe('getDescription', () => {
    it('should return handler description', () => {
      // Create a test class that exposes the protected method
      class TestableSmartModeHandler extends SmartModeHandler {
        public testGetDescription() {
          return this.getDescription();
        }
      }
      
      const testHandler = new TestableSmartModeHandler(mockWebhookFunctions);
      const description = testHandler.testGetDescription();
      
      expect(description).toContain('Modo Smart - separando eventos em');
    });
  });
});