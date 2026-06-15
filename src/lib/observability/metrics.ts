export interface RequestMetric {
  endpoint: string;
  tenantId?: string;
  statusCode: number;
  durationMs: number;
  timestamp: string;
}

const metricsBuffer: RequestMetric[] = [];
const MAX_BUFFER_SIZE = 1000;

export function recordRequestMetric(metric: RequestMetric) {
  metricsBuffer.push(metric);
  if (metricsBuffer.length > MAX_BUFFER_SIZE) {
    metricsBuffer.shift();
  }
}

export function getRecentMetrics(take = 100): RequestMetric[] {
  return metricsBuffer.slice(-take);
}

export function getAverageLatency(endpoint?: string): number {
  const relevant = endpoint ? metricsBuffer.filter((m) => m.endpoint === endpoint) : metricsBuffer;
  if (relevant.length === 0) return 0;
  return relevant.reduce((sum, m) => sum + m.durationMs, 0) / relevant.length;
}

export function getErrorRate(): number {
  if (metricsBuffer.length === 0) return 0;
  const errors = metricsBuffer.filter((m) => m.statusCode >= 500).length;
  return errors / metricsBuffer.length;
}
