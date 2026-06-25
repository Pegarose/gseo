'use client';

import { useState } from 'react';
import { Bot, Loader2, CheckCircle2, XCircle, Info } from 'lucide-react';
import { loadAiCrawlerIntel } from '../vebapi-actions';
import type { NormalizedAiCrawlerIntel } from '@/lib/providers/vebapi/normalize';
import type { VebApiIntelMeta } from '@/lib/providers/vebapi/service';

interface SiteOption {
  id: string;
  name: string;
  domain: string;
}

interface Props {
  sites: SiteOption[];
  vebApiEnabled: boolean;
}

export default function AiCrawlerPanel({ sites, vebApiEnabled }: Props) {
  const [website, setWebsite] = useState(sites[0]?.domain ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<NormalizedAiCrawlerIntel | null>(null);
  const [meta, setMeta] = useState<VebApiIntelMeta | null>(null);

  if (!vebApiEnabled) {
    return null;
  }

  const runCheck = async () => {
    if (!website.trim()) return;
    setLoading(true);
    setError(null);
    const res = await loadAiCrawlerIntel(website.trim());
    setLoading(false);
    if (!res.success) {
      setError(res.error);
      return;
    }
    setData(res.data);
    setMeta(res.meta);
  };

  const blockedCount = data?.blockedBots.length ?? 0;
  const allowedCount = data
    ? Object.values(data.aiAccess).filter(Boolean).length
    : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-600" />
          AI Bot Crawler Access
          <span className="text-[10px] font-semibold uppercase tracking-wide bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
            VebAPI
          </span>
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          robots.txt üzerinden GPTBot, PerplexityBot ve diğer AI crawler izinleri — 1 credit
        </p>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          {sites.length > 0 && (
            <select
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white sm:max-w-xs"
            >
              {sites.map((s) => (
                <option key={s.id} value={s.domain}>
                  {s.name} ({s.domain})
                </option>
              ))}
            </select>
          )}
          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="example.com"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={runCheck}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
            Check
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
        )}

        {data && (
          <div className="space-y-4">
            {meta && (
              <p className="text-xs text-gray-400">
                {meta.cached ? 'Cached' : `~${meta.creditsEstimated} credit`} · {meta.durationMs}ms
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatusCard
                label="robots.txt"
                ok={data.robotsFound}
                detail={data.robotsFound ? 'Found' : 'Not found'}
              />
              <StatusCard
                label="AI bots"
                ok={data.aiBotsAllowed}
                detail={data.aiBotsAllowed ? 'All allowed' : `${blockedCount} blocked`}
              />
              <StatusCard
                label="Allowed bots"
                ok={allowedCount > 0}
                detail={`${allowedCount} / ${Object.keys(data.aiAccess).length}`}
              />
            </div>

            {data.suggestions.length > 0 && (
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-purple-900">
                  <Info className="w-4 h-4" /> Suggestions
                </div>
                <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
                  {data.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {data.blockedBots.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Blocked bots</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.blockedBots.map((bot) => (
                    <span
                      key={bot}
                      className="text-xs bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded-full"
                    >
                      {bot}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusCard({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 flex items-start gap-3">
      {ok ? (
        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
      )}
      <div>
        <div className="text-xs text-gray-500 uppercase font-medium">{label}</div>
        <div className="text-sm font-semibold text-gray-900 mt-0.5">{detail}</div>
      </div>
    </div>
  );
}
