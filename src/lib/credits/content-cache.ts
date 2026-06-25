import { createHash } from 'crypto';

import { prisma } from '@/lib/db/prisma';

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function computeContentHash(html: string, targetKeyword?: string, locale?: string): string {
  return createHash('sha256')
    .update(`${locale ?? ''}|${targetKeyword ?? ''}|${html}`)
    .digest('hex');
}

export async function findCachedContentSnapshot(
  tenantId: string,
  siteId: string,
  contentHash: string
): Promise<string | null> {
  const since = new Date(Date.now() - CACHE_TTL_MS);

  const recent = await prisma.creditLedgerEntry.findMany({
    where: {
      tenantId,
      featureKey: 'score.content',
      createdAt: { gte: since },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  for (const row of recent) {
    const meta = row.metadata as { contentHash?: string; snapshotId?: string; siteId?: string } | null;
    if (meta?.contentHash === contentHash && meta?.siteId === siteId && meta?.snapshotId) {
      return meta.snapshotId;
    }
  }

  return null;
}
