/**
 * Low-level VebAPI HTTP client.
 * Auth: X-API-KEY header — https://vebapi.com/apis
 */

import { estimateCredits, VEBAPI_BASE_URL } from './endpoints';

export type VebApiSourceType = 'global_fallback' | 'unavailable';

export type VebApiProviderStatus = 'success' | 'unavailable' | 'failed' | 'disabled';

export interface VebApiRequestResult<T = unknown> {
  ok: boolean;
  status: number;
  data: T | null;
  errorMessage?: string;
  durationMs: number;
  endpointId: string;
  creditsEstimated: number;
}

export interface VebApiClientOptions {
  apiKey?: string;
  /** Abort slow requests (default 30s) */
  timeoutMs?: number;
}

function isEnabled(): boolean {
  if (process.env.VEBAPI_ENABLED === 'false') return false;
  return Boolean(process.env.VEBAPI_API_KEY);
}

export function resolveVebApiKey(): { apiKey: string; sourceType: VebApiSourceType } | null {
  if (!isEnabled()) return null;
  const apiKey = process.env.VEBAPI_API_KEY?.trim();
  if (!apiKey) return null;
  return { apiKey, sourceType: 'global_fallback' };
}

export function stripWebsiteParam(domainOrUrl: string): string {
  return domainOrUrl
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .trim();
}

export async function vebApiGet<T = unknown>(
  endpointId: string,
  path: string,
  query: Record<string, string | number | undefined>,
  options?: VebApiClientOptions & { creditOptions?: { pageCount?: number } }
): Promise<VebApiRequestResult<T>> {
  const start = Date.now();
  const creditsEstimated = estimateCredits(endpointId, options?.creditOptions);

  const creds = options?.apiKey
    ? { apiKey: options.apiKey, sourceType: 'global_fallback' as const }
    : resolveVebApiKey();

  if (!creds) {
    return {
      ok: false,
      status: 0,
      data: null,
      errorMessage: 'VebAPI unavailable (set VEBAPI_API_KEY or VEBAPI_ENABLED=false)',
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

  const url = `${VEBAPI_BASE_URL}${path}${params.size ? `?${params}` : ''}`;
  const timeoutMs = options?.timeoutMs ?? 30_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-KEY': creds.apiKey,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    const durationMs = Date.now() - start;
    let data: T | null = null;
    let errorMessage: string | undefined;

    const text = await resp.text();
    try {
      data = text ? (JSON.parse(text) as T) : null;
    } catch {
      errorMessage = `Non-JSON response (${resp.status})`;
    }

    if (!resp.ok) {
      const bodyMsg =
        data && typeof data === 'object' && 'message' in data
          ? String((data as { message: unknown }).message)
          : text.slice(0, 200);
      return {
        ok: false,
        status: resp.status,
        data,
        errorMessage: errorMessage ?? bodyMsg ?? `HTTP ${resp.status}`,
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
    const message = err instanceof Error ? err.message : 'Unknown error';
    return {
      ok: false,
      status: 0,
      data: null,
      errorMessage: message,
      durationMs: Date.now() - start,
      endpointId,
      creditsEstimated,
    };
  } finally {
    clearTimeout(timer);
  }
}
