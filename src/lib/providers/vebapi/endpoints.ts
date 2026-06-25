/**
 * VebAPI endpoint catalog — credit costs from https://vebapi.com/#endpoints
 * Actual paths verified against https://vebapi.com/apis/* doc pages.
 */

export type VebApiCategory =
  | 'account'
  | 'keyword'
  | 'serp'
  | 'seo'
  | 'youtube'
  | 'tools';

export interface VebApiEndpointDef {
  id: string;
  name: string;
  category: VebApiCategory;
  method: 'GET' | 'POST';
  /** Path under https://vebapi.com/api */
  path: string;
  credits: number;
  /** Extra multiplier note (e.g. SERP page_count) */
  creditNote?: string;
  docsUrl: string;
}

export const VEBAPI_BASE_URL = 'https://vebapi.com/api';

/** All documented endpoints with per-call credit cost */
export const VEBAPI_ENDPOINTS: VebApiEndpointDef[] = [
  {
    id: 'creditbalance',
    name: 'Credit Balance',
    category: 'account',
    method: 'GET',
    path: '/creditbalance',
    credits: 0,
    docsUrl: 'https://vebapi.com/apis/vebapi-credits',
  },
  {
    id: 'singlekeyword',
    name: 'Single Keyword',
    category: 'keyword',
    method: 'GET',
    path: '/seo/singlekeyword',
    credits: 1,
    docsUrl: 'https://vebapi.com/apis/single-keyword',
  },
  {
    id: 'keywordresearch',
    name: 'Keyword Research',
    category: 'keyword',
    method: 'GET',
    path: '/seo/keywordresearch',
    credits: 1,
    docsUrl: 'https://vebapi.com/apis/keywordresearch',
  },
  {
    id: 'google_serp',
    name: 'Google SERP',
    category: 'serp',
    method: 'GET',
    path: '/serp/google',
    credits: 5,
    creditNote: '5 × page_count',
    docsUrl: 'https://vebapi.com/apis/google_serp_api',
  },
  {
    id: 'google_ai_serp',
    name: 'Google AI Mode SERP',
    category: 'serp',
    method: 'GET',
    path: '/serp/google-ai-mode',
    credits: 8,
    docsUrl: 'https://vebapi.com/apis/google-ai-mode-serp',
  },
  {
    id: 'page_analysis',
    name: 'On Page Analysis',
    category: 'seo',
    method: 'GET',
    path: '/seo/analyze',
    credits: 1,
    docsUrl: 'https://vebapi.com/apis/page-analysis',
  },
  {
    id: 'ai_visibility',
    name: 'AI Visibility Analyzer',
    category: 'seo',
    method: 'GET',
    path: '/seo/ai-visibility-analyzer',
    credits: 1,
    docsUrl: 'https://vebapi.com/apis/ai-search-engine-analyzer',
  },
  {
    id: 'backlinkdata',
    name: 'Backlink Lists',
    category: 'seo',
    method: 'GET',
    path: '/seo/backlinkdata',
    credits: 1,
    docsUrl: 'https://vebapi.com/apis/backlink-data',
  },
  {
    id: 'new_backlinks',
    name: 'New Backlinks',
    category: 'seo',
    method: 'GET',
    path: '/seo/newbacklinks',
    credits: 1,
    docsUrl: 'https://vebapi.com/apis/new-backlinks',
  },
  {
    id: 'topsearchkeywords',
    name: 'Top Search Keywords',
    category: 'seo',
    method: 'GET',
    path: '/seo/topsearchkeywords',
    credits: 1,
    docsUrl: 'https://vebapi.com/apis/topsearch-keywords',
  },
  {
    id: 'ai_seo_crawler',
    name: 'AI SEO Crawler Check',
    category: 'seo',
    method: 'GET',
    path: '/seo/aiseochecker',
    credits: 1,
    docsUrl: 'https://vebapi.com/apis/ai-seo-crawler',
  },
];

export function getEndpointDef(id: string): VebApiEndpointDef | undefined {
  return VEBAPI_ENDPOINTS.find((e) => e.id === id);
}

export function estimateCredits(
  endpointId: string,
  options?: { pageCount?: number }
): number {
  const def = getEndpointDef(endpointId);
  if (!def) return 0;
  if (endpointId === 'google_serp') {
    return def.credits * Math.max(1, options?.pageCount ?? 1);
  }
  return def.credits;
}
