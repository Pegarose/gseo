import Link from 'next/link';
import { ArrowLeft, FlaskConical } from 'lucide-react';
import { getSeoCrawlAllowedDomains } from '@/lib/features/seocrawl-intel';

export default function SeoCrawlPilotGate() {
  const domains = getSeoCrawlAllowedDomains();

  return (
    <div className="max-w-xl space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <FlaskConical className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm text-amber-900">
            <p className="font-semibold">SEOCrawl — pilot (EfesusStone)</p>
            <p className="leading-relaxed">
              Search Console entegrasyonu şu an genel kullanıma kapalı. Yalnızca pilot domain
              listesindeki siteler için açılır.
            </p>
            <p className="text-xs text-amber-800">
              Aktif pilot:{' '}
              <code className="bg-white/80 px-1 rounded">{domains.join(', ') || '—'}</code>
            </p>
            <p className="text-xs text-amber-800">
              Geliştirme: <code className="bg-white/80 px-1 rounded">SEOCRAWL_INTEL_ENABLED=true</code>
            </p>
          </div>
        </div>
      </div>
      <Link
        href="/dashboard/sites"
        className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        <ArrowLeft className="w-4 h-4" /> Site yönetimine dön
      </Link>
    </div>
  );
}
