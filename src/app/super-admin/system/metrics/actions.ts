'use server';

import { requireSuperAdmin } from '../../actions';
import { getRecentMetrics, getAverageLatency, getErrorRate } from '@/lib/observability/metrics';

export async function getPerformanceMetrics() {
  await requireSuperAdmin();

  return {
    recent: getRecentMetrics(50),
    averageLatencyMs: getAverageLatency(),
    errorRate: getErrorRate(),
  };
}
