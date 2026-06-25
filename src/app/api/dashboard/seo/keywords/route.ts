import {
  dashboardJsonError,
  dashboardJsonOk,
  requireDashboardTenant,
} from '@/lib/dashboard/require-tenant';
import {
  fetchKeywordIntel,
  isVebApiConfigured,
  VebApiUnavailableError,
} from '@/lib/providers/vebapi/service';
import {
  assertTenantHasCredits,
  chargeTenantCredits,
  InsufficientCreditsError,
} from '@/lib/credits/charge';
import { VEBAPI_ENDPOINT_TO_FEATURE } from '@/lib/credits/catalog';

export async function POST(req: Request) {
  const ctx = await requireDashboardTenant();
  if (!ctx) return dashboardJsonError('Unauthorized', 401);

  if (!isVebApiConfigured()) {
    return dashboardJsonError('VebAPI provider is not configured.', 503);
  }

  try {
    const body = await req.json();
    const { keyword, country = 'tr', mode = 'research' } = body;

    if (!keyword || String(keyword).trim().length < 2) {
      return dashboardJsonError('Missing field: keyword (min 2 chars)');
    }

    const endpointId = mode === 'single' ? 'singlekeyword' : 'keywordresearch';
    const featureKey = VEBAPI_ENDPOINT_TO_FEATURE[endpointId] ?? 'vebapi.keywordresearch';

    await assertTenantHasCredits(ctx.tenantId, featureKey);

    const intel = await fetchKeywordIntel(
      String(keyword).trim(),
      String(country).toLowerCase(),
      mode === 'single' ? 'single' : 'research'
    );

    const charge = await chargeTenantCredits({
      tenantId: ctx.tenantId,
      featureKey,
      endpoint: 'dashboard/seo/keywords',
      cached: intel.meta.cached,
    });

    return dashboardJsonOk({
      ...intel.data,
      meta: {
        ...intel.meta,
        creditsCharged: charge.charged,
        creditBalance: charge.balance,
      },
    });
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return dashboardJsonError(err.message, 429);
    }
    if (err instanceof VebApiUnavailableError) {
      return dashboardJsonError(err.message, 503);
    }
    return dashboardJsonError(err instanceof Error ? err.message : 'Keywords failed', 502);
  }
}
