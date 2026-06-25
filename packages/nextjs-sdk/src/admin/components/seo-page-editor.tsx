'use client';

import React, { useMemo, useState } from 'react';
import { resolvePageDescription, resolvePageTitle } from '../../free/templates';
import type { SeoSuiteConfig } from '../../free/config';
import { SerpPreview } from './serp-preview';
import { AdminCard, AdminInput } from './ui';
import { VariableInserter } from './variable-inserter';

export interface SeoPageEditorValue {
  title: string;
  description: string;
  focusKeyword?: string;
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
}

export interface SeoPageEditorProps {
  config: SeoSuiteConfig;
  pageType?: string;
  value: SeoPageEditorValue;
  onChange: (value: SeoPageEditorValue) => void;
  previewUrl?: string;
  showProReport?: boolean;
  proLocked?: boolean;
}

export function SeoPageEditor({
  config,
  pageType = 'page',
  value,
  onChange,
  previewUrl,
  showProReport = true,
  proLocked = true,
}: SeoPageEditorProps) {
  const [tab, setTab] = useState<'meta' | 'social' | 'visibility'>('meta');

  const previewTitle = useMemo(
    () =>
      resolvePageTitle(
        { pageType, title: value.title, excerpt: value.description },
        config
      ),
    [config, pageType, value.title, value.description]
  );

  const previewDescription = useMemo(
    () =>
      resolvePageDescription(
        { pageType, title: value.title, description: value.description, excerpt: value.description },
        config
      ) ?? value.description,
    [config, pageType, value.title, value.description]
  );

  const url = previewUrl ?? `${config.siteUrl}/preview`;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-gray-200">
        {(['meta', 'social', 'visibility'] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`border-b-2 px-3 py-2 text-sm capitalize ${
              tab === id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'
            }`}
          >
            {id === 'meta' ? 'Meta Tags' : id === 'social' ? 'Open Graph' : 'Visibility'}
          </button>
        ))}
        {showProReport && (
          <button
            type="button"
            disabled={proLocked}
            className="border-b-2 border-transparent px-3 py-2 text-sm text-gray-400"
            title={proLocked ? 'Requires GSEO_API_KEY + Pro plan' : 'SeoSuite Report'}
          >
            SeoSuite Report {proLocked ? '🔒' : ''}
          </button>
        )}
      </div>

      {tab === 'meta' && (
        <>
          <AdminCard title="Meta tags">
            <div className="space-y-4">
              <AdminInput
                label="SEO title"
                value={value.title}
                onChange={(title) => onChange({ ...value, title })}
              />
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Meta description</span>
                <textarea
                  value={value.description}
                  onChange={(e) => onChange({ ...value, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
              <AdminInput
                label="Focus keyword (optional)"
                value={value.focusKeyword ?? ''}
                onChange={(focusKeyword) => onChange({ ...value, focusKeyword })}
              />
              <VariableInserter
                onInsert={(token) => onChange({ ...value, title: `${value.title} ${token}`.trim() })}
              />
            </div>
          </AdminCard>
          <SerpPreview title={previewTitle} url={url} description={previewDescription} />
        </>
      )}

      {tab === 'social' && (
        <AdminCard title="Open Graph / Twitter">
          <div className="grid grid-cols-1 gap-4">
            <AdminInput
              label="OG title override"
              value={value.ogTitle ?? ''}
              onChange={(ogTitle) => onChange({ ...value, ogTitle: ogTitle || undefined })}
            />
            <AdminInput
              label="OG description override"
              value={value.ogDescription ?? ''}
              onChange={(ogDescription) => onChange({ ...value, ogDescription: ogDescription || undefined })}
            />
          </div>
        </AdminCard>
      )}

      {tab === 'visibility' && (
        <AdminCard title="Visibility">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={value.noindex ?? false}
                onChange={(e) => onChange({ ...value, noindex: e.target.checked })}
              />
              Noindex this page
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={value.nofollow ?? false}
                onChange={(e) => onChange({ ...value, nofollow: e.target.checked })}
              />
              Nofollow this page
            </label>
            <AdminInput
              label="Canonical URL override"
              value={value.canonical ?? ''}
              onChange={(canonical) => onChange({ ...value, canonical: canonical || undefined })}
            />
          </div>
        </AdminCard>
      )}
    </div>
  );
}
