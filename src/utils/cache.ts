import { logger } from './logger';

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  expiresAt: number;
  hits: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  checkInterval?: number; // Cleanup interval in milliseconds
}

export class MemoryCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly defaultTtl: number;
  private readonly maxSize: number;
  private cleanupInterval: ReturnType<typeof setTimeout> | null = null;

  constructor(options: CacheOptions = {}) {
    this.defaultTtl = options.ttl || 300000; // 5 minutes default
    this.maxSize = options.maxSize || 1000;
    
    const checkInterval = options.checkInterval || 60000; // 1 minute default
    this.startCleanup(checkInterval);
  }

  /**
   * Set a value in the cache
   */
  set(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    const timeToLive = ttl || this.defaultTtl;
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      value,
      timestamp: now,
      expiresAt: now + timeToLive,
      hits: 0,
    });

    logger.debug('Cache entry set', {
      operation: 'cache.set',
      metadata: { key, ttl: timeToLive, cacheSize: this.cache.size },
    });
  }

  /**
   * Get a value from the cache
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      logger.debug('Cache miss', {
        operation: 'cache.get',
        metadata: { key },
      });
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      logger.debug('Cache entry expired', {
        operation: 'cache.get',
        metadata: { key },
      });
      return undefined;
    }

    entry.hits++;
    logger.debug('Cache hit', {
      operation: 'cache.get',
      metadata: { key, hits: entry.hits },
    });
    
    return entry.value;
  }

  /**
   * Check if a key exists in cache and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      logger.debug('Cache entry deleted', {
        operation: 'cache.delete',
        metadata: { key },
      });
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    logger.info('Cache cleared', {
      operation: 'cache.clear',
      metadata: { entriesCleared: size },
    });
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalHits: number;
    oldestEntry?: number;
    newestEntry?: number;
  } {
    let totalHits = 0;
    let oldestTimestamp = Number.MAX_SAFE_INTEGER;
    let newestTimestamp = 0;

    for (const entry of this.cache.values()) {
      totalHits += entry.hits;
      oldestTimestamp = Math.min(oldestTimestamp, entry.timestamp);
      newestTimestamp = Math.max(newestTimestamp, entry.timestamp);
    }

    const totalRequests = totalHits + this.cache.size; // Approximation
    const hitRate = totalRequests > 0 ? totalHits / totalRequests : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate,
      totalHits,
      oldestEntry: oldestTimestamp === Number.MAX_SAFE_INTEGER ? undefined : oldestTimestamp,
      newestEntry: newestTimestamp || undefined,
    };
  }

  /**
   * Get or set a value (cache-aside pattern)
   */
  async getOrSet<R = T>(
    key: string,
    factory: () => Promise<R>,
    ttl?: number
  ): Promise<R> {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached as unknown as R;
    }

    try {
      const value = await factory();
      this.set(key, value as unknown as T, ttl);
      return value;
    } catch (error) {
      logger.error('Cache factory function failed', {
        operation: 'cache.getOrSet',
        metadata: { key },
      }, error as Error);
      throw error;
    }
  }

  /**
   * Wrap a function with caching
   */
  wrap<Args extends any[], R>(
    fn: (...args: Args) => Promise<R>,
    keyGenerator: (...args: Args) => string,
    ttl?: number
  ): (...args: Args) => Promise<R> {
    return async (...args: Args): Promise<R> => {
      const key = keyGenerator(...args);
      return this.getOrSet(key, () => fn(...args), ttl);
    };
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Number.MAX_SAFE_INTEGER;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      logger.debug('Evicted oldest cache entry', {
        operation: 'cache.evict',
        metadata: { key: oldestKey },
      });
    }
  }

  private startCleanup(interval: number): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, interval);

    if (typeof (this.cleanupInterval as any).unref === 'function') {
      (this.cleanupInterval as any).unref();
    }
  }

  private cleanup(): void {
    const now = Date.now();
    let expiredCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      logger.debug('Cache cleanup completed', {
        operation: 'cache.cleanup',
        metadata: { expiredEntries: expiredCount, remainingEntries: this.cache.size },
      });
    }
  }

  /**
   * Destroy the cache and cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

/**
 * Redis-like cache interface for future Redis implementation
 */
export interface RedisLikeCache<T = any> {
  get(key: string): Promise<T | undefined>;
  set(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  has(key: string): Promise<boolean>;
  clear(): Promise<void>;
  getStats(): Promise<any>;
}

/**
 * Cache decorator for methods
 */
export function cached(options: { ttl?: number; keyGenerator?: (...args: any[]) => string } = {}) {
  const cache = new MemoryCache();
  
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const originalMethod = descriptor.value!;
    const defaultKeyGenerator = (...args: any[]) => 
      `${target.constructor.name}.${propertyKey}:${JSON.stringify(args)}`;
    
    const keyGenerator = options.keyGenerator || defaultKeyGenerator;
    
    descriptor.value = cache.wrap(
      originalMethod.bind(target),
      keyGenerator,
      options.ttl
    ) as T;
    
    return descriptor;
  };
}

// Global cache instances
export const globalCache = new MemoryCache({
  ttl: 300000, // 5 minutes
  maxSize: 1000,
});

export const resourceCache = new MemoryCache({
  ttl: 600000, // 10 minutes
  maxSize: 500,
});

export { MemoryCache as Cache };
