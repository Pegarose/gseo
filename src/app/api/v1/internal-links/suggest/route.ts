import { NextRequest } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth/middleware';
import { successResponse } from '@/lib/response';

async function handler(req: NextRequest, context: AuthenticatedContext) {
  const startTime = Date.now();
  const body = await req.json().catch(() => ({}));

  const data = {
    _skeleton: true,
    _message: 'POST /api/v1/internal-links/suggest is a Phase 0 skeleton. Full implementation coming in Phase 1.',
    sourceUrl: body.sourceUrl || null,
    suggestions: [],
    orphanRisk: false,
    siteGraphStatus: 'not_available',
    createdAt: new Date().toISOString(),
  };

  return successResponse(data, Date.now() - startTime, context.requestId);
}

export const POST = withAuth(handler, 'links:read');
