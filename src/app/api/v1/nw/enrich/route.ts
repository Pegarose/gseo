import { NextRequest } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/response';
import { enrichWithNeuronWriter } from '@/lib/providers/neuronwriter';
import { prisma } from '@/lib/db/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import { createRateLimitResponse } from '@/lib/utils/rate-limit';
import { logApiError } from '@/lib/utils/logger';
import { checkQuotaLimit, incrementTenantCredits } from '@/lib/auth/quota';

async function handler(req: NextRequest, context: AuthenticatedContext) {
  const startTime = Date.now();

  // Rate Limit Check (30 req / hour)
    const rl = await checkRateLimit(context.tenantId, 'nw/enrich', 30, req.headers.get('x-forwarded-for') || 'unknown');
    if (!rl.success) {
      return createRateLimitResponse(rl.info, context.requestId);
    }

    // --- Quota Limit Check ---
    const quota = await checkQuotaLimit(context.tenantId);
    if (!quota.success) {
      return errorResponse(
        `AI Credit quota limit exceeded. Current monthly usage: ${quota.used}/${quota.limit}`,
        'QUOTA_EXCEEDED',
        403,
        { used: quota.used, limit: quota.limit },
        context.requestId
      );
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

    // Track provider enrichment quota usage and increment cached credit counter
    await prisma.quotaUsage.create({
      data: {
        tenantId: context.tenantId,
        siteId: resolvedSiteId,
        endpoint: 'nw/enrich',
        units: 1,
        date: new Date(new Date().toISOString().split('T')[0]),
      },
    });
    await incrementTenantCredits(context.tenantId);

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
  } catch (error) {
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
      { error: error instanceof Error ? error.message : 'Unknown error' },
      context.requestId
    );
  }
}

export const POST = withAuth(handler, 'semantic:read');
