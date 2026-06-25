import Link from 'next/link';
import { SEO_PERSIST_LABEL } from '../../../lib/seo-settings';

export default function StarterDemoBanner() {
  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
      <strong>Demo modu:</strong> Bu panel müşterinin kendi Next.js sitesinde çalışan{' '}
      <code className="rounded bg-white/80 px-1 text-xs">@seosuite/next/admin</code> embed&apos;idir.
      Ayarlar{' '}
      <code className="rounded bg-white/80 px-1 text-xs">{SEO_PERSIST_LABEL}</code> dosyasına kaydedilir
      (RankMath&apos;in <code className="rounded bg-white/80 px-1 text-xs">wp_options</code> mantığı — site-local).
      Keyword explorer ve ajans özellikleri{' '}
      <Link href="http://localhost:3001/dashboard" className="font-medium underline hover:text-indigo-700">
        GSeoSuite Cloud
      </Link>{' '}
      (3001) tarafındadır.{' '}
      <Link href="/" className="font-medium underline hover:text-indigo-700">
        ← Demo ana sayfa
      </Link>
    </div>
  );
}
