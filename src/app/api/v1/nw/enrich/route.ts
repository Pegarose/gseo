import { NextRequest } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/response';
import { enrichWithNeuronWriter } from '@/lib/providers/neuronwriter';
import { checkRateLimit } from '@/lib/rate-limit';
import { createRateLimitResponse } from '@/lib/utils/rate-limit';
import { logApiError } from '@/lib/utils/logger';
import {
  assertTenantHasCredits,
  chargeTenantCredits,
  InsufficientCreditsError,
} from '@/lib/credits/charge';

const FEATURE_KEY = 'neuronwriter.enrich';

async function handler(req: NextRequest, context: AuthenticatedContext) {
  const startTime = Date.now();

  try {
    const body = await req.json().catch(() => ({}));
    const { siteId, targetKeyword } = body;
    const resolvedSiteId = siteId || context.siteId;

    const rl = await checkRateLimit(
      context.tenantId,
      'nw/enrich',
      30,
      req.headers.get('x-forwarded-for') || 'unknown'
    );
    if (!rl.success) {
      return createRateLimitResponse(rl.info, context.requestId);
    }

    await assertTenantHasCredits(context.tenantId, FEATURE_KEY);

    const enrichment = await enrichWithNeuronWriter(
      context.tenantId,
      resolvedSiteId,
      targetKeyword || null,
      startTime
    );

    const charge = await chargeTenantCredits({
      tenantId: context.tenantId,
      siteId: resolvedSiteId ?? undefined,
      featureKey: FEATURE_KEY,
      endpoint: 'nw/enrich',
      cached: enrichment.providerStatus === 'mocked' || enrichment.providerStatus === 'unavailable',
    });

    const responseData = {
      provider: 'neuronwriter',
      sourceType: enrichment.sourceType,
      providerStatus: enrichment.providerStatus,
      targetKeyword: enrichment.targetKeyword,
      contentScore: enrichment.contentScore,
      targetWordCount: enrichment.targetWordCount,
      targetReadability: enrichment.targetReadability,
      terms: enrichment.terms,
      competitorGaps: enrichment.competitorGaps,
      recommendedHeadings: enrichment.recommendedHeadings,
      confidence: enrichment.confidence,
      durationMs: enrichment.durationMs,
      creditsCharged: charge.charged,
      creditBalance: charge.balance,
      ...(enrichment.providerStatus === 'unavailable' && {
        message:
          'No NeuronWriter credentials configured. Configure via site/tenant integration or NEURONWRITER_API_KEY env var.',
        issueCode: 'PROVIDER_ENRICHMENT_UNAVAILABLE',
      }),
      ...(enrichment.providerStatus === 'failed' && {
        message: 'NeuronWriter API request failed. Semantic fallback analyzer is available.',
        issueCode: 'PROVIDER_ENRICHMENT_FAILED',
      }),
    };

    return successResponse(responseData, Date.now() - startTime, context.requestId);
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      return errorResponse(
        error.message,
        'QUOTA_EXCEEDED',
        429,
        { used: error.used, limit: error.limit, required: error.required },
        context.requestId
      );
    }

    logApiError({
      requestId: context.requestId,
      tenantId: context.tenantId,
      endpoint: 'nw/enrich',
      durationMs: Date.now() - startTime,
      errorCode: 'INTERNAL_ERROR',
      error,
    });

    return errorResponse(
      'An unexpected error occurred during NeuronWriter enrichment.',
      'INTERNAL_ERROR',
      500,
      { error: error instanceof Error ? error.message : 'Unknown error' },
      context.requestId
    );
  }
}

export const POST = withAuth(handler, 'semantic:read');
