import { NextRequest } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/response';
import { prisma } from '@/lib/db/prisma';
import {
  fetchAiCrawlerIntel,
  VebApiUnavailableError,
  isVebApiConfigured,
} from '@/lib/providers/vebapi/service';
import { assertTenantHasCredits, chargeTenantCredits, InsufficientCreditsError } from '@/lib/credits/charge';

const FEATURE_KEY = 'vebapi.ai_seo_crawler';

async function handler(req: NextRequest, context: AuthenticatedContext) {
  const startTime = Date.now();
  const body = await req.json().catch(() => ({}));
  let website = body.website as string | undefined;
  const siteId = (body.siteId as string | undefined) || context.siteId || undefined;

  if (siteId) {
    const site = await prisma.site.findFirst({
      where: { id: siteId, tenantId: context.tenantId },
      select: { domain: true },
    });
    if (!site) {
      return errorResponse('Site not found or access denied.', 'NOT_FOUND', 404, { siteId }, context.requestId);
    }
    website = site.domain;
  }

  if (!website || typeof website !== 'string') {
    return errorResponse(
      'Missing website or siteId.',
      'VALIDATION_ERROR',
      400,
      { fields: ['website', 'siteId'] },
      context.requestId
    );
  }

  if (!isVebApiConfigured()) {
    return errorResponse(
      'VebAPI provider is not configured.',
      'PROVIDER_UNAVAILABLE',
      503,
      { provider: 'vebapi' },
      context.requestId
    );
  }

  try {
    await assertTenantHasCredits(context.tenantId, FEATURE_KEY);
    const intel = await fetchAiCrawlerIntel(website);
    const charge = await chargeTenantCredits({
      tenantId: context.tenantId,
      siteId: siteId ?? context.siteId ?? undefined,
      featureKey: FEATURE_KEY,
      endpoint: 'intel/ai-crawler',
      cached: intel.meta.cached,
    });
    return successResponse(
      {
        ...intel.data,
        meta: {
          ...intel.meta,
          creditsCharged: charge.charged,
          creditBalance: charge.balance,
        },
      },
      Date.now() - startTime,
      context.requestId
    );
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return errorResponse(err.message, 'QUOTA_EXCEEDED', 429, {
        used: err.used,
        limit: err.limit,
        required: err.required,
      }, context.requestId);
    }
    if (err instanceof VebApiUnavailableError) {
      return errorResponse(err.message, 'PROVIDER_UNAVAILABLE', 503, {}, context.requestId);
    }
    return errorResponse(
      err instanceof Error ? err.message : 'VebAPI AI crawler check failed',
      'PROVIDER_ERROR',
      502,
      { provider: 'vebapi' },
      context.requestId
    );
  }
}

export const POST = withAuth(handler, 'ai:read');
