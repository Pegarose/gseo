import { RateLimiter, RateLimitInfo } from './types';
import { LRUCache } from 'lru-cache';

const rateLimitCache = new LRUCache<string, { count: number; resetAt: number }>({
  max: 5000,
  ttl: 1000 * 60 * 60, // 1 hour TTL
});

export class MemoryRateLimiter implements RateLimiter {
  async check(identifier: string, endpoint: string, limitPerHour: number): Promise<{ success: boolean; info: RateLimitInfo }> {
    const key = `${identifier}:${endpoint}`;
    let record = rateLimitCache.get(key);
    const now = Date.now();

    if (!record || record.resetAt < now) {
      record = { count: 0, resetAt: now + 1000 * 60 * 60 };
    }

    record.count += 1;
    rateLimitCache.set(key, record);

    const remaining = Math.max(0, limitPerHour - record.count);

    return {
      success: record.count <= limitPerHour,
      info: {
        limit: limitPerHour,
        remaining,
        resetAt: new Date(record.resetAt).toISOString(),
      },
    };
  }
}
