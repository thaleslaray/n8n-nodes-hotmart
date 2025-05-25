import { BaseWebhookHandler } from '../../../../nodes/Hotmart/trigger/handlers/BaseWebhookHandler';
import { createMockWebhookFunctions } from '../../../helpers/triggerHelpers';
import type { IWebhookResponseData } from 'n8n-workflow';

// Create a concrete implementation for testing
class TestHandler extends BaseWebhookHandler {
  protected getDescription(): string {
    return 'Test Handler';
  }
  
  async process(): Promise<IWebhookResponseData> {
    return {
      workflowData: [
        [
          {
            json: {
              test: true,
            },
          },
        ],
      ],
    };
  }
  
  // Expose protected methods for testing
  public async testValidate() {
    return this.validate();
  }
  
  public testIsTestEvent(body: any) {
    return this.isTestEvent(body);
  }
  
  public testLogDebug(message: string, data?: any) {
    return this.logDebug(message, data);
  }
}

describe('BaseWebhookHandler', () => {
  let handler: TestHandler;
  let mockWebhookFunctions: any;

  beforeEach(() => {
    mockWebhookFunctions = createMockWebhookFunctions();
    handler = new TestHandler(mockWebhookFunctions);
  });

  describe('validate', () => {
    it('should validate successfully with correct structure', async () => {
      mockWebhookFunctions.getBodyData.mockReturnValue({
        event: 'PURCHASE_APPROVED',
        data: {
          subscription: { id: 'sub_123' },
          purchase: { approved_date: 1234567890 },
        },
      });
      mockWebhookFunctions.getNodeParameter.mockReturnValue({});

      const result = await handler.testValidate();

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should fail validation when body is empty', async () => {
      mockWebhookFunctions.getBodyData.mockReturnValue(null);

      const result = await handler.testValidate();

      expect(result.success).toBe(false);
      expect(result.error?.webhookResponse.body).toContain('Invalid webhook body');
      expect(result.error?.webhookResponse.statusCode).toBe(400);
    });

    it('should fail validation when body is not an object', async () => {
      mockWebhookFunctions.getBodyData.mockReturnValue('string body');

      const result = await handler.testValidate();

      expect(result.success).toBe(false);
      expect(result.error?.webhookResponse.body).toContain('Invalid webhook body');
    });

    it('should ignore test events when option is enabled', async () => {
      mockWebhookFunctions.getBodyData.mockReturnValue({
        event: 'PURCHASE_APPROVED',
        test_mode: true,
        data: { test: 'data' },
      });
      mockWebhookFunctions.getNodeParameter.mockReturnValue({
        ignoreTestEvents: true,
      });

      const result = await handler.testValidate();

      expect(result.success).toBe(false);
      expect(result.error?.workflowData).toEqual([[]]);
    });

    it('should not ignore test events when option is disabled', async () => {
      mockWebhookFunctions.getBodyData.mockReturnValue({
        event: 'PURCHASE_APPROVED',
        test_mode: true,
        data: { test: 'data' },
      });
      mockWebhookFunctions.getNodeParameter.mockReturnValue({
        ignoreTestEvents: false,
      });

      const result = await handler.testValidate();

      expect(result.success).toBe(true);
    });
  });

  describe('isTestEvent', () => {
    it('should detect test_mode flag', () => {
      const result = handler.testIsTestEvent({
        test_mode: true,
        data: {},
      });

      expect(result).toBe(true);
    });

    it('should detect test flag in data', () => {
      const result = handler.testIsTestEvent({
        data: { test: true },
      });

      expect(result).toBe(true);
    });

    it('should detect test email', () => {
      const result = handler.testIsTestEvent({
        data: {
          buyer: { email: 'test@example.com' },
        },
      });

      expect(result).toBe(true);
    });

    it('should not detect regular events as test', () => {
      const result = handler.testIsTestEvent({
        event: 'PURCHASE_APPROVED',
        data: {
          buyer: { email: 'real@customer.com' },
          purchase: { id: 'pur_123' },
        },
      });

      expect(result).toBe(false);
    });

    it('should handle missing data gracefully', () => {
      const result = handler.testIsTestEvent({});
      expect(result).toBe(false);
    });

    it('should handle null buyer', () => {
      const result = handler.testIsTestEvent({
        data: { buyer: null },
      });
      expect(result).toBe(false);
    });
  });

  describe('handleError', () => {
    it('should handle error with message', () => {
      const error = new Error('Test error message');

      const result = handler.handleError(error);

      expect(result.webhookResponse).toContain('Test error message');
      expect(result.workflowData).toBeDefined();
      expect(result.workflowData?.[0][0].json.error).toBe('Test error message');
      expect(result.workflowData?.[0][0].json.timestamp).toBeDefined();
    });

    it('should handle error without message', () => {
      const error = new Error();

      const result = handler.handleError(error);

      expect(result.webhookResponse).toContain('Unknown error occurred');
      expect(result.workflowData?.[0][0].json.error).toBe('Unknown error occurred');
    });

    it('should include timestamp in error response', () => {
      const error = new Error('Test error');
      const beforeTime = new Date().toISOString();
      
      const result = handler.handleError(error);
      
      const afterTime = new Date().toISOString();
      const timestamp = result.workflowData?.[0][0].json.timestamp as string;
      
      expect(new Date(timestamp).getTime()).toBeGreaterThanOrEqual(new Date(beforeTime).getTime());
      expect(new Date(timestamp).getTime()).toBeLessThanOrEqual(new Date(afterTime).getTime());
    });
  });

  describe('logDebug', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalLog = console.log;

    beforeEach(() => {
      console.log = jest.fn();
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
      console.log = originalLog;
    });

    it('should log in development environment', () => {
      process.env.NODE_ENV = 'development';

      handler.testLogDebug('Test message', { data: 'test' });

      expect(console.log).toHaveBeenCalledWith(
        '[HotmartTrigger] Test message',
        { data: 'test' }
      );
    });

    it('should not log in production environment', () => {
      process.env.NODE_ENV = 'production';

      handler.testLogDebug('Test message', { data: 'test' });

      expect(console.log).not.toHaveBeenCalled();
    });

    it('should handle missing data parameter', () => {
      process.env.NODE_ENV = 'development';

      handler.testLogDebug('Test message');

      expect(console.log).toHaveBeenCalledWith(
        '[HotmartTrigger] Test message',
        ''
      );
    });
  });

  describe('process', () => {
    it('should return expected response', async () => {
      const result = await handler.process();

      expect(result.workflowData).toBeDefined();
      expect(result.workflowData?.[0][0].json.test).toBe(true);
    });
  });
});