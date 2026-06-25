/**
 * Cached VebAPI service layer for dashboard + API routes.
 */

import { LRUCache } from 'lru-cache';
import {
  resolveVebApiKey,
  vebApiGet,
  stripWebsiteParam,
} from './client';
import {
  normalizeAiCrawler,
  normalizeBacklinkData,
  normalizeKeywordResearch,
  type NormalizedAiCrawlerIntel,
  type NormalizedBacklinkIntel,
  type NormalizedKeywordIntel,
} from './normalize';
import { estimateCredits } from './endpoints';

const cache = new LRUCache<string, object>({
  max: 256,
  ttl: 1000 * 60 * 60 * 6, // 6h — conserve trial credits
});

export class VebApiUnavailableError extends Error {
  constructor(message = 'VebAPI is not configured or disabled') {
    super(message);
    this.name = 'VebApiUnavailableError';
  }
}

function assertAvailable() {
  if (!resolveVebApiKey()) {
    throw new VebApiUnavailableError();
  }
}

export interface VebApiIntelMeta {
  provider: 'vebapi';
  cached: boolean;
  creditsEstimated: number;
  durationMs: number;
  disclaimer: string;
}

const DISCLAIMER =
  'Metrics from VebAPI (third-party estimate). Not official Google/Moz data.';

export async function fetchKeywordIntel(
  keyword: string,
  country = 'tr',
  mode: 'research' | 'single' = 'research'
): Promise<{ data: NormalizedKeywordIntel; meta: VebApiIntelMeta }> {
  assertAvailable();
  const cacheKey = `kw:${mode}:${country}:${keyword.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return {
      data: cached as NormalizedKeywordIntel,
      meta: {
        provider: 'vebapi',
        cached: true,
        creditsEstimated: 0,
        durationMs: 0,
        disclaimer: DISCLAIMER,
      },
    };
  }

  const endpointId = mode === 'single' ? 'singlekeyword' : 'keywordresearch';
  const path = mode === 'single' ? '/seo/singlekeyword' : '/seo/keywordresearch';
  const result = await vebApiGet(endpointId, path, { keyword, country });

  if (!result.ok || result.data == null) {
    throw new Error(result.errorMessage ?? 'VebAPI keyword request failed');
  }

  const normalized = normalizeKeywordResearch(keyword, country, result.data);
  cache.set(cacheKey, normalized);

  return {
    data: normalized,
    meta: {
      provider: 'vebapi',
      cached: false,
      creditsEstimated: estimateCredits(endpointId),
      durationMs: result.durationMs,
      disclaimer: DISCLAIMER,
    },
  };
}

export async function fetchBacklinkIntel(
  website: string
): Promise<{ data: NormalizedBacklinkIntel; meta: VebApiIntelMeta }> {
  assertAvailable();
  const host = stripWebsiteParam(website);
  const cacheKey = `bl:${host}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return {
      data: cached as NormalizedBacklinkIntel,
      meta: {
        provider: 'vebapi',
        cached: true,
        creditsEstimated: 0,
        durationMs: 0,
        disclaimer: DISCLAIMER,
      },
    };
  }

  const result = await vebApiGet('backlinkdata', '/seo/backlinkdata', { website: host });
  if (!result.ok || result.data == null) {
    throw new Error(result.errorMessage ?? 'VebAPI backlink request failed');
  }

  const normalized = normalizeBacklinkData(host, result.data);
  cache.set(cacheKey, normalized);

  return {
    data: normalized,
    meta: {
      provider: 'vebapi',
      cached: false,
      creditsEstimated: estimateCredits('backlinkdata'),
      durationMs: result.durationMs,
      disclaimer: DISCLAIMER,
    },
  };
}

export async function fetchAiCrawlerIntel(
  website: string
): Promise<{ data: NormalizedAiCrawlerIntel; meta: VebApiIntelMeta }> {
  assertAvailable();
  const host = stripWebsiteParam(website);
  const cacheKey = `ai:${host}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return {
      data: cached as NormalizedAiCrawlerIntel,
      meta: {
        provider: 'vebapi',
        cached: true,
        creditsEstimated: 0,
        durationMs: 0,
        disclaimer: DISCLAIMER,
      },
    };
  }

  const result = await vebApiGet('ai_seo_crawler', '/seo/aiseochecker', { website: host });
  if (!result.ok || result.data == null) {
    throw new Error(result.errorMessage ?? 'VebAPI AI crawler check failed');
  }

  const normalized = normalizeAiCrawler(host, result.data);
  cache.set(cacheKey, normalized);

  return {
    data: normalized,
    meta: {
      provider: 'vebapi',
      cached: false,
      creditsEstimated: estimateCredits('ai_seo_crawler'),
      durationMs: result.durationMs,
      disclaimer: DISCLAIMER,
    },
  };
}

export function isVebApiConfigured(): boolean {
  return resolveVebApiKey() != null;
}
