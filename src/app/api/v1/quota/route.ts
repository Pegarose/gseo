import { NextRequest } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/response';
import { prisma } from '@/lib/db/prisma';
import { checkRateLimit, createRateLimitResponse } from '@/lib/utils/rate-limit';
import { logApiError } from '@/lib/utils/logger';

const PLAN_LIMITS: Record<string, Record<string, number>> = {
  free:         { scoreRequests: 100,   semanticRequests: 50,   aiVisibilityChecks: 20,  providerEnrichments: 50 },
  starter:      { scoreRequests: 1000,  semanticRequests: 500,  aiVisibilityChecks: 200, providerEnrichments: 300 },
  professional: { scoreRequests: 5000,  semanticRequests: 2000, aiVisibilityChecks: 500, providerEnrichments: 1000 },
  agency:       { scoreRequests: 25000, semanticRequests: 10000, aiVisibilityChecks: 2500, providerEnrichments: 5000 },
};

const RATE_LIMITS: Record<string, number> = {
  free: 10,
  starter: 30,
  professional: 60,
  agency: 120,
};

async function handler(req: NextRequest, context: AuthenticatedContext) {
  const startTime = Date.now();

  // Rate Limit Check (300 req / hour)
  const rl = checkRateLimit(context.tenantId, 'quota', 300, req.headers.get('x-forwarded-for') || 'unknown');
  if (!rl.success) {
    return createRateLimitResponse(rl.info, context.requestId);
  }

  try {
    // Get tenant plan
    const tenant = await prisma.tenant.findUnique({
      where: { id: context.tenantId },
    });
    if (!tenant) {
      return errorResponse('Tenant not found.', 'NOT_FOUND', 404, {}, context.requestId);
    }

    const plan = tenant.plan || 'free';
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS['free'];
    const ratePerMinute = RATE_LIMITS[plan] || RATE_LIMITS['free'];

    // Calculate current period (month start - month end)
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Aggregate usage for this period
    const usageRecords = await prisma.quotaUsage.groupBy({
      by: ['endpoint'],
      where: {
        tenantId: context.tenantId,
        date: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      _sum: {
        units: true,
      },
    });

    // Map usage
    const usageMap: Record<string, number> = {};
    for (const rec of usageRecords) {
      const key = rec.endpoint;
      usageMap[key] = (usageMap[key] || 0) + (rec._sum.units || 0);
    }

    const scoreRequests = (usageMap['score/url'] || 0) + (usageMap['score/content'] || 0);
    const semanticRequests = usageMap['semantic/analyze'] || 0;
    const aiVisibilityChecks = usageMap['ai-visibility/check'] || 0;
    const providerEnrichments = usageMap['nw/enrich'] || 0;

    const data = {
      tenantId: context.tenantId,
      plan,
      period: {
        start: periodStart.toISOString(),
        end: periodEnd.toISOString(),
      },
      usage: {
        scoreRequests,
        scoreRequestsLimit: limits.scoreRequests,
        semanticRequests,
        semanticRequestsLimit: limits.semanticRequests,
        aiVisibilityChecks,
        aiVisibilityChecksLimit: limits.aiVisibilityChecks,
        providerEnrichments,
        providerEnrichmentsLimit: limits.providerEnrichments,
      },
      rateLimit: {
        limitPerMinute: ratePerMinute,
        remaining: ratePerMinute, // Phase 0: simplified, not tracking per-minute
        resetAt: new Date(now.getTime() + 60_000).toISOString(),
      },
    };

    const durationMs = Date.now() - startTime;
    return successResponse(data, durationMs, context.requestId);
  } catch (error: any) {
    logApiError({
      requestId: context.requestId,
      tenantId: context.tenantId,
      endpoint: 'quota',
      durationMs: Date.now() - startTime,
      errorCode: 'INTERNAL_ERROR',
      error
    });

    return errorResponse(
      'Failed to retrieve quota information.',
      'INTERNAL_ERROR',
      500,
      { error: error?.message },
      context.requestId
    );
  }
}

export const GET = withAuth(handler, 'quota:read');
