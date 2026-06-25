import { parseHtml } from '@/lib/parsers/html-parser';
import { SemanticModule } from '@/lib/scoring/modules/semantic';
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
    await assertTenantHasCredits(ctx.tenantId, 'content.ai');

    const body = await req.json();
    const { html, url = 'https://example.com', targetKeyword, pageType = 'generic' } = body;

    if (!html) return dashboardJsonError('Missing field: html');

    const parsed = parseHtml(html, 200, {}, url);
    const scoreContext: ScoreContext = {
      url,
      normalizedUrl: url,
      pageType,
      locale: 'en-US',
      platform: 'custom',
      parsed,
      targetKeyword,
      enrichments: [],
      tenantId: ctx.tenantId,
    };

    const result = await new SemanticModule().run(scoreContext);
    const semanticData = result.semanticAnalysisData as Record<string, unknown> | undefined;

    const charge = await chargeTenantCredits({
      tenantId: ctx.tenantId,
      featureKey: 'content.ai',
      endpoint: 'dashboard/seo/content-ai',
    });

    return dashboardJsonOk({
      semanticScore: result.score,
      targetKeyword: targetKeyword || null,
      recommendedHeadings: semanticData?.recommendedHeadings ?? [],
      missingEntities: semanticData?.missingTopics ?? [],
      recommendations: result.recommendations,
      providerEnrichment: { provider: 'fallback', status: 'skipped' },
      creditsCharged: charge.charged,
      creditBalance: charge.balance,
    });
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return dashboardJsonError(err.message, 429);
    }
    return dashboardJsonError(err instanceof Error ? err.message : 'Content AI failed', 500);
  }
}
