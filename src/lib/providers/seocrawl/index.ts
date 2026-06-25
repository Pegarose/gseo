/**
 * SEOCrawl REST provider — Faz 2 GSC / rank / tasks backbone.
 * MCP docs: https://seocrawl.ai/mcp
 *
 * Credential: SEOCRAWL_API_KEY (Bearer sca_live_*)
 * Disable without removing key: SEOCRAWL_ENABLED=false
 */

export {
  SEOCRAWL_BASE_URL,
  SEOCRAWL_ENDPOINTS,
  estimateSeoCrawlCredits,
  getSeoCrawlEndpointDef,
  type SeoCrawlEndpointDef,
} from './endpoints';

export {
  resolveSeoCrawlKey,
  seocrawlFetch,
  stripPropertyHost,
  type SeoCrawlRequestResult,
} from './client';

export { last28DaysRange, lastNDaysRange, type SeoCrawlDateRange } from './dates';

export type {
  SeoCrawlGscKeywordRow,
  SeoCrawlGscPageRow,
  SeoCrawlGscSummary,
  SeoCrawlProperty,
  SeoCrawlTask,
} from './types';

export {
  isSeoCrawlConfigured,
  fetchGscDashboard,
  listSeoCrawlSiteLinks,
  resolvePropertyForDomain,
  type SeoCrawlIntelMeta,
  type SeoCrawlSiteLink,
  SeoCrawlUnavailableError,
  SeoCrawlPropertyNotFoundError,
} from './service';

export {
  formatCount,
  formatCtr,
  formatPct,
  formatPosition,
  type NormalizedGscDashboard,
  type NormalizedGscMetricRow,
} from './normalize';

import { last28DaysRange } from './dates';
import { seocrawlFetch, resolveSeoCrawlKey, stripPropertyHost } from './client';
import type {
  SeoCrawlGscKeywordRow,
  SeoCrawlGscPageRow,
  SeoCrawlGscSummary,
  SeoCrawlListResponse,
  SeoCrawlProperty,
  SeoCrawlTask,
} from './types';

export interface SeoCrawlHealthResult {
  provider: 'SEOCrawl';
  status: 'operational' | 'disabled' | 'failed';
  latencyMs: number;
  propertyCount: number | null;
  lastCheckedAt: string;
  errorMessage?: string;
}

export async function pingSeoCrawlPlatform() {
  return seocrawlFetch<{ status: string }>('health', '/health');
}

export async function listProperties() {
  return seocrawlFetch<SeoCrawlListResponse<SeoCrawlProperty>>(
    'list_properties',
    '/v1/properties'
  );
}

export async function findPropertyByHost(domainOrUrl: string) {
  const host = stripPropertyHost(domainOrUrl);
  const result = await listProperties();
  if (!result.ok || !result.data?.data) {
    return { result, property: null as SeoCrawlProperty | null };
  }
  const property =
    result.data.data.find((p) => stripPropertyHost(p.url) === host) ??
    result.data.data.find((p) => stripPropertyHost(p.title) === host) ??
    null;
  return { result, property };
}

export async function getGscSummary(
  propertyId: string,
  range = last28DaysRange()
) {
  return seocrawlFetch<{ data: SeoCrawlGscSummary }>(
    'gsc_summary',
    '/v1/properties/{propertyId}/gsc/summary',
    { from: range.from, to: range.to },
    { pathParams: { propertyId } }
  );
}

export async function getTopKeywords(
  propertyId: string,
  range = last28DaysRange(),
  limit = 10
) {
  return seocrawlFetch<SeoCrawlListResponse<SeoCrawlGscKeywordRow>>(
    'gsc_top_keywords',
    '/v1/properties/{propertyId}/gsc/top-keywords',
    { from: range.from, to: range.to, limit },
    { pathParams: { propertyId } }
  );
}

export async function getTopPages(
  propertyId: string,
  range = last28DaysRange(),
  limit = 10
) {
  return seocrawlFetch<SeoCrawlListResponse<SeoCrawlGscPageRow>>(
    'gsc_top_pages',
    '/v1/properties/{propertyId}/gsc/top-pages',
    { from: range.from, to: range.to, limit },
    { pathParams: { propertyId } }
  );
}

export async function listTasks(propertyId: string, limit = 10) {
  return seocrawlFetch<SeoCrawlListResponse<SeoCrawlTask>>(
    'list_tasks',
    '/v1/properties/{propertyId}/tasks',
    { limit },
    { pathParams: { propertyId } }
  );
}

/** Health: free /health + authenticated property list (1 MCP credit). */
export async function checkSeoCrawlHealth(): Promise<SeoCrawlHealthResult> {
  const checkedAt = new Date().toISOString();
  const creds = resolveSeoCrawlKey();

  if (!creds) {
    return {
      provider: 'SEOCrawl',
      status: 'disabled',
      latencyMs: 0,
      propertyCount: null,
      lastCheckedAt: checkedAt,
      errorMessage: 'SEOCRAWL_API_KEY not set or SEOCRAWL_ENABLED=false',
    };
  }

  const platform = await pingSeoCrawlPlatform();
  if (!platform.ok) {
    return {
      provider: 'SEOCrawl',
      status: 'failed',
      latencyMs: platform.durationMs,
      propertyCount: null,
      lastCheckedAt: checkedAt,
      errorMessage: platform.errorMessage ?? 'Platform health check failed',
    };
  }

  const props = await listProperties();
  if (!props.ok) {
    return {
      provider: 'SEOCrawl',
      status: 'failed',
      latencyMs: props.durationMs,
      propertyCount: null,
      lastCheckedAt: checkedAt,
      errorMessage: props.errorMessage ?? 'Property list failed',
    };
  }

  return {
    provider: 'SEOCrawl',
    status: 'operational',
    latencyMs: platform.durationMs + props.durationMs,
    propertyCount: props.data?.data?.length ?? 0,
    lastCheckedAt: checkedAt,
  };
}
