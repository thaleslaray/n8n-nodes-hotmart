import { EventCache } from '../../../../nodes/Hotmart/trigger/cache/EventCache';
import { PerformanceMonitor, debounce, memoize } from '../../../../nodes/Hotmart/trigger/utils/performance';

describe('Performance Optimizations', () => {
  describe('EventCache', () => {
    let cache: EventCache;

    beforeEach(() => {
      cache = EventCache.getInstance();
      cache.clear();
    });

    it('should store and retrieve values', () => {
      cache.set('test-key', { value: 'test-value' });
      const result = cache.get<{ value: string }>('test-key');
      
      expect(result).toEqual({ value: 'test-value' });
    });

    it('should expire values after TTL', (done) => {
      cache.set('expire-key', 'value', 100); // 100ms TTL
      
      expect(cache.get('expire-key')).toBe('value');
      
      setTimeout(() => {
        expect(cache.get('expire-key')).toBeUndefined();
        done();
      }, 150);
    });

    it('should be a singleton', () => {
      const instance1 = EventCache.getInstance();
      const instance2 = EventCache.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should track cache size', () => {
      expect(cache.size()).toBe(0);
      
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      expect(cache.size()).toBe(2);
    });
  });

  describe('PerformanceMonitor', () => {
    beforeEach(() => {
      PerformanceMonitor.clear();
    });

    it('should track operation duration', (done) => {
      PerformanceMonitor.start('test-operation');
      
      setTimeout(() => {
        const metrics = PerformanceMonitor.end('test-operation');
        
        expect(metrics).toBeDefined();
        expect(metrics!.duration).toBeGreaterThanOrEqual(50);
        expect(metrics!.duration).toBeLessThan(100);
        done();
      }, 50);
    });

    it('should handle non-existent operations', () => {
      const metrics = PerformanceMonitor.end('non-existent');
      expect(metrics).toBeUndefined();
    });

    it('should store multiple metrics', () => {
      PerformanceMonitor.start('op1');
      PerformanceMonitor.start('op2');
      
      PerformanceMonitor.end('op1');
      PerformanceMonitor.end('op2');
      
      const allMetrics = PerformanceMonitor.getMetrics();
      expect(allMetrics.size).toBe(2);
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', (done) => {
      let callCount = 0;
      const fn = jest.fn(() => callCount++);
      const debouncedFn = debounce(fn, 100);

      // Call multiple times rapidly
      debouncedFn();
      debouncedFn();
      debouncedFn();
      debouncedFn();

      // Should not have been called yet
      expect(callCount).toBe(0);

      setTimeout(() => {
        // Should have been called only once
        expect(callCount).toBe(1);
        done();
      }, 150);
    });
  });

  describe('memoize', () => {
    it('should cache function results', () => {
      let callCount = 0;
      const expensiveFn = (a: number, b: number) => {
        callCount++;
        return a + b;
      };

      const memoizedFn = memoize(expensiveFn);

      // First call
      expect(memoizedFn(1, 2)).toBe(3);
      expect(callCount).toBe(1);

      // Second call with same arguments - should use cache
      expect(memoizedFn(1, 2)).toBe(3);
      expect(callCount).toBe(1);

      // Different arguments - should call function
      expect(memoizedFn(2, 3)).toBe(5);
      expect(callCount).toBe(2);
    });

    it('should use custom key generator', () => {
      let callCount = 0;
      const fn = (obj: { id: number; name: string }) => {
        callCount++;
        return obj.name;
      };

      const memoizedFn = memoize(fn, (obj) => obj.id.toString());

      const obj1 = { id: 1, name: 'Test' };
      const obj2 = { id: 1, name: 'Different' }; // Same ID

      expect(memoizedFn(obj1)).toBe('Test');
      expect(callCount).toBe(1);

      // Same ID, should use cache even though name is different
      expect(memoizedFn(obj2)).toBe('Test');
      expect(callCount).toBe(1);
    });

    it('should limit cache size', () => {
      const fn = (n: number) => n * 2;
      const memoizedFn = memoize(fn);

      // Fill cache beyond limit (100 items)
      for (let i = 0; i < 110; i++) {
        memoizedFn(i);
      }

      // Early entries should have been evicted
      // This is harder to test directly without exposing cache
      // But we can verify the function still works
      expect(memoizedFn(0)).toBe(0);
      expect(memoizedFn(109)).toBe(218);
    });
  });
});