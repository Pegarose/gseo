import { NextRequest } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/response';
import { prisma } from '@/lib/db/prisma';
import crypto from 'crypto';

const VALID_EVENTS = ['score.completed', 'score.failed', 'site.crawl.completed', 'quota.warning'];

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

async function handler(req: NextRequest, context: AuthenticatedContext) {
  const startTime = Date.now();

  if (req.method === 'GET') {
    const webhooks = await prisma.webhook.findMany({
      where: { tenantId: context.tenantId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        url: true,
        events: true,
        active: true,
        siteId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return successResponse({ webhooks }, Date.now() - startTime, context.requestId);
  }

  if (req.method === 'POST') {
    const body = await req.json().catch(() => ({}));
    const { url, events = [], siteId, secret } = body;

    if (!url || typeof url !== 'string' || !isValidUrl(url)) {
      return errorResponse('Missing or invalid field: url', 'VALIDATION_ERROR', 400, { field: 'url' }, context.requestId);
    }

    const normalizedEvents = Array.isArray(events) ? events : [events];
    const invalidEvents = normalizedEvents.filter((e: string) => !VALID_EVENTS.includes(e));
    if (invalidEvents.length > 0) {
      return errorResponse('Invalid event types', 'VALIDATION_ERROR', 400, { invalidEvents, validEvents: VALID_EVENTS }, context.requestId);
    }

    if (siteId) {
      const site = await prisma.site.findFirst({
        where: { id: siteId, tenantId: context.tenantId },
        select: { id: true },
      });
      if (!site) {
        return errorResponse('Site not found or access denied.', 'NOT_FOUND', 404, { siteId }, context.requestId);
      }
    }

    const webhook = await prisma.webhook.create({
      data: {
        tenantId: context.tenantId,
        siteId: siteId || null,
        url,
        events: normalizedEvents,
        secret: secret || null,
      },
      select: {
        id: true,
        url: true,
        events: true,
        active: true,
        siteId: true,
        createdAt: true,
      },
    });

    return successResponse(webhook, Date.now() - startTime, context.requestId);
  }

  return errorResponse('Method not allowed', 'METHOD_NOT_ALLOWED', 405, {}, context.requestId);
}

export const GET = withAuth(handler, 'webhook:write');
export const POST = withAuth(handler, 'webhook:write');

// Delete webhook
async function deleteHandler(req: NextRequest, context: AuthenticatedContext) {
  const startTime = Date.now();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return errorResponse('Missing id query parameter', 'VALIDATION_ERROR', 400, {}, context.requestId);
  }

  const webhook = await prisma.webhook.findFirst({
    where: { id, tenantId: context.tenantId },
  });

  if (!webhook) {
    return errorResponse('Webhook not found', 'NOT_FOUND', 404, { id }, context.requestId);
  }

  await prisma.webhook.delete({ where: { id } });
  return successResponse({ deleted: true }, Date.now() - startTime, context.requestId);
}

export const DELETE = withAuth(deleteHandler, 'webhook:write');
