import { describe, it, expect, beforeEach } from 'vitest';
import { defineSeoSuiteConfig } from '../config';
import { createRobotsRoute } from '../robots';
import { createSitemapRoute } from '../sitemap';
import { createRedirectMiddleware } from '../redirects';
import { defaultSeoModules } from '../modules-config';

const bootstrap = {
  siteUrl: 'https://example.com',
  siteName: 'Example',
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
  sitemap: { exclude: ['/admin/*'], includeImages: false, trailingSlash: false },
  modules: defaultSeoModules,
  redirects: [{ source: '/old', destination: '/new', permanent: true }],
};

beforeEach(() => {
  defineSeoSuiteConfig(bootstrap);
});

describe('runtime regression', () => {
  it('createSitemapRoute respects exclude patterns', async () => {
    const sitemap = createSitemapRoute({
      entries: [
        { url: 'https://example.com/' },
        { url: 'https://example.com/admin/seo' },
      ],
    });
    const result = await sitemap();
    expect(result).toHaveLength(1);
    expect(result[0].url.replace(/\/$/, '')).toBe('https://example.com');
  });

  it('createRobotsRoute returns sitemap reference', async () => {
    const robots = createRobotsRoute();
    const result = await robots();
    if (result instanceof Response) {
      expect(result.status).toBe(200);
    } else {
      expect(result.sitemap).toBe('https://example.com/sitemap.xml');
    }
  });

  it('redirect middleware matches configured rules', async () => {
    const middleware = createRedirectMiddleware();
    const nextUrl = new URL('https://example.com/old');
    const req = {
      nextUrl: Object.assign(nextUrl, { clone: () => new URL(nextUrl.toString()) }),
      url: nextUrl.toString(),
    } as import('next/server').NextRequest;
    const res = await middleware(req);
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
  });
});
