import Link from 'next/link';
import { BarChart3, ArrowRight } from 'lucide-react';
import {
  isSeoCrawlAllowedDomain,
  isSeoCrawlIntelEnabled,
} from '@/lib/features/seocrawl-intel';
import { resolvePropertyForDomain } from '@/lib/providers/seocrawl/service';

type Props = {
  siteId: string;
  domain: string;
};

export default async function SiteGscLink({ siteId, domain }: Props) {
  if (!isSeoCrawlIntelEnabled() || !isSeoCrawlAllowedDomain(domain)) {
    return null;
  }

  const property = await resolvePropertyForDomain(domain);
  if (!property) {
    return (
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-900">
        <strong>{domain}</strong> SEOCrawl pilot projesiyle eşleşmiyor. SEOCrawl panelinde aynı
        domain ile proje ve GSC bağlantısını kontrol edin.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-500" />
          Search Console
          <span className="text-xs font-normal text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
            Pilot
          </span>
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          SEOCrawl GSC — yalnızca EfesusStone pilot kapsamında.
        </p>
      </div>
      <Link
        href={`/dashboard/intelligence/gsc?siteId=${siteId}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        GSC Dashboard <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
