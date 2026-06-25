import DashboardShell from './DashboardShell';
import { isPlatformIntelEnabled } from '@/lib/features/platform-intel';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell platformIntelEnabled={isPlatformIntelEnabled()}>
      {children}
    </DashboardShell>
  );
}
