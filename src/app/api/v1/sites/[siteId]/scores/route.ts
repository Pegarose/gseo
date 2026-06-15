import { NextRequest } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/response';
import { prisma } from '@/lib/db/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import { createRateLimitResponse } from '@/lib/utils/rate-limit';

async function handler(req: NextRequest, context: AuthenticatedContext) {
  const startTime = Date.now();

  const rl = await checkRateLimit(context.tenantId, 'sites/scores', 60, req.headers.get('x-forwarded-for') || 'unknown');
  if (!rl.success) {
    return createRateLimitResponse(rl.info, context.requestId);
  }

  const siteId = req.url.split('/sites/')[1]?.split('/scores')[0];
  if (!siteId) {
    return errorResponse('Missing siteId in path.', 'VALIDATION_ERROR', 400, {}, context.requestId);
  }

  const site = await prisma.site.findFirst({
    where: { id: siteId, tenantId: context.tenantId },
  });

  if (!site) {
    return errorResponse('Site not found or access denied.', 'NOT_FOUND', 404, { siteId }, context.requestId);
  }

  const snapshots = await prisma.scoreSnapshot.findMany({
    where: { siteId: site.id, tenantId: context.tenantId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return successResponse({ siteId: site.id, scores: snapshots }, Date.now() - startTime, context.requestId);
}

export const GET = withAuth(handler, 'site:read');
