import Link from 'next/link';
import { Microscope, ArrowRight } from 'lucide-react';

export default function PlatformIntelGate() {
  return (
    <div className="max-w-xl mx-auto mt-12 text-center space-y-4">
      <div className="inline-flex p-4 rounded-2xl bg-gray-100 text-gray-500">
        <Microscope className="w-10 h-10" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900">Intelligence — Faz 2</h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        Keyword explorer, rank tracking, domain overview ve backlink araçları OpenSEO / Semrush
        tarzı <strong>platform</strong> özellikleridir. Önce{' '}
        <code className="text-xs bg-gray-100 px-1 rounded">@seosuite/next</code> SDK ve WordPress
        eklentisini tamamlıyoruz; site içi SEO execution oturduktan sonra bu katman açılacak.
      </p>
      <p className="text-xs text-gray-400">
        Geliştirme: <code>GSEO_PLATFORM_INTEL_ENABLED=true</code>
      </p>
      <Link
        href="/dashboard/sites"
        className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        Site yönetimine git <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
