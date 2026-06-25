'use server';

import { prisma } from '@/lib/db/prisma';
import { getPlanLimits } from '@/lib/plans/plans';
import { getDashboardTenantContext } from '../actions';

export async function getDashboardSettings() {
  const { tenantId } = await getDashboardTenantContext();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      _count: {
        select: { sites: true, users: true },
      },
    },
  });

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  const limits = getPlanLimits(tenant.plan);

  return {
    tenant: {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      plan: tenant.plan,
      aiCreditUsed: tenant.aiCreditUsed,
      aiCreditLimit: tenant.aiCreditLimit,
      siteCount: tenant._count.sites,
      userCount: tenant._count.users,
    },
    limits,
  };
}
