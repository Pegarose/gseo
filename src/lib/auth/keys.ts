import crypto from 'crypto';
import { prisma } from '@/lib/db/prisma';

export interface GeneratedKeyResult {
  rawKey: string;
  keyHash: string;
  keyPrefix: string;
}

/**
 * Hashes an API key using SHA-256.
 */
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Generates a new API key object, but does NOT save it to the database.
 * The raw API key must only be shown once to the user upon creation.
 */
export function generateApiKeyString(environment: 'live' | 'test' = 'live'): string {
  const prefix = `gseo_${environment}_`;
  const randomBytes = crypto.randomBytes(24).toString('hex'); // 48 chars
  return `${prefix}${randomBytes}`;
}

/**
 * Verifies an incoming raw API key against the database.
 * If valid, returns the associated ApiKey record with Tenant and optional Site info.
 */
export async function verifyApiKey(rawKey: string) {
  if (!rawKey || typeof rawKey !== 'string') {
    return null;
  }

  const hashedKey = hashApiKey(rawKey);

  const keyRecord = await prisma.apiKey.findUnique({
    where: {
      keyHash: hashedKey,
    },
    include: {
      tenant: true,
      site: true,
    },
  });

  if (!keyRecord) {
    return null;
  }

  if (keyRecord.revokedAt) {
    return null;
  }

  // Update lastUsedAt asynchronously in the background
  prisma.apiKey
    .update({
      where: { id: keyRecord.id },
      data: { lastUsedAt: new Date() },
    })
    .catch((err) => {
      console.error('Failed to update API key lastUsedAt:', err);
    });

  return keyRecord;
}
