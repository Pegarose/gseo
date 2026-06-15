import { prisma } from '@/lib/db/prisma';

export interface AuditLogInput {
  tenantId?: string | null;
  actorId?: string;
  actorType: 'user' | 'api_key';
  action: string;
  resource?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAuditEvent(input: AuditLogInput) {
  return prisma.auditLog.create({
    data: {
      tenantId: input.tenantId || null,
      actorId: input.actorId || null,
      actorType: input.actorType,
      action: input.action,
      resource: input.resource || null,
      metadata: (input.metadata || {}) as any,
      ipAddress: input.ipAddress || null,
      userAgent: input.userAgent || null,
    },
  });
}

export async function getAuditLogs(tenantId?: string, take = 100, skip = 0) {
  return prisma.auditLog.findMany({
    where: tenantId ? { tenantId } : undefined,
    orderBy: { createdAt: 'desc' },
    take,
    skip,
  });
}
