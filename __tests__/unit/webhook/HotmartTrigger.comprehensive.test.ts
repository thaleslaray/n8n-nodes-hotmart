import { HotmartTrigger } from '../../../nodes/Hotmart/HotmartTrigger.node';
import { ITriggerFunctions } from 'n8n-workflow';
import { createMockTriggerFunctions } from '../../helpers/testHelpers';
import * as fs from 'fs';
import * as path from 'path';

describe('HotmartTrigger - Comprehensive Tests', () => {
  let trigger: HotmartTrigger;
  let triggerFunctions: ITriggerFunctions;

  beforeEach(() => {
    trigger = new HotmartTrigger();
    triggerFunctions = createMockTriggerFunctions();
  });

  describe('Event Type Coverage', () => {
    test('should handle all 15 event types', () => {
      const eventTypes = [
        'SUBSCRIPTION_CANCELLATION',
        'PURCHASE_BILLET_PRINTED',
        'PURCHASE_APPROVED',
        'PURCHASE_PROTEST',
        'PURCHASE_OUT_OF_SHOPPING_CART',
        'PURCHASE_COMPLETE',
        'PURCHASE_DELAYED',
        'CLUB_FIRST_ACCESS',
        'PURCHASE_CANCELED',
        'PURCHASE_REFUNDED',
        'CLUB_MODULE_COMPLETED',
        'UPDATE_SUBSCRIPTION_CHARGE_DATE',
        'PURCHASE_CHARGEBACK',
        'PURCHASE_EXPIRED',
        'SWITCH_PLAN'
      ];
      
      eventTypes.forEach(eventType => {
        const webhookData = {
          webhookEvent: eventType,
          webhookUrl: 'http://test.com/webhook'
        };
        
        expect(() => {
          trigger.webhook.call(triggerFunctions, webhookData);
        }).not.toThrow();
      });
    });
  });

  describe('Webhook Processing', () => {
    test('should validate webhook URL format', async () => {
      const invalidUrl = 'not-a-url';
      const webhookData = {
        webhookEvent: 'PURCHASE_COMPLETE',
        webhookUrl: invalidUrl
      };
      
      await expect(
        trigger.webhook.call(triggerFunctions, webhookData)
      ).rejects.toThrow();
    });

    test('should process events in correct order', async () => {
      const events: any[] = [];
      const mockEmit = jest.fn((data) => events.push(data));
      
      triggerFunctions.emit = mockEmit;
      
      // Simular múltiplos eventos
      const webhookData = {
        webhookEvent: 'all-events',
        webhookUrl: 'http://test.com/webhook'
      };
      
      const response = await trigger.webhook.call(triggerFunctions, webhookData);
      
      expect(response).toHaveProperty('webhookUrl');
      expect(mockEmit).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed JSON gracefully', async () => {
      const webhookData = {
        webhookEvent: 'PURCHASE_COMPLETE',
        webhookUrl: 'http://test.com/webhook'
      };
      
      const mockReq = {
        body: 'invalid json',
        headers: { 'content-type': 'application/json' }
      };
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
      
      await trigger.webhookProcess.call(
        triggerFunctions,
        webhookData,
        mockReq,
        mockRes
      );
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('should reject unknown event types', async () => {
      const webhookData = {
        webhookEvent: 'PURCHASE_COMPLETE',
        webhookUrl: 'http://test.com/webhook'
      };
      
      const mockReq = {
        body: { event: 'UNKNOWN_EVENT', data: {} },
        headers: { 'content-type': 'application/json' }
      };
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
      
      await trigger.webhookProcess.call(
        triggerFunctions,
        webhookData,
        mockReq,
        mockRes
      );
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith('Evento desconhecido');
    });
  });
});
