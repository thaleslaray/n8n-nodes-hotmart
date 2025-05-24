import { HotmartTrigger } from '../../../nodes/Hotmart/HotmartTrigger.node';
import { ITriggerFunctions } from 'n8n-workflow';
import { createMockTriggerFunctions } from '../../helpers/testHelpers';
import * as fs from 'fs';
import * as path from 'path';

describe('HotmartTrigger - PURCHASE_EXPIRED (Mocked)', () => {
  let trigger: HotmartTrigger;
  let triggerFunctions: ITriggerFunctions;
  const mockData = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, '../../fixtures/webhook-mocks/purchase-expired.json'),
      'utf-8'
    )
  );

  beforeEach(() => {
    trigger = new HotmartTrigger();
    triggerFunctions = createMockTriggerFunctions();
  });

  describe('PURCHASE_EXPIRED Mock Event', () => {
    test('should process mocked PURCHASE_EXPIRED event', async () => {
      const webhookData = {
        webhookEvent: 'PURCHASE_EXPIRED',
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
      expect(emittedData[0][0][0].json.event).toBe('PURCHASE_EXPIRED');
    });

    test('should validate mocked data structure', () => {
      expect(mockData).toHaveProperty('event', 'PURCHASE_EXPIRED');
      expect(mockData).toHaveProperty('data');
      expect(mockData.data).toBeInstanceOf(Object);
    });
  });
});
