'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import { logAuditEvent } from '@/lib/audit/logger';

export async function requireSuperAdmin() {
  const session = await auth();
  if (session?.user.role !== 'super_admin') {
    throw new Error('Forbidden: Super Admin access required.');
  }
  return session;
}

export async function getSuperAdminMetrics() {
  await requireSuperAdmin();

  const [totalTenants, totalSites, totalSnapshots, totalCriticalIssues, totalAiCreditsUsed] = await Promise.all([
    prisma.tenant.count(),
    prisma.site.count(),
    prisma.scoreSnapshot.count(),
    prisma.auditIssue.count({ where: { severity: 'critical' } }),
    prisma.tenant.aggregate({ _sum: { aiCreditUsed: true } }),
  ]);

  return {
    totalTenants,
    totalSites,
    totalSnapshots,
    totalCriticalIssues,
    totalAiCreditsUsed: totalAiCreditsUsed._sum.aiCreditUsed ?? 0,
  };
}

export async function getSuperAdminTenants(search?: string, plan?: string) {
  await requireSuperAdmin();

  return prisma.tenant.findMany({
    where: {
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      ...(plan ? { plan } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { users: true, sites: true, snapshots: true },
      },
    },
  });
}

export async function getSuperAdminTenantDetail(id: string) {
  await requireSuperAdmin();

  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: {
      users: true,
      sites: {
        include: {
          snapshots: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { finalScore: true },
          },
        },
      },
      apiKeys: {
        where: { revokedAt: null },
      },
      integrations: true,
    },
  });

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  return tenant;
}

export async function updateTenantQuota(
  tenantId: string,
  data: { plan?: string; aiCreditLimit?: number; supportNotes?: string }
) {
  const session = await requireSuperAdmin();

  const updated = await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      ...(data.plan && { plan: data.plan }),
      ...(typeof data.aiCreditLimit === 'number' && { aiCreditLimit: data.aiCreditLimit }),
      ...(typeof data.supportNotes === 'string' && { supportNotes: data.supportNotes }),
    },
  });

  await logAuditEvent({
    tenantId,
    actorId: session.user.id,
    actorType: 'user',
    action: 'tenant.plan_updated',
    resource: tenantId,
    metadata: { changes: data },
  });

  return updated;
}

export async function syncTenantCredits(tenantId: string) {
  const session = await requireSuperAdmin();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const usage = await prisma.quotaUsage.aggregate({
    where: { tenantId, createdAt: { gte: startOfMonth } },
    _sum: { units: true },
  });

  const aiCreditUsed = usage._sum.units ?? 0;

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { aiCreditUsed },
  });

  await logAuditEvent({
    tenantId,
    actorId: session.user.id,
    actorType: 'user',
    action: 'tenant.quota_synced',
    resource: tenantId,
    metadata: { aiCreditUsed },
  });

  return { success: true, aiCreditUsed };
}

export async function getProviderHealth() {
  await requireSuperAdmin();

  // Placeholder provider health data. In production these would come from real health checks.
  return [
    { provider: 'NeuronWriter', status: 'operational', latencyMs: 245, lastCheckedAt: new Date().toISOString() },
    { provider: 'PageSpeed', status: 'operational', latencyMs: 120, lastCheckedAt: new Date().toISOString() },
  ];
}

export async function getGlobalUsageStats() {
  await requireSuperAdmin();

  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const usage = await prisma.quotaUsage.groupBy({
    by: ['endpoint'],
    where: { createdAt: { gte: last30Days } },
    _sum: { units: true },
    _count: { id: true },
  });

  return usage.map((u) => ({
    endpoint: u.endpoint,
    totalUnits: u._sum.units ?? 0,
    requestCount: u._count.id,
  }));
}

export async function getSystemOverview() {
  await requireSuperAdmin();

  // Placeholder until rate limit events are persisted
  return {
    rateLimitHits: [] as { tenantId: string; endpoint: string; count: number; lastHitAt: string }[],
    pluginVersions: [] as { version: string; count: number }[],
  };
}
