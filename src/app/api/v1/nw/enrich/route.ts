import { NextRequest } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/response';
import { enrichWithNeuronWriter } from '@/lib/providers/neuronwriter';
import { prisma } from '@/lib/db/prisma';
import { checkRateLimit, createRateLimitResponse } from '@/lib/utils/rate-limit';
import { logApiError } from '@/lib/utils/logger';

async function handler(req: NextRequest, context: AuthenticatedContext) {
  const startTime = Date.now();

  // Rate Limit Check (30 req / hour)
  const rl = checkRateLimit(context.tenantId, 'nw/enrich', 30, req.headers.get('x-forwarded-for') || 'unknown');
  if (!rl.success) {
    return createRateLimitResponse(rl.info, context.requestId);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      siteId,
      targetKeyword,
      contentHtml,
      storeResult = false,
    } = body;

    const resolvedSiteId = siteId || context.siteId || null;

    // Verify site belongs to tenant if provided
    if (resolvedSiteId) {
      const site = await prisma.site.findFirst({
        where: { id: resolvedSiteId, tenantId: context.tenantId },
      });
      if (!site) {
        return errorResponse('Site not found or access denied.', 'NOT_FOUND', 404, { siteId: resolvedSiteId }, context.requestId);
      }
    }

    const enrichment = await enrichWithNeuronWriter(
      context.tenantId,
      resolvedSiteId,
      targetKeyword || null,
      startTime
    );

    // Build response — NO credentials, only sourceType
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
      // Surface informational error without leaking internals
      ...(enrichment.providerStatus === 'unavailable' && {
        message: 'No NeuronWriter credentials configured. Configure via site/tenant integration or NEURONWRITER_API_KEY env var.',
        issueCode: 'PROVIDER_ENRICHMENT_UNAVAILABLE',
      }),
      ...(enrichment.providerStatus === 'failed' && {
        message: 'NeuronWriter API request failed. Semantic fallback analyzer is available.',
        issueCode: 'PROVIDER_ENRICHMENT_FAILED',
      }),
    };

    return successResponse(responseData, Date.now() - startTime, context.requestId);
  } catch (error: any) {
    logApiError({
      requestId: context.requestId,
      tenantId: context.tenantId,
      endpoint: 'nw/enrich',
      durationMs: Date.now() - startTime,
      errorCode: 'INTERNAL_ERROR',
      error
    });

    return errorResponse(
      'An unexpected error occurred during NeuronWriter enrichment.',
      'INTERNAL_ERROR',
      500,
      { error: error?.message },
      context.requestId
    );
  }
}

export const POST = withAuth(handler, 'semantic:read');
