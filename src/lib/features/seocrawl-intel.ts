/**
 * SEOCrawl dashboard features — pilot / allowlist only.
 * Varsayılan: kapalı. Açmak için SEOCRAWL_INTEL_ENABLED=true
 * ve SEOCRAWL_ALLOWED_DOMAINS (varsayılan: efesusstone.com).
 *
 * Super Admin sağlık ping'i bu gate'ten etkilenmez.
 */

import { stripPropertyHost } from '@/lib/providers/seocrawl/client';

const DEFAULT_PILOT_DOMAINS = ['efesusstone.com'];

export function isSeoCrawlIntelEnabled(): boolean {
  if (process.env.SEOCRAWL_INTEL_ENABLED !== 'true') return false;
  if (process.env.SEOCRAWL_ENABLED === 'false') return false;
  return Boolean(process.env.SEOCRAWL_API_KEY?.trim());
}

export function getSeoCrawlAllowedDomains(): string[] {
  const raw = process.env.SEOCRAWL_ALLOWED_DOMAINS?.trim();
  if (!raw) return [...DEFAULT_PILOT_DOMAINS];
  return raw
    .split(',')
    .map((d) => stripPropertyHost(d))
    .filter(Boolean);
}

export function isSeoCrawlAllowedDomain(domain: string): boolean {
  if (!isSeoCrawlIntelEnabled()) return false;
  const host = stripPropertyHost(domain);
  return getSeoCrawlAllowedDomains().includes(host);
}
