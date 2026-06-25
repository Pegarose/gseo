import { isSeoCrawlIntelEnabled } from '@/lib/features/seocrawl-intel';
import { listGscSiteOptions } from '../../seocrawl-actions';
import GscDashboard from './GscDashboard';
import SeoCrawlPilotGate from './SeoCrawlPilotGate';

export const dynamic = 'force-dynamic';

export default async function GscIntelligencePage() {
  if (!isSeoCrawlIntelEnabled()) {
    return <SeoCrawlPilotGate />;
  }

  const sites = await listGscSiteOptions();

  if (sites.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-sm text-amber-900 space-y-2">
        <p className="font-semibold">GSeoSuite&apos;te site kaydı yok</p>
        <p>
          SEOCrawl&apos;da proje olsa bile panel, <strong>Sites</strong> listesindeki domain ile
          eşleşme arar. Pilot için{' '}
          <code className="text-xs bg-white px-1 rounded">efesusstone.com</code> kayıtlı olmalı.
        </p>
        <p className="text-xs text-amber-800">
          Local: <code className="bg-white/80 px-1 rounded">npx prisma db seed</code> — seed
          Efesus Stone sitesini ekler.
        </p>
      </div>
    );
  }

  return <GscDashboard sites={sites} />;
}
