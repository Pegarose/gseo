'use client';

import { useCallback, useState } from 'react';
import { normalizeInternalLinksResult, InternalLinksResult } from './types';

export interface UseInternalLinksInput {
  siteId?: string;
  sourceUrl: string;
  html?: string;
  targetKeyword?: string;
  pageType?: string;
}

export interface UseInternalLinksOptions {
  apiPath?: string;
}

export interface UseInternalLinksReturn {
  result: InternalLinksResult | null;
  loading: boolean;
  error: string | null;
  fetch: () => Promise<InternalLinksResult | null>;
}

export function useInternalLinkSuggestions(
  input: UseInternalLinksInput,
  options: UseInternalLinksOptions = {}
): UseInternalLinksReturn {
  const apiPath = options.apiPath ?? '/api/seo/links';
  const [result, setResult] = useState<InternalLinksResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async (): Promise<InternalLinksResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || `Request failed (${res.status})`);
      }

      const normalized = normalizeInternalLinksResult(json);
      setResult(normalized);
      return normalized;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load link suggestions';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiPath, input]);

  return { result, loading, error, fetch: fetchSuggestions };
}
