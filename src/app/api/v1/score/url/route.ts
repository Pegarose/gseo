import { NextRequest } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/response';
import { prisma } from '@/lib/db/prisma';
import { fetchUrl } from '@/lib/parsers/fetcher';
import { parseHtml, normalizeUrl } from '@/lib/parsers/html-parser';
import { ScoringEngine } from '@/lib/scoring/engine';
import { ScoreContext, ScoreOptions } from '@/lib/scoring/types';
import { checkRateLimit, createRateLimitResponse } from '@/lib/utils/rate-limit';
import { logApiError, logApiInfo } from '@/lib/utils/logger';
import { checkQuotaLimit, incrementTenantCredits } from '@/lib/auth/quota';

const MAX_URL_LENGTH = 2048;

async function handler(req: NextRequest, context: AuthenticatedContext) {
  const startTime = Date.now();

  // Rate Limit Check (60 req / hour)
  const rl = checkRateLimit(context.tenantId, 'score/url', 60, req.headers.get('x-forwarded-for') || 'unknown');
  if (!rl.success) {
    return createRateLimitResponse(rl.info, context.requestId);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      siteId,
      url,
      targetKeyword,
      locale,
      platform,
      pageType,
      options: rawOptions,
    } = body;

    // --- Validation ---
    if (!url || typeof url !== 'string') {
      return errorResponse('Missing or invalid field: url', 'VALIDATION_ERROR', 400, { field: 'url' }, context.requestId);
    }
    if (url.length > MAX_URL_LENGTH) {
      return errorResponse(`URL exceeds maximum length of ${MAX_URL_LENGTH} characters.`, 'VALIDATION_ERROR', 400, { field: 'url' }, context.requestId);
    }

    // Resolve site
    const resolvedSiteId = siteId || context.siteId;
    if (!resolvedSiteId) {
      return errorResponse('Missing siteId. Provide siteId in request body or use a site-scoped API key.', 'VALIDATION_ERROR', 400, { field: 'siteId' }, context.requestId);
    }

    // Verify site belongs to tenant
    const site = await prisma.site.findFirst({
      where: { id: resolvedSiteId, tenantId: context.tenantId },
    });
    if (!site) {
      return errorResponse('Site not found or access denied.', 'NOT_FOUND', 404, { siteId: resolvedSiteId }, context.requestId);
    }

    // --- Quota Limit Check ---
    const quota = await checkQuotaLimit(context.tenantId);
    if (!quota.success) {
      return errorResponse(
        `AI Credit quota limit exceeded. Current monthly usage: ${quota.used}/${quota.limit}`,
        'QUOTA_EXCEEDED',
        403,
        { used: quota.used, limit: quota.limit },
        context.requestId
      );
    }

    const scoreOptions: ScoreOptions = {
      includeNeuronWriter: rawOptions?.includeNeuronWriter ?? false,
      includePerformance: rawOptions?.includePerformance ?? false,
      includeAiVisibility: rawOptions?.includeAiVisibility ?? true,
      renderJavascript: rawOptions?.renderJavascript ?? false,
      storeSnapshot: rawOptions?.storeSnapshot ?? rawOptions?.saveSnapshot ?? true,
    };

    // --- Fetch URL ---
    const fetchResult = await fetchUrl(url);

    if (!fetchResult.ok && fetchResult.statusCode === 0) {
      // Total fetch failure (SSRF, timeout, network error)
      return errorResponse(
        `Failed to fetch URL: ${fetchResult.error}`,
        'FETCH_FAILED',
        422,
        { url, error: fetchResult.error },
        context.requestId
      );
    }

    // --- Parse HTML ---
    const normalizedUrl = normalizeUrl(fetchResult.finalUrl || url);
    const parsed = parseHtml(
      fetchResult.html,
      fetchResult.statusCode,
      fetchResult.headers,
      normalizedUrl
    );

    // --- Build Score Context ---
    const scoreContext: ScoreContext = {
      tenantId: context.tenantId,
      siteId: resolvedSiteId,
      url: fetchResult.finalUrl || url,
      normalizedUrl,
      targetKeyword: targetKeyword || undefined,
      locale: locale || site.defaultLocale,
      pageType: pageType || 'generic',
      platform: platform || site.platform,
      options: scoreOptions,
      parsed,
    };

    // --- Run Scoring Engine ---
    const engine = new ScoringEngine();
    const scoreOutput = await engine.scorePage(scoreContext, startTime);

    // --- Persist Snapshot ---
    let snapshotId: string | null = null;
    if (scoreOptions.storeSnapshot) {
      const snapshot = await prisma.scoreSnapshot.create({
        data: {
          tenantId: context.tenantId,
          siteId: resolvedSiteId,
          url: scoreContext.url!,
          normalizedUrl,
          scoreVersion: scoreOutput.scoreVersion,
          finalScore: scoreOutput.finalScore,
          scoreBand: scoreOutput.scoreBand,
          pageType: scoreContext.pageType || 'generic',
          locale: scoreContext.locale || 'en-US',
          platform: scoreContext.platform || 'custom',
          source: 'live_url',
          durationMs: scoreOutput.durationMs,
          moduleResults: {
            create: scoreOutput.modules.map((m) => ({
              tenantId: context.tenantId,
              moduleKey: m.key,
              label: m.label,
              score: m.score,
              maxScore: m.maxScore,
              status: m.status,
            })),
          },
          auditIssues: {
            create: [...scoreOutput.topIssues, ...scoreOutput.experimentalSignals].map((iss) => ({
              tenantId: context.tenantId,
              code: iss.code,
              severity: iss.severity,
              module: iss.module,
              title: iss.title,
              impact: iss.impact,
              evidenceJson: iss.evidence || {},
              recommendation: iss.recommendation,
              implementationHint: iss.implementationHint || null,
              confidence: iss.confidence,
            })),
          },
          providerEnrichments: {
            create: (scoreOutput.providerEnrichments || []).map((pe: any) => ({
              tenantId: context.tenantId,
              provider: pe.provider,
              status: pe.providerStatus,
              requestMetaJson: pe.requestMeta || {},
              responseMetaJson: pe.responseMeta || {},
              normalizedDataJson: {
                targetKeyword: pe.targetKeyword,
                contentScore: pe.contentScore,
                targetWordCount: pe.targetWordCount,
                targetReadability: pe.targetReadability,
                terms: pe.terms,
                competitorGaps: pe.competitorGaps,
                recommendedHeadings: pe.recommendedHeadings,
                confidence: pe.confidence,
              },
              durationMs: pe.durationMs,
            })),
          },
        },
      });
      snapshotId = snapshot.id;

      // Track quota
      await prisma.quotaUsage.create({
        data: {
          tenantId: context.tenantId,
          siteId: resolvedSiteId,
          endpoint: 'score/url',
          units: 1,
          date: new Date(new Date().toISOString().split('T')[0]), // Day start
        },
      });

      // Increment cached credit used in Tenant
      await incrementTenantCredits(context.tenantId);
    }

    // --- Build Response ---
    const responseData = {
      snapshotId,
      scoreVersion: scoreOutput.scoreVersion,
      url: scoreContext.url,
      normalizedUrl,
      platform: scoreContext.platform,
      pageType: scoreContext.pageType,
      locale: scoreContext.locale,
      finalScore: scoreOutput.finalScore,
      scoreBand: scoreOutput.scoreBand,
      modules: scoreOutput.modules,
      topIssues: scoreOutput.topIssues,
      quickWins: scoreOutput.quickWins,
      nextActions: scoreOutput.nextActions,
      experimentalSignals: scoreOutput.experimentalSignals,
      platformReadiness: scoreOutput.platformReadiness,
      durationMs: scoreOutput.durationMs,
      semanticAnalysis: scoreOutput.semanticAnalysis || null,
      aiVisibility: scoreOutput.aiVisibility || null,
      providerEnrichments: (scoreOutput.providerEnrichments || []).map((pe: any) => ({
        provider: pe.provider,
        sourceType: pe.sourceType,
        providerStatus: pe.providerStatus,
        targetKeyword: pe.targetKeyword,
        contentScore: pe.contentScore,
        targetWordCount: pe.targetWordCount,
        targetReadability: pe.targetReadability,
        terms: pe.terms,
        competitorGaps: pe.competitorGaps,
        recommendedHeadings: pe.recommendedHeadings,
        confidence: pe.confidence,
        durationMs: pe.durationMs,
        errorMessage: pe.errorMessage,
      })),
      createdAt: new Date().toISOString(),
    };

    return successResponse(responseData, scoreOutput.durationMs, context.requestId);
  } catch (error: any) {
    logApiError({
      requestId: context.requestId,
      tenantId: context.tenantId,
      endpoint: 'score/url',
      durationMs: Date.now() - startTime,
      errorCode: 'INTERNAL_ERROR',
      error
    });

    return errorResponse(
      'An unexpected error occurred during scoring.',
      'INTERNAL_ERROR',
      500,
      { error: error?.message },
      context.requestId
    );
  }
}

export const POST = withAuth(handler, 'score:read');
