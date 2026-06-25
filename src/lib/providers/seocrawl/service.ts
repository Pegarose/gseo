/**
 * Cached SEOCrawl service for dashboard GSC widgets.
 */

import { LRUCache } from 'lru-cache';
import {
  estimateSeoCrawlCredits,
  findPropertyByHost,
  getGscSummary,
  getTopKeywords,
  getTopPages,
  listProperties,
  resolveSeoCrawlKey,
  stripPropertyHost,
} from './index';
import { isSeoCrawlAllowedDomain } from '@/lib/features/seocrawl-intel';
import {
  normalizeGscDashboard,
  type NormalizedGscDashboard,
} from './normalize';
import type { SeoCrawlProperty } from './types';

const cache = new LRUCache<string, object>({
  max: 128,
  ttl: 1000 * 60 * 60 * 6, // 6h — conserve MCP credits (12k/mo shared)
});

const propertiesCache = new LRUCache<string, SeoCrawlProperty[]>({
  max: 4,
  ttl: 1000 * 60 * 60, // 1h
});

export class SeoCrawlUnavailableError extends Error {
  constructor(message = 'SEOCrawl is not configured or disabled') {
    super(message);
    this.name = 'SeoCrawlUnavailableError';
  }
}

export class SeoCrawlPropertyNotFoundError extends Error {
  constructor(domain: string) {
    super(`SEOCrawl projesi bulunamadı: ${domain}`);
    this.name = 'SeoCrawlPropertyNotFoundError';
  }
}

export interface SeoCrawlIntelMeta {
  provider: 'seocrawl';
  cached: boolean;
  creditsEstimated: number;
  durationMs: number;
  propertyId: string;
  disclaimer: string;
}

export interface SeoCrawlSiteLink {
  domain: string;
  propertyId: string | null;
  propertyUrl: string | null;
  linked: boolean;
}

const DISCLAIMER =
  'Search Console verisi SEOCrawl üzerinden — resmi Google API değil, SEOCrawl MCP/REST kotasından harcanır.';

function assertAvailable() {
  if (!resolveSeoCrawlKey()) {
    throw new SeoCrawlUnavailableError();
  }
}

export function isSeoCrawlConfigured(): boolean {
  return resolveSeoCrawlKey() != null;
}

async function getCachedProperties(): Promise<SeoCrawlProperty[]> {
  const cached = propertiesCache.get('all');
  if (cached) return cached;

  const result = await listProperties();
  if (!result.ok || !result.data?.data) {
    throw new Error(result.errorMessage ?? 'SEOCrawl property list failed');
  }

  propertiesCache.set('all', result.data.data);
  return result.data.data;
}

export async function resolvePropertyForDomain(domain: string): Promise<SeoCrawlProperty | null> {
  assertAvailable();
  const host = stripPropertyHost(domain);
  const properties = await getCachedProperties();
  return (
    properties.find((p) => stripPropertyHost(p.url) === host) ??
    properties.find((p) => stripPropertyHost(p.title) === host) ??
    null
  );
}

export async function listSeoCrawlSiteLinks(domains: string[]): Promise<SeoCrawlSiteLink[]> {
  if (!isSeoCrawlConfigured()) {
    return domains.map((domain) => ({
      domain,
      propertyId: null,
      propertyUrl: null,
      linked: false,
    }));
  }

  const properties = await getCachedProperties();
  return domains.map((domain) => {
    const host = stripPropertyHost(domain);
    const property =
      properties.find((p) => stripPropertyHost(p.url) === host) ??
      properties.find((p) => stripPropertyHost(p.title) === host) ??
      null;
    return {
      domain,
      propertyId: property?.id ?? null,
      propertyUrl: property?.url ?? null,
      linked: Boolean(property),
    };
  });
}

export async function fetchGscDashboard(
  domain: string,
  options?: { keywordLimit?: number; pageLimit?: number }
): Promise<{ data: NormalizedGscDashboard; meta: SeoCrawlIntelMeta }> {
  assertAvailable();

  if (!isSeoCrawlAllowedDomain(domain)) {
    throw new Error('Domain not allowed for SEOCrawl pilot');
  }

  const keywordLimit = options?.keywordLimit ?? 10;
  const pageLimit = options?.pageLimit ?? 10;
  const cacheKey = `gsc:${stripPropertyHost(domain)}:k${keywordLimit}:p${pageLimit}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    const data = cached as NormalizedGscDashboard;
    return {
      data,
      meta: {
        provider: 'seocrawl',
        cached: true,
        creditsEstimated: 0,
        durationMs: 0,
        propertyId: data.propertyId,
        disclaimer: DISCLAIMER,
      },
    };
  }

  const start = Date.now();
  const property = await resolvePropertyForDomain(domain);
  if (!property) {
    throw new SeoCrawlPropertyNotFoundError(domain);
  }

  const creditsEstimated =
    estimateSeoCrawlCredits('gsc_summary') +
    estimateSeoCrawlCredits('gsc_top_keywords') +
    estimateSeoCrawlCredits('gsc_top_pages');

  const [summaryRes, keywordsRes, pagesRes] = await Promise.all([
    getGscSummary(property.id),
    getTopKeywords(property.id, undefined, keywordLimit),
    getTopPages(property.id, undefined, pageLimit),
  ]);

  if (!summaryRes.ok || !summaryRes.data?.data) {
    throw new Error(summaryRes.errorMessage ?? 'GSC summary failed');
  }
  if (!keywordsRes.ok || !keywordsRes.data?.data) {
    throw new Error(keywordsRes.errorMessage ?? 'GSC top keywords failed');
  }
  if (!pagesRes.ok || !pagesRes.data?.data) {
    throw new Error(pagesRes.errorMessage ?? 'GSC top pages failed');
  }

  const data = normalizeGscDashboard(
    property,
    summaryRes.data.data,
    keywordsRes.data.data,
    pagesRes.data.data
  );

  cache.set(cacheKey, data);

  return {
    data,
    meta: {
      provider: 'seocrawl',
      cached: false,
      creditsEstimated,
      durationMs: Date.now() - start,
      propertyId: property.id,
      disclaimer: DISCLAIMER,
    },
  };
}
