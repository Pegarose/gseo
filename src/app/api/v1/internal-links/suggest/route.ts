import { NextRequest } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/response';
import { prisma } from '@/lib/db/prisma';
import { parseHtml } from '@/lib/parsers/html-parser';
import { LinkingModule } from '@/lib/scoring/modules/linking';
import { ScoreContext } from '@/lib/scoring/types';
import {
  assertTenantHasCredits,
  chargeTenantCredits,
  InsufficientCreditsError,
} from '@/lib/credits/charge';

const FEATURE_KEY = 'links.internal';

async function handler(req: NextRequest, context: AuthenticatedContext) {
  const startTime = Date.now();

  try {
    const body = await req.json().catch(() => ({}));
    const { sourceUrl, html, siteId } = body;

    if (!sourceUrl || typeof sourceUrl !== 'string') {
      return errorResponse(
        'Missing or invalid field: sourceUrl',
        'VALIDATION_ERROR',
        400,
        { field: 'sourceUrl' },
        context.requestId
      );
    }

    const resolvedSiteId = siteId || context.siteId;
    if (!resolvedSiteId) {
      return errorResponse(
        'Missing siteId. Provide siteId in request body or use a site-scoped API key.',
        'VALIDATION_ERROR',
        400,
        { field: 'siteId' },
        context.requestId
      );
    }

    const site = await prisma.site.findFirst({
      where: { id: resolvedSiteId, tenantId: context.tenantId },
      select: { id: true, domain: true, name: true },
    });

    if (!site) {
      return errorResponse(
        'Site not found or access denied.',
        'NOT_FOUND',
        404,
        { siteId: resolvedSiteId },
        context.requestId
      );
    }

    await assertTenantHasCredits(context.tenantId, FEATURE_KEY);

    let parsed = null;
    if (html && typeof html === 'string') {
      parsed = parseHtml(html, 200, {}, sourceUrl);
    }

    const candidates = await prisma.scoreSnapshot.findMany({
      where: {
        tenantId: context.tenantId,
        siteId: site.id,
        normalizedUrl: { not: sourceUrl },
      },
      orderBy: { createdAt: 'desc' },
      distinct: ['normalizedUrl'],
      take: 20,
      select: {
        url: true,
        normalizedUrl: true,
        finalScore: true,
      },
    });

    const baseDomain = site.domain;
    const sourceUrlObj = new URL(sourceUrl, `https://${baseDomain}`);
    const sourceText = parsed?.textContent?.toLowerCase() ?? '';

    const suggestions = candidates
      .filter((c) => {
        try {
          return new URL(c.normalizedUrl, `https://${baseDomain}`).pathname !== sourceUrlObj.pathname;
        } catch {
          return true;
        }
      })
      .map((c) => {
        const candidateText = c.url.toLowerCase();
        const relevance = candidateText
          .split(/\W+/)
          .filter((w: string) => w.length > 3 && sourceText.includes(w)).length;
        return {
          targetUrl: c.normalizedUrl,
          title: c.url,
          anchorSuggestion: c.url,
          reason: 'Related page in the same site',
          relationship: 'contextual',
          confidence: Math.min(0.5 + relevance * 0.1, 0.95),
        };
      })
      .filter((s) => s.confidence > 0.5)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);

    let linkModuleResult = null;
    if (parsed) {
      const scoreContext: ScoreContext = {
        url: sourceUrl,
        normalizedUrl: sourceUrl,
        pageType: body.pageType ?? 'generic',
        locale: 'en-US',
        platform: 'custom',
        parsed,
        targetKeyword: body.targetKeyword,
        enrichments: [],
        tenantId: context.tenantId,
      };
      const linking = new LinkingModule();
      linkModuleResult = await linking.run(scoreContext);
    }

    const charge = await chargeTenantCredits({
      tenantId: context.tenantId,
      siteId: site.id,
      featureKey: FEATURE_KEY,
      endpoint: 'internal-links/suggest',
    });

    const data = {
      sourceUrl,
      sourceSiteId: site.id,
      suggestions,
      orphanRisk: suggestions.length === 0,
      siteGraphStatus: candidates.length > 0 ? 'partial' : 'not_available',
      sourceIssues: linkModuleResult?.issues ?? [],
      createdAt: new Date().toISOString(),
      creditsCharged: charge.charged,
      creditBalance: charge.balance,
    };

    return successResponse(data, Date.now() - startTime, context.requestId);
  } catch (err) {
    if (err instanceof InsufficientCreditsError) {
      return errorResponse(err.message, 'QUOTA_EXCEEDED', 429, {
        used: err.used,
        limit: err.limit,
        required: err.required,
      }, context.requestId);
    }
    return errorResponse(
      err instanceof Error ? err.message : 'Internal link suggestion failed',
      'INTERNAL_ERROR',
      500,
      {},
      context.requestId
    );
  }
}

export const POST = withAuth(handler, 'links:read');
