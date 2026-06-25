export interface NormalizedKeywordSuggestion {
  term: string;
  volume: number | null;
  cpc: number | null;
  competition: string | null;
  score: number | null;
}

export interface NormalizedKeywordIntel {
  query: string;
  country: string;
  suggestions: NormalizedKeywordSuggestion[];
}

export interface NormalizedBacklinkIntel {
  website: string;
  totalBacklinks: number;
  doFollowBacklinks: number;
  referringDomains: number;
  sampleLinks: Array<{
    urlFrom: string;
    urlTo: string;
    anchor: string;
    nofollow: boolean;
    domainRank: number | null;
  }>;
}

export interface NormalizedAiCrawlerIntel {
  website: string;
  robotsFound: boolean;
  aiBotsAllowed: boolean;
  aiAccess: Record<string, boolean>;
  suggestions: string[];
  blockedBots: string[];
}

function parseNum(value: unknown): number | null {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function normalizeKeywordResearch(
  query: string,
  country: string,
  raw: unknown
): NormalizedKeywordIntel {
  const rows = Array.isArray(raw) ? raw : raw && typeof raw === 'object' ? [raw] : [];

  const suggestions: NormalizedKeywordSuggestion[] = rows.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      term: String(r.text ?? r.keyword ?? query),
      volume: parseNum(r.vol ?? r.volume ?? r.searchVolume),
      cpc: parseNum(r.cpc),
      competition: r.competition != null ? String(r.competition) : null,
      score: parseNum(r.score),
    };
  });

  return { query, country, suggestions };
}

export function normalizeBacklinkData(website: string, raw: unknown): NormalizedBacklinkIntel {
  const data = (raw ?? {}) as Record<string, unknown>;
  const counts = (data.counts ?? {}) as Record<string, unknown>;
  const backlinks = (counts.backlinks ?? {}) as Record<string, unknown>;
  const domains = (counts.domains ?? {}) as Record<string, unknown>;
  const list = Array.isArray(data.backlinks) ? data.backlinks : [];

  return {
    website,
    totalBacklinks: Number(backlinks.total ?? 0),
    doFollowBacklinks: Number(backlinks.doFollow ?? 0),
    referringDomains: Number(domains.total ?? 0),
    sampleLinks: list.slice(0, 10).map((item) => {
      const b = item as Record<string, unknown>;
      return {
        urlFrom: String(b.url_from ?? ''),
        urlTo: String(b.url_to ?? ''),
        anchor: String(b.anchor ?? ''),
        nofollow: Boolean(b.nofollow),
        domainRank: parseNum(b.domain_inlink_rank),
      };
    }),
  };
}

export function normalizeAiCrawler(website: string, raw: unknown): NormalizedAiCrawlerIntel {
  const data = (raw ?? {}) as Record<string, unknown>;
  const aiAccess = (data.ai_access ?? {}) as Record<string, boolean>;
  const suggestions = Array.isArray(data.suggestions)
    ? data.suggestions.map(String)
    : [];

  const blockedBots = Object.entries(aiAccess)
    .filter(([, allowed]) => !allowed)
    .map(([bot]) => bot);

  return {
    website,
    robotsFound: Boolean(data.robots_found),
    aiBotsAllowed: Boolean(data.ai_bots_allowed),
    aiAccess,
    suggestions,
    blockedBots,
  };
}
