import { prisma } from '@/lib/db/prisma';
import { ensureCreditPricingSeeded } from './pricing';

export async function getTenantCreditBalance(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { aiCreditUsed: true, aiCreditLimit: true, plan: true },
  });
  if (!tenant) return null;
  return {
    used: tenant.aiCreditUsed,
    limit: tenant.aiCreditLimit,
    plan: tenant.plan,
    unlimited: tenant.aiCreditLimit === 0,
  };
}

export async function getCreditLedgerSummary(limit = 50) {
  await ensureCreditPricingSeeded();
  const [entries, byFeature] = await Promise.all([
    prisma.creditLedgerEntry.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        tenant: { select: { name: true, slug: true } },
      },
    }),
    prisma.creditLedgerEntry.groupBy({
      by: ['featureKey'],
      _sum: { sellCredits: true, providerCost: true },
      _count: true,
      orderBy: { _sum: { sellCredits: 'desc' } },
    }),
  ]);

  const totalSell = entries.reduce((s, e) => s + e.sellCredits, 0);
  const totalCost = entries.reduce((s, e) => s + e.providerCost, 0);

  return { entries, byFeature, totalSell, totalCost };
}
