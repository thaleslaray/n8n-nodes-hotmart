import { HotmartTrigger } from '../../../nodes/Hotmart/HotmartTrigger.node';
import { ITriggerFunctions } from 'n8n-workflow';
import { createMockTriggerFunctions } from '../../helpers/testHelpers';
import * as fs from 'fs';
import * as path from 'path';

describe('HotmartTrigger - UPDATE_SUBSCRIPTION_CHARGE_DATE', () => {
  let trigger: HotmartTrigger;
  let triggerFunctions: ITriggerFunctions;
  const fixturesDir = path.join(__dirname, '../../fixtures/webhook-fixtures-anon/update-subscription-charge-date');

  beforeEach(() => {
    trigger = new HotmartTrigger();
    triggerFunctions = createMockTriggerFunctions();
  });

  describe('UPDATE_SUBSCRIPTION_CHARGE_DATE Event Processing', () => {
    const fixtures = fs.readdirSync(fixturesDir)
      .filter(f => f.endsWith('.json'))
      .map(f => ({
        name: f,
        data: JSON.parse(fs.readFileSync(path.join(fixturesDir, f), 'utf-8'))
      }));

    test.each(fixtures)('should process $name correctly', async ({ data }) => {
      const webhookData = {
        webhookEvent: 'UPDATE_SUBSCRIPTION_CHARGE_DATE',
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

    test('should handle UPDATE_SUBSCRIPTION_CHARGE_DATE in "all-events" mode', async () => {
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

  describe('UPDATE_SUBSCRIPTION_CHARGE_DATE Data Validation', () => {
    test('should validate required fields', () => {
      const sampleFixture = JSON.parse(
        fs.readFileSync(path.join(fixturesDir, '1.json'), 'utf-8')
      );

      // Verificar campos obrigatórios
      expect(sampleFixture).toHaveProperty('event');
      expect(sampleFixture).toHaveProperty('data');
      expect(sampleFixture.event).toBe('UPDATE_SUBSCRIPTION_CHARGE_DATE');
    });

    test('should handle missing optional fields gracefully', async () => {
      const minimalData = {
        event: 'UPDATE_SUBSCRIPTION_CHARGE_DATE',
        data: {}
      };

      const webhookData = {
        webhookEvent: 'UPDATE_SUBSCRIPTION_CHARGE_DATE',
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
