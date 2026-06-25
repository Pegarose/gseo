'use client';

import React, { useState } from 'react';
import { buildSchema } from '../../free/schema-registry';
import type { SchemaType } from '../../free/schema-registry';
import { useAdminConfig } from '../context';
import { SCHEMA_TYPE_OPTIONS, VENDOR_SCHEMA_TYPES } from '../types';
import { AdminCard } from '../components/ui';

const SCHEMA_SAMPLES: Record<SchemaType, object> = {
  Organization: {
    name: 'GSeoSuite',
    url: 'https://gseosuite.com',
    logo: 'https://gseosuite.com/logo.png',
  },
  WebSite: {
    name: 'GSeoSuite',
    url: 'https://gseosuite.com',
    searchUrl: 'https://gseosuite.com/search?q={search_term_string}',
  },
  WebPage: {
    url: 'https://gseosuite.com/about',
    name: 'About Us',
    description: 'Learn about our team.',
  },
  Article: {
    url: 'https://gseosuite.com/blog/post',
    headline: 'Sample Article',
    datePublished: '2026-06-15',
    author: { name: 'Editor' },
  },
  BreadcrumbList: {
    items: [
      { name: 'Home', item: 'https://gseosuite.com/' },
      { name: 'Blog', item: 'https://gseosuite.com/blog' },
    ],
  },
  FAQPage: {
    items: [
      { question: 'What is structured data?', answer: 'Machine-readable page metadata for search engines.' },
    ],
  },
  HowTo: {
    name: 'Install @seosuite/next',
    steps: [{ name: 'Install package', text: 'Run npm install @seosuite/next' }],
  },
};

export function SeoAdminSchema() {
  const { config } = useAdminConfig();
  const [schemaType, setSchemaType] = useState<SchemaType>('Article');
  const [jsonInput, setJsonInput] = useState(JSON.stringify(SCHEMA_SAMPLES.Article, null, 2));

  let preview: Record<string, unknown> | null = null;
  let error: string | null = null;

  try {
    const props = JSON.parse(jsonInput);
    preview = buildSchema(schemaType, props);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Invalid JSON';
  }

  function loadSample(type: SchemaType) {
    setSchemaType(type);
    setJsonInput(JSON.stringify(SCHEMA_SAMPLES[type], null, 2));
  }

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Schema Manager</h1>
        <p className="mt-1 text-sm text-gray-500">
          Pick a schema type, edit props, and preview JSON-LD output before adding to your pages.
        </p>
      </div>

      <AdminCard title="Site schema defaults">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Organization</dt>
            <dd className="mt-1 text-gray-800">{config.schema.organization?.name ?? 'Not configured'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-500">Breadcrumbs</dt>
            <dd className="mt-1 text-gray-800">{config.schema.enableBreadcrumb ? 'Enabled' : 'Disabled'}</dd>
          </div>
        </dl>
      </AdminCard>

      <AdminCard title="Vendor JSON-LD types (via @seosuite/next)">
        <p className="text-sm text-gray-600">
          Use dedicated components: {VENDOR_SCHEMA_TYPES.join(', ')} — plus Article, FAQ, HowTo, Event, Video, Product, and more.
        </p>
      </AdminCard>

      <AdminCard title="Legacy buildSchema types">
        <div className="flex flex-wrap gap-2">
          {SCHEMA_TYPE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => loadSample(value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                schemaType === value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </AdminCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AdminCard title="Props (JSON)">
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={16}
            className="w-full rounded-lg border border-gray-300 p-3 font-mono text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </AdminCard>

        <AdminCard title="JSON-LD preview">
          <pre className="max-h-96 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-emerald-300">
            {preview ? JSON.stringify(preview, null, 2) : 'Fix JSON to preview schema.'}
          </pre>
          <p className="mt-3 text-xs text-gray-500">
            Use <code className="rounded bg-gray-100 px-1">buildSchema()</code> or matching JsonLd component in your page.
          </p>
        </AdminCard>
      </div>
    </>
  );
}
