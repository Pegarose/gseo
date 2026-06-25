import {
  withSeoMetadata,
  ArticleJsonLd,
  BreadcrumbJsonLd,
  FAQJsonLd,
} from '@seosuite/next';
import type { Metadata } from 'next';

const POST = {
  slug: 'seo-tips',
  title: '10 SEO Tips for Next.js',
  excerpt: 'Practical SEO patterns for headless Next.js sites.',
  date: '2026-06-15',
  author: 'GSeoSuite Team',
};

export const metadata: Metadata = withSeoMetadata(
  {
    title: POST.title,
    description: POST.excerpt,
    pageType: 'article',
    excerpt: POST.excerpt,
    date: POST.date,
    author: POST.author,
  },
  `/blog/${POST.slug}`
);

export default function BlogPostPage() {
  const url = `https://gseosuite.com/blog/${POST.slug}`;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <ArticleJsonLd
        url={url}
        headline={POST.title}
        description={POST.excerpt}
        datePublished={POST.date}
        author={{ name: POST.author }}
        publisher={{ name: 'GSeoSuite', url: 'https://gseosuite.com' }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', item: 'https://gseosuite.com/' },
          { name: 'Blog', item: 'https://gseosuite.com/blog' },
          { name: POST.title, item: url },
        ]}
      />
      <FAQJsonLd
        items={[
          {
            question: 'Do I need a plugin for Next.js SEO?',
            answer:
              'No. @seosuite/next provides meta, schema, sitemap, and robots as an SDK.',
          },
          {
            question: 'Does scoring require cloud?',
            answer:
              'Free tier works offline. Pro scoring uses GSeoSuite Cloud via a server-side API key.',
          },
        ]}
      />

      <nav className="text-sm text-gray-500 mb-6">
        <a href="/" className="hover:text-indigo-600">
          Home
        </a>
        <span className="mx-2">/</span>
        <span>Blog</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900">{POST.title}</h1>
      <p className="mt-2 text-sm text-gray-500">
        {POST.date} · {POST.author}
      </p>
      <p className="mt-6 text-lg text-gray-700 leading-relaxed">{POST.excerpt}</p>

      <section className="mt-10 rounded-xl border border-gray-200 bg-gray-50 p-6">
        <h2 className="text-lg font-semibold">FAQ</h2>
        <dl className="mt-4 space-y-4">
          <div>
            <dt className="font-medium">Do I need a plugin for Next.js SEO?</dt>
            <dd className="mt-1 text-gray-600">
              No. @seosuite/next provides meta, schema, sitemap, and robots as an SDK.
            </dd>
          </div>
          <div>
            <dt className="font-medium">Does scoring require cloud?</dt>
            <dd className="mt-1 text-gray-600">
              Free tier works offline. Pro scoring uses GSeoSuite Cloud via a server-side API key.
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
