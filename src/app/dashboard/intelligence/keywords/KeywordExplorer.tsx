'use client';

import { useState } from 'react';
import { Search, Loader2, Info } from 'lucide-react';
import { researchKeyword } from '../../vebapi-actions';
import type { NormalizedKeywordIntel } from '@/lib/providers/vebapi/normalize';
import type { VebApiIntelMeta } from '@/lib/providers/vebapi/service';

/**
 * OpenSEO referans: KeywordResearchPage + KeywordResearchSearchBar + results table.
 * @see .reference/open-seo/src/client/features/keywords/page/KeywordResearchPage.tsx
 */
export default function KeywordExplorer() {
  const [keyword, setKeyword] = useState('');
  const [country, setCountry] = useState('tr');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<NormalizedKeywordIntel | null>(null);
  const [meta, setMeta] = useState<VebApiIntelMeta | null>(null);
  const [creditsCharged, setCreditsCharged] = useState<number | null>(null);

  const run = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError(null);
    const res = await researchKeyword(keyword.trim(), country);
    setLoading(false);
    if (!res.success) {
      setError(res.error);
      return;
    }
    setData(res.data);
    setMeta(res.meta);
    setCreditsCharged('creditsCharged' in res ? (res.creditsCharged as number) : null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Keyword Explorer</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Pazar araştırması — herhangi bir kelime için hacim, CPC, rekabet
        </p>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-3">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            Platform intelligence — site detayından ayrı. Site sıralamaları GSC / Rank Tracker ile
            (Faz 2).
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && run()}
            placeholder="ör. mozaik, seo araçları"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white sm:w-28"
          >
            <option value="tr">TR</option>
            <option value="us">US</option>
            <option value="de">DE</option>
            <option value="gb">GB</option>
          </select>
          <button
            type="button"
            onClick={run}
            disabled={loading || !keyword.trim()}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Ara
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
        )}

        {meta && (
          <p className="text-xs text-gray-400">
            {meta.cached
              ? 'Önbellek (0 kredi)'
              : `${creditsCharged ?? meta.creditsEstimated} kredi düşüldü`}
            {' · '}
            {meta.durationMs}ms
          </p>
        )}

        {data && data.suggestions.length > 0 && (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-2 text-left">Keyword</th>
                  <th className="px-4 py-2 text-right">Volume</th>
                  <th className="px-4 py-2 text-right">CPC</th>
                  <th className="px-4 py-2 text-left">Competition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.suggestions.map((s) => (
                  <tr key={s.term} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900">{s.term}</td>
                    <td className="px-4 py-2 text-right text-gray-600">{s.volume?.toLocaleString() ?? '—'}</td>
                    <td className="px-4 py-2 text-right text-gray-600">{s.cpc != null ? `$${s.cpc}` : '—'}</td>
                    <td className="px-4 py-2 text-gray-600 capitalize">{s.competition ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
