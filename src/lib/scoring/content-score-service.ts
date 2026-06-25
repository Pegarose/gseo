import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { parseHtml, normalizeUrl } from '@/lib/parsers/html-parser';
import { ScoringEngine } from '@/lib/scoring/engine';
import { ScoreContext, ScoreOptions, Recommendation } from '@/lib/scoring/types';
import { assertTenantHasCredits, chargeTenantCredits } from '@/lib/credits/charge';

const MAX_CONTENT_SIZE = 2 * 1024 * 1024;

export interface ContentScoreInput {
  tenantId: string;
  siteId: string;
  url?: string;
  html: string;
  contentId?: string;
  title?: string;
  metaDescription?: string;
  targetKeyword?: string;
  locale?: string;
  platform?: string;
  pageType?: string;
  options?: {
    includeNeuronWriter?: boolean;
    includePerformance?: boolean;
    includeAiVisibility?: boolean;
    storeSnapshot?: boolean;
    saveSnapshot?: boolean;
  };
}

export async function runContentScore(input: ContentScoreInput, startTime = Date.now()) {
  const {
    tenantId,
    siteId,
    html,
    url,
    contentId,
    title: providedTitle,
    metaDescription: providedDescription,
    targetKeyword,
    locale,
    platform,
    pageType,
    options: rawOptions,
  } = input;

  if (!html || typeof html !== 'string') {
    throw new Error('Missing or invalid field: html');
  }

  const contentBytes = new TextEncoder().encode(html).length;
  if (contentBytes > MAX_CONTENT_SIZE) {
    throw new Error(`Content payload exceeds maximum size of ${MAX_CONTENT_SIZE / 1024 / 1024}MB.`);
  }

  const site = await prisma.site.findFirst({
    where: { id: siteId, tenantId },
  });
  if (!site) {
    throw new Error('Site not found or access denied.');
  }

  await assertTenantHasCredits(tenantId, 'score.content');

  const scoreOptions: ScoreOptions = {
    includeNeuronWriter: rawOptions?.includeNeuronWriter ?? false,
    includePerformance: rawOptions?.includePerformance ?? false,
    includeAiVisibility: rawOptions?.includeAiVisibility ?? true,
    renderJavascript: false,
    storeSnapshot: rawOptions?.storeSnapshot ?? rawOptions?.saveSnapshot ?? true,
  };

  const storeSnapshotAllowed = scoreOptions.storeSnapshot;
  const draftUrl = url || `https://${site.domain}/draft/${contentId || 'untitled'}`;
  const normalizedUrl = normalizeUrl(draftUrl);
  const parsed = parseHtml(html, 200, {}, normalizedUrl);

  if (providedTitle) parsed.title = providedTitle;
  if (providedDescription) parsed.metaDescription = providedDescription;

  const scoreContext: ScoreContext = {
    tenantId,
    siteId,
    url: draftUrl,
    normalizedUrl,
    targetKeyword: targetKeyword || undefined,
    locale: locale || site.defaultLocale,
    pageType: pageType || 'generic',
    platform: platform || site.platform,
    options: scoreOptions,
    parsed,
  };

  const engine = new ScoringEngine();
  const scoreOutput = await engine.scorePage(scoreContext, startTime);

  let snapshotId: string | null = null;
  if (storeSnapshotAllowed) {
    const snapshot = await prisma.scoreSnapshot.create({
      data: {
        tenantId,
        siteId,
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
            tenantId,
            moduleKey: m.key,
            label: m.label,
            score: m.score,
            maxScore: m.maxScore,
            status: m.status,
          })),
        },
        auditIssues: {
          create: [...scoreOutput.topIssues, ...scoreOutput.experimentalSignals].map((iss) => ({
            tenantId,
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
            tenantId,
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
            tenantId,
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
                tenantId,
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
    tenantId,
    siteId,
    featureKey: 'score.content',
    endpoint: 'score/content',
  });

  return {
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
    durationMs: scoreOutput.durationMs,
    createdAt: new Date().toISOString(),
    creditsCharged: creditCharge.charged,
  };
}
