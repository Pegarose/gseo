'use client';

import React, { useMemo } from 'react';
import { useAdminConfig } from '../context';
import { runSeoAnalysis, seoAnalysisScore } from '../../free/seo-analysis';
import type { SeoSuiteConfig } from '../../free/config';
import { AdminBadge, AdminCard, AdminStat } from '../components/ui';

function toConfig(snapshot: ReturnType<typeof useAdminConfig>['config']): SeoSuiteConfig {
  return snapshot as unknown as SeoSuiteConfig;
}

export function SeoAdminAnalysis() {
  const { config: snapshot } = useAdminConfig();
  const config = toConfig(snapshot);

  const checks = useMemo(
    () =>
      runSeoAnalysis({
        config,
        samplePages: [
          { url: `${config.siteUrl}/`, title: config.defaultTitle, description: config.defaultDescription },
          { url: `${config.siteUrl}/blog/seo-tips`, title: 'Sample post', description: 'Sample excerpt' },
        ],
      }),
    [config]
  );

  const score = seoAnalysisScore(checks);

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SEO Analysis</h1>
        <p className="mt-1 text-sm text-gray-500">
          Local technical checklist (cloud-free). Does not replace rank tracking or Search Console.
        </p>
      </div>

      <AdminStat label="Technical SEO score" value={`${score}/100`} hint="Based on configured checks" />

      <AdminCard title="Checklist">
        <ul className="space-y-3">
          {checks.map((check) => (
            <li key={check.id} className="flex items-start justify-between gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-800">{check.label}</p>
                {check.hint && <p className="text-xs text-gray-500">{check.hint}</p>}
              </div>
              <AdminBadge tone={check.pass ? 'success' : 'warning'}>{check.pass ? 'Pass' : 'Fix'}</AdminBadge>
            </li>
          ))}
        </ul>
      </AdminCard>

      {config.modules.linkCounter.enabled && (
        <AdminCard title="Link Counter (lite)" description="Enable full crawl in CI or use CMS export">
          <p className="text-sm text-gray-600">
            Use <code className="rounded bg-gray-100 px-1">scanPagesForLinks()</code> from{' '}
            <code className="rounded bg-gray-100 px-1">@seosuite/next</code> with HTML snapshots of your routes.
          </p>
        </AdminCard>
      )}
    </>
  );
}
