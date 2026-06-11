import { NextRequest } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/response';
import { prisma } from '@/lib/db/prisma';
import { checkRateLimit, createRateLimitResponse } from '@/lib/utils/rate-limit';
import { logApiError } from '@/lib/utils/logger';

async function handler(req: NextRequest, context: AuthenticatedContext) {
  const startTime = Date.now();

  // Rate Limit Check (300 req / hour)
  const rl = checkRateLimit(context.tenantId, 'auth/me', 300, req.headers.get('x-forwarded-for') || 'unknown');
  if (!rl.success) {
    return createRateLimitResponse(rl.info, context.requestId);
  }

  try {
    // Fetch tenant plan and key details
    const keyRecord = await prisma.apiKey.findUnique({
      where: { id: context.apiKeyId },
      include: {
        tenant: true
      }
    });

    if (!keyRecord) {
      return errorResponse('API Key record not found.', 'NOT_FOUND', 404, {}, context.requestId);
    }

    const keyType = keyRecord.keyPrefix.includes('_test_') ? 'test' : 'live';

    const data = {
      tenantId: context.tenantId,
      keyId: context.apiKeyId,
      keyType,
      scopes: context.scopes,
      allowedSiteIds: context.siteId ? [context.siteId] : null,
      plan: keyRecord.tenant.plan
    };

    const durationMs = Date.now() - startTime;
    return successResponse(data, durationMs, context.requestId);
  } catch (error: any) {
    logApiError({
      requestId: context.requestId,
      tenantId: context.tenantId,
      endpoint: 'auth/me',
      durationMs: Date.now() - startTime,
      errorCode: 'INTERNAL_ERROR',
      error
    });
    
    return errorResponse(
      'Failed to resolve authentication info.',
      'INTERNAL_ERROR',
      500,
      { error: error?.message },
      context.requestId
    );
  }
}

export const GET = withAuth(handler);
