/**
 * NeuronWriter Provider
 * Handles credential resolution and API enrichment using the official NeuronWriter API (v0.5).
 *
 * Credential resolution order:
 *  1. Site-specific Integration (encrypted creds in DB)
 *  2. Tenant-level Integration (encrypted creds in DB)
 *  3. Global env fallback (NEURONWRITER_API_KEY)
 *  4. Unavailable
 *
 * IMPORTANT: Credentials are NEVER included in the response.
 */

import { prisma } from '@/lib/db/prisma';

export type NWSourceType =
  | 'site_integration'
  | 'tenant_integration'
  | 'global_fallback'
  | 'unavailable';

export type NWProviderStatus = 'success' | 'unavailable' | 'failed' | 'mocked' | 'waiting';

export interface NWTerm {
  term: string;
  category: 'basic' | 'complementary' | 'contextual';
  importance: 'high' | 'medium' | 'low';
  used: boolean;
  usageCount: number;
}

export interface NWEnrichmentResult {
  sourceType: NWSourceType;
  providerStatus: NWProviderStatus;
  targetKeyword: string | null;
  contentScore: number | null;
  targetWordCount: number | null;
  targetReadability: number | null;
  terms: NWTerm[];
  competitorGaps: string[];
  recommendedHeadings: string[];
  confidence: number;
  durationMs: number;
  errorMessage?: string;
  // Request/response meta for DB persistence — no credentials
  requestMeta: Record<string, any>;
  responseMeta: Record<string, any>;
}

interface CredsResult {
  apiKey: string;
  sourceType: NWSourceType;
  projectId?: string | null;
}

/** Resolve NeuronWriter API key and configured project ID without exposing credentials */
async function resolveCredentials(
  tenantId: string,
  siteId?: string | null
): Promise<CredsResult | null> {
  // 1. Site-specific integration
  if (siteId) {
    const siteIntegration = await prisma.integration.findFirst({
      where: { siteId, tenantId, provider: 'neuronwriter', status: 'active' },
    });
    if (siteIntegration?.encryptedCreds) {
      const config = siteIntegration.configJson as any;
      return { 
        apiKey: siteIntegration.encryptedCreds, 
        sourceType: 'site_integration',
        projectId: config?.projectId || null
      };
    }
  }

  // 2. Tenant-level integration
  const tenantIntegration = await prisma.integration.findFirst({
    where: { tenantId, siteId: null, provider: 'neuronwriter', status: 'active' },
  });
  if (tenantIntegration?.encryptedCreds) {
    const config = tenantIntegration.configJson as any;
    return { 
      apiKey: tenantIntegration.encryptedCreds, 
      sourceType: 'tenant_integration',
      projectId: config?.projectId || null
    };
  }

  // 3. Global env fallback
  const globalKey = process.env.NEURONWRITER_API_KEY;
  if (globalKey) {
    const globalProjectId = process.env.NEURONWRITER_PROJECT_ID;
    return { 
      apiKey: globalKey, 
      sourceType: 'global_fallback',
      projectId: globalProjectId || null
    };
  }

  return null;
}

/**
 * Resolves the NeuronWriter project ID.
 * If not explicitly configured, fetches the project list and matches by site domain or falls back.
 */
async function resolveProjectId(
  apiKey: string,
  siteDomain?: string | null,
  configuredProjectId?: string | null
): Promise<string | null> {
  if (configuredProjectId) return configuredProjectId;

  try {
    const resp = await fetch('https://app.neuronwriter.com/neuron-api/0.5/writer/list-projects', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!resp.ok) {
      console.warn(`NeuronWriter list-projects failed: HTTP ${resp.status}`);
      return null;
    }

    const projects = await resp.json();
    if (!Array.isArray(projects) || projects.length === 0) {
      return null;
    }

    // Try to match matching domain
    if (siteDomain) {
      const domainLower = siteDomain.toLowerCase();
      const matched = projects.find(
        (p) => p.name && (domainLower.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(domainLower))
      );
      if (matched) return matched.project;
    }

    // Default fallback: first project in list
    return projects[0].project;
  } catch (err) {
    console.error('Failed to resolve NeuronWriter project ID:', err);
    return null;
  }
}

