import { describe, it, expect } from 'vitest';
import { applyTemplate, resolvePageTitle, resolvePageDescription } from '../templates';
import type { SeoSuiteConfig } from '../config';

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

describe('applyTemplate', () => {
  it('replaces all supported tokens', () => {
    const result = applyTemplate(
      '%title% %sep% %sitename% — %category% by %author% (%currentyear%)',
      {
        title: 'Hello World',
        sep: '|',
        sitename: 'Example',
        category: 'SEO',
        author: 'Jane',
        currentyear: '2026',
      }
    );
    expect(result).toBe('Hello World | Example — SEO by Jane (2026)');
  });

  it('strips unknown tokens', () => {
    const result = applyTemplate('%title% %unknown%', { title: 'Test' });
    expect(result).toBe('Test');
  });
});

describe('resolvePageTitle', () => {
  it('uses global title template by default', () => {
    expect(resolvePageTitle({ title: 'About' }, baseConfig)).toBe('About | Example Site');
  });

  it('uses page-type template when configured', () => {
    const config: SeoSuiteConfig = {
      ...baseConfig,
      titleTemplates: {
        article: '%title% — %sitename%',
      },
    };
    expect(resolvePageTitle({ title: 'Blog Post', pageType: 'article' }, config)).toBe(
      'Blog Post — Example Site'
    );
  });

  it('uses homepage override when set', () => {
    const config: SeoSuiteConfig = {
      ...baseConfig,
      homepage: { title: '%sitename% — %page%' },
    };
    expect(
      resolvePageTitle({ title: 'Ignored', pageType: 'homepage', page: 'Home' }, config)
    ).toBe('Example Site — Home');
  });
});

describe('resolvePageDescription', () => {
  it('falls back to default description', () => {
    const config: SeoSuiteConfig = {
      ...baseConfig,
      defaultDescription: 'Default site description',
    };
    expect(resolvePageDescription({ title: 'About' }, config)).toBe('Default site description');
  });

  it('uses page-type description template', () => {
    const config: SeoSuiteConfig = {
      ...baseConfig,
      descriptionTemplates: {
        article: 'Read %title% on %sitename%',
      },
    };
    expect(
      resolvePageDescription({ title: 'SEO Tips', pageType: 'article' }, config)
    ).toBe('Read SEO Tips on Example Site');
  });
});
