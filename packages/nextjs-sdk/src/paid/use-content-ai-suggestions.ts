'use client';

import { useCallback, useState } from 'react';
import { normalizeContentAiResult, ContentAiResult } from './types';

export interface UseContentAiInput {
  html: string;
  url?: string;
  targetKeyword?: string;
  pageType?: string;
}

export interface UseContentAiOptions {
  apiPath?: string;
}

export interface UseContentAiReturn {
  result: ContentAiResult | null;
  loading: boolean;
  error: string | null;
  fetch: () => Promise<ContentAiResult | null>;
}

export function useContentAiSuggestions(
  input: UseContentAiInput,
  options: UseContentAiOptions = {}
): UseContentAiReturn {
  const apiPath = options.apiPath ?? '/api/seo/content-ai';
  const [result, setResult] = useState<ContentAiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async (): Promise<ContentAiResult | null> => {
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

      const normalized = normalizeContentAiResult(json);
      setResult(normalized);
      return normalized;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load content suggestions';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiPath, input]);

  return { result, loading, error, fetch: fetchSuggestions };
}
