import { StandardModeHandler } from '../../../../nodes/Hotmart/trigger/handlers/StandardModeHandler';
import type { IWebhookFunctions, IDataObject } from 'n8n-workflow';

// Mock the webhook context
function createMockWebhookContext(overrides?: Partial<IWebhookFunctions>): IWebhookFunctions {
  return {
    getBodyData: jest.fn().mockReturnValue({ event: 'PURCHASE_APPROVED', data: {} }),
    getHeaderData: jest.fn().mockReturnValue({ 'x-hotmart-hottok': 'valid-token' }),
    getWorkflowStaticData: jest.fn().mockReturnValue({ hotTokToken: 'valid-token' }),
    getNodeParameter: jest.fn().mockImplementation((name: string, defaultValue?: any) => {
      const params: IDataObject = {
        triggerMode: 'standard',
        event: '*',
        useHotTokToken: true,
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

  describe('validation', () => {
    it('should pass validation with correct token', async () => {
      const result = await handler.validate();
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should fail validation with incorrect token', async () => {
      (mockContext.getHeaderData as jest.Mock).mockReturnValue({ 
        'x-hotmart-hottok': 'wrong-token' 
      });
      
      handler = new StandardModeHandler(mockContext);
      const result = await handler.validate();
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockContext.getResponseObject().status).toHaveBeenCalledWith(401);
    });

    it('should fail validation with unknown event', async () => {
      (mockContext.getBodyData as jest.Mock).mockReturnValue({ 
        event: 'UNKNOWN_EVENT', 
        data: {} 
      });
      
      handler = new StandardModeHandler(mockContext);
      const result = await handler.validate();
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockContext.getResponseObject().status).toHaveBeenCalledWith(400);
    });

    it('should pass validation when token validation is disabled', async () => {
      (mockContext.getNodeParameter as jest.Mock).mockImplementation((name: string) => {
        if (name === 'useHotTokToken') return false;
        if (name === 'event') return '*';
        return 'standard';
      });
      
      (mockContext.getHeaderData as jest.Mock).mockReturnValue({}); // No token
      
      handler = new StandardModeHandler(mockContext);
      const result = await handler.validate();
      
      expect(result.success).toBe(true);
    });
  });

  describe('process', () => {
    it('should process all events when * is selected', async () => {
      const result = await handler.process();
      
      expect(result.workflowData).toBeDefined();
      expect(result.workflowData![0]).toHaveLength(1);
      expect(result.workflowData![0][0].json).toMatchObject({
        event: 'PURCHASE_APPROVED',
        eventType: 'PURCHASE_APPROVED',
        eventName: 'Compra Aprovada',
        eventCategory: 'purchase',
        isSubscription: false,
      });
    });

    it('should process specific event when selected', async () => {
      (mockContext.getNodeParameter as jest.Mock).mockImplementation((name: string) => {
        if (name === 'event') return 'PURCHASE_APPROVED';
        if (name === 'useHotTokToken') return true;
        return 'standard';
      });
      
      const result = await handler.process();
      
      expect(result.workflowData).toBeDefined();
    });

    it('should reject event that does not match selection', async () => {
      (mockContext.getNodeParameter as jest.Mock).mockImplementation((name: string) => {
        if (name === 'event') return 'PURCHASE_COMPLETE';
        if (name === 'useHotTokToken') return true;
        return 'standard';
      });
      
      const result = await handler.process();
      
      expect(result.noWebhookResponse).toBe(true);
      expect(mockContext.getResponseObject().status).toHaveBeenCalledWith(400);
    });

    it('should detect subscription events correctly', async () => {
      (mockContext.getBodyData as jest.Mock).mockReturnValue({
        event: 'SUBSCRIPTION_CANCELLATION',
        data: { subscription: { subscriber: { code: 'SUB123' } } }
      });
      
      handler = new StandardModeHandler(mockContext);
      const result = await handler.process();
      
      expect(result.workflowData![0][0].json.isSubscription).toBe(true);
    });

    it('should include metadata in response', async () => {
      const result = await handler.process();
      
      expect(result.workflowData![0][0].json.metadata).toBeDefined();
      expect(result.workflowData![0][0].json.metadata).toMatchObject({
        hottok: 'valid-token',
        headers: { 'x-hotmart-hottok': 'valid-token' },
      });
    });

    it('should include timestamp in response', async () => {
      const before = new Date().toISOString();
      const result = await handler.process();
      const after = new Date().toISOString();
      
      const receivedAt = result.workflowData![0][0].json.receivedAt as string;
      expect(new Date(receivedAt).getTime()).toBeGreaterThanOrEqual(new Date(before).getTime());
      expect(new Date(receivedAt).getTime()).toBeLessThanOrEqual(new Date(after).getTime());
    });
  });

  describe('error handling', () => {
    it('should handle errors gracefully', () => {
      const error = new Error('Test error');
      const result = handler.handleError(error);
      
      expect(result.noWebhookResponse).toBe(true);
      expect(mockContext.logger.error).toHaveBeenCalledWith(
        '[HotmartTrigger] Webhook error:',
        { error: 'Test error' }
      );
      expect(mockContext.getResponseObject().status).toHaveBeenCalledWith(500);
    });
  });
});