import { NextRequest } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/response';
import { parseHtml } from '@/lib/parsers/html-parser';
import { SemanticModule } from '@/lib/scoring/modules/semantic';
import { ScoreContext } from '@/lib/scoring/types';

async function handler(req: NextRequest, context: AuthenticatedContext) {
  const startTime = Date.now();
  const body = await req.json().catch(() => ({}));
  const { html, url = 'https://example.com', targetKeyword, pageType = 'generic' } = body;

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
    targetKeyword,
    enrichments: [],
    tenantId: context.tenantId,
  };

  const module = new SemanticModule();
  const result = await module.run(scoreContext);

  const data = {
    semanticScore: result.score,
    maxSemanticScore: result.maxScore,
    targetKeyword: targetKeyword || null,
    inferredPrimaryTopic: (result.semanticAnalysisData as Record<string, unknown> | undefined)?.inferredPrimaryTopic ?? null,
    topicConfidence: (result.semanticAnalysisData as Record<string, unknown> | undefined)?.topicConfidence ?? null,
    semanticCoverageScore: (result.semanticAnalysisData as Record<string, unknown> | undefined)?.semanticCoverageScore ?? null,
    missingEntities: (result.semanticAnalysisData as Record<string, unknown> | undefined)?.missingTopics ?? [],
    competitorGaps: [],
    recommendedHeadings: (result.semanticAnalysisData as Record<string, unknown> | undefined)?.recommendedHeadings ?? [],
    issues: result.issues,
    recommendations: result.recommendations,
    providerEnrichment: {
      provider: 'fallback',
      status: 'skipped',
    },
  };

  return successResponse(data, Date.now() - startTime, context.requestId);
}

export const POST = withAuth(handler, 'semantic:read');
