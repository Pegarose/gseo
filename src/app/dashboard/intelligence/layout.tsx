import { isPlatformIntelEnabled } from '@/lib/features/platform-intel';
import { isSeoCrawlIntelEnabled } from '@/lib/features/seocrawl-intel';
import PlatformIntelGate from './PlatformIntelGate';
import IntelligenceNav from './IntelligenceNav';

export default function IntelligenceRootLayout({ children }: { children: React.ReactNode }) {
  if (!isPlatformIntelEnabled()) {
    return <PlatformIntelGate />;
  }

  return (
    <>
      <IntelligenceNav showSeoCrawlGsc={isSeoCrawlIntelEnabled()} />
      {children}
    </>
  );
}
