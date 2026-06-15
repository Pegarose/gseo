import { NextRequest } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/response';
import { parseHtml } from '@/lib/parsers/html-parser';
import { AiVisibilityModule } from '@/lib/scoring/modules/ai-visibility';
import { ScoreContext } from '@/lib/scoring/types';

async function handler(req: NextRequest, context: AuthenticatedContext) {
  const startTime = Date.now();
  const body = await req.json().catch(() => ({}));
  const { html, url = 'https://example.com', pageType = 'generic' } = body;

  if (!html || typeof html !== 'string') {
    return errorResponse('Missing or invalid field: html', 'VALIDATION_ERROR', 400, { field: 'html' }, context.requestId);
  }

  const parsed = parseHtml(html, 200, {}, url);
  const scoreContext: ScoreContext = {
    url,
    normalizedUrl: url,
    pageType,
    locale: 'en-US',
    platform: 'custom',
    parsed,
    targetKeyword: body.targetKeyword,
    enrichments: [],
    tenantId: context.tenantId,
  };

  const module = new AiVisibilityModule();
  const result = await module.run(scoreContext);

  const data = {
    disclaimer: 'This score estimates AI visibility readiness, not guaranteed visibility in AI answers.',
    aiVisibilityReadinessScore: Math.round(result.aiVisibilityData?.platformReadiness?.reduce((acc, p) => acc + p.score, 0) ?? 0 / (result.aiVisibilityData?.platformReadiness?.length || 1)),
    signals: {
      answerability: result.aiVisibilityData?.answerability ?? 0,
      citationReadiness: result.aiVisibilityData?.citationReadiness ?? 0,
      entityClarity: result.aiVisibilityData?.entityClarity ?? 0,
      aiParseability: result.aiVisibilityData?.aiParseability ?? 0,
      brandTrustSignals: result.aiVisibilityData?.sourceTrustSignals ?? 0,
    },
    platformReadiness: result.aiVisibilityData?.platformReadiness ?? [],
    issues: result.issues,
    experimentalSignals: result.issues.filter(i => i.severity === 'experimental' || i.severity === 'info'),
    recommendations: result.recommendations,
  };

  return successResponse(data, Date.now() - startTime, context.requestId);
}

export const POST = withAuth(handler, 'ai:read');
