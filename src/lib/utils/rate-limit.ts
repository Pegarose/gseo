import { LRUCache } from 'lru-cache';
import { NextRequest, NextResponse } from 'next/server';

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: string; // ISO String
}

// Global cache (persists across requests in the same Node.js instance)
const rateLimitCache = new LRUCache<string, { count: number, resetAt: number }>({
  max: 5000,
  ttl: 1000 * 60 * 60, // 1 hour TTL
});

/**
 * Basic in-memory rate limiter for Phase 5 internal pilot.
 * 
 * Note: This does not synchronize across serverless edge functions or multiple instances.
 * For production scale, replace this with Redis / Vercel KV.
 */
export function checkRateLimit(tenantId: string | null, endpoint: string, limitPerHour: number, ip: string = 'unknown'): { success: boolean, info: RateLimitInfo } {
  // Key format: tenantId:endpoint or IP:endpoint for unauthenticated
  const identifier = tenantId ? `tenant:${tenantId}` : `ip:${ip}`;
  const key = `${identifier}:${endpoint}`;

  let record = rateLimitCache.get(key);
  const now = Date.now();

  if (!record || record.resetAt < now) {
    record = { count: 0, resetAt: now + (1000 * 60 * 60) };
  }

  record.count += 1;
  rateLimitCache.set(key, record);

  const remaining = Math.max(0, limitPerHour - record.count);

  const info: RateLimitInfo = {
    limit: limitPerHour,
    remaining,
    resetAt: new Date(record.resetAt).toISOString()
  };

  return {
    success: record.count <= limitPerHour,
    info
  };
}

export function createRateLimitResponse(info: RateLimitInfo, requestId: string): NextResponse {
  return NextResponse.json({
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Rate limit exceeded. Please retry later.',
      details: info
    },
    meta: {
      requestId
    }
  }, {
    status: 429,
    headers: {
      'X-RateLimit-Limit': info.limit.toString(),
      'X-RateLimit-Remaining': info.remaining.toString(),
      'X-RateLimit-Reset': info.resetAt
    }
  });
}
