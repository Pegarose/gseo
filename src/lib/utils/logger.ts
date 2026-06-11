export function logApiError({
  requestId,
  tenantId,
  endpoint,
  durationMs,
  errorCode,
  error
}: {
  requestId: string;
  tenantId: string | null;
  endpoint: string;
  durationMs?: number;
  errorCode: string;
  error?: any;
}) {
  const logPayload = {
    level: 'error',
    timestamp: new Date().toISOString(),
    requestId,
    tenantId: tenantId || 'unauthenticated',
    endpoint,
    durationMs,
    errorCode,
    // Safely extract error message without logging sensitive traces/objects unless sanitized
    errorMessage: error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error',
  };

  console.error(JSON.stringify(logPayload));
}

export function logApiInfo({
  requestId,
  tenantId,
  endpoint,
  durationMs,
  status
}: {
  requestId: string;
  tenantId: string | null;
  endpoint: string;
  durationMs: number;
  status: string;
}) {
  const logPayload = {
    level: 'info',
    timestamp: new Date().toISOString(),
    requestId,
    tenantId: tenantId || 'unauthenticated',
    endpoint,
    durationMs,
    status
  };

  console.info(JSON.stringify(logPayload));
}
