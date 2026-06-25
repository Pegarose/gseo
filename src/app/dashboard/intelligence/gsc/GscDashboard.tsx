'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BarChart3, Loader2, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
import { loadGscDashboard } from '../../seocrawl-actions';
import type { NormalizedGscDashboard } from '@/lib/providers/seocrawl/normalize';
import { formatCtr, formatCount, formatPct, formatPosition } from '@/lib/providers/seocrawl/normalize';
import type { SeoCrawlIntelMeta } from '@/lib/providers/seocrawl/service';

export type GscSiteOption = {
  id: string;
  name: string;
  domain: string;
  seocrawlLinked: boolean;
  seocrawlPropertyUrl: string | null;
};

type Props = {
  sites: GscSiteOption[];
};

function ChangeBadge({ value }: { value: number | null }) {
  if (value == null || !Number.isFinite(value)) {
    return <span className="text-gray-400 text-xs">—</span>;
  }
  const up = value > 0;
  const down = value < 0;
  const Icon = up ? TrendingUp : down ? TrendingDown : null;
  const color = up ? 'text-green-700 bg-green-50' : down ? 'text-red-700 bg-red-50' : 'text-gray-600 bg-gray-50';

  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${color}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {formatPct(value)}
    </span>
  );
}

export default function GscDashboard({ sites }: Props) {
  const searchParams = useSearchParams();
  const initialSiteId = searchParams.get('siteId') ?? sites[0]?.id ?? '';

  const [siteId, setSiteId] = useState(initialSiteId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<NormalizedGscDashboard | null>(null);
  const [meta, setMeta] = useState<SeoCrawlIntelMeta | null>(null);
  const [creditsCharged, setCreditsCharged] = useState<number | null>(null);

  const selectedSite = useMemo(() => sites.find((s) => s.id === siteId), [sites, siteId]);
  const linkedSites = sites.filter((s) => s.seocrawlLinked);

  const run = async () => {
    if (!siteId) return;
    setLoading(true);
    setError(null);
    const res = await loadGscDashboard(siteId);
    setLoading(false);
    if (!res.success) {
      setError(res.error);
      setData(null);
      setMeta(null);
      return;
    }
    setData(res.data);
    setMeta(res.meta);
    setCreditsCharged(res.creditsCharged);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            Search Console
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            SEOCrawl REST — son 28 gün GSC özeti, top keywords ve top pages
          </p>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
            >
              {sites.length === 0 && <option value="">Site yok</option>}
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} ({site.domain}){site.seocrawlLinked ? '' : ' — SEOCrawl yok'}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={run}
              disabled={loading || !siteId || !selectedSite?.seocrawlLinked}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              GSC yükle
            </button>
          </div>

          {linkedSites.length === 0 && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              Hiçbir GSeoSuite sitesi SEOCrawl projesiyle eşleşmiyor. SEOCrawl panelinde aynı domain ile
              proje oluşturun.
            </p>
          )}

          {selectedSite && !selectedSite.seocrawlLinked && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              <strong>{selectedSite.domain}</strong> SEOCrawl hesabınızda bulunamadı.
            </p>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}

          {meta && (
            <p className="text-xs text-gray-400">
              {meta.cached ? 'Önbellek (0 kredi)' : `${creditsCharged ?? meta.creditsEstimated} kredi düşüldü`}
              {' · '}
              {meta.durationMs}ms
              {' · '}
              {data?.period.from} → {data?.period.to}
            </p>
          )}
        </div>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Tıklama" value={formatCount(data.metrics.clicks)} />
            <MetricCard label="Gösterim" value={formatCount(data.metrics.impressions)} />
            <MetricCard label="CTR" value={formatCtr(data.metrics.ctr)} />
            <MetricCard label="Ort. pozisyon" value={formatPosition(data.metrics.position)} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <DataTable
              title="Top Keywords"
              rows={data.topKeywords.map((row) => ({
                primary: row.keyword ?? '—',
                clicks: row.clicks,
                change: row.clicksChangePct,
                secondary: row.position != null ? `Pos. ${formatPosition(row.position)}` : undefined,
              }))}
            />
            <DataTable
              title="Top Pages"
              rows={data.topPages.map((row) => ({
                primary: row.url ?? '—',
                clicks: row.clicks,
                change: row.clicksChangePct,
                secondary:
                  row.impressions > 0 ? `${formatCount(row.impressions)} imp.` : undefined,
              }))}
            />
          </div>

          {meta?.disclaimer && (
            <p className="text-xs text-gray-400">{meta.disclaimer}</p>
          )}
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-2 text-2xl font-bold text-gray-900">{value}</dd>
    </div>
  );
}

function DataTable({
  title,
  rows,
}: {
  title: string;
  rows: { primary: string; clicks: number; change: number | null; secondary?: string }[];
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2 text-left">{title === 'Top Pages' ? 'URL' : 'Keyword'}</th>
              <th className="px-4 py-2 text-right">Clicks</th>
              <th className="px-4 py-2 text-right">Δ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                  Veri yok
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.primary} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <div className="font-medium text-gray-900 max-w-md truncate" title={row.primary}>
                      {row.primary}
                    </div>
                    {row.secondary && <div className="text-xs text-gray-400">{row.secondary}</div>}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-700">{formatCount(row.clicks)}</td>
                  <td className="px-4 py-2 text-right">
                    <ChangeBadge value={row.change} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
