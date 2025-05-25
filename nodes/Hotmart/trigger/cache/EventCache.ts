/**
 * Simple in-memory cache for event configurations
 * Reduces repeated object lookups
 */
export class EventCache {
  private static instance: EventCache;
  private cache = new Map<string, any>();
  private readonly TTL = 60 * 60 * 1000; // 1 hour

  private constructor() {}

  static getInstance(): EventCache {
    if (!EventCache.instance) {
      EventCache.instance = new EventCache();
    }
    return EventCache.instance;
  }

  get<T>(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return undefined;
    }

    return item.value as T;
  }

  set<T>(key: string, value: T, ttl?: number): void {
    this.cache.set(key, {
      value,
      expires: Date.now() + (ttl || this.TTL),
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}