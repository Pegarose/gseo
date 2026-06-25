import { NextRequest } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/response';
import { parseHtml } from '@/lib/parsers/html-parser';
import { SemanticModule } from '@/lib/scoring/modules/semantic';
import { ScoreContext } from '@/lib/scoring/types';
import {
  assertTenantHasCredits,
  chargeTenantCredits,
  InsufficientCreditsError,
} from '@/lib/credits/charge';

const FEATURE_KEY = 'content.ai';

async function handler(req: NextRequest, context: AuthenticatedContext) {
  const startTime = Date.now();

  try {
    const body = await req.json().catch(() => ({}));
    const { html, url = 'https://example.com', targetKeyword, pageType = 'generic' } = body;

    if (!html || typeof html !== 'string') {
      return errorResponse(
        'Missing or invalid field: html',
        'VALIDATION_ERROR',
        400,
        { field: 'html' },
        context.requestId
      );
    }

    await assertTenantHasCredits(context.tenantId, FEATURE_KEY);

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

    const charge = await chargeTenantCredits({
      tenantId: context.tenantId,
      featureKey: FEATURE_KEY,
      endpoint: 'semantic/analyze',
    });

    const data = {
      semanticScore: result.score,
      maxSemanticScore: result.maxScore,
      targetKeyword: targetKeyword || null,
      inferredPrimaryTopic:
        (result.semanticAnalysisData as Record<string, unknown> | undefined)?.inferredPrimaryTopic ??
        null,
      topicConfidence:
        (result.semanticAnalysisData as Record<string, unknown> | undefined)?.topicConfidence ??
        null,
      semanticCoverageScore:
        (result.semanticAnalysisData as Record<string, unknown> | undefined)?.semanticCoverageScore ??
        null,
      missingEntities:
        (result.semanticAnalysisData as Record<string, unknown> | undefined)?.missingTopics ?? [],
      competitorGaps: [],
      recommendedHeadings:
        (result.semanticAnalysisData as Record<string, unknown> | undefined)?.recommendedHeadings ??
        [],
      issues: result.issues,
      recommendations: result.recommendations,
      providerEnrichment: {
        provider: 'fallback',
        status: 'skipped',
      },
      creditsCharged: charge.charged,
      creditBalance: charge.balance,
    };

    return successResponse(data, Date.now() - startTime, context.requestId);
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return errorResponse(err.message, 'QUOTA_EXCEEDED', 429, {
        used: err.used,
        limit: err.limit,
        required: err.required,
      }, context.requestId);
    }
    return errorResponse(
      err instanceof Error ? err.message : 'Semantic analysis failed',
      'INTERNAL_ERROR',
      500,
      {},
      context.requestId
    );
  }
}

export const POST = withAuth(handler, 'semantic:read');
