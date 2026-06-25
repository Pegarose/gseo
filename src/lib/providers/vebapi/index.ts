/**
 * VebAPI provider — optional backup / trial integration.
 * Docs: https://vebapi.com/apis
 *
 * Credential: VEBAPI_API_KEY env (global fallback only for now).
 * Disable without removing key: VEBAPI_ENABLED=false
 */

export {
  VEBAPI_BASE_URL,
  VEBAPI_ENDPOINTS,
  estimateCredits,
  getEndpointDef,
  type VebApiCategory,
  type VebApiEndpointDef,
} from './endpoints';

export {
  resolveVebApiKey,
  stripWebsiteParam,
  vebApiGet,
  type VebApiProviderStatus,
  type VebApiRequestResult,
  type VebApiSourceType,
} from './client';

import { vebApiGet, resolveVebApiKey, stripWebsiteParam } from './client';

export interface VebApiHealthResult {
  provider: 'VebAPI';
  status: 'operational' | 'disabled' | 'failed';
  latencyMs: number;
  creditsRemaining: number | null;
  lastCheckedAt: string;
  errorMessage?: string;
}

export interface VebApiCreditBalance {
  credits: number;
}

export interface VebApiSingleKeywordResult {
  keyword?: string;
  searchVolume?: number;
  cpc?: number;
  competition?: number | string;
  [key: string]: unknown;
}

export interface VebApiTopKeyword {
  keyword: string;
  rank: number;
  searchVolume: number;
  topRankedUrl?: string;
  rankingDifficulty?: number;
  seoClicks?: number;
}

export interface VebApiBacklinkCounts {
  backlinks?: { total?: number; doFollow?: number };
  domains?: { total?: number; doFollow?: number };
}

/** Ping credit balance (0 credits) — use for health checks */
export async function checkVebApiHealth(): Promise<VebApiHealthResult> {
  const checkedAt = new Date().toISOString();
  const creds = resolveVebApiKey();

  if (!creds) {
    return {
      provider: 'VebAPI',
      status: 'disabled',
      latencyMs: 0,
      creditsRemaining: null,
      lastCheckedAt: checkedAt,
      errorMessage: 'VEBAPI_API_KEY not set or VEBAPI_ENABLED=false',
    };
  }

  const result = await getCreditBalance();
  if (!result.ok) {
    return {
      provider: 'VebAPI',
      status: 'failed',
      latencyMs: result.durationMs,
      creditsRemaining: null,
      lastCheckedAt: checkedAt,
      errorMessage: result.errorMessage,
    };
  }

  const credits =
    result.data && typeof result.data === 'object' && 'credits' in result.data
      ? Number((result.data as VebApiCreditBalance).credits)
      : null;

  return {
    provider: 'VebAPI',
    status: 'operational',
    latencyMs: result.durationMs,
    creditsRemaining: Number.isFinite(credits) ? credits : null,
    lastCheckedAt: checkedAt,
  };
}

export async function getCreditBalance() {
  return vebApiGet<VebApiCreditBalance>('creditbalance', '/creditbalance', {});
}

export async function getSingleKeyword(keyword: string, country = 'tr') {
  return vebApiGet<VebApiSingleKeywordResult>('singlekeyword', '/seo/singlekeyword', {
    keyword,
    country,
  });
}

export async function getKeywordResearch(keyword: string, country = 'tr') {
  return vebApiGet('keywordresearch', '/seo/keywordresearch', { keyword, country });
}

export async function getBacklinkData(website: string) {
  return vebApiGet('backlinkdata', '/seo/backlinkdata', {
    website: stripWebsiteParam(website),
  });
}

export async function getTopSearchKeywords(website: string) {
  return vebApiGet<{ keywords?: VebApiTopKeyword[] }>(
    'topsearchkeywords',
    '/seo/topsearchkeywords',
    { website: stripWebsiteParam(website) }
  );
}

export async function getPageAnalysis(website: string) {
  return vebApiGet('page_analysis', '/seo/analyze', {
    website: stripWebsiteParam(website),
  });
}

export async function getGoogleSerp(
  query: string,
  locale = 'en-us',
  deviceType = 'desktop_chrome',
  pageCount = 1
) {
  return vebApiGet(
    'google_serp',
    '/serp/google',
    { q: query, locale, device_type: deviceType, page_count: pageCount },
    { creditOptions: { pageCount } }
  );
}

export async function getAiSeoCrawlerCheck(website: string) {
  return vebApiGet('ai_seo_crawler', '/seo/aiseochecker', {
    website: stripWebsiteParam(website),
  });
}
