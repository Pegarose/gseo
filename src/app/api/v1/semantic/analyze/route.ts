import { NextRequest } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth/middleware';
import { successResponse } from '@/lib/response';

async function handler(req: NextRequest, context: AuthenticatedContext) {
  const startTime = Date.now();
  const body = await req.json().catch(() => ({}));

  // Phase 0: Skeleton endpoint — returns placeholder response
  const data = {
    _skeleton: true,
    _message: 'POST /api/v1/semantic/analyze is a Phase 0 skeleton. Full implementation coming in Phase 1.',
    semanticScore: null,
    targetKeyword: body.targetKeyword || null,
    terms: [],
    missingEntities: [],
    competitorGaps: [],
    recommendations: [],
    providerEnrichment: {
      provider: 'fallback',
      status: 'skipped',
    },
  };

  return successResponse(data, Date.now() - startTime, context.requestId);
}

export const POST = withAuth(handler, 'semantic:read');
