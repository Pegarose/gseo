import { successResponse } from '@/lib/response';

export async function GET() {
  const startTime = Date.now();
  const data = {
    status: 'ok',
    service: 'seosuite-api',
    version: '0.1.0',
    timestamp: new Date().toISOString()
  };
  const durationMs = Date.now() - startTime;
  return successResponse(data, durationMs);
}
