import { HotmartTrigger } from '../../../nodes/Hotmart/HotmartTrigger.node';
import { ITriggerFunctions } from 'n8n-workflow';
import { createMockTriggerFunctions } from '../../helpers/testHelpers';
import * as fs from 'fs';
import * as path from 'path';

describe('HotmartTrigger - PURCHASE_CANCELED', () => {
  let trigger: HotmartTrigger;
  let triggerFunctions: ITriggerFunctions;
  const fixturesDir = path.join(__dirname, '../../fixtures/webhook-fixtures-anon/purchase-canceled');

  beforeEach(() => {
    trigger = new HotmartTrigger();
    triggerFunctions = createMockTriggerFunctions();
  });

  describe('PURCHASE_CANCELED Event Processing', () => {
    const fixtures = fs.readdirSync(fixturesDir)
      .filter(f => f.endsWith('.json'))
      .map(f => ({
        name: f,
        data: JSON.parse(fs.readFileSync(path.join(fixturesDir, f), 'utf-8'))
      }));

    test.each(fixtures)('should process $name correctly', async ({ data }) => {
      const webhookData = {
        webhookEvent: 'PURCHASE_CANCELED',
        webhookUrl: 'http://test.com/webhook'
      };

      const mockReq = {
        body: data,
        headers: { 'content-type': 'application/json' }
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      const emittedData: any[] = [];
      triggerFunctions.emit = jest.fn((data) => emittedData.push(data));

      await trigger.webhookProcess.call(
        triggerFunctions,
        webhookData,
        mockReq,
        mockRes
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(emittedData).toHaveLength(1);
      expect(emittedData[0][0][0].json).toEqual(data);
    });

    test('should handle PURCHASE_CANCELED in "all-events" mode', async () => {
      const webhookData = {
        webhookEvent: 'all-events',
        webhookUrl: 'http://test.com/webhook'
      };

      const sampleData = fixtures[0].data;
      const mockReq = {
        body: sampleData,
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

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('PURCHASE_CANCELED Data Validation', () => {
    test('should validate required fields', () => {
      const sampleFixture = JSON.parse(
        fs.readFileSync(path.join(fixturesDir, '1.json'), 'utf-8')
      );

      // Verificar campos obrigatórios
      expect(sampleFixture).toHaveProperty('event');
      expect(sampleFixture).toHaveProperty('data');
      expect(sampleFixture.event).toBe('PURCHASE_CANCELED');
    });

    test('should handle missing optional fields gracefully', async () => {
      const minimalData = {
        event: 'PURCHASE_CANCELED',
        data: {}
      };

      const webhookData = {
        webhookEvent: 'PURCHASE_CANCELED',
        webhookUrl: 'http://test.com/webhook'
      };

      const mockReq = {
        body: minimalData,
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

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
