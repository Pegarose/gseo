'use client';

import React, { useMemo, useState } from 'react';
import { applyTemplate, resolvePageDescription, resolvePageTitle } from '../../free/templates';
import type { SeoSuiteConfig } from '../../free/config';
import { useAdminConfig } from '../context';
import { AdminCard, AdminInput } from '../components/ui';
import { SerpPreview } from '../components/serp-preview';
import { SettingsLayout } from '../components/settings-layout';
import { VariableInserter } from '../components/variable-inserter';

const SAMPLE = {
  title: '10 SEO Tips for Next.js',
  excerpt: 'Practical patterns for headless sites.',
  date: '2026-06-15',
  category: 'SEO',
  author: 'Editor',
  page: 'Home',
};

function toSeoConfig(snapshot: ReturnType<typeof useAdminConfig>['config']): SeoSuiteConfig {
  return snapshot as unknown as SeoSuiteConfig;
}

export function SeoAdminTitlesMeta() {
  const { config: snapshot, persist } = useAdminConfig();
  const config = toSeoConfig(snapshot);
  const editable = Boolean(persist);

  const [sample, setSample] = useState(SAMPLE);
  const [pageType, setPageType] = useState<string>('article');

  const previewTitle = useMemo(
    () =>
      resolvePageTitle(
        { pageType, title: sample.title, excerpt: sample.excerpt, date: sample.date, category: sample.category, author: sample.author, page: sample.page },
        config
      ),
    [config, pageType, sample]
  );

  const previewDescription = useMemo(
    () =>
      resolvePageDescription(
        { pageType, title: sample.title, excerpt: sample.excerpt, description: sample.excerpt },
        config
      ) ?? '—',
    [config, pageType, sample]
  );

  const globalTab = (
    <AdminCard title="Global meta templates">
      {editable ? (
        <div className="space-y-4">
          <AdminInput
            label="Default title template"
            value={snapshot.titleTemplate}
            onChange={(titleTemplate) => persist?.update({ titleTemplate })}
          />
          <VariableInserter
            onInsert={(token) => persist?.update({ titleTemplate: `${snapshot.titleTemplate} ${token}`.trim() })}
          />
          <AdminInput
            label="Article title template"
            value={snapshot.titleTemplates?.article ?? ''}
            onChange={(value) =>
              persist?.update({
                titleTemplates: { ...(snapshot.titleTemplates ?? {}), article: value },
              })
            }
          />
          <AdminInput
            label="Page title template"
            value={snapshot.titleTemplates?.page ?? ''}
            onChange={(value) =>
              persist?.update({
                titleTemplates: { ...(snapshot.titleTemplates ?? {}), page: value },
              })
            }
          />
        </div>
      ) : (
        <p className="font-mono text-sm text-gray-700">{snapshot.titleTemplate}</p>
      )}
    </AdminCard>
  );

  const homepageTab = (
    <AdminCard title="Homepage overrides">
      {editable ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AdminInput
            label="Homepage title template"
            value={snapshot.homepage?.title ?? ''}
            onChange={(title) =>
              persist?.update({ homepage: { ...snapshot.homepage, title: title || undefined } })
            }
          />
          <AdminInput
            label="Homepage description template"
            value={snapshot.homepage?.description ?? ''}
            onChange={(description) =>
              persist?.update({ homepage: { ...snapshot.homepage, description: description || undefined } })
            }
          />
        </div>
      ) : (
        <p className="text-sm text-gray-600">{snapshot.homepage?.title ?? '—'}</p>
      )}
    </AdminCard>
  );

  const previewTab = (
    <AdminCard title="Live SERP preview">
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-gray-700">Page type</span>
          <select
            value={pageType}
            onChange={(e) => setPageType(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="default">default</option>
            <option value="homepage">homepage</option>
            <option value="article">article</option>
            <option value="page">page</option>
          </select>
        </label>
        <AdminInput label="Sample title" value={sample.title} onChange={(v) => setSample({ ...sample, title: v })} />
        <AdminInput label="Sample excerpt" value={sample.excerpt} onChange={(v) => setSample({ ...sample, excerpt: v })} />
      </div>
      <SerpPreview title={previewTitle} url={`${snapshot.siteUrl}/example`} description={previewDescription} />
      <p className="mt-4 font-mono text-xs text-gray-600">
        Raw: {applyTemplate(snapshot.titleTemplates?.[pageType] ?? snapshot.titleTemplate, { ...sample, sitename: snapshot.siteName, sep: snapshot.separator })}
      </p>
    </AdminCard>
  );

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Titles & Meta</h1>
        <p className="mt-1 text-sm text-gray-500">Template editor with live SERP preview.</p>
      </div>
      <SettingsLayout
        tabs={[
          { id: 'global', label: 'Global Meta', content: globalTab },
          { id: 'homepage', label: 'Homepage', content: homepageTab },
          { id: 'preview', label: 'SERP Preview', content: previewTab },
        ]}
      />
    </>
  );
}
