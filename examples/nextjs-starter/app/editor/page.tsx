'use client';

import Link from 'next/link';
import { SeoAssistant } from '@seosuite/next/client';

const SAMPLE_HTML = `<!DOCTYPE html>
<html>
<head><title>Sample Blog Post</title></head>
<body>
  <h1>10 SEO Tips for Next.js</h1>
  <p>Learn how to optimize your headless site for search engines.</p>
</body>
</html>`;

export default function EditorDemoPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <Link href="/" className="text-sm text-indigo-600 hover:underline">
            ← Demo ana sayfa
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">İçerik Editörü Demo</h1>
          <p className="mt-1 text-sm text-gray-600">
            CMS editörü yanındaki <strong>SeoAssistant</strong> — site içi Pro özellikler (skor, link, Content AI).
            Cloud API: <code className="rounded bg-gray-100 px-1 text-xs">localhost:3001</code>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_22rem]">
          <div className="min-w-0 space-y-4">
            <p className="text-xs text-gray-500">
              <code className="rounded bg-gray-100 px-1">GSEO_API_KEY</code> +{' '}
              <code className="rounded bg-gray-100 px-1">GSEO_SITE_ID</code> →{' '}
              <code className="rounded bg-gray-100 px-1">.env.local</code>
            </p>
            <textarea
              readOnly
              className="h-48 w-full rounded-xl border border-gray-200 bg-white p-4 font-mono text-sm"
              value={SAMPLE_HTML}
            />
          </div>

          <aside className="w-full min-w-0 xl:sticky xl:top-8 xl:self-start">
            <SeoAssistant
              scoring={{
                url: 'https://gseosuite.com/blog/seo-tips',
                html: SAMPLE_HTML,
                title: '10 SEO Tips for Next.js',
                metaDescription: 'Learn how to optimize your headless site.',
                targetKeyword: 'nextjs seo',
                pageType: 'article',
              }}
              pro={{
                enableInternalLinks: true,
                enableContentAi: true,
                enableKeywords: true,
              }}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
