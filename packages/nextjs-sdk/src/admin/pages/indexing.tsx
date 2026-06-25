'use client';

import React, { useState } from 'react';
import { useAdminConfig } from '../context';
import { AdminButton, AdminCard, AdminInput } from '../components/ui';

export function SeoAdminIndexing() {
  const { config, persist } = useAdminConfig();
  const [urls, setUrls] = useState(`${config.siteUrl}/\n${config.siteUrl}/blog/seo-tips`);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setResult(null);
    try {
      const response = await fetch('/api/seo/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urls: urls
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'Submit failed');
      setResult(`Submitted ${payload.results?.length ?? 0} URL(s)`);
      if (payload.results && persist) {
        persist.update({
          modules: {
            ...config.modules,
            instantIndexing: {
              ...config.modules.instantIndexing,
              history: [...payload.results, ...config.modules.instantIndexing.history].slice(0, 50),
            },
          },
        });
      }
    } catch (error) {
      setResult(error instanceof Error ? error.message : 'Submit failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Instant Indexing</h1>
        <p className="mt-1 text-sm text-gray-500">Submit URLs to IndexNow (Bing/Yandex).</p>
      </div>

      <AdminCard title="IndexNow key">
        <AdminInput
          label="API key"
          value={config.modules.instantIndexing.indexNowKey ?? ''}
          onChange={(indexNowKey) =>
            persist?.update({
              modules: {
                ...config.modules,
                instantIndexing: { ...config.modules.instantIndexing, indexNowKey: indexNowKey || undefined },
              },
            })
          }
        />
        <p className="mt-2 text-xs text-gray-500">
          Host a <code className="rounded bg-gray-100 px-1">{config.modules.instantIndexing.indexNowKey ?? 'key'}.txt</code>{' '}
          file at your site root with the key value.
        </p>
      </AdminCard>

      <AdminCard title="Submit URLs">
        <textarea
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          rows={6}
          className="w-full rounded-lg border border-gray-300 p-3 font-mono text-xs"
        />
        <div className="mt-3 flex items-center gap-3">
          <AdminButton onClick={submit} disabled={busy || !config.modules.instantIndexing.enabled}>
            {busy ? 'Submitting…' : 'Submit to IndexNow'}
          </AdminButton>
          {result && <span className="text-sm text-gray-600">{result}</span>}
        </div>
      </AdminCard>

      <AdminCard title="History">
        {config.modules.instantIndexing.history.length ? (
          <ul className="space-y-2 text-sm">
            {config.modules.instantIndexing.history.slice(0, 20).map((item, index) => (
              <li key={`${item.url}-${index}`} className="flex justify-between gap-4 font-mono text-xs">
                <span className="truncate text-gray-700">{item.url}</span>
                <span className={item.status === 'sent' ? 'text-emerald-600' : 'text-red-600'}>
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No submissions yet.</p>
        )}
      </AdminCard>
    </>
  );
}
