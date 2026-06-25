import { prisma } from '@/lib/db/prisma';
import { parseHtml } from '@/lib/parsers/html-parser';
import { LinkingModule } from '@/lib/scoring/modules/linking';
import { ScoreContext } from '@/lib/scoring/types';
import {
  dashboardJsonError,
  dashboardJsonOk,
  requireDashboardTenant,
} from '@/lib/dashboard/require-tenant';
import {
  assertTenantHasCredits,
  chargeTenantCredits,
  InsufficientCreditsError,
} from '@/lib/credits/charge';

export async function POST(req: Request) {
  const ctx = await requireDashboardTenant();
  if (!ctx) return dashboardJsonError('Unauthorized', 401);

  try {
    await assertTenantHasCredits(ctx.tenantId, 'links.internal');

    const body = await req.json();
    const { siteId, sourceUrl, html, targetKeyword, pageType } = body;

    if (!siteId || !sourceUrl) {
      return dashboardJsonError('Missing required fields: siteId, sourceUrl');
    }

    const site = await prisma.site.findFirst({
      where: { id: siteId, tenantId: ctx.tenantId },
      select: { id: true, domain: true },
    });
    if (!site) return dashboardJsonError('Site not found.', 404);

    let parsed = null;
    if (html && typeof html === 'string') {
      parsed = parseHtml(html, 200, {}, sourceUrl);
    }

    const candidates = await prisma.scoreSnapshot.findMany({
      where: { tenantId: ctx.tenantId, siteId: site.id, normalizedUrl: { not: sourceUrl } },
      orderBy: { createdAt: 'desc' },
      distinct: ['normalizedUrl'],
      take: 20,
      select: { url: true, normalizedUrl: true, finalScore: true },
    });

    const baseDomain = site.domain;
    const sourceText = parsed?.textContent?.toLowerCase() ?? '';

    const suggestions = candidates
      .map((c) => {
        const candidateText = c.url.toLowerCase();
        const relevance = candidateText
          .split(/\W+/)
          .filter((w: string) => w.length > 3 && sourceText.includes(w)).length;
        return {
          targetUrl: c.normalizedUrl,
          title: c.url,
          anchorSuggestion: c.url,
          reason: 'Related page in the same site',
          relationship: 'contextual',
          confidence: Math.min(0.5 + relevance * 0.1, 0.95),
        };
      })
      .filter((s) => s.confidence > 0.5)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);

    let linkModuleResult = null;
    if (parsed) {
      const scoreContext: ScoreContext = {
        url: sourceUrl,
        normalizedUrl: sourceUrl,
        pageType: pageType ?? 'generic',
        locale: 'en-US',
        platform: 'custom',
        parsed,
        targetKeyword,
        enrichments: [],
        tenantId: ctx.tenantId,
      };
      linkModuleResult = await new LinkingModule().run(scoreContext);
    }

    const charge = await chargeTenantCredits({
      tenantId: ctx.tenantId,
      siteId: site.id,
      featureKey: 'links.internal',
      endpoint: 'dashboard/seo/links',
    });

    return dashboardJsonOk({
      sourceUrl,
      sourceSiteId: site.id,
      suggestions,
      orphanRisk: suggestions.length === 0,
      siteGraphStatus: candidates.length > 0 ? 'partial' : 'not_available',
      sourceIssues: linkModuleResult?.issues ?? [],
      createdAt: new Date().toISOString(),
      creditsCharged: charge.charged,
      creditBalance: charge.balance,
    });
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return dashboardJsonError(err.message, 429);
    }
    return dashboardJsonError(err instanceof Error ? err.message : 'Links failed', 500);
  }
}
