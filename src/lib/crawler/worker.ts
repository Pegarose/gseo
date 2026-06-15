import { Worker } from 'bullmq';
import { getSiteCrawlQueue, SiteCrawlJobData } from './queue';
import { prisma } from '@/lib/db/prisma';
import { fetchUrl } from '@/lib/parsers/fetcher';
import { fetchUrlWithPlaywright } from '@/lib/parsers/playwright-fetcher';
import { parseHtml, normalizeUrl } from '@/lib/parsers/html-parser';
import { ScoringEngine } from '@/lib/scoring/engine';
import { ScoreContext } from '@/lib/scoring/types';
import { incrementTenantCredits } from '@/lib/auth/quota';
import { Prisma } from '@prisma/client';

export function createSiteCrawlWorker(): Worker<SiteCrawlJobData> {
  const worker = new Worker<SiteCrawlJobData>(
    'site-crawl',
    async (job) => {
      const { tenantId, siteId, startUrl, maxPages = 25, options } = job.data;
      const site = await prisma.site.findFirst({ where: { id: siteId, tenantId } });
      if (!site) {
        throw new Error(`Site not found: ${siteId}`);
      }

      const baseUrl = new URL(`https://${site.domain}`);
      const visited = new Set<string>();
      const queue: string[] = [startUrl];
      const results: { url: string; status: 'success' | 'error'; snapshotId?: string; error?: string }[] = [];

      while (queue.length > 0 && visited.size < maxPages) {
        const url = queue.shift()!;
        if (visited.has(normalizeUrl(url))) continue;
        visited.add(normalizeUrl(url));

        await job.updateProgress(Math.round((visited.size / maxPages) * 100));

        try {
          const fetchResult = options?.renderJavascript
            ? await fetchUrlWithPlaywright(url)
            : await fetchUrl(url);

          if (!fetchResult.ok) {
            results.push({ url, status: 'error', error: fetchResult.error });
            continue;
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
            locale: site.defaultLocale,
            pageType: 'generic',
            platform: site.platform,
            options: {
              includeNeuronWriter: false,
              includePerformance: false,
              includeAiVisibility: options?.includeAiVisibility ?? true,
              renderJavascript: options?.renderJavascript ?? false,
              storeSnapshot: true,
            },
            parsed,
          };

          const engine = new ScoringEngine();
          const scoreOutput = await engine.scorePage(scoreContext, Date.now());

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
              recommendations: {
                create: scoreOutput.recommendations.map((rec) => ({
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
                        (Number(scoreOutput.aiVisibility.answerability) +
                          Number(scoreOutput.aiVisibility.citationReadiness) +
                          Number(scoreOutput.aiVisibility.entityClarity) +
                          Number(scoreOutput.aiVisibility.aiParseability) +
                          Number(scoreOutput.aiVisibility.sourceTrustSignals)) /
                          5 *
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

          await prisma.quotaUsage.create({
            data: {
              tenantId,
              siteId,
              endpoint: 'site-crawl',
              units: 1,
              date: new Date(new Date().toISOString().split('T')[0]),
            },
          });

          await incrementTenantCredits(tenantId);

          results.push({ url, status: 'success', snapshotId: snapshot.id });

          // Extract new internal links from the same domain
          parsed.links.forEach((link) => {
            try {
              const resolved = new URL(link.href, normalizedUrl);
              if (resolved.hostname === baseUrl.hostname) {
                const next = resolved.toString();
                const norm = normalizeUrl(next);
                if (!visited.has(norm) && queue.length + visited.size < maxPages) {
                  queue.push(next);
                }
              }
            } catch {
              // ignore invalid links
            }
          });
        } catch (err: any) {
          results.push({ url, status: 'error', error: err.message });
        }
      }

      return {
        crawledPages: visited.size,
        results,
      };
    },
    {
      connection: { url: process.env.REDIS_URL! },
      concurrency: 2,
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`Site crawl job ${job?.id} failed:`, err);
  });

  return worker;
}
