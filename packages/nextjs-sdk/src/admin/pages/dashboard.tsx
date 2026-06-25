'use client';

import React from 'react';
import Link from 'next/link';
import { useAdminConfig } from '../context';
import { getAdminNavItems } from '../nav';
import { AdminBadge, AdminCard, AdminStat } from '../components/ui';

export function SeoAdminDashboard() {
  const { config, basePath } = useAdminConfig();
  const navItems = getAdminNavItems(basePath).filter((item) => item.href !== basePath);

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SEO Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Site-side SEO status for {config.siteName}. Cloud analytics and rank tracking ship in Faz 2.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStat label="Site URL" value={new URL(config.siteUrl).hostname} hint={config.siteUrl} />
        <AdminStat
          label="Redirects"
          value={config.redirects.length}
          hint={config.redirectsPath ? `File: ${config.redirectsPath}` : 'Inline rules'}
        />
        <AdminStat
          label="Sitemap excludes"
          value={config.sitemap.exclude.length}
          hint="Patterns excluded from sitemap"
        />
        <AdminStat
          label="Schema types"
          value={config.schema.organization ? 'Org + site' : 'Defaults'}
          hint="Configured in seosuite.config.ts"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AdminCard title="Runtime modules" description="Free tier features active on this site">
          <ul className="space-y-3">
            {[
              ['Metadata & templates', 'Active'],
              ['JSON-LD schema', config.schema.organization ? 'Organization configured' : 'Global defaults'],
              ['Sitemap', '/sitemap.xml'],
              ['Robots', '/robots.txt'],
              ['Redirects', `${config.redirects.length} rules`],
            ].map(([label, status]) => (
              <li key={label} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{label}</span>
                <AdminBadge tone="success">{status}</AdminBadge>
              </li>
            ))}
          </ul>
        </AdminCard>

        <AdminCard title="Pro features" description="Require GSeoSuite Cloud API key">
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-center justify-between">
              <span>Live content scoring</span>
              <Link href="/editor" className="text-indigo-600 hover:underline">
                Editor demo →
              </Link>
            </li>
            <li className="flex items-center justify-between">
              <span>Content AI suggestions</span>
              <AdminBadge tone="info">Pro — locked without API key</AdminBadge>
            </li>
            <li className="flex items-center justify-between">
              <span>Module toggles</span>
              <Link href={`${basePath}/modules`} className="text-indigo-600 hover:underline">
                Modules hub →
              </Link>
            </li>
          </ul>
        </AdminCard>
      </div>

      <AdminCard title="Quick settings" description="Jump to common configuration screens">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50/30"
            >
              <p className="font-medium text-gray-900">{item.label}</p>
              <p className="mt-1 text-sm text-gray-500">{item.description}</p>
            </Link>
          ))}
        </div>
      </AdminCard>
    </>
  );
}
