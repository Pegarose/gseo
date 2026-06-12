'use server';

import { prisma } from '@/lib/db/prisma';
import { revalidatePath } from 'next/cache';
import { recalculateTenantCredits } from '@/lib/auth/quota';

// Helper to verify the admin token
async function verifyAdminAuth() {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const token = cookieStore.get('super_admin_token')?.value;
  const validToken = process.env.SUPER_ADMIN_TOKEN;
  const isProduction = process.env.NODE_ENV === 'production';
  
  let isAuthenticated = false;
  if (validToken) {
    isAuthenticated = token === validToken;
  } else if (!isProduction) {
    isAuthenticated = token === 'gseo_admin_secret_token';
  }
  
  if (!isAuthenticated) {
    throw new Error('Yetkisiz işlem: Super Admin oturumu bulunamadı.');
  }
}

// 1. Get Global Super Admin Dashboard Metrics
export async function getSuperAdminMetrics() {
  await verifyAdminAuth();

  const [totalTenants, totalSites, totalSnapshots, totalCriticalIssues, creditAggregate] = await Promise.all([
    prisma.tenant.count(),
    prisma.site.count(),
    prisma.scoreSnapshot.count(),
    prisma.auditIssue.count({ where: { severity: 'critical' } }),
    prisma.tenant.aggregate({
      _sum: {
        aiCreditUsed: true
      }
    })
  ]);

  return {
    totalTenants,
    totalSites,
    totalSnapshots,
    totalCriticalIssues,
    totalAiCreditsUsed: creditAggregate._sum.aiCreditUsed ?? 0
  };
}

// 2. Get All Tenants for Grid
export async function getSuperAdminTenants() {
  await verifyAdminAuth();

  return prisma.tenant.findMany({
    include: {
      _count: {
        select: {
          users: true,
          sites: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

// 3. Get Tenant Details
export async function getSuperAdminTenantDetail(tenantId: string) {
  await verifyAdminAuth();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      users: {
        orderBy: { createdAt: 'desc' }
      },
      sites: {
        include: {
          snapshots: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { finalScore: true, scoreBand: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      apiKeys: {
        orderBy: { createdAt: 'desc' }
      },
      integrations: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  return tenant;
}

// 4. Update Tenant Plan & Quota Override
export async function updateTenantQuota(
  tenantId: string, 
  data: { plan: string; aiCreditLimit: number; supportNotes?: string }
) {
  await verifyAdminAuth();

  const updatedTenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      plan: data.plan,
      aiCreditLimit: data.aiCreditLimit,
      supportNotes: data.supportNotes
    }
  });

  revalidatePath('/super-admin');
  revalidatePath(`/super-admin/tenants/${tenantId}`);
  revalidatePath('/dashboard'); // revalidate client dashboard to apply quota overrides instantly

  return updatedTenant;
}

// 5. Get Provider Health Statuses (Masked Secrets)
export async function getProviderHealth() {
  await verifyAdminAuth();

  const nwKey = process.env.NEURONWRITER_API_KEY;
  const psKey = process.env.PAGESPEED_API_KEY;

  const maskKey = (key?: string) => {
    if (!key) return 'Tanımlanmadı';
    if (key.length <= 8) return '••••••••';
    return `${key.substring(0, 4)}••••••••${key.substring(key.length - 4)}`;
  };

  return [
    {
      id: 'neuronwriter',
      name: 'Semantic Content Analyzer API Provider',
      status: nwKey ? 'active' : 'offline',
      maskedKey: maskKey(nwKey),
      endpoint: 'https://api.neuronwriter.com/v1 (Mocked Routing)',
      lastChecked: new Date()
    },
    {
      id: 'pagespeed',
      name: 'Google PageSpeed Insights API',
      status: psKey ? 'active' : 'offline',
      maskedKey: maskKey(psKey),
      endpoint: 'https://www.googleapis.com/pagespeedonline/v5',
      lastChecked: new Date()
    }
  ];
}

// 6. Get Global Usage Statistics
export async function getGlobalUsageStats() {
  await verifyAdminAuth();

  const usages = await prisma.quotaUsage.groupBy({
    by: ['endpoint'],
    _sum: {
      units: true
    },
    _count: {
      id: true
    }
  });

  return usages.map(u => ({
    endpoint: u.endpoint,
    totalCalls: u._count.id,
    totalUnits: u._sum.units ?? 0
  }));
}

// 7. Get System Overview Stats (Rate limit hits & Plugin version summaries)
export async function getSystemOverview() {
  await verifyAdminAuth();

  // Simple mocked system stats for the MVP console
  return {
    rateLimitHits: [
      { path: '/api/v1/score/url', count: 12, lastHit: new Date(Date.now() - 3600000) },
      { path: '/api/v1/score/content', count: 5, lastHit: new Date(Date.now() - 7200000) },
      { path: '/api/v1/semantic/analyze', count: 2, lastHit: new Date(Date.now() - 14400000) }
    ],
    pluginVersions: [
      { version: 'WordPress Plugin v1.0.0', count: 8, percentage: 80 },
      { version: 'Next.js SDK v0.8.2', count: 2, percentage: 20 }
    ]
  };
}

// 8. Manual Sync / Recalculate Tenant Credits
export async function syncTenantCredits(tenantId: string) {
  await verifyAdminAuth();
  
  const updatedUsed = await recalculateTenantCredits(tenantId);
  
  revalidatePath('/super-admin');
  revalidatePath(`/super-admin/tenants/${tenantId}`);
  revalidatePath('/dashboard');
  
  return { success: true, aiCreditUsed: updatedUsed };
}
