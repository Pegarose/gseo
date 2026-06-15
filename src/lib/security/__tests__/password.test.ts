import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, isPasswordStrong } from '../password';

describe('password utils', () => {
  it('hashes and verifies passwords', async () => {
    const hash = await hashPassword('StrongPass1!');
    expect(await verifyPassword('StrongPass1!', hash)).toBe(true);
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });

  it('rejects weak passwords', () => {
    expect(isPasswordStrong('short').valid).toBe(false);
    expect(isPasswordStrong('lowercase1').valid).toBe(false);
    expect(isPasswordStrong('UPPERCASE1').valid).toBe(false);
    expect(isPasswordStrong('StrongPass1').valid).toBe(true);
  });
});
