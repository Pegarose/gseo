import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { fetchUrl } from '@/lib/parsers/fetcher';
import { fetchUrlWithPlaywright } from '@/lib/parsers/playwright-fetcher';
import { parseHtml, normalizeUrl } from '@/lib/parsers/html-parser';
import { ScoringEngine } from '@/lib/scoring/engine';
import { ScoreContext, ScoreOptions, Recommendation } from '@/lib/scoring/types';
import { assertTenantHasCredits, chargeTenantCredits } from '@/lib/credits/charge';

const MAX_URL_LENGTH = 2048;
const MAX_PAGE_HTML_BYTES = 512 * 1024;

export interface UrlScoreInput {
  tenantId: string;
  siteId: string;
  url: string;
  targetKeyword?: string;
  locale?: string;
  platform?: string;
  pageType?: string;
  options?: {
    includeNeuronWriter?: boolean;
    includePerformance?: boolean;
    includeAiVisibility?: boolean;
    renderJavascript?: boolean;
    storeSnapshot?: boolean;
    saveSnapshot?: boolean;
  };
}

export async function runUrlScore(input: UrlScoreInput, startTime = Date.now()) {
  const { tenantId, siteId, url, targetKeyword, locale, platform, pageType, options: rawOptions } =
    input;

  if (!url || typeof url !== 'string') {
    throw new Error('Missing or invalid field: url');
  }
  if (url.length > MAX_URL_LENGTH) {
    throw new Error(`URL exceeds maximum length of ${MAX_URL_LENGTH} characters.`);
  }

  const site = await prisma.site.findFirst({ where: { id: siteId, tenantId } });
  if (!site) {
    throw new Error('Site not found or access denied.');
  }

  await assertTenantHasCredits(tenantId, 'score.url');

  const scoreOptions: ScoreOptions = {
    includeNeuronWriter: rawOptions?.includeNeuronWriter ?? false,
    includePerformance: rawOptions?.includePerformance ?? false,
    includeAiVisibility: rawOptions?.includeAiVisibility ?? true,
    renderJavascript: rawOptions?.renderJavascript ?? false,
    storeSnapshot: rawOptions?.storeSnapshot ?? rawOptions?.saveSnapshot ?? true,
  };

  const storeSnapshotAllowed = scoreOptions.storeSnapshot;

  const fetchResult = scoreOptions.renderJavascript
    ? await fetchUrlWithPlaywright(url)
    : await fetchUrl(url);

  if (!fetchResult.ok && fetchResult.statusCode === 0) {
    throw new Error(`Failed to fetch URL: ${fetchResult.error ?? 'network error'}`);
  }

  const normalizedUrl = normalizeUrl(fetchResult.finalUrl || url);
  const parsed = parseHtml(
    fetchResult.html,
    fetchResult.statusCode,
    fetchResult.headers,
    normalizedUrl
  );

  const scoreContext: ScoreContext = {
    tenantId,
    siteId,
    url: fetchResult.finalUrl || url,
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
    featureKey: 'score.url',
    endpoint: 'score/url',
  });

  const pageHtml =
    fetchResult.html.length > MAX_PAGE_HTML_BYTES
      ? fetchResult.html.slice(0, MAX_PAGE_HTML_BYTES)
      : fetchResult.html;

  return {
    snapshotId,
    sourceType: 'live_url',
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
    durationMs: scoreOutput.durationMs,
    createdAt: new Date().toISOString(),
    pageHtml,
    pageTitle: parsed.title ?? null,
    metaDescription: parsed.metaDescription ?? null,
    fetchStatusCode: fetchResult.statusCode,
    creditsCharged: creditCharge.charged,
  };
}
