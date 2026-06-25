'use client';

import React, { useEffect, useState } from 'react';
import { useAdminConfig } from '../context';
import { AdminBadge, AdminButton, AdminCard, AdminInput } from '../components/ui';
import type { RedirectRule } from '../types';

export function SeoAdminRedirects() {
  const { config, persist } = useAdminConfig();
  const [rules, setRules] = useState<RedirectRule[]>(config.redirects);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [permanent, setPermanent] = useState(true);

  useEffect(() => {
    setRules(config.redirects);
  }, [config.redirects]);

  function syncRules(next: RedirectRule[]) {
    setRules(next);
    persist?.update({ redirects: next });
  }

  function addRule() {
    if (!source.trim() || !destination.trim()) return;
    syncRules([
      ...rules,
      { source: source.trim(), destination: destination.trim(), permanent },
    ]);
    setSource('');
    setDestination('');
  }

  function removeRule(index: number) {
    syncRules(rules.filter((_, i) => i !== index));
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(rules, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'redirects.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Redirections</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage redirect rules for Edge middleware.
          {persist ? (
            <>
              {' '}
              Save persists to{' '}
              <code className="rounded bg-gray-100 px-1 text-xs">{persist.label}</code>.
            </>
          ) : (
            <> Export JSON and update your redirects file manually.</>
          )}
        </p>
      </div>

      {config.redirectsPath && (
        <AdminCard title="Bootstrap source file">
          <p className="text-sm text-gray-600">
            Configured path: <code className="font-mono">{config.redirectsPath}</code>
          </p>
        </AdminCard>
      )}

      <AdminCard title="Add redirect">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AdminInput label="Source path" value={source} onChange={setSource} placeholder="/old-page" />
          <AdminInput label="Destination" value={destination} onChange={setDestination} placeholder="/new-page" />
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={permanent}
            onChange={(e) => setPermanent(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Permanent (308/301)
        </label>
        <div className="mt-4">
          <AdminButton onClick={addRule}>Add rule</AdminButton>
        </div>
      </AdminCard>

      <AdminCard
        title={`Active rules (${rules.length})`}
        action={<AdminButton variant="secondary" onClick={exportJson}>Export JSON</AdminButton>}
      >
        {rules.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="pb-2 pr-4">Source</th>
                  <th className="pb-2 pr-4">Destination</th>
                  <th className="pb-2 pr-4">Type</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule, index) => (
                  <tr key={`${rule.source}-${index}`} className="border-b border-gray-100">
                    <td className="py-3 pr-4 font-mono text-gray-800">{rule.source}</td>
                    <td className="py-3 pr-4 font-mono text-gray-800">{rule.destination}</td>
                    <td className="py-3 pr-4">
                      <AdminBadge tone={rule.permanent ? 'success' : 'info'}>
                        {rule.permanent ? 'Permanent' : 'Temporary'}
                      </AdminBadge>
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => removeRule(index)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No redirect rules yet.</p>
        )}
      </AdminCard>
    </>
  );
}
