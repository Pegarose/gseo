import { describe, it, expect } from 'vitest';
import { validateUrlForFetch } from '../ssrf';

describe('validateUrlForFetch', () => {
  it('blocks localhost', async () => {
    const result = await validateUrlForFetch('http://localhost:3000');
    expect(result.safe).toBe(false);
  });

  it('blocks private IP ranges', async () => {
    const result = await validateUrlForFetch('http://192.168.1.1');
    expect(result.safe).toBe(false);
  });

  it('blocks non-http protocols', async () => {
    const result = await validateUrlForFetch('file:///etc/passwd');
    expect(result.safe).toBe(false);
  });

  it('blocks metadata paths', async () => {
    const result = await validateUrlForFetch('http://example.com/latest/meta-data/');
    expect(result.safe).toBe(false);
  });

  it('allows public https URLs', async () => {
    const result = await validateUrlForFetch('https://example.com');
    expect(result.safe).toBe(true);
  });
});
