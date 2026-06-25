import { NextRequest } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/response';
import {
  fetchKeywordIntel,
  VebApiUnavailableError,
  isVebApiConfigured,
} from '@/lib/providers/vebapi/service';
import { assertTenantHasCredits, chargeTenantCredits, InsufficientCreditsError } from '@/lib/credits/charge';
import { VEBAPI_ENDPOINT_TO_FEATURE } from '@/lib/credits/catalog';

async function handler(req: NextRequest, context: AuthenticatedContext) {
  const startTime = Date.now();
  const body = await req.json().catch(() => ({}));
  const { keyword, country = 'tr', mode = 'research' } = body;

  if (!keyword || typeof keyword !== 'string' || keyword.trim().length < 2) {
    return errorResponse(
      'Missing or invalid field: keyword (min 2 chars)',
      'VALIDATION_ERROR',
      400,
      { field: 'keyword' },
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

  const endpointId = mode === 'single' ? 'singlekeyword' : 'keywordresearch';
  const featureKey = VEBAPI_ENDPOINT_TO_FEATURE[endpointId] ?? 'vebapi.keywordresearch';

  try {
    await assertTenantHasCredits(context.tenantId, featureKey);

    const intel = await fetchKeywordIntel(
      keyword.trim(),
      String(country).toLowerCase(),
      mode === 'single' ? 'single' : 'research'
    );

    const charge = await chargeTenantCredits({
      tenantId: context.tenantId,
      siteId: context.siteId ?? undefined,
      featureKey,
      endpoint: `intel/keywords`,
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
      err instanceof Error ? err.message : 'VebAPI keyword request failed',
      'PROVIDER_ERROR',
      502,
      { provider: 'vebapi' },
      context.requestId
    );
  }
}

export const POST = withAuth(handler, 'semantic:read');
