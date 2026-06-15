import { NextResponse } from 'next/server';
import { RateLimitInfo } from '@/lib/rate-limit/types';

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
