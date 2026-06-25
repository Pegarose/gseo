'use client';

import React from 'react';
import Link from 'next/link';
import { useAdminConfig } from '../context';
import { ModuleCard } from '../components/module-card';
import { AdminCard } from '../components/ui';
import { getClientProAvailability } from '../../paid/pro-gate';

export function SeoAdminModules() {
  const { config, persist, basePath } = useAdminConfig();
  const pro = getClientProAvailability();

  function updateModules(patch: Partial<typeof config.modules>) {
    persist?.update({ modules: { ...config.modules, ...patch } });
  }

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Modules</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enable RankMath-style SEO modules for this site. Pro modules stay visible but locked without API key.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ModuleCard
          title="Breadcrumbs"
          description="Output BreadcrumbList JSON-LD on pages with trail data."
          enabled={config.modules.breadcrumbs.enabled}
          onToggle={(enabled) =>
            updateModules({ breadcrumbs: { ...config.modules.breadcrumbs, enabled } })
          }
        />
        <ModuleCard
          title="Image SEO"
          description="Auto alt/title attribute patterns for media."
          enabled={config.modules.imageSeo.enabled}
          href={`${basePath}/general`}
          onToggle={(enabled) =>
            updateModules({ imageSeo: { ...config.modules.imageSeo, enabled } })
          }
        />
        <ModuleCard
          title="Link Counter"
          description="Lite internal/external link counts for sample pages."
          enabled={config.modules.linkCounter.enabled}
          href={`${basePath}/analysis`}
          onToggle={(enabled) =>
            updateModules({ linkCounter: { ...config.modules.linkCounter, enabled } })
          }
        />
        <ModuleCard
          title="404 Monitor"
          description="Log 404 hits to .seosuite/404-log.json via middleware hook."
          enabled={config.modules.monitor404.enabled}
          href={`${basePath}/tools`}
          onToggle={(enabled) =>
            updateModules({ monitor404: { ...config.modules.monitor404, enabled } })
          }
        />
        <ModuleCard
          title="Instant Indexing"
          description="Submit URLs via IndexNow (Bing/Yandex)."
          enabled={config.modules.instantIndexing.enabled}
          href={`${basePath}/indexing`}
          onToggle={(enabled) =>
            updateModules({ instantIndexing: { ...config.modules.instantIndexing, enabled } })
          }
        />
        <ModuleCard
          title="llms.txt"
          description="Serve /llms.txt for AI crawlers."
          enabled={config.modules.llmsTxt.enabled}
          href={`${basePath}/tools`}
          onToggle={(enabled) =>
            updateModules({ llmsTxt: { ...config.modules.llmsTxt, enabled } })
          }
        />
        <ModuleCard
          title="Content AI"
          description="AI meta/title suggestions in the page editor."
          tier="pro"
          locked={!pro.available}
        />
        <ModuleCard
          title="SeoSuite Report"
          description="Live content scoring via GSeoSuite Cloud API."
          tier="pro"
          locked={!pro.available}
          href="/editor"
        />
      </div>

      <AdminCard title="Core runtime (always on)">
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600">
          <li>Metadata & title templates</li>
          <li>JSON-LD (27+ types via next-seo vendor)</li>
          <li>
            <Link href="/sitemap.xml" className="text-indigo-600 hover:underline">
              /sitemap.xml
            </Link>
          </li>
          <li>
            <Link href="/robots.txt" className="text-indigo-600 hover:underline">
              /robots.txt
            </Link>
          </li>
          <li>Redirect middleware</li>
        </ul>
      </AdminCard>
    </>
  );
}
