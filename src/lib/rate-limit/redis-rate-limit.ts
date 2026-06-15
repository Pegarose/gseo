import { RateLimiter, RateLimitInfo } from './types';
import Redis from 'ioredis';

export class RedisRateLimiter implements RateLimiter {
  private redis: Redis;

  constructor(redisUrl?: string) {
    const url = redisUrl || process.env.REDIS_URL;
    if (!url) {
      throw new Error('Redis URL is required for RedisRateLimiter. Set REDIS_URL environment variable.');
    }
    this.redis = new Redis(url);
  }

  async check(identifier: string, endpoint: string, limitPerHour: number): Promise<{ success: boolean; info: RateLimitInfo }> {
    const key = `rate_limit:${identifier}:${endpoint}`;
    const windowSeconds = 3600;
    const now = Date.now();
    const resetAt = now + windowSeconds * 1000;

    const pipeline = this.redis.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, windowSeconds, 'NX');
    const results = await pipeline.exec();

    const count = (results?.[0]?.[1] as number) || 1;
    const remaining = Math.max(0, limitPerHour - count);

    return {
      success: count <= limitPerHour,
      info: {
        limit: limitPerHour,
        remaining,
        resetAt: new Date(resetAt).toISOString(),
      },
    };
  }
}
