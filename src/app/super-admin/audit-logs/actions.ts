'use server';

import { requireSuperAdmin } from '../actions';
import { prisma } from '@/lib/db/prisma';

export async function getAuditLogs(take = 100, skip = 0) {
  await requireSuperAdmin();

  return prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take,
    skip,
  });
}

export async function getAuditLogsForTenant(tenantId: string, take = 100, skip = 0) {
  await requireSuperAdmin();

  return prisma.auditLog.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    take,
    skip,
  });
}
