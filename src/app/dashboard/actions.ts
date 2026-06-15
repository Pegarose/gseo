'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';

// 1. Authentication Helper
export async function getDashboardTenantContext() {
  const session = await auth();

  // Impersonation support: super_admin may view a tenant dashboard read-only
  const impersonatedTenantId = session?.user.impersonatedTenantId;
  const effectiveTenantId = impersonatedTenantId ?? session?.user.tenantId;

  if (!effectiveTenantId) {
    // Demo mode fallback for local development
    if (process.env.NODE_ENV === 'development' || process.env.DASHBOARD_DEMO_MODE === 'true') {
      const seedTenant = await prisma.tenant.findUnique({
        where: { slug: 'gmedya' }
      });
      if (seedTenant) {
        return { tenantId: seedTenant.id, readOnly: !!impersonatedTenantId };
      }
    }
    throw new Error('No tenant associated with this account.');
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: effectiveTenantId } });
  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  return { tenantId: tenant.id, readOnly: !!impersonatedTenantId };
}

// 2. Overview Page Metrics
export async function getOverviewMetrics() {
  const { tenantId } = await getDashboardTenantContext();

  // 1. Fetch sites with their latest snapshot and critical issues
  const sites = await prisma.site.findMany({
    where: { tenantId },
    include: {
      snapshots: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          auditIssues: {
            where: { severity: 'critical' },
            select: { id: true }
          }
        }
      }
    }
  });

  // Calculate sites at risk & needing attention list
  const sitesNeedingAttention = sites
    .filter(site => {
      const latestSnapshot = site.snapshots[0];
      if (!latestSnapshot) return false;
      const hasCriticalIssue = latestSnapshot.auditIssues.length > 0;
      return latestSnapshot.finalScore < 60 || hasCriticalIssue;
    })
    .map(site => ({
      id: site.id,
      name: site.name,
      domain: site.domain,
      latestScore: site.snapshots[0]?.finalScore ?? 0,
      criticalIssueCount: site.snapshots[0]?.auditIssues.length ?? 0,
      updatedAt: site.updatedAt
    }));

  const sitesAtRisk = sitesNeedingAttention.length;

  // 2. Count total critical issues for active tenant
  const totalCriticalIssues = await prisma.auditIssue.count({
    where: {
      tenantId,
      severity: 'critical'
    }
  });

  // 3. Count low AI readiness pages (< 50)
  const lowAiReadinessCount = await prisma.aiVisibilityCheck.count({
    where: {
      tenantId,
      aiVisibilityReadinessScore: { lt: 50 }
    }
  });

  // 4. Monthly AI Analysis Credit quota usage database query
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      aiCreditLimit: true,
      aiCreditUsed: true
    }
  });

  const aiCredits = {
    used: tenant?.aiCreditUsed ?? 0,
    limit: tenant?.aiCreditLimit ?? 500
  };

  // 5. Get recent audits (score snapshots)
  const recentAudits = await prisma.scoreSnapshot.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      site: {
        select: { domain: true }
      }
    }
  });

  // 6. Get quick wins
  const quickWins = await getQuickWins(10);

  return {
    sitesAtRisk,
    totalCriticalIssues,
    lowAiReadinessCount,
    aiCredits,
    recentAudits,
    sitesNeedingAttention,
    quickWins
  };
}

// 2.1 Get Quick Wins
export async function getQuickWins(take = 10) {
  const { tenantId } = await getDashboardTenantContext();
  return prisma.recommendation.findMany({
    where: {
      tenantId,
      estimatedEffort: 'low',
      estimatedImpact: { in: ['medium', 'high'] }
    },
    orderBy: { createdAt: 'desc' },
    take,
    include: {
      scoreSnapshot: {
        select: {
          url: true,
          site: {
            select: { domain: true }
          }
        }
      }
    }
  });
}

// 3. Recent Audits
export async function getRecentAudits(take = 5) {
  const { tenantId } = await getDashboardTenantContext();

  return prisma.scoreSnapshot.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    take,
    include: {
      site: {
        select: { domain: true }
      }
    }
  });
}

// 4. Top Critical Issues
export async function getTopIssues() {
  const { tenantId } = await getDashboardTenantContext();

  // Group by issue code to find the most frequent critical/high issues
  const issuesGrouped = await prisma.auditIssue.groupBy({
    by: ['code', 'title', 'severity'],
    where: {
      tenantId,
      severity: { in: ['critical', 'high'] }
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5
  });

  return issuesGrouped.map(i => ({
    code: i.code,
    title: i.title,
    severity: i.severity,
    count: i._count.id
  }));
}

// 5. List Sites
export async function getSites() {
  const { tenantId } = await getDashboardTenantContext();

  return prisma.site.findMany({
    where: { tenantId },
    include: {
      snapshots: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { finalScore: true, scoreBand: true, createdAt: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

// 6. Site Details
export async function getSiteDetail(siteId: string) {
  const { tenantId } = await getDashboardTenantContext();

  return prisma.site.findFirst({
    where: { id: siteId, tenantId },
    include: {
      snapshots: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  });
}

// 7. AI Visibility Overview
export async function getAiVisibilityOverview() {
  const { tenantId } = await getDashboardTenantContext();

  const checks = await prisma.aiVisibilityCheck.findMany({
    where: { tenantId },
    include: {
      scoreSnapshot: {
        select: {
          url: true,
          createdAt: true
        }
      }
    },
    orderBy: { aiVisibilityReadinessScore: 'asc' }
  });

  const missingAnswerBlocks = checks.filter(c => c.answerability < 50).length;
  const weakCitationReadiness = checks.filter(c => c.citationReadiness < 50).length;
  const entityClarityIssues = checks.filter(c => c.entityClarity < 50).length;
  const lowAiReadinessPages = checks.filter(c => c.aiVisibilityReadinessScore < 50).length;

  const pagesNeedingWork = checks
    .filter(c => c.aiVisibilityReadinessScore < 50)
    .map(c => {
      // Determine main weakness
      const scores = [
        { name: 'Answer Blocks', score: c.answerability, action: 'Add question-answer pairs and FAQ structure.' },
        { name: 'Citation Readiness', score: c.citationReadiness, action: 'Include reliable sources and structured citation-friendly formatting.' },
        { name: 'Entity Clarity', score: c.entityClarity, action: 'Define entities clearly with schema.org markup.' }
      ];
      // Sort ascending to find lowest score
      scores.sort((a, b) => a.score - b.score);
      const lowest = scores[0];

      return {
        id: c.id,
        url: c.scoreSnapshot?.url ?? 'Unknown',
        aiScore: c.aiVisibilityReadinessScore,
        mainWeakness: lowest ? lowest.name : 'General Structure',
        suggestedAction: lowest ? lowest.action : 'Improve content structure.',
        isExperimental: true,
        lastAnalyzed: c.scoreSnapshot?.createdAt ?? c.createdAt
      };
    });

  return {
    missingAnswerBlocks,
    weakCitationReadiness,
    entityClarityIssues,
    lowAiReadinessPages,
    pagesNeedingWork
  };
}

// 8. Settings Summary
export async function getSettingsSummary() {
  const { tenantId } = await getDashboardTenantContext();

  return prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      name: true,
      plan: true,
      createdAt: true,
      apiKeys: {
        where: { revokedAt: null },
        select: { id: true, name: true, keyPrefix: true, createdAt: true },
        take: 5
      }
    }
  });
}
