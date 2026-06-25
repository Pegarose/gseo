export interface ScoreIssue {
  code: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info' | string;
  message?: string;
  category?: string;
}

export interface ScoreQuickWin {
  title: string;
  recommendation: string;
  estimatedImpact?: string;
  estimatedEffort?: string;
}

export interface ScoreModuleResult {
  name: string;
  score: number;
  maxScore?: number;
  weight?: number;
}

export interface ScoreContentResult {
  snapshotId?: string | null;
  sourceType?: string;
  url: string;
  normalizedUrl?: string;
  finalScore: number;
  scoreBand: string;
  modules?: ScoreModuleResult[];
  topIssues: ScoreIssue[];
  quickWins: ScoreQuickWin[];
  nextActions?: string[];
  targetKeyword?: string;
  durationMs?: number;
  createdAt?: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  requestId?: string;
  durationMs?: number;
  error?: {
    message: string;
    code?: string;
  };
}

export function normalizeScoreResult(raw: unknown): ScoreContentResult {
  const envelope = raw as ApiEnvelope<ScoreContentResult>;
  const data = envelope?.data ?? (raw as ScoreContentResult);

  return {
    snapshotId: data.snapshotId,
    sourceType: data.sourceType,
    url: data.url,
    normalizedUrl: data.normalizedUrl,
    finalScore: data.finalScore ?? 0,
    scoreBand: data.scoreBand ?? 'unknown',
    modules: data.modules,
    topIssues: data.topIssues ?? [],
    quickWins: data.quickWins ?? [],
    nextActions: data.nextActions,
    durationMs: data.durationMs,
    createdAt: data.createdAt,
  };
}

export interface InternalLinkSuggestion {
  targetUrl: string;
  title?: string;
  anchorSuggestion: string;
  reason: string;
  relationship?: string;
  confidence: number;
  estimatedImpact?: string;
}

export interface InternalLinksResult {
  sourceUrl: string;
  suggestions: InternalLinkSuggestion[];
  orphanRisk: boolean;
  siteGraphStatus: string;
  sourceIssues?: ScoreIssue[];
  createdAt?: string;
}

export interface ContentAiResult {
  semanticScore?: number;
  targetKeyword?: string | null;
  suggestedTitles: string[];
  suggestedDescription?: string | null;
  recommendedHeadings: string[];
  missingTopics: string[];
  recommendations: string[];
}

export interface KeywordSuggestion {
  term: string;
  volume: number | null;
  cpc: number | null;
  competition: string | null;
  score: number | null;
}

export interface KeywordIntelResult {
  query: string;
  country: string;
  suggestions: KeywordSuggestion[];
  provider?: string;
  cached?: boolean;
  disclaimer?: string;
}

export function normalizeInternalLinksResult(raw: unknown): InternalLinksResult {
  const envelope = raw as ApiEnvelope<InternalLinksResult>;
  const data = envelope?.data ?? (raw as InternalLinksResult);

  return {
    sourceUrl: data.sourceUrl,
    suggestions: data.suggestions ?? [],
    orphanRisk: data.orphanRisk ?? false,
    siteGraphStatus: data.siteGraphStatus ?? 'unknown',
    sourceIssues: data.sourceIssues,
    createdAt: data.createdAt,
  };
}

export function normalizeContentAiResult(raw: unknown): ContentAiResult {
  const envelope = raw as ApiEnvelope<Record<string, unknown>>;
  const data = envelope?.data ?? (raw as Record<string, unknown>);

  const recommendedHeadings = (data.recommendedHeadings as string[]) ?? [];
  const recommendations = (data.recommendations as string[]) ?? [];
  const missingTopics = (data.missingEntities as string[]) ?? (data.missingTopics as string[]) ?? [];
  const targetKeyword = (data.targetKeyword as string) ?? null;

  const suggestedTitles = recommendedHeadings.length
    ? recommendedHeadings.slice(0, 5)
    : targetKeyword
      ? [
          `${targetKeyword} — Complete Guide`,
          `How to Master ${targetKeyword}`,
          `${targetKeyword}: Tips and Best Practices`,
        ]
      : [];

  return {
    semanticScore: data.semanticScore as number | undefined,
    targetKeyword,
    suggestedTitles,
    suggestedDescription: recommendations[0] ?? null,
    recommendedHeadings,
    missingTopics,
    recommendations,
  };
}

export function normalizeKeywordIntelResult(raw: unknown): KeywordIntelResult {
  const envelope = raw as ApiEnvelope<KeywordIntelResult & { meta?: { disclaimer?: string; cached?: boolean; provider?: string } }>;
  const data = envelope?.data ?? (raw as KeywordIntelResult & { meta?: { disclaimer?: string; cached?: boolean; provider?: string } });
  const meta = data.meta;

  return {
    query: data.query ?? '',
    country: data.country ?? 'tr',
    suggestions: (data.suggestions ?? []).map((s) => ({
      term: s.term,
      volume: s.volume ?? null,
      cpc: s.cpc ?? null,
      competition: s.competition ?? null,
      score: s.score ?? null,
    })),
    provider: meta?.provider ?? 'vebapi',
    cached: meta?.cached,
    disclaimer: meta?.disclaimer,
  };
}
