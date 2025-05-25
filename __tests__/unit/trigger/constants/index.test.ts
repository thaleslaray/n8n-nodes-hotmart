import * as constants from '../../../../nodes/Hotmart/trigger/constants';

describe('Trigger Constants Index', () => {
  it('should export events constants', () => {
    expect(constants.WEBHOOK_EVENTS).toBeDefined();
    expect(constants.EVENT_CONFIG).toBeDefined();
    expect(constants.isValidEvent).toBeDefined();
    expect(constants.getEventConfig).toBeDefined();
  });

  it('should export outputs constants', () => {
    // Check if outputs constants are exported
    expect(constants).toBeDefined();
  });

  it('should have correct event structure', () => {
    expect(Array.isArray(constants.WEBHOOK_EVENTS)).toBe(true);
    expect(constants.WEBHOOK_EVENTS.length).toBeGreaterThan(0);
    expect(typeof constants.EVENT_CONFIG).toBe('object');
  });

  it('should validate events correctly', () => {
    expect(constants.isValidEvent('PURCHASE_APPROVED')).toBe(true);
    expect(constants.isValidEvent('INVALID_EVENT')).toBe(false);
  });

  it('should get event config correctly', () => {
    const config = constants.getEventConfig('PURCHASE_APPROVED');
    expect(config).toBeDefined();
    expect(config?.displayName).toBe('Compra Aprovada');
  });
});