import { NextRequest } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/response';
import { prisma } from '@/lib/db/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import { createRateLimitResponse } from '@/lib/utils/rate-limit';
import { logApiError } from '@/lib/utils/logger';

/**
 * GET /api/v1/sites
 * Lists all sites belonging to the authenticated tenant.
 * Required scope: site:read
 */
async function getHandler(req: NextRequest, context: AuthenticatedContext) {
  const startTime = Date.now();
  const rl = await checkRateLimit(context.tenantId, 'sites', 120, req.headers.get('x-forwarded-for') || 'unknown');
  if (!rl.success) {
    return createRateLimitResponse(rl.info, context.requestId);
  }

  try {
    const sites = await prisma.site.findMany({
      where: {
        tenantId: context.tenantId,
        // If API key is scoped to a specific site, filter by it
        ...(context.siteId ? { id: context.siteId } : {})
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedSites = sites.map(site => ({
      siteId: site.id,
      tenantId: site.tenantId,
      name: site.name,
      baseUrl: `https://${site.domain}`, // map stored domain back to baseUrl
      platform: site.platform,
      defaultLocale: site.defaultLocale,
      createdAt: site.createdAt.toISOString()
    }));

    const durationMs = Date.now() - startTime;
    return successResponse({ sites: formattedSites }, durationMs, context.requestId);
  } catch (error: any) {
    logApiError({
      requestId: context.requestId,
      tenantId: context.tenantId,
      endpoint: 'sites (GET)',
      durationMs: Date.now() - startTime,
      errorCode: 'INTERNAL_ERROR',
      error
    });

    return errorResponse(
      'Failed to retrieve sites.',
      'INTERNAL_ERROR',
      500,
      { error: error?.message },
      context.requestId
    );
  }
}

/**
 * POST /api/v1/sites
 * Creates a new site under the authenticated tenant.
 * Required scope: site:write
 */
async function postHandler(req: NextRequest, context: AuthenticatedContext) {
  const startTime = Date.now();
  const rl = await checkRateLimit(context.tenantId, 'sites', 120, req.headers.get('x-forwarded-for') || 'unknown');
  if (!rl.success) {
    return createRateLimitResponse(rl.info, context.requestId);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { name, baseUrl, platform, defaultLocale } = body;

    // Validation
    if (!name || typeof name !== 'string') {
      return errorResponse('Missing or invalid field: name', 'VALIDATION_ERROR', 400, { field: 'name' }, context.requestId);
    }
    if (!baseUrl || typeof baseUrl !== 'string') {
      return errorResponse('Missing or invalid field: baseUrl', 'VALIDATION_ERROR', 400, { field: 'baseUrl' }, context.requestId);
    }

    // Extract domain from baseUrl
    let domain = baseUrl;
    try {
      // Add protocol if missing to allow URL parsing
      const urlString = baseUrl.match(/^https?:\/\//) ? baseUrl : `https://${baseUrl}`;
      const parsedUrl = new URL(urlString);
      domain = parsedUrl.hostname;
    } catch (e) {
      return errorResponse('Invalid baseUrl format.', 'VALIDATION_ERROR', 400, { field: 'baseUrl' }, context.requestId);
    }

    if (!domain) {
      return errorResponse('Invalid domain derived from baseUrl.', 'VALIDATION_ERROR', 400, { field: 'baseUrl' }, context.requestId);
    }

    const platformValue = platform || 'custom';
    const localeValue = defaultLocale || 'en-US';

    // Tenant/Site isolation check & unique constraint: site domain must be unique under the same tenant
    const existingSite = await prisma.site.findUnique({
      where: {
        tenantId_domain: {
          tenantId: context.tenantId,
          domain: domain
        }
      }
    });

    if (existingSite) {
      return errorResponse(
        `A site with domain '${domain}' already exists under this tenant.`,
        'CONFLICT',
        409,
        { domain },
        context.requestId
      );
    }

    // Create Site
    const site = await prisma.site.create({
      data: {
        tenantId: context.tenantId,
        name,
        domain,
        platform: platformValue,
        defaultLocale: localeValue
      }
    });

    const data = {
      siteId: site.id,
      tenantId: site.tenantId,
      name: site.name,
      baseUrl: `https://${site.domain}`,
      platform: site.platform,
      defaultLocale: site.defaultLocale,
      createdAt: site.createdAt.toISOString()
    };

    const durationMs = Date.now() - startTime;
    return successResponse(data, durationMs, context.requestId);
  } catch (error: any) {
    logApiError({
      requestId: context.requestId,
      tenantId: context.tenantId,
      endpoint: 'sites (POST)',
      durationMs: Date.now() - startTime,
      errorCode: 'INTERNAL_ERROR',
      error
    });

    return errorResponse(
      'Failed to create site.',
      'INTERNAL_ERROR',
      500,
      { error: error?.message },
      context.requestId
    );
  }
}

export const GET = withAuth(getHandler, 'site:read');
export const POST = withAuth(postHandler, 'site:write');
