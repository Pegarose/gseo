/**
 * SEOCrawl REST endpoint catalog (reverse-engineered until official docs).
 * Base: https://api.seocrawl.ai/v1
 * Auth: Authorization: Bearer sca_live_...
 *
 * Credit costs mirror MCP tool tiers — https://seocrawl.ai/mcp
 */

export const SEOCRAWL_BASE_URL = 'https://api.seocrawl.ai';
export const SEOCRAWL_API_VERSION = 'v1';

export type SeoCrawlEndpointCategory = 'platform' | 'gsc' | 'ga4' | 'tasks' | 'audit';

export interface SeoCrawlEndpointDef {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  /** Path template — `{propertyId}` replaced at runtime */
  path: string;
  credits: number;
  category: SeoCrawlEndpointCategory;
  /** Query params required for a successful call */
  requiredQuery?: string[];
  verified: boolean;
}

export const SEOCRAWL_ENDPOINTS: SeoCrawlEndpointDef[] = [
  {
    id: 'health',
    name: 'Platform health',
    method: 'GET',
    path: '/health',
    credits: 0,
    category: 'platform',
    verified: true,
  },
  {
    id: 'list_properties',
    name: 'List GSC projects',
    method: 'GET',
    path: '/v1/properties',
    credits: 1,
    category: 'platform',
    verified: true,
  },
  {
    id: 'gsc_summary',
    name: 'GSC summary',
    method: 'GET',
    path: '/v1/properties/{propertyId}/gsc/summary',
    credits: 3,
    category: 'gsc',
    requiredQuery: ['from', 'to'],
    verified: true,
  },
  {
    id: 'gsc_top_keywords',
    name: 'Top keywords',
    method: 'GET',
    path: '/v1/properties/{propertyId}/gsc/top-keywords',
    credits: 5,
    category: 'gsc',
    requiredQuery: ['from', 'to'],
    verified: true,
  },
  {
    id: 'gsc_top_pages',
    name: 'Top pages',
    method: 'GET',
    path: '/v1/properties/{propertyId}/gsc/top-pages',
    credits: 5,
    category: 'gsc',
    requiredQuery: ['from', 'to'],
    verified: true,
  },
  {
    id: 'list_tasks',
    name: 'SEO tasks',
    method: 'GET',
    path: '/v1/properties/{propertyId}/tasks',
    credits: 1,
    category: 'tasks',
    verified: true,
  },
];

export function getSeoCrawlEndpointDef(id: string): SeoCrawlEndpointDef | undefined {
  return SEOCRAWL_ENDPOINTS.find((e) => e.id === id);
}

export function estimateSeoCrawlCredits(endpointId: string): number {
  return getSeoCrawlEndpointDef(endpointId)?.credits ?? 1;
}

export function buildSeoCrawlPath(
  template: string,
  params: { propertyId?: string }
): string {
  return template.replace('{propertyId}', params.propertyId ?? '');
}
