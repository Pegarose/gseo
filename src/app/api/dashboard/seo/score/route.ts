import {
  dashboardJsonError,
  dashboardJsonOk,
  requireDashboardTenant,
} from '@/lib/dashboard/require-tenant';
import { runContentScore } from '@/lib/scoring/content-score-service';

export async function POST(req: Request) {
  const ctx = await requireDashboardTenant();
  if (!ctx) {
    return dashboardJsonError('Unauthorized', 401);
  }
  if (ctx.readOnly) {
    return dashboardJsonError('Read-only impersonation mode.', 403);
  }

  try {
    const body = await req.json();
    const { siteId, html, url, title, metaDescription, targetKeyword, pageType, locale, platform, options } =
      body;

    if (!siteId || !html || !url) {
      return dashboardJsonError('Missing required fields: siteId, html, url');
    }

    const data = await runContentScore({
      tenantId: ctx.tenantId,
      siteId,
      html,
      url,
      title,
      metaDescription,
      targetKeyword,
      pageType,
      locale,
      platform,
      options,
    });

    return dashboardJsonOk(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Scoring failed';
    const status = message.includes('quota') ? 403 : message.includes('not found') ? 404 : 500;
    return dashboardJsonError(message, status);
  }
}
