import { NextRequest } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/response';
import { prisma } from '@/lib/db/prisma';
import { enqueueSiteCrawl } from '@/lib/crawler/queue';
import { checkRateLimit } from '@/lib/rate-limit';
import { createRateLimitResponse } from '@/lib/utils/rate-limit';
import { logAuditEvent } from '@/lib/audit/logger';
import {
  assertTenantHasCredits,
  chargeTenantCredits,
  InsufficientCreditsError,
} from '@/lib/credits/charge';

const FEATURE_KEY = 'crawl.site';

async function handler(req: NextRequest, context: AuthenticatedContext) {
  const startTime = Date.now();

  const rl = await checkRateLimit(
    context.tenantId,
    'sites/crawl',
    10,
    req.headers.get('x-forwarded-for') || 'unknown'
  );
  if (!rl.success) {
    return createRateLimitResponse(rl.info, context.requestId);
  }

  try {
    const siteId = req.url.split('/sites/')[1]?.split('/crawl')[0];
    if (!siteId) {
      return errorResponse('Missing siteId in path.', 'VALIDATION_ERROR', 400, {}, context.requestId);
    }

    const site = await prisma.site.findFirst({
      where: { id: siteId, tenantId: context.tenantId },
    });

    if (!site) {
      return errorResponse(
        'Site not found or access denied.',
        'NOT_FOUND',
        404,
        { siteId },
        context.requestId
      );
    }

    const body = await req.json().catch(() => ({}));
    const maxPages = typeof body.maxPages === 'number' ? body.maxPages : 25;

    await assertTenantHasCredits(context.tenantId, FEATURE_KEY);

    const job = await enqueueSiteCrawl({
      tenantId: context.tenantId,
      siteId: site.id,
      startUrl: body.startUrl || `https://${site.domain}`,
      maxPages,
      options: {
        renderJavascript: body.renderJavascript === true,
        includeAiVisibility: body.includeAiVisibility !== false,
      },
    });

    const charge = await chargeTenantCredits({
      tenantId: context.tenantId,
      siteId: site.id,
      featureKey: FEATURE_KEY,
      endpoint: 'sites/crawl',
    });

    await logAuditEvent({
      tenantId: context.tenantId,
      actorId: context.apiKeyId,
      actorType: 'api_key',
      action: 'site.crawl_queued',
      resource: site.id,
      metadata: {
        jobId: job.id,
        startUrl: body.startUrl || `https://${site.domain}`,
        maxPages,
        creditsCharged: charge.charged,
      },
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    return successResponse(
      {
        crawlJobId: job.id,
        siteId: site.id,
        status: 'queued',
        startUrl: body.startUrl || `https://${site.domain}`,
        creditsCharged: charge.charged,
        creditBalance: charge.balance,
      },
      Date.now() - startTime,
      context.requestId
    );
  } catch (error: any) {
    if (error instanceof InsufficientCreditsError) {
      return errorResponse(error.message, 'QUOTA_EXCEEDED', 429, {
        used: error.used,
        limit: error.limit,
        required: error.required,
      }, context.requestId);
    }
    return errorResponse(
      error.message || 'Failed to enqueue site crawl.',
      'INTERNAL_ERROR',
      500,
      { error: error.message },
      context.requestId
    );
  }
}

export const POST = withAuth(handler, 'site:write');
