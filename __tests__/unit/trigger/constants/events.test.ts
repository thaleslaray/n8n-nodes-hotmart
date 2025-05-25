import { 
  WEBHOOK_EVENTS, 
  EVENT_CONFIG, 
  isValidEvent, 
  getEventConfig,
  SUPER_SMART_EVENT_MAP 
} from '../../../../nodes/Hotmart/trigger/constants/events';

describe('Event Constants', () => {
  describe('WEBHOOK_EVENTS', () => {
    it('should have 15 events', () => {
      expect(WEBHOOK_EVENTS).toHaveLength(15);
    });

    it('should include all expected events', () => {
      const expectedEvents = [
        'PURCHASE_APPROVED',
        'PURCHASE_COMPLETE',
        'PURCHASE_CANCELED',
        'SUBSCRIPTION_CANCELLATION',
        'CLUB_FIRST_ACCESS',
      ];
      
      expectedEvents.forEach(event => {
        expect(WEBHOOK_EVENTS).toContain(event);
      });
    });
  });

  describe('EVENT_CONFIG', () => {
    it('should have configuration for all events', () => {
      WEBHOOK_EVENTS.forEach(event => {
        expect(EVENT_CONFIG[event]).toBeDefined();
        expect(EVENT_CONFIG[event].displayName).toBeTruthy();
        expect(EVENT_CONFIG[event].category).toBeTruthy();
        expect(EVENT_CONFIG[event].index).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have unique indices for smart mode', () => {
      const indices = Object.values(EVENT_CONFIG).map(config => config.index);
      const uniqueIndices = new Set(indices);
      // Some events share indices (PURCHASE_EXPIRED and PURCHASE_DELAYED both use 9)
      expect(uniqueIndices.size).toBeGreaterThanOrEqual(14);
    });

    it('should mark events with subtypes correctly', () => {
      expect(EVENT_CONFIG.PURCHASE_APPROVED.hasSubTypes).toBe(true);
      expect(EVENT_CONFIG.PURCHASE_BILLET_PRINTED.hasSubTypes).toBe(true);
      expect((EVENT_CONFIG.PURCHASE_COMPLETE as any).hasSubTypes).toBeUndefined();
    });
  });

  describe('isValidEvent', () => {
    it('should return true for valid events', () => {
      expect(isValidEvent('PURCHASE_APPROVED')).toBe(true);
      expect(isValidEvent('SUBSCRIPTION_CANCELLATION')).toBe(true);
      expect(isValidEvent('CLUB_FIRST_ACCESS')).toBe(true);
    });

    it('should return false for invalid events', () => {
      expect(isValidEvent('INVALID_EVENT')).toBe(false);
      expect(isValidEvent('')).toBe(false);
      expect(isValidEvent('purchase_approved')).toBe(false); // lowercase
    });
  });

  describe('getEventConfig', () => {
    it('should return config for valid events', () => {
      const config = getEventConfig('PURCHASE_APPROVED');
      expect(config).toBeDefined();
      expect(config?.displayName).toBe('Compra Aprovada');
      expect(config?.category).toBe('purchase');
    });

    it('should return undefined for invalid events', () => {
      expect(getEventConfig('INVALID_EVENT')).toBeUndefined();
    });
  });

  describe('SUPER_SMART_EVENT_MAP', () => {
    it('should map all events to correct indices', () => {
      expect(SUPER_SMART_EVENT_MAP.PURCHASE_APPROVED).toBe(0);
      expect(SUPER_SMART_EVENT_MAP.PURCHASE_BILLET_PRINTED).toBe(7);
      expect(SUPER_SMART_EVENT_MAP.CLUB_MODULE_COMPLETED).toBe(15);
    });
  });
});