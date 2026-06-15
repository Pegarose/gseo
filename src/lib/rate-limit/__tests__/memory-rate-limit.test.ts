import { describe, it, expect } from 'vitest';
import { MemoryRateLimiter } from '../memory-rate-limit';

describe('MemoryRateLimiter', () => {
  it('allows requests under the limit', async () => {
    const limiter = new MemoryRateLimiter();
    const result = await limiter.check('tenant_1', 'score/url', 5);
    expect(result.success).toBe(true);
    expect(result.info.remaining).toBe(4);
  });

  it('blocks requests over the limit', async () => {
    const limiter = new MemoryRateLimiter();
    for (let i = 0; i < 5; i++) {
      await limiter.check('tenant_2', 'score/url', 2);
    }
    const result = await limiter.check('tenant_2', 'score/url', 2);
    expect(result.success).toBe(false);
    expect(result.info.remaining).toBe(0);
  });

  it('isolates different endpoints', async () => {
    const limiter = new MemoryRateLimiter();
    await limiter.check('tenant_3', 'score/url', 1);
    const otherEndpoint = await limiter.check('tenant_3', 'auth/me', 10);
    expect(otherEndpoint.success).toBe(true);
  });
});
