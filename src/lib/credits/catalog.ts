/**
 * Default feature catalog — provider maliyeti × markup = müşteri kredisi.
 * Super admin panelden override edilebilir.
 */

export type CreditCategory = 'execution' | 'intelligence';
export type CreditProvider =
  | 'internal'
  | 'vebapi'
  | 'seocrawl'
  | 'domaindetailer'
  | 'similarweb'
  | 'neuronwriter';

export interface CreditFeatureDef {
  featureKey: string;
  label: string;
  category: CreditCategory;
  provider: CreditProvider;
  providerCostCredits: number;
  sellCredits: number;
  useAutoMarkup: boolean;
  description?: string;
}

export const DEFAULT_MARKUP_MULTIPLIER = 10;

export const CREDIT_FEATURE_CATALOG: CreditFeatureDef[] = [
  {
    featureKey: 'score.content',
    label: 'İçerik Skoru',
    category: 'execution',
    provider: 'internal',
    providerCostCredits: 0,
    sellCredits: 1,
    useAutoMarkup: false,
    description: 'Draft HTML + meta skorlama',
  },
  {
    featureKey: 'score.url',
    label: 'Canlı URL Skoru',
    category: 'execution',
    provider: 'internal',
    providerCostCredits: 0,
    sellCredits: 2,
    useAutoMarkup: false,
    description: 'URL fetch + on-page skor',
  },
  {
    featureKey: 'links.internal',
    label: 'Internal Link Önerileri',
    category: 'execution',
    provider: 'internal',
    providerCostCredits: 0,
    sellCredits: 1,
    useAutoMarkup: false,
  },
  {
    featureKey: 'content.ai',
    label: 'Content AI',
    category: 'execution',
    provider: 'internal',
    providerCostCredits: 0,
    sellCredits: 3,
    useAutoMarkup: false,
  },
  {
    featureKey: 'crawl.site',
    label: 'Site Audit Crawl',
    category: 'execution',
    provider: 'internal',
    providerCostCredits: 0,
    sellCredits: 5,
    useAutoMarkup: false,
  },
  {
    featureKey: 'neuronwriter.enrich',
    label: 'NeuronWriter Enrich',
    category: 'execution',
    provider: 'neuronwriter',
    providerCostCredits: 1,
    sellCredits: 10,
    useAutoMarkup: true,
  },
  {
    featureKey: 'vebapi.keywordresearch',
    label: 'Keyword Research',
    category: 'intelligence',
    provider: 'vebapi',
    providerCostCredits: 1,
    sellCredits: 10,
    useAutoMarkup: true,
  },
  {
    featureKey: 'vebapi.singlekeyword',
    label: 'Single Keyword',
    category: 'intelligence',
    provider: 'vebapi',
    providerCostCredits: 1,
    sellCredits: 10,
    useAutoMarkup: true,
  },
  {
    featureKey: 'vebapi.backlinkdata',
    label: 'Backlink Data',
    category: 'intelligence',
    provider: 'vebapi',
    providerCostCredits: 1,
    sellCredits: 10,
    useAutoMarkup: true,
  },
  {
    featureKey: 'vebapi.ai_seo_crawler',
    label: 'AI SEO Crawler Check',
    category: 'intelligence',
    provider: 'vebapi',
    providerCostCredits: 1,
    sellCredits: 10,
    useAutoMarkup: true,
  },
  {
    featureKey: 'vebapi.page_analysis',
    label: 'On-Page Analysis (VebAPI)',
    category: 'intelligence',
    provider: 'vebapi',
    providerCostCredits: 1,
    sellCredits: 10,
    useAutoMarkup: true,
  },
  {
    featureKey: 'vebapi.google_serp',
    label: 'Google SERP',
    category: 'intelligence',
    provider: 'vebapi',
    providerCostCredits: 5,
    sellCredits: 50,
    useAutoMarkup: true,
    description: '5 kredi × sayfa (VebAPI)',
  },
  {
    featureKey: 'vebapi.topsearchkeywords',
    label: 'Top Search Keywords',
    category: 'intelligence',
    provider: 'vebapi',
    providerCostCredits: 1,
    sellCredits: 10,
    useAutoMarkup: true,
  },
  {
    featureKey: 'domaindetailer.overview',
    label: 'Domain Overview',
    category: 'intelligence',
    provider: 'domaindetailer',
    providerCostCredits: 1,
    sellCredits: 10,
    useAutoMarkup: true,
  },
  {
    featureKey: 'similarweb.traffic',
    label: 'Traffic Estimate',
    category: 'intelligence',
    provider: 'similarweb',
    providerCostCredits: 1,
    sellCredits: 10,
    useAutoMarkup: true,
  },
  {
    featureKey: 'seocrawl.gsc_dashboard',
    label: 'Search Console Dashboard',
    category: 'intelligence',
    provider: 'seocrawl',
    providerCostCredits: 13,
    sellCredits: 130,
    useAutoMarkup: true,
    description: 'GSC summary + top keywords + top pages (~13 MCP credits)',
  },
];

export const SEOCRAWL_ENDPOINT_TO_FEATURE: Record<string, string> = {
  gsc_dashboard: 'seocrawl.gsc_dashboard',
  gsc_summary: 'seocrawl.gsc_dashboard',
  gsc_top_keywords: 'seocrawl.gsc_dashboard',
  gsc_top_pages: 'seocrawl.gsc_dashboard',
};

export const VEBAPI_ENDPOINT_TO_FEATURE: Record<string, string> = {
  keywordresearch: 'vebapi.keywordresearch',
  singlekeyword: 'vebapi.singlekeyword',
  backlinkdata: 'vebapi.backlinkdata',
  ai_seo_crawler: 'vebapi.ai_seo_crawler',
  page_analysis: 'vebapi.page_analysis',
  google_serp: 'vebapi.google_serp',
  topsearchkeywords: 'vebapi.topsearchkeywords',
};
