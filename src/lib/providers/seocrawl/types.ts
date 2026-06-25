export interface SeoCrawlProperty {
  id: string;
  title: string;
  url: string;
  favicon_url: string | null;
}

export interface SeoCrawlListResponse<T> {
  data: T[];
}

export interface SeoCrawlMetricDelta {
  value: number | null;
  value_prev?: number | null;
  diff?: number | null;
  change_pct?: number | null;
}

export interface SeoCrawlGscSummary {
  period: { from: string; to: string };
  previous_period: { from: string; to: string };
  filters: { country: string | null; device: string | null };
  metrics: {
    clicks: number | null;
    impressions: number | null;
    ctr: number | null;
    position: number | null;
  };
}

export interface SeoCrawlGscKeywordRow {
  keyword: string;
  metrics: {
    clicks: SeoCrawlMetricDelta;
    impressions: SeoCrawlMetricDelta;
    ctr?: SeoCrawlMetricDelta;
    position?: SeoCrawlMetricDelta;
  };
}

export interface SeoCrawlGscPageRow {
  url: string;
  metrics: {
    clicks: SeoCrawlMetricDelta;
    impressions: SeoCrawlMetricDelta;
    ctr?: SeoCrawlMetricDelta;
    position?: SeoCrawlMetricDelta;
  };
}

export interface SeoCrawlTask {
  id: string;
  slug: string;
  url?: string;
  title?: string;
  [key: string]: unknown;
}
