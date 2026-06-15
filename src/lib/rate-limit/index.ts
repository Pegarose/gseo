import { RateLimiter, RateLimitInfo } from './types';
import { MemoryRateLimiter } from './memory-rate-limit';
import { RedisRateLimiter } from './redis-rate-limit';

let rateLimiter: RateLimiter | null = null;

export function getRateLimiter(): RateLimiter {
  if (rateLimiter) return rateLimiter;

  const strategy = process.env.RATE_LIMIT_STRATEGY || 'memory';

  if (strategy === 'redis') {
    rateLimiter = new RedisRateLimiter(process.env.REDIS_URL);
  } else {
    rateLimiter = new MemoryRateLimiter();
  }

  return rateLimiter;
}

export async function checkRateLimit(
  tenantId: string | null,
  endpoint: string,
  limitPerHour: number,
  ip: string = 'unknown'
): Promise<{ success: boolean; info: RateLimitInfo }> {
  const identifier = tenantId ? `tenant:${tenantId}` : `ip:${ip}`;
  const limiter = getRateLimiter();
  return limiter.check(identifier, endpoint, limitPerHour);
}

export { createRateLimitResponse } from '@/lib/utils/rate-limit';
