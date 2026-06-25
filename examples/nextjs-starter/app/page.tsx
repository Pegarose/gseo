import { withSeoMetadata, WebPageJsonLd, BreadcrumbJsonLd } from '@seosuite/next';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = withSeoMetadata(
  {
    title: 'Homepage',
    description: 'GSeoSuite Next.js Starter — SDK demo uygulaması.',
    pageType: 'homepage',
    page: 'Home',
    excerpt: 'RankMath tarzı site içi SEO + cloud skorlama demosu.',
  },
  '/'
);

const demos = [
  {
    href: '/admin/seo',
    title: 'SEO Admin Panel',
    badge: 'Site içi · Free',
    description:
      'RankMath WordPress admininin Next.js karşılığı. Meta şablonları, sitemap, redirect, schema — hepsi müşteri sitesinde çalışır.',
    cta: 'Admin paneli aç →',
  },
  {
    href: '/editor',
    title: 'İçerik Editörü + SeoAssistant',
    badge: 'Site içi · Pro',
    description:
      'CMS editörü yanında canlı skor, internal link, Content AI ve focus keyword. Cloud API key gerektirir (3001).',
    cta: 'Editör demosu →',
  },
  {
    href: '/blog/seo-tips',
    title: 'Örnek Blog Sayfası',
    badge: 'Runtime · Free',
    description:
      'generateMetadata, JSON-LD schema ve title template\'lerin gerçek sayfada nasıl render edildiğini gösterir.',
    cta: 'Blog sayfası →',
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50/80 to-gray-50">
      <WebPageJsonLd
        url="https://gseosuite.com/"
        title="GSeoSuite Next.js Starter"
        description="SDK demo uygulaması"
        breadcrumb={[{ name: 'Home', item: 'https://gseosuite.com/' }]}
      />
      <BreadcrumbJsonLd items={[{ name: 'Home', item: 'https://gseosuite.com/' }]} />

      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
            Demo · Port 3002
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
            GSeoSuite Next.js Starter
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 leading-relaxed">
            Bu bir <strong>müşteri sitesi simülasyonu</strong>dur — cloud dashboard (3001) değil.
            <code className="mx-1 rounded bg-white px-1.5 py-0.5 text-sm">@seosuite/next</code> SDK&apos;sının
            nasıl kurulacağını gösterir.
          </p>
        </div>

        <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Ne değildir?</strong> Semrush/OpenSEO tarzı keyword araştırması burada yok — o Faz 2 cloud
          intelligence katmanında (<code className="text-xs">localhost:3001</code>).
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-1">
          {demos.map((demo) => (
            <Link
              key={demo.href}
              href={demo.href}
              className="group block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                    {demo.badge}
                  </span>
                  <h2 className="mt-2 text-xl font-semibold text-gray-900 group-hover:text-indigo-700">
                    {demo.title}
                  </h2>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{demo.description}</p>
                </div>
              </div>
              <p className="mt-4 text-sm font-medium text-indigo-600">{demo.cta}</p>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-gray-400">
          Pro özellikler için{' '}
          <code className="rounded bg-gray-100 px-1">.env.local</code> içinde GSEO_API_KEY + GSEO_SITE_ID
          gerekir. Cloud: <code className="rounded bg-gray-100 px-1">localhost:3001</code>
        </p>
      </div>
    </main>
  );
}
