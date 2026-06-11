import { NextRequest } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth/middleware';
import { successResponse } from '@/lib/response';

async function handler(req: NextRequest, context: AuthenticatedContext) {
  const startTime = Date.now();
  const body = await req.json().catch(() => ({}));

  const data = {
    _skeleton: true,
    _message: 'POST /api/v1/webhooks is a Phase 0 skeleton. Webhook registration will be implemented in Phase 1.',
    webhookId: null,
    siteId: body.siteId || null,
    url: body.url || null,
    events: body.events || [],
    createdAt: new Date().toISOString(),
  };

  return successResponse(data, Date.now() - startTime, context.requestId);
}

export const POST = withAuth(handler, 'webhook:write');
