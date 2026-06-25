import { prisma } from '@/lib/db/prisma';

/**
 * Checks if a tenant has remaining AI scoring credits.
 * If aiCreditLimit is 0, it is considered unlimited.
 */
export async function checkQuotaLimit(
  tenantId: string,
  additionalUnits = 0
): Promise<{
  success: boolean;
  used: number;
  limit: number;
}> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      aiCreditLimit: true,
      aiCreditUsed: true,
    },
  });

  if (!tenant) {
    throw new Error(`Tenant not found: ${tenantId}`);
  }

  const limit = tenant.aiCreditLimit;
  const used = tenant.aiCreditUsed;

  if (limit > 0 && used + additionalUnits > limit) {
    return { success: false, used, limit };
  }

  return { success: true, used, limit };
}

/**
 * Atomically increments the tenant's credit used counter.
 */
export async function incrementTenantCredits(
  tenantId: string,
  amount = 1
): Promise<number> {
  const updated = await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      aiCreditUsed: {
        increment: amount,
      },
    },
    select: {
      aiCreditUsed: true,
    },
  });

  return updated.aiCreditUsed;
}

/**
 * Recalculates the total AI credit usage for a tenant for the current month
 * by summing QuotaUsage logs, and synchronizes the Tenant.aiCreditUsed cached counter.
 */
export async function recalculateTenantCredits(tenantId: string): Promise<number> {
  const now = new Date();
  // Get start of the current month in UTC (aligning with QuotaUsage date insertion)
  const firstDayOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const aggregation = await prisma.quotaUsage.aggregate({
    where: {
      tenantId,
      date: {
        gte: firstDayOfMonth,
      },
    },
    _sum: {
      units: true,
    },
  });

  const totalUsed = aggregation._sum.units ?? 0;

  // Sync to Tenant
  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      aiCreditUsed: totalUsed,
    },
  });

  return totalUsed;
}
