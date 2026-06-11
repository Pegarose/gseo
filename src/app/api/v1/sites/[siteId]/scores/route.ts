import { NextRequest } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/response';
import { prisma } from '@/lib/db/prisma';

async function handler(req: NextRequest, context: AuthenticatedContext) {
  const startTime = Date.now();

  try {
    // Extract siteId from the URL path: /api/v1/sites/[siteId]/scores
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    // Expected: ['', 'api', 'v1', 'sites', '<siteId>', 'scores']
    const siteIdIndex = pathParts.indexOf('sites') + 1;
    const siteId = pathParts[siteIdIndex];

    if (!siteId) {
      return errorResponse('Missing siteId in URL path.', 'VALIDATION_ERROR', 400, {}, context.requestId);
    }

    // Verify site belongs to tenant
    const site = await prisma.site.findFirst({
      where: { id: siteId, tenantId: context.tenantId },
    });
    if (!site) {
      return errorResponse('Site not found or access denied.', 'NOT_FOUND', 404, { siteId }, context.requestId);
    }

    // Query params
    const pageType = url.searchParams.get('pageType') || undefined;
    const filterUrl = url.searchParams.get('url') || undefined;
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
    const cursor = url.searchParams.get('cursor') || undefined;

    const whereClause: any = {
      tenantId: context.tenantId,
      siteId,
    };
    if (pageType) whereClause.pageType = pageType;
    if (filterUrl) whereClause.url = filterUrl;

    const snapshots = await prisma.scoreSnapshot.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit + 1, // +1 to determine hasNextPage
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        url: true,
        pageType: true,
        finalScore: true,
        scoreBand: true,
        scoreVersion: true,
        platform: true,
        source: true,
        durationMs: true,
        createdAt: true,
      },
    });

    const hasNextPage = snapshots.length > limit;
    const resultScores = hasNextPage ? snapshots.slice(0, limit) : snapshots;

    const data = {
      scores: resultScores.map((s) => ({
        snapshotId: s.id,
        url: s.url,
        pageType: s.pageType,
        finalScore: s.finalScore,
        scoreBand: s.scoreBand,
        scoreVersion: s.scoreVersion,
        platform: s.platform,
        source: s.source,
        durationMs: s.durationMs,
        createdAt: s.createdAt.toISOString(),
      })),
      pageInfo: {
        hasNextPage,
        endCursor: resultScores.length > 0 ? resultScores[resultScores.length - 1].id : null,
      },
    };

    return successResponse(data, Date.now() - startTime, context.requestId);
  } catch (error: any) {
    console.error('Scores list error:', error);
    return errorResponse(
      'Failed to retrieve scores.',
      'INTERNAL_ERROR',
      500,
      { error: error?.message },
      context.requestId
    );
  }
}

export const GET = withAuth(handler, 'site:read');
