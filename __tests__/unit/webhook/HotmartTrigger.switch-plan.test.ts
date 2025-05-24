import { HotmartTrigger } from '../../../nodes/Hotmart/HotmartTrigger.node';
import { ITriggerFunctions } from 'n8n-workflow';
import { createMockTriggerFunctions } from '../../helpers/testHelpers';
import * as fs from 'fs';
import * as path from 'path';

describe('HotmartTrigger - SWITCH_PLAN (Mocked)', () => {
  let trigger: HotmartTrigger;
  let triggerFunctions: ITriggerFunctions;
  const mockData = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../../fixtures/webhook-mocks/switch-plan.json'),
      'utf-8'
    )
  );

  beforeEach(() => {
    trigger = new HotmartTrigger();
    triggerFunctions = createMockTriggerFunctions();
  });

  describe('SWITCH_PLAN Mock Event', () => {
    test('should process mocked SWITCH_PLAN event', async () => {
      const webhookData = {
        webhookEvent: 'SWITCH_PLAN',
        webhookUrl: 'http://test.com/webhook'
      };

      const mockReq = {
        body: mockData,
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
      expect(emittedData[0][0][0].json.event).toBe('SWITCH_PLAN');
    });

    test('should validate mocked data structure', () => {
      expect(mockData).toHaveProperty('event', 'SWITCH_PLAN');
      expect(mockData).toHaveProperty('data');
      expect(mockData.data).toBeInstanceOf(Object);
    });
  });
});
