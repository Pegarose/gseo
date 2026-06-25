import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { withAuth, AuthenticatedContext } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/response';
import { prisma } from '@/lib/db/prisma';
import { parseHtml, normalizeUrl } from '@/lib/parsers/html-parser';
import { ScoringEngine } from '@/lib/scoring/engine';
import { ScoreContext, ScoreOptions, Recommendation } from '@/lib/scoring/types';
import { checkRateLimit } from '@/lib/rate-limit';
import { createRateLimitResponse } from '@/lib/utils/rate-limit';
import { logApiError } from '@/lib/utils/logger';
import {
  assertTenantHasCredits,
  chargeTenantCredits,
  InsufficientCreditsError,
} from '@/lib/credits/charge';
import { computeContentHash, findCachedContentSnapshot } from '@/lib/credits/content-cache';

const MAX_CONTENT_SIZE = 2 * 1024 * 1024; // 2 MB

async function handler(req: NextRequest, context: AuthenticatedContext) {
  const startTime = Date.now();
  
  // Rate Limit Check (120 req / hour)
  const rl = await checkRateLimit(context.tenantId, 'score/content', 120, req.headers.get('x-forwarded-for') || 'unknown');
  if (!rl.success) {
    return createRateLimitResponse(rl.info, context.requestId);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      siteId,
      url,
      html,
      contentId,
      title: providedTitle,
      metaDescription: providedDescription,
      targetKeyword,
      locale,
      platform,
      pageType,
      options: rawOptions,
      contentHash: clientContentHash,
    } = body;

    // --- Validation ---
    if (!html || typeof html !== 'string') {
      return errorResponse('Missing or invalid field: html', 'VALIDATION_ERROR', 400, { field: 'html' }, context.requestId);
    }

    // Size limit
    const contentBytes = new TextEncoder().encode(html).length;
    if (contentBytes > MAX_CONTENT_SIZE) {
      return errorResponse(
        `Content payload exceeds maximum size of ${MAX_CONTENT_SIZE / 1024 / 1024}MB.`,
        'VALIDATION_ERROR',
        400,
        { field: 'html', maxBytes: MAX_CONTENT_SIZE, receivedBytes: contentBytes },
        context.requestId
      );
    }

    // Resolve site
    const resolvedSiteId = siteId || context.siteId;
    if (!resolvedSiteId) {
      return errorResponse('Missing siteId.', 'VALIDATION_ERROR', 400, { field: 'siteId' }, context.requestId);
    }

    const site = await prisma.site.findFirst({
      where: { id: resolvedSiteId, tenantId: context.tenantId },
    });
    if (!site) {
      return errorResponse('Site not found or access denied.', 'NOT_FOUND', 404, { siteId: resolvedSiteId }, context.requestId);
    }

    const scoreOptions: ScoreOptions = {
      includeNeuronWriter: rawOptions?.includeNeuronWriter ?? false,
      includePerformance: rawOptions?.includePerformance ?? false,
      includeAiVisibility: rawOptions?.includeAiVisibility ?? true,
      renderJavascript: false,
      storeSnapshot: rawOptions?.storeSnapshot ?? rawOptions?.saveSnapshot ?? true,
    };

    // AI scoring always consumes credits, even if the caller asks not to persist the snapshot.
    const storeSnapshotAllowed = scoreOptions.storeSnapshot;

    const draftUrl = url || `https://${site.domain}/draft/${contentId || 'untitled'}`;
    const normalizedUrl = normalizeUrl(draftUrl);
    const contentHash =
      typeof clientContentHash === 'string' && clientContentHash.length > 0
        ? clientContentHash
        : computeContentHash(html, targetKeyword, locale || site.defaultLocale);

    const cachedSnapshotId = await findCachedContentSnapshot(
      context.tenantId,
      resolvedSiteId,
      contentHash
    );

    if (cachedSnapshotId) {
      const cached = await prisma.scoreSnapshot.findFirst({
        where: {
          id: cachedSnapshotId,
          tenantId: context.tenantId,
          siteId: resolvedSiteId,
        },
        include: {
          moduleResults: true,
          auditIssues: true,
          recommendations: true,
          providerEnrichments: true,
          aiVisibilityCheck: true,
        },
      });

      if (cached) {
        const creditCharge = await chargeTenantCredits({
          tenantId: context.tenantId,
          siteId: resolvedSiteId,
          featureKey: 'score.content',
          endpoint: 'score/content',
          cached: true,
          metadata: { contentHash, snapshotId: cached.id },
        });

        const topIssues = cached.auditIssues
          .filter((i) => i.severity !== 'info')
          .slice(0, 10)
          .map((iss) => ({
            code: iss.code,
            severity: iss.severity,
            module: iss.module,
            title: iss.title,
            impact: iss.impact,
            recommendation: iss.recommendation,
            confidence: iss.confidence,
          }));

        return successResponse(
          {
            snapshotId: cached.id,
            sourceType: 'draft_content',
            scoreVersion: cached.scoreVersion,
            url: cached.url,
            normalizedUrl: cached.normalizedUrl,
            finalScore: cached.finalScore,
            scoreBand: cached.scoreBand,
            topIssues,
            quickWins: cached.recommendations.map((r) => ({
              code: r.code,
              title: r.title,
              severity: r.severity,
              recommendation: r.recommendation,
              estimatedEffort: r.estimatedEffort,
              estimatedImpact: r.estimatedImpact,
            })),
            providerEnrichments: cached.providerEnrichments,
            cached: true,
            creditsCharged: creditCharge.charged,
            creditBalance: creditCharge.balance,
          },
          Date.now() - startTime,
          context.requestId
        );
      }
    }

    // For draft content, we simulate a 200 status since the content is provided directly
    const parsed = parseHtml(html, 200, {}, normalizedUrl);

    // Override title/description if explicitly provided in request body
    if (providedTitle) {
      parsed.title = providedTitle;
    }
    if (providedDescription) {
      parsed.metaDescription = providedDescription;
    }

    // --- Build Score Context ---
    const scoreContext: ScoreContext = {
      tenantId: context.tenantId,
      siteId: resolvedSiteId,
      url: draftUrl,
      normalizedUrl,
      targetKeyword: targetKeyword || undefined,
      locale: locale || site.defaultLocale,
      pageType: pageType || 'generic',
      platform: platform || site.platform,
      options: scoreOptions,
      parsed,
    };

    // --- Run Scoring Engine ---
    await assertTenantHasCredits(context.tenantId, 'score.content');
    const engine = new ScoringEngine();
    const scoreOutput = await engine.scorePage(scoreContext, startTime);

    // --- Persist Snapshot ---
    let snapshotId: string | null = null;
    if (storeSnapshotAllowed) {
      const snapshot = await prisma.scoreSnapshot.create({
        data: {
          tenantId: context.tenantId,
          siteId: resolvedSiteId,
          url: draftUrl,
          normalizedUrl,
          scoreVersion: scoreOutput.scoreVersion,
          finalScore: scoreOutput.finalScore,
          scoreBand: scoreOutput.scoreBand,
          pageType: scoreContext.pageType || 'generic',
          locale: scoreContext.locale || 'en-US',
          platform: scoreContext.platform || 'custom',
          source: 'draft_content',
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
            create: (scoreOutput.providerEnrichments || []).map((pe) => ({
              tenantId: context.tenantId,
              provider: String(pe.provider),
              status: String(pe.providerStatus),
              requestMetaJson: pe.requestMeta as Prisma.InputJsonValue,
              responseMetaJson: pe.responseMeta as Prisma.InputJsonValue,
              normalizedDataJson: {
                targetKeyword: pe.targetKeyword,
                contentScore: pe.contentScore,
                targetWordCount: pe.targetWordCount,
                targetReadability: pe.targetReadability,
                terms: pe.terms,
                competitorGaps: pe.competitorGaps,
                recommendedHeadings: pe.recommendedHeadings,
                confidence: pe.confidence,
              } as unknown as Prisma.InputJsonValue,
              durationMs: Number(pe.durationMs),
            })),
          },
          recommendations: {
            create: scoreOutput.recommendations.map((rec: Recommendation) => ({
              tenantId: context.tenantId,
              code: rec.code,
              title: rec.title,
              module: rec.module,
              severity: rec.severity,
              recommendation: rec.recommendation,
              implementationHint: rec.implementationHint || null,
              estimatedEffort: rec.estimatedEffort,
              estimatedImpact: rec.estimatedImpact,
              confidence: rec.confidence,
            })),
          },
          aiVisibilityCheck: scoreOutput.aiVisibility
            ? {
                create: {
                  tenantId: context.tenantId,
                  aiVisibilityReadinessScore: Math.round(
                    ((Number(scoreOutput.aiVisibility.answerability) +
                      Number(scoreOutput.aiVisibility.citationReadiness) +
                      Number(scoreOutput.aiVisibility.entityClarity) +
                      Number(scoreOutput.aiVisibility.aiParseability) +
                      Number(scoreOutput.aiVisibility.sourceTrustSignals)) /
                      5) *
                      100
                  ),
                  answerability: Number(scoreOutput.aiVisibility.answerability),
                  citationReadiness: Number(scoreOutput.aiVisibility.citationReadiness),
                  entityClarity: Number(scoreOutput.aiVisibility.entityClarity),
                  aiParseability: Number(scoreOutput.aiVisibility.aiParseability),
                  brandTrustSignals: Number(scoreOutput.aiVisibility.sourceTrustSignals),
                  platformReadinessJson: scoreOutput.aiVisibility.platformReadiness || {},
                },
              }
            : undefined,
        },
      });
      snapshotId = snapshot.id;
    }

    const creditCharge = await chargeTenantCredits({
      tenantId: context.tenantId,
      siteId: resolvedSiteId,
      featureKey: 'score.content',
      endpoint: 'score/content',
      metadata: { contentHash, snapshotId: snapshotId ?? undefined, siteId: resolvedSiteId },
    });

    // --- Build Response ---
    const responseData = {
      snapshotId,
      sourceType: 'draft_content',
      scoreVersion: scoreOutput.scoreVersion,
      url: draftUrl,
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
      providerEnrichments: (scoreOutput.providerEnrichments || []).map((pe) => ({
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
      creditsCharged: creditCharge.charged,
      creditBalance: creditCharge.balance,
    };

    return successResponse(responseData, scoreOutput.durationMs, context.requestId);
  } catch (error) {
    if (error instanceof InsufficientCreditsError) {
      return errorResponse(error.message, 'QUOTA_EXCEEDED', 429, {
        used: error.used,
        limit: error.limit,
        required: error.required,
      }, context.requestId);
    }
    logApiError({
      requestId: context.requestId,
      tenantId: context.tenantId,
      endpoint: 'score/content',
      durationMs: Date.now() - startTime,
      errorCode: 'INTERNAL_ERROR',
      error
    });
    
    return errorResponse(
      'An unexpected error occurred during content scoring.',
      'INTERNAL_ERROR',
      500,
      { error: error instanceof Error ? error.message : 'Unknown error' },
      context.requestId
    );
  }
}

export const POST = withAuth(handler, 'score:read');
