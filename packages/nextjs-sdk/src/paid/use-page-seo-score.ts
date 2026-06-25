'use client';

import { useCallback, useState } from 'react';
import { normalizeScoreResult, ScoreContentResult } from './types';

export type PageScoreMode = 'content' | 'url';

export interface UsePageSeoScoreInput {
  siteId?: string;
  url: string;
  /** Required for content mode (CMS editor). Omitted for url mode (live crawl). */
  html?: string;
  title?: string;
  metaDescription?: string;
  targetKeyword?: string;
  contentId?: string;
  locale?: string;
  pageType?: string;
  scoreMode?: PageScoreMode;
}

export interface UsePageSeoScoreOptions {
  /** Content score proxy. Default: /api/seo/score */
  apiPath?: string;
  autoScore?: boolean;
}

export interface UsePageSeoScoreReturn {
  result: ScoreContentResult | null;
  pageHtml: string | null;
  loading: boolean;
  error: string | null;
  score: () => Promise<ScoreContentResult | null>;
  reset: () => void;
}

export function usePageSeoScore(
  input: UsePageSeoScoreInput,
  options: UsePageSeoScoreOptions = {}
): UsePageSeoScoreReturn {
  const scoreMode = input.scoreMode ?? (input.html ? 'content' : 'url');
  const apiPath = options.apiPath ?? (scoreMode === 'url' ? '/api/seo/score-url' : '/api/seo/score');
  const [result, setResult] = useState<ScoreContentResult | null>(null);
  const [pageHtml, setPageHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const score = useCallback(async (): Promise<ScoreContentResult | null> => {
    if (scoreMode === 'content' && !input.html) {
      setError('HTML content is required for content scoring.');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const body =
        scoreMode === 'url'
          ? {
              siteId: input.siteId,
              url: input.url,
              targetKeyword: input.targetKeyword,
              pageType: input.pageType,
              locale: input.locale,
              options: { includeAiVisibility: true, storeSnapshot: true },
            }
          : {
              siteId: input.siteId,
              url: input.url,
              html: input.html,
              title: input.title,
              metaDescription: input.metaDescription,
              targetKeyword: input.targetKeyword,
              contentId: input.contentId,
              locale: input.locale,
              pageType: input.pageType,
              options: { includeAiVisibility: true, storeSnapshot: true },
            };

      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || `Scoring failed (${res.status})`);
      }

      const normalized = normalizeScoreResult(json);
      setResult(normalized);
      if (scoreMode === 'url' && json.data?.pageHtml) {
        setPageHtml(String(json.data.pageHtml));
      }
      return normalized;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Scoring failed';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiPath, input, scoreMode]);

  const reset = useCallback(() => {
    setResult(null);
    setPageHtml(null);
    setError(null);
  }, []);

  return { result, pageHtml, loading, error, score, reset };
}
