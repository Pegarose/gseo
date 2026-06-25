import { describe, it, expect, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { defineSeoSuiteConfig, type SeoSuiteConfig } from '../config';
import { withSeoMetadata } from '../metadata';
import { BreadcrumbJsonLd, FAQJsonLd, OrganizationJsonLd } from '../jsonld';

function parseJsonLd(html: string): unknown {
  const match = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) {
    throw new Error('JSON-LD script not found');
  }
  return JSON.parse(match[1]);
}

const baseConfig = {
  siteUrl: 'https://example.com',
  siteName: 'Example Site',
  defaultLocale: 'en-US',
  separator: '|',
  titleTemplate: '%title% %sep% %sitename%',
  noindex: false,
  nofollow: false,
  openGraph: { type: 'website' },
  twitter: { card: 'summary_large_image' as const },
  robots: { index: true, follow: true, nocache: false },
  verification: {},
  schema: { enableBreadcrumb: true },
  sitemap: { exclude: [], includeImages: false, trailingSlash: false },
  modules: {
    breadcrumbs: { enabled: true },
    imageSeo: { enabled: false, altTemplate: '%title%', titleTemplate: '%title%' },
    linkCounter: { enabled: false },
    instantIndexing: { enabled: false, history: [] },
    llmsTxt: { enabled: false, content: '' },
    monitor404: { enabled: false },
    links: { nofollowExternal: false, openExternalInNewTab: false },
  },
} satisfies SeoSuiteConfig;

beforeEach(() => {
  defineSeoSuiteConfig(baseConfig);
});

describe('withSeoMetadata', () => {
  it('uses siteName for openGraph.siteName, not og.title', () => {
    const metadata = withSeoMetadata(
      {
        title: 'Page Title',
        og: { title: 'OG Title Override' },
      },
      '/about'
    );

    expect(metadata.openGraph?.siteName).toBe('Example Site');
    expect(metadata.openGraph?.title).toBe('OG Title Override');
  });

  it('maps bing verification to msvalidate.01', () => {
    defineSeoSuiteConfig({
      ...baseConfig,
      verification: { bing: 'BING-TOKEN' },
    });

    const metadata = withSeoMetadata({ title: 'Home' }, '/');
    expect(metadata.verification?.other?.['msvalidate.01']).toBe('BING-TOKEN');
  });
});

describe('JsonLd golden output', () => {
  it('BreadcrumbJsonLd matches next-seo shape', () => {
    const html = renderToStaticMarkup(
      BreadcrumbJsonLd({
        items: [
          { name: 'Books', item: 'https://example.com/books' },
          { name: 'Science Fiction', item: 'https://example.com/books/sci-fi' },
          { name: 'Award Winners' },
        ],
      })
    );

    expect(parseJsonLd(html)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Books',
          item: 'https://example.com/books',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Science Fiction',
          item: 'https://example.com/books/sci-fi',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Award Winners',
        },
      ],
    });
  });

  it('FAQJsonLd accepts legacy items prop', () => {
    const html = renderToStaticMarkup(
      FAQJsonLd({
        items: [{ question: 'What is SEO?', answer: 'Search engine optimization.' }],
      })
    );

    const data = parseJsonLd(html) as Record<string, unknown>;
    const mainEntity = data.mainEntity as Array<Record<string, unknown>>;
    expect(data['@type']).toBe('FAQPage');
    expect(mainEntity[0].name).toBe('What is SEO?');
  });

  it('OrganizationJsonLd reads config defaults', () => {
    defineSeoSuiteConfig({
      ...baseConfig,
      schema: {
        organization: {
          name: 'Acme Corp',
          url: 'https://acme.com',
          logo: 'https://acme.com/logo.png',
        },
        enableBreadcrumb: true,
      },
    });

    const html = renderToStaticMarkup(OrganizationJsonLd());
    const data = parseJsonLd(html) as Record<string, unknown>;
    expect(data['@type']).toBe('Organization');
    expect(data.name).toBe('Acme Corp');
    expect(data.url).toBe('https://acme.com');
  });
});
