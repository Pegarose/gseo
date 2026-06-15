export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'experimental';
export type ModuleStatus = 'excellent' | 'good' | 'needs_improvement' | 'poor' | 'critical';

export interface ScoreOptions {
  includeNeuronWriter: boolean;
  includePerformance: boolean;
  includeAiVisibility: boolean;
  renderJavascript: boolean;
  storeSnapshot: boolean;
}

export interface ParsedPage {
  statusCode: number;
  headers: Record<string, string>;
  title?: string;
  metaDescription?: string;
  canonical?: string;
  metaRobots?: { noindex: boolean; nofollow: boolean };
  headings: { level: number; text: string }[];
  links: { href: string; text: string; isInternal: boolean }[];
  images: { src: string; alt?: string }[];
  jsonLd: any[];
  rawHtml: string;
  textContent: string;
}

export interface ScoreContext {
  tenantId: string;
  siteId?: string | null;
  url?: string;
  normalizedUrl?: string;
  targetKeyword?: string;
  locale?: string;
  pageType?: string;
  platform?: string;
  options?: ScoreOptions;
  parsed: ParsedPage;
  enrichments?: Record<string, unknown>[];
}

export interface AuditIssue {
  code: string;
  title: string;
  severity: Severity;
  module: string;
  impact: string;
  evidence: any;
  recommendation: string;
  implementationHint?: string;
  confidence: number;
}

export interface Recommendation {
  code: string;
  title: string;
  module: string;
  severity: Severity;
  recommendation: string;
  implementationHint?: string;
  estimatedEffort: 'low' | 'medium' | 'high';
  estimatedImpact: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface AiVisibilityData {
  answerability: number;
  citationReadiness: number;
  entityClarity: number;
  aiParseability: number;
  sourceTrustSignals: number;
  platformReadiness: {
    platform: string;
    score: number;
    confidence: number;
    rationale: string;
    experimental: boolean;
  }[];
}

export interface ScoreModuleResult {
  key: string;
  label: string;
  score: number;
  maxScore: number;
  status: ModuleStatus;
  issues: AuditIssue[];
  recommendations: Recommendation[];
  aiVisibilityData?: AiVisibilityData;
  semanticAnalysisData?: Record<string, unknown>;
}

export interface ScoreModule {
  key: string;
  label: string;
  maxScore: number;
  run(context: ScoreContext): Promise<ScoreModuleResult>;
}
