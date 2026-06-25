import {
  dashboardJsonError,
  dashboardJsonOk,
  requireDashboardTenant,
} from '@/lib/dashboard/require-tenant';
import { runUrlScore } from '@/lib/scoring/url-score-service';
import { InsufficientCreditsError } from '@/lib/credits/charge';

export async function POST(req: Request) {
  const ctx = await requireDashboardTenant();
  if (!ctx) return dashboardJsonError('Unauthorized', 401);
  if (ctx.readOnly) return dashboardJsonError('Read-only impersonation mode.', 403);

  try {
    const body = await req.json();
    const { siteId, url, targetKeyword, pageType, locale, platform, options } = body;

    if (!siteId || !url) {
      return dashboardJsonError('Missing required fields: siteId, url');
    }

    const data = await runUrlScore({
      tenantId: ctx.tenantId,
      siteId,
      url,
      targetKeyword,
      pageType,
      locale,
      platform,
      options,
    });

    return dashboardJsonOk(data);
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return dashboardJsonError(err.message, 429);
    }
    const message = err instanceof Error ? err.message : 'URL scoring failed';
    const status = message.includes('Failed to fetch') ? 422 : 500;
    return dashboardJsonError(message, status);
  }
}
