/**
 * NeuronWriter Provider
 * Handles credential resolution and API enrichment (real or mock).
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

export type NWProviderStatus = 'success' | 'unavailable' | 'failed' | 'mocked';

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

/** Resolve NeuronWriter API key without exposing it in the result */
async function resolveCredentials(
  tenantId: string,
  siteId?: string | null
): Promise<{ apiKey: string; sourceType: NWSourceType } | null> {
  // 1. Site-specific integration
  if (siteId) {
    const siteIntegration = await prisma.integration.findFirst({
      where: { siteId, tenantId, provider: 'neuronwriter', status: 'active' },
    });
    if (siteIntegration?.encryptedCreds) {
      // In Phase 1: treat encryptedCreds as plain key (real encryption in Phase 2)
      return { apiKey: siteIntegration.encryptedCreds, sourceType: 'site_integration' };
    }
  }

  // 2. Tenant-level integration
  const tenantIntegration = await prisma.integration.findFirst({
    where: { tenantId, siteId: null, provider: 'neuronwriter', status: 'active' },
  });
  if (tenantIntegration?.encryptedCreds) {
    return { apiKey: tenantIntegration.encryptedCreds, sourceType: 'tenant_integration' };
  }

  // 3. Global env fallback
  const globalKey = process.env.NEURONWRITER_API_KEY;
  if (globalKey) {
    return { apiKey: globalKey, sourceType: 'global_fallback' };
  }

  return null;
}

/** Deterministic mock response for test/local keys */
function buildMockResponse(targetKeyword: string | null, sourceType: NWSourceType): NWEnrichmentResult {
  const kwBase = targetKeyword || 'content';
  return {
    sourceType,
    providerStatus: 'mocked',
    targetKeyword,
    contentScore: 68,
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
 * Returns an enrichment result — scoring should NOT fail if this fails.
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

  // Real API call
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const resp = await fetch('https://app.neuronwriter.com/api/v1/query/get-recommendations', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: targetKeyword || '', language: 'en' }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!resp.ok) {
      throw new Error(`NeuronWriter API error: HTTP ${resp.status}`);
    }

    const raw = await resp.json();

    // Normalize the NW vendor response (shape may change — normalize layer here)
    const normalized = normalizeNWResponse(raw, targetKeyword, sourceType);
    normalized.durationMs = Date.now() - startTime;
    return normalized;
  } catch (err: any) {
    return {
      sourceType,
      providerStatus: 'failed',
      targetKeyword,
      contentScore: null,
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
  const terms: NWTerm[] = (raw.keywords || raw.terms || []).slice(0, 30).map((k: any) => ({
    term: k.keyword || k.term || '',
    category: k.type === 'main' ? 'basic' : k.type === 'related' ? 'complementary' : 'contextual',
    importance: k.importance === 1 ? 'high' : k.importance === 2 ? 'medium' : 'low',
    used: k.used || false,
    usageCount: k.count || 0,
  }));

  return {
    sourceType,
    providerStatus: 'success',
    targetKeyword,
    contentScore: raw.content_score ?? raw.score ?? null,
    terms,
    competitorGaps: (raw.missing_keywords || []).slice(0, 10),
    recommendedHeadings: (raw.headings || raw.recommended_headings || []).slice(0, 8),
    confidence: 0.9,
    durationMs: 0,
    requestMeta: { keyword: targetKeyword, source: sourceType },
    responseMeta: { termCount: terms.length, contentScore: raw.content_score },
  };
}
