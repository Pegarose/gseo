/**
 * Low-level SEOCrawl REST client.
 * Auth: Bearer sca_live_* — same key as MCP (https://mcp.seocrawl.ai).
 */

import {
  buildSeoCrawlPath,
  estimateSeoCrawlCredits,
  SEOCRAWL_BASE_URL,
} from './endpoints';

export type SeoCrawlSourceType = 'global_fallback' | 'unavailable';

export interface SeoCrawlRequestResult<T = unknown> {
  ok: boolean;
  status: number;
  data: T | null;
  errorMessage?: string;
  errorCode?: string;
  durationMs: number;
  endpointId: string;
  creditsEstimated: number;
}

export interface SeoCrawlClientOptions {
  apiKey?: string;
  timeoutMs?: number;
}

function isEnabled(): boolean {
  if (process.env.SEOCRAWL_ENABLED === 'false') return false;
  return Boolean(process.env.SEOCRAWL_API_KEY?.trim());
}

export function resolveSeoCrawlKey(): { apiKey: string; sourceType: SeoCrawlSourceType } | null {
  if (!isEnabled()) return null;
  const apiKey = process.env.SEOCRAWL_API_KEY?.trim();
  if (!apiKey) return null;
  return { apiKey, sourceType: 'global_fallback' };
}

export function stripPropertyHost(domainOrUrl: string): string {
  return domainOrUrl
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .replace(/^www\./i, '')
    .trim()
    .toLowerCase();
}

function parseError(body: unknown, fallback: string): { message: string; code?: string } {
  if (body && typeof body === 'object' && 'error' in body) {
    const err = (body as { error: { code?: string; message?: string } }).error;
    if (err?.code) {
      return { message: err.message ?? err.code, code: err.code };
    }
  }
  if (body && typeof body === 'object' && 'detail' in body) {
    return { message: String((body as { detail: unknown }).detail) };
  }
  return { message: fallback };
}

export async function seocrawlFetch<T = unknown>(
  endpointId: string,
  pathTemplate: string,
  query: Record<string, string | number | undefined> = {},
  options?: SeoCrawlClientOptions & { pathParams?: { propertyId?: string } }
): Promise<SeoCrawlRequestResult<T>> {
  const start = Date.now();
  const creditsEstimated = estimateSeoCrawlCredits(endpointId);
  const path = buildSeoCrawlPath(pathTemplate, options?.pathParams ?? {});
  const needsAuth = path !== '/health';

  const creds =
    options?.apiKey != null
      ? { apiKey: options.apiKey, sourceType: 'global_fallback' as const }
      : resolveSeoCrawlKey();

  if (needsAuth && !creds) {
    return {
      ok: false,
      status: 0,
      data: null,
      errorMessage: 'SEOCrawl unavailable (set SEOCRAWL_API_KEY or SEOCRAWL_ENABLED=false)',
      durationMs: Date.now() - start,
      endpointId,
      creditsEstimated,
    };
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  }

  const url = `${SEOCRAWL_BASE_URL}${path}${params.size ? `?${params}` : ''}`;
  const timeoutMs = options?.timeoutMs ?? 30_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (creds) {
    headers.Authorization = `Bearer ${creds.apiKey}`;
  }

  try {
    const resp = await fetch(url, { method: 'GET', headers, signal: controller.signal });
    const durationMs = Date.now() - start;
    const text = await resp.text();

    let data: T | null = null;
    try {
      data = text ? (JSON.parse(text) as T) : null;
    } catch {
      return {
        ok: false,
        status: resp.status,
        data: null,
        errorMessage: `Non-JSON response (${resp.status})`,
        durationMs,
        endpointId,
        creditsEstimated,
      };
    }

    if (!resp.ok) {
      const { message, code } = parseError(data, text.slice(0, 200) || `HTTP ${resp.status}`);
      return {
        ok: false,
        status: resp.status,
        data,
        errorMessage: message,
        errorCode: code,
        durationMs,
        endpointId,
        creditsEstimated,
      };
    }

    return {
      ok: true,
      status: resp.status,
      data,
      durationMs,
      endpointId,
      creditsEstimated,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      data: null,
      errorMessage: err instanceof Error ? err.message : 'Unknown error',
      durationMs: Date.now() - start,
      endpointId,
      creditsEstimated,
    };
  } finally {
    clearTimeout(timer);
  }
}
