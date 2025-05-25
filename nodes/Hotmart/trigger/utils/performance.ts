/**
 * Performance monitoring utilities
 */

interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryUsage?: NodeJS.MemoryUsage;
}

export class PerformanceMonitor {
  private static metrics = new Map<string, PerformanceMetrics>();

  static start(operationId: string): void {
    this.metrics.set(operationId, {
      startTime: Date.now(),
      memoryUsage: process.memoryUsage(),
    });
  }

  static end(operationId: string): PerformanceMetrics | undefined {
    const metric = this.metrics.get(operationId);
    if (!metric) return undefined;

    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${operationId}: ${metric.duration}ms`);
    }

    return metric;
  }

  static getMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  static clear(): void {
    this.metrics.clear();
  }
}

/**
 * Debounce function to prevent excessive calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Memoize function results
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func(...args);
    cache.set(key, result);
    
    // Limit cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }

    return result;
  }) as T;
}