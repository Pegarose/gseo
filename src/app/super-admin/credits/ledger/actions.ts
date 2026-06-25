'use server';

import { prisma } from '@/lib/db/prisma';
import { requireSuperAdmin } from '../../actions';
import { getCreditLedgerSummary } from '@/lib/credits/ledger';
import { ensureCreditPricingSeeded } from '@/lib/credits/pricing';

export async function getCreditLedgerAdminData() {
  await requireSuperAdmin();
  await ensureCreditPricingSeeded();

  const [summary, pricing, tenantTotals] = await Promise.all([
    getCreditLedgerSummary(200),
    prisma.creditFeaturePricing.findMany({ orderBy: { category: 'asc' } }),
    prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        aiCreditUsed: true,
        aiCreditLimit: true,
      },
      orderBy: { aiCreditUsed: 'desc' },
      take: 50,
    }),
  ]);

  const providerCostTotal = summary.entries.reduce((s, e) => s + e.providerCost, 0);
  const revenueTotal = summary.entries.reduce((s, e) => s + e.sellCredits, 0);

  return {
    ...summary,
    providerCostTotal,
    revenueTotal,
    pricing,
    tenantTotals,
  };
}
