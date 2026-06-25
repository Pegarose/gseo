'use client';

import React, { useState } from 'react';
import { useAdminConfig } from '../context';
import { AdminCard, AdminField, AdminInput } from '../components/ui';

export function SeoAdminSitemap() {
  const { config, persist } = useAdminConfig();
  const [excludeInput, setExcludeInput] = useState('');

  function addExclude() {
    if (!excludeInput.trim()) return;
    persist?.update({
      sitemap: {
        ...config.sitemap,
        exclude: [...config.sitemap.exclude, excludeInput.trim()],
      },
    });
    setExcludeInput('');
  }

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sitemap</h1>
        <p className="mt-1 text-sm text-gray-500">Sitemap generation rules and live route preview.</p>
      </div>

      <AdminCard
        title="Live sitemap"
        action={
          <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Open /sitemap.xml →
          </a>
        }
      >
        <p className="text-sm text-gray-600">
          Generated via <code className="rounded bg-gray-100 px-1 text-xs">createSitemapRoute()</code> in{' '}
          <code className="rounded bg-gray-100 px-1 text-xs">app/sitemap.ts</code>.
        </p>
      </AdminCard>

      <AdminCard title="Generation rules">
        {persist ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Default change frequency</span>
              <select
                value={config.sitemap.changefreq ?? ''}
                onChange={(e) =>
                  persist.update({
                    sitemap: { ...config.sitemap, changefreq: (e.target.value || undefined) as typeof config.sitemap.changefreq },
                  })
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Not set</option>
                {['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'].map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </label>
            <AdminInput
              label="Default priority (0-1)"
              value={config.sitemap.priority?.toString() ?? ''}
              onChange={(v) =>
                persist.update({
                  sitemap: { ...config.sitemap, priority: v ? Number(v) : undefined },
                })
              }
            />
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={config.sitemap.includeImages}
                onChange={(e) => persist.update({ sitemap: { ...config.sitemap, includeImages: e.target.checked } })}
              />
              Include images in sitemap
            </label>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={config.sitemap.trailingSlash}
                onChange={(e) => persist.update({ sitemap: { ...config.sitemap, trailingSlash: e.target.checked } })}
              />
              Trailing slash URLs
            </label>
          </div>
        ) : (
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <AdminField label="Default change frequency" value={config.sitemap.changefreq ?? 'Not set'} />
            <AdminField label="Include images" value={config.sitemap.includeImages ? 'Yes' : 'No'} />
          </dl>
        )}
      </AdminCard>

      <AdminCard title="Excluded patterns">
        <div className="mb-4 flex gap-2">
          <AdminInput label="Add exclude pattern" value={excludeInput} onChange={setExcludeInput} placeholder="/admin/*" />
          {persist && (
            <div className="flex items-end">
              <button type="button" onClick={addExclude} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white">
                Add
              </button>
            </div>
          )}
        </div>
        {config.sitemap.exclude.length ? (
          <ul className="space-y-2 font-mono text-sm">
            {config.sitemap.exclude.map((pattern) => (
              <li key={pattern} className="flex justify-between gap-2">
                <span>{pattern}</span>
                {persist && (
                  <button
                    type="button"
                    className="text-red-600"
                    onClick={() =>
                      persist.update({
                        sitemap: {
                          ...config.sitemap,
                          exclude: config.sitemap.exclude.filter((p) => p !== pattern),
                        },
                      })
                    }
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No exclude patterns configured.</p>
        )}
      </AdminCard>
    </>
  );
}
