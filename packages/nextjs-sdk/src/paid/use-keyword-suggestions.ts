'use client';

import { useCallback, useState } from 'react';
import { normalizeKeywordIntelResult, KeywordIntelResult } from './types';

export interface UseKeywordIntelInput {
  keyword: string;
  country?: string;
  mode?: 'research' | 'single';
}

export interface UseKeywordIntelOptions {
  apiPath?: string;
}

export interface UseKeywordIntelReturn {
  result: KeywordIntelResult | null;
  loading: boolean;
  error: string | null;
  fetch: () => Promise<KeywordIntelResult | null>;
}

export function useKeywordSuggestions(
  input: UseKeywordIntelInput,
  options: UseKeywordIntelOptions = {}
): UseKeywordIntelReturn {
  const apiPath = options.apiPath ?? '/api/seo/keywords';
  const [result, setResult] = useState<KeywordIntelResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async (): Promise<KeywordIntelResult | null> => {
    if (!input.keyword || input.keyword.trim().length < 2) {
      setError('Enter a target keyword (min 2 characters).');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: input.keyword.trim(),
          country: input.country ?? 'tr',
          mode: input.mode ?? 'research',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || `Request failed (${res.status})`);
      }

      const normalized = normalizeKeywordIntelResult(json);
      setResult(normalized);
      return normalized;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load keyword suggestions';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiPath, input.keyword, input.country, input.mode]);

  return { result, loading, error, fetch: fetchSuggestions };
}