/** Deterministic mock response for test/local keys */
function buildMockResponse(targetKeyword: string | null, sourceType: NWSourceType): NWEnrichmentResult {
  const kwBase = targetKeyword || 'content';
  return {
    sourceType,
    providerStatus: 'mocked',
    targetKeyword,
    contentScore: 68,
    targetWordCount: 1200,
    targetReadability: 45,
    terms: [
      { term: kwBase, category: 'basic', importance: 'high', used: true, usageCount: 3 },
      { term: `${kwBase} guide`, category: 'complementary', importance: 'high', used: false, usageCount: 0 },
      { term: `best ${kwBase}`, category: 'complementary', importance: 'medium', used: false, usageCount: 0 },
      { term: `${kwBase} tips`, category: 'contextual', importance: 'medium', used: false, usageCount: 0 },
      { term: `${kwBase} examples`, category: 'contextual', importance: 'low', used: false, usageCount: 0 },
    ],
    competitorGaps: [`${kwBase} comparison`, `${kwBase} cost`, `${kwBase} vs alternatives`],
    recommendedHeadings: [
      `What is ${kwBase}?`,
      `How to use ${kwBase} effectively`,
      `${kwBase} best practices`,
      `Common ${kwBase} mistakes to avoid`,
    ],
    confidence: 0.85,
    durationMs: 8,
    requestMeta: { keyword: targetKeyword, source: sourceType, mocked: true },
    responseMeta: { contentScore: 68, termCount: 5, status: 'mocked' },
  };
}

const MOCK_KEYS = new Set([
  'local_test_neuronwriter_fallback_key',
  'mock',
  'test',
]);

/**
 * Main NeuronWriter enrichment function.
 * Connects to the official NeuronWriter API (v0.5).
 */
export async function enrichWithNeuronWriter(
  tenantId: string,
  siteId: string | null | undefined,
  targetKeyword: string | null,
  startTime = Date.now()
): Promise<NWEnrichmentResult> {
  const creds = await resolveCredentials(tenantId, siteId);

  if (!creds) {
    return {
      sourceType: 'unavailable',
      providerStatus: 'unavailable',
      targetKeyword,
      contentScore: null,
      targetWordCount: null,
      targetReadability: null,
      terms: [],
      competitorGaps: [],
      recommendedHeadings: [],
      confidence: 0,
      durationMs: Date.now() - startTime,
      errorMessage: 'No NeuronWriter credentials configured.',
      requestMeta: {},
      responseMeta: {},
    };
  }

  const { apiKey, sourceType } = creds;

  // Return deterministic mock for test keys
  if (MOCK_KEYS.has(apiKey)) {
    return { ...buildMockResponse(targetKeyword, sourceType), durationMs: Date.now() - startTime };
  }

  try {
    // 1. Resolve site domain if siteId exists
    let domain: string | null = null;
    if (siteId) {
      const site = await prisma.site.findUnique({
        where: { id: siteId },
        select: { domain: true },
      });
      domain = site?.domain || null;
    }

    // 2. Resolve Project ID
    const projectId = await resolveProjectId(apiKey, domain, creds.projectId);
    if (!projectId) {
      throw new Error('Could not resolve any NeuronWriter project ID. Please configure a projectId or create a project first.');
    }

    // 3. Search for existing query for this keyword
    const listResp = await fetch('https://app.neuronwriter.com/neuron-api/0.5/writer/list-queries', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        project: projectId,
        keyword: targetKeyword || '',
      }),
    });

    if (!listResp.ok) {
      throw new Error(`NeuronWriter list-queries failed: HTTP ${listResp.status}`);
    }

    const queries = await listResp.json();
    let queryId: string | null = null;

    if (Array.isArray(queries) && queries.length > 0) {
      queryId = queries[0].query || queries[0].id;
    }

    // 4. Create query if not exists
    if (!queryId) {
      const createResp = await fetch('https://app.neuronwriter.com/neuron-api/0.5/writer/new-query', {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          project: projectId,
          keyword: targetKeyword || '',
          engine: 'google.com',
          language: 'English',
        }),
      });

      if (!createResp.ok) {
        throw new Error(`NeuronWriter new-query failed: HTTP ${createResp.status}`);
      }

      const newQuery = await createResp.json();
      queryId = newQuery.query;

      if (!queryId) {
        throw new Error('NeuronWriter new-query did not return a valid query ID.');
      }

      // Return waiting immediately since new query takes ~60 seconds to process
      return {
        sourceType,
        providerStatus: 'waiting',
        targetKeyword,
        contentScore: null,
        targetWordCount: null,
        targetReadability: null,
        terms: [],
        competitorGaps: [],
        recommendedHeadings: [],
        confidence: 0.5,
        durationMs: Date.now() - startTime,
        requestMeta: { projectId, keyword: targetKeyword, newQueryCreated: true },
        responseMeta: { queryId, status: 'waiting' },
      };
    }

    // 5. Fetch query recommendations
    const getQueryResp = await fetch('https://app.neuronwriter.com/neuron-api/0.5/writer/get-query', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: queryId,
      }),
    });

    if (!getQueryResp.ok) {
      throw new Error(`NeuronWriter get-query failed: HTTP ${getQueryResp.status}`);
    }

    const queryData = await getQueryResp.json();

    if (queryData.status !== 'ready') {
      return {
        sourceType,
        providerStatus: 'waiting',
        targetKeyword,
        contentScore: null,
        targetWordCount: null,
        targetReadability: null,
        terms: [],
        competitorGaps: [],
        recommendedHeadings: [],
        confidence: 0.5,
        durationMs: Date.now() - startTime,
        requestMeta: { projectId, keyword: targetKeyword, queryId },
        responseMeta: { status: queryData.status },
      };
    }

    // 6. Normalize recommendations
    const normalized = normalizeNWResponse(queryData, targetKeyword, sourceType);
    normalized.durationMs = Date.now() - startTime;
    normalized.requestMeta = { projectId, keyword: targetKeyword, queryId };
    return normalized;

  } catch (err: any) {
    return {
      sourceType,
      providerStatus: 'failed',
      targetKeyword,
      contentScore: null,
      targetWordCount: null,
      targetReadability: null,
      terms: [],
      competitorGaps: [],
      recommendedHeadings: [],
      confidence: 0,
      durationMs: Date.now() - startTime,
      errorMessage: err.message,
      requestMeta: { keyword: targetKeyword, source: sourceType },
      responseMeta: { error: err.message },
    };
  }
}

