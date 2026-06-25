/** ISO date (Y-m-d) for SEOCrawl `from` / `to` query params. */

export interface SeoCrawlDateRange {
  from: string;
  to: string;
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Last N days ending yesterday (GSC data lag). */
export function lastNDaysRange(days: number): SeoCrawlDateRange {
  const to = new Date();
  to.setUTCDate(to.getUTCDate() - 1);
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - (days - 1));
  return { from: toIsoDate(from), to: toIsoDate(to) };
}

export function last28DaysRange(): SeoCrawlDateRange {
  return lastNDaysRange(28);
}
