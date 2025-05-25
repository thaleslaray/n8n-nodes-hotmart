import { HotmartTrigger } from '../../../nodes/Hotmart/HotmartTrigger.node';
import { HotmartTriggerV2 } from '../../../nodes/Hotmart/trigger/HotmartTriggerV2.node';
import { HandlerFactory } from '../../../nodes/Hotmart/trigger/handlers/HandlerFactory';
import { StandardModeHandler } from '../../../nodes/Hotmart/trigger/handlers/StandardModeHandler';
import { SmartModeHandler } from '../../../nodes/Hotmart/trigger/handlers/SmartModeHandler';
import { SuperSmartModeHandler } from '../../../nodes/Hotmart/trigger/handlers/SuperSmartModeHandler';

describe('HotmartTrigger Modular', () => {
  describe('Module Exports', () => {
    it('should export HotmartTriggerV2 as HotmartTrigger', () => {
      expect(HotmartTrigger).toBe(HotmartTriggerV2);
    });

    it('should have correct node type properties', () => {
      const instance = new HotmartTrigger();
      expect(instance.description.name).toBe('hotmartTrigger');
      expect(instance.description.displayName).toBe('Hotmart Trigger');
      expect(instance.description.group).toContain('trigger');
    });
  });

  describe('HandlerFactory', () => {
    const mockWebhookFunctions = {
      getNodeParameter: jest.fn(),
      getHeaderData: jest.fn(),
      getBodyData: jest.fn(),
      getResponseObject: jest.fn(),
      helpers: {
        returnJsonArray: jest.fn(),
      },
    };

    it('should create StandardModeHandler for standard mode', () => {
      const handler = HandlerFactory.create('standard', mockWebhookFunctions as any);
      expect(handler).toBeInstanceOf(StandardModeHandler);
    });

    it('should create SmartModeHandler for smart mode', () => {
      const handler = HandlerFactory.create('smart', mockWebhookFunctions as any);
      expect(handler).toBeInstanceOf(SmartModeHandler);
    });

    it('should create SuperSmartModeHandler for superSmart mode', () => {
      const handler = HandlerFactory.create('superSmart', mockWebhookFunctions as any);
      expect(handler).toBeInstanceOf(SuperSmartModeHandler);
    });

    it('should throw error for invalid mode', () => {
      expect(() => HandlerFactory.create('invalid', mockWebhookFunctions as any))
        .toThrow('Modo de trigger inválido: invalid');
    });
  });

  describe('Webhook Methods', () => {
    const instance = new HotmartTrigger();
    
    describe('checkExists', () => {
      it('should return true when webhookId exists', async () => {
        const mockHookFunctions = {
          getWorkflowStaticData: jest.fn().mockReturnValue({ webhookId: 'test-id' }),
        };

        const result = await instance.webhookMethods.default.checkExists.call(mockHookFunctions as any);
        expect(result).toBe(true);
      });

      it('should return false when webhookId does not exist', async () => {
        const mockHookFunctions = {
          getWorkflowStaticData: jest.fn().mockReturnValue({}),
        };

        const result = await instance.webhookMethods.default.checkExists.call(mockHookFunctions as any);
        expect(result).toBe(false);
      });
    });

    describe('create', () => {
      it('should create webhook and store URL', async () => {
        const webhookData = {};
        const mockHookFunctions = {
          getNodeWebhookUrl: jest.fn().mockReturnValue('http://test.com/webhook'),
          getWorkflowStaticData: jest.fn().mockReturnValue(webhookData),
        };

        const result = await instance.webhookMethods.default.create.call(mockHookFunctions as any);
        
        expect(result).toBe(true);
        expect(webhookData).toHaveProperty('webhookId', 'http://test.com/webhook');
      });
    });

    describe('delete', () => {
      it('should delete webhook when it exists', async () => {
        const webhookData = { webhookId: 'test-id' };
        const mockHookFunctions = {
          getWorkflowStaticData: jest.fn().mockReturnValue(webhookData),
        };

        const result = await instance.webhookMethods.default.delete.call(mockHookFunctions as any);
        
        expect(result).toBe(true);
        expect(webhookData).not.toHaveProperty('webhookId');
      });

      it('should return true even when webhook does not exist', async () => {
        const webhookData = {};
        const mockHookFunctions = {
          getWorkflowStaticData: jest.fn().mockReturnValue(webhookData),
        };

        const result = await instance.webhookMethods.default.delete.call(mockHookFunctions as any);
        expect(result).toBe(true);
      });
    });
  });

  describe('File Size Verification', () => {
    it('should have main file under 100 lines', async () => {
      const fs = require('fs');
      const path = require('path');
      
      const filePath = path.join(__dirname, '../../../nodes/Hotmart/HotmartTrigger.node.ts');
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').length;
      
      expect(lines).toBeLessThan(100);
    });

    it('should have modularized files under 300 lines each', async () => {
      const fs = require('fs');
      const path = require('path');
      
      const files = [
        'trigger/HotmartTriggerV2.node.ts',
        'trigger/HotmartTriggerDescription.ts',
        'trigger/handlers/StandardModeHandler.ts',
        'trigger/handlers/SmartModeHandler.ts',
        'trigger/handlers/SuperSmartModeHandler.ts',
      ];
      
      for (const file of files) {
        const filePath = path.join(__dirname, '../../../nodes/Hotmart', file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          const lines = content.split('\n').length;
          expect(lines).toBeLessThan(300);
        }
      }
    });
  });
});