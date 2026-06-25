import type {
  SeoCrawlGscKeywordRow,
  SeoCrawlGscPageRow,
  SeoCrawlGscSummary,
  SeoCrawlProperty,
} from './types';

export interface NormalizedGscMetricRow {
  keyword?: string;
  url?: string;
  clicks: number;
  clicksChangePct: number | null;
  impressions: number;
  impressionsChangePct: number | null;
  position: number | null;
  ctr: number | null;
}

export interface NormalizedGscDashboard {
  propertyId: string;
  propertyUrl: string;
  period: SeoCrawlGscSummary['period'];
  previousPeriod: SeoCrawlGscSummary['previous_period'];
  metrics: SeoCrawlGscSummary['metrics'];
  topKeywords: NormalizedGscMetricRow[];
  topPages: NormalizedGscMetricRow[];
}

function deltaPct(delta: { change_pct?: number; value?: number | null } | undefined): number | null {
  return delta?.change_pct != null && Number.isFinite(delta.change_pct)
    ? Math.round(delta.change_pct * 100) / 100
    : null;
}

function metricValue(delta: { value?: number | null } | undefined): number {
  const value = delta?.value;
  return value != null && Number.isFinite(value) ? value : 0;
}

function metricValueOrNull(delta: { value?: number | null } | undefined): number | null {
  const value = delta?.value;
  return value != null && Number.isFinite(value) ? value : null;
}

export function normalizeKeywordRow(row: SeoCrawlGscKeywordRow): NormalizedGscMetricRow {
  return {
    keyword: row.keyword,
    clicks: metricValue(row.metrics.clicks),
    clicksChangePct: deltaPct(row.metrics.clicks),
    impressions: metricValue(row.metrics.impressions),
    impressionsChangePct: deltaPct(row.metrics.impressions),
    position: metricValueOrNull(row.metrics.position),
    ctr: metricValueOrNull(row.metrics.ctr),
  };
}

export function normalizePageRow(row: SeoCrawlGscPageRow): NormalizedGscMetricRow {
  return {
    url: row.url,
    clicks: metricValue(row.metrics.clicks),
    clicksChangePct: deltaPct(row.metrics.clicks),
    impressions: metricValue(row.metrics.impressions),
    impressionsChangePct: deltaPct(row.metrics.impressions),
    position: metricValueOrNull(row.metrics.position),
    ctr: metricValueOrNull(row.metrics.ctr),
  };
}

export function normalizeGscDashboard(
  property: SeoCrawlProperty,
  summary: SeoCrawlGscSummary,
  keywords: SeoCrawlGscKeywordRow[],
  pages: SeoCrawlGscPageRow[]
): NormalizedGscDashboard {
  return {
    propertyId: property.id,
    propertyUrl: property.url,
    period: summary.period,
    previousPeriod: summary.previous_period,
    metrics: summary.metrics,
    topKeywords: keywords.map(normalizeKeywordRow),
    topPages: pages.map(normalizePageRow),
  };
}

export function formatPct(value: number | null, digits = 1): string {
  if (value == null || !Number.isFinite(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatCtr(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return `${(value * 100).toFixed(2)}%`;
}

export function formatCount(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return value.toLocaleString();
}

export function formatPosition(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return value.toFixed(1);
}
