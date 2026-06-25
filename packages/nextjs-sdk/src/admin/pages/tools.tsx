'use client';

import React, { useState } from 'react';
import { useAdminConfig } from '../context';
import { AdminButton, AdminCard, AdminInput } from '../components/ui';

export function SeoAdminTools() {
  const { config, persist } = useAdminConfig();
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  function exportSettings() {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'seosuite-settings-export.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function importSettings() {
    try {
      const parsed = JSON.parse(importText) as Partial<typeof config>;
      persist?.update(parsed);
      setMessage('Imported into form — click Save changes to persist.');
    } catch {
      setMessage('Invalid JSON');
    }
  }

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Status & Tools</h1>
        <p className="mt-1 text-sm text-gray-500">Import/export settings and edit advanced files.</p>
      </div>

      <AdminCard title="System status">
        <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase text-gray-500">Site</dt>
            <dd className="mt-1 font-mono text-gray-800">{config.siteUrl}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-gray-500">Redirects</dt>
            <dd className="mt-1 text-gray-800">{config.redirects.length} rules</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-gray-500">404 monitor</dt>
            <dd className="mt-1 text-gray-800">{config.modules.monitor404.enabled ? 'Enabled' : 'Disabled'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-gray-500">llms.txt</dt>
            <dd className="mt-1 text-gray-800">{config.modules.llmsTxt.enabled ? 'Enabled' : 'Disabled'}</dd>
          </div>
        </dl>
      </AdminCard>

      <AdminCard
        title="Import / Export"
        action={<AdminButton variant="secondary" onClick={exportSettings}>Export JSON</AdminButton>}
      >
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          rows={8}
          placeholder="Paste exported settings JSON here"
          className="w-full rounded-lg border border-gray-300 p-3 font-mono text-xs"
        />
        <div className="mt-3 flex items-center gap-3">
          <AdminButton onClick={importSettings} disabled={!persist}>Import to form</AdminButton>
          {message && <span className="text-sm text-gray-600">{message}</span>}
        </div>
      </AdminCard>

      <AdminCard title="robots.txt override">
        <textarea
          value={config.robotsTxt ?? ''}
          onChange={(e) => persist?.update({ robotsTxt: e.target.value })}
          rows={8}
          placeholder="Optional custom robots.txt body (advanced)"
          className="w-full rounded-lg border border-gray-300 p-3 font-mono text-xs"
          disabled={!persist}
        />
      </AdminCard>

      <AdminCard title="llms.txt content">
        <textarea
          value={config.modules.llmsTxt.content}
          onChange={(e) =>
            persist?.update({
              modules: {
                ...config.modules,
                llmsTxt: { ...config.modules.llmsTxt, content: e.target.value },
              },
            })
          }
          rows={8}
          className="w-full rounded-lg border border-gray-300 p-3 font-mono text-xs"
          disabled={!persist}
        />
        <p className="mt-2 text-xs text-gray-500">
          Expose via <code className="rounded bg-gray-100 px-1">createLlmsTxtRoute()</code> at{' '}
          <code className="rounded bg-gray-100 px-1">/llms.txt</code>
        </p>
      </AdminCard>

      <AdminCard title="Image SEO templates">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AdminInput
            label="Alt template"
            value={config.modules.imageSeo.altTemplate}
            onChange={(altTemplate) =>
              persist?.update({
                modules: {
                  ...config.modules,
                  imageSeo: { ...config.modules.imageSeo, altTemplate },
                },
              })
            }
          />
          <AdminInput
            label="Title template"
            value={config.modules.imageSeo.titleTemplate}
            onChange={(titleTemplate) =>
              persist?.update({
                modules: {
                  ...config.modules,
                  imageSeo: { ...config.modules.imageSeo, titleTemplate },
                },
              })
            }
          />
        </div>
      </AdminCard>
    </>
  );
}