/** Normalize raw NeuronWriter vendor response into our internal schema */
function normalizeNWResponse(
  raw: any,
  targetKeyword: string | null,
  sourceType: NWSourceType
): NWEnrichmentResult {
  let rawTerms: any[] = [];
  if (raw.terms) {
    if (Array.isArray(raw.terms)) {
      rawTerms = raw.terms;
    } else if (raw.terms.content_basic && Array.isArray(raw.terms.content_basic)) {
      rawTerms = raw.terms.content_basic;
    }
  } else if (raw.keywords && Array.isArray(raw.keywords)) {
    rawTerms = raw.keywords;
  }

  const terms: NWTerm[] = rawTerms.slice(0, 30).map((k: any) => {
    const term = k.t || k.keyword || k.term || '';
    
    let category: NWTerm['category'] = 'basic';
    if (k.type === 'related' || k.category === 'related') {
      category = 'complementary';
    } else if (k.type === 'contextual' || k.category === 'contextual') {
      category = 'contextual';
    }
    
    let importance: NWTerm['importance'] = 'medium';
    if (k.importance === 1 || k.importance === 'high') {
      importance = 'high';
    } else if (k.importance === 3 || k.importance === 'low') {
      importance = 'low';
    }

    const usageCount = k.count || k.usageCount || 0;
    const used = k.used || usageCount > 0;

    return {
      term,
      category,
      importance,
      used,
      usageCount,
    };
  });

  let competitorGaps: string[] = [];
  if (Array.isArray(raw.missing_keywords)) {
    competitorGaps = raw.missing_keywords;
  } else if (raw.ideas && Array.isArray(raw.ideas.suggest_questions)) {
    competitorGaps = raw.ideas.suggest_questions.map((q: any) => q.q || q.question || '');
  }

  let recommendedHeadings: string[] = [];
  if (Array.isArray(raw.headings)) {
    recommendedHeadings = raw.headings;
  } else if (Array.isArray(raw.recommended_headings)) {
    recommendedHeadings = raw.recommended_headings;
  } else if (raw.ideas && Array.isArray(raw.ideas.content_questions)) {
    recommendedHeadings = raw.ideas.content_questions.map((q: any) => q.q || q.question || '');
  }

  const contentScore = raw.content_score ?? raw.score ?? (raw.metrics?.content_score ?? null);
  const targetWordCount = raw.metrics?.word_count?.target ?? raw.metrics?.word_count?.median ?? null;
  const targetReadability = raw.metrics?.readability?.target ?? raw.metrics?.readability?.median ?? null;

  return {
    sourceType,
    providerStatus: 'success',
    targetKeyword,
    contentScore,
    targetWordCount,
    targetReadability,
    terms,
    competitorGaps: competitorGaps.slice(0, 10),
    recommendedHeadings: recommendedHeadings.slice(0, 8),
    confidence: 0.9,
    durationMs: 0,
    requestMeta: { keyword: targetKeyword, source: sourceType },
    responseMeta: { 
      termCount: terms.length, 
      contentScore,
      competitorGapsCount: competitorGaps.length,
      recommendedHeadingsCount: recommendedHeadings.length,
    },
  };
}
