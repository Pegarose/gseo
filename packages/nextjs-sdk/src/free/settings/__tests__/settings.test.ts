import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { defineSeoSuiteConfig } from '../../config';
import { createFileSettingsAdapter } from '../file-adapter';
import { mergeSeoSuiteConfig } from '../merge';

const baseBootstrap = {
  siteUrl: 'https://example.com',
  siteName: 'Bootstrap Name',
  defaultLocale: 'en-US',
  separator: '|',
  titleTemplate: '%title% %sep% %sitename%',
  noindex: false,
  nofollow: false,
  openGraph: { type: 'website', siteName: 'Bootstrap OG' },
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
};

describe('mergeSeoSuiteConfig', () => {
  beforeEach(() => {
    defineSeoSuiteConfig(baseBootstrap);
  });

  it('keeps bootstrap siteUrl while merging persisted fields', () => {
    const bootstrap = defineSeoSuiteConfig(baseBootstrap);
    const merged = mergeSeoSuiteConfig(bootstrap, {
      siteUrl: 'https://evil.com',
      siteName: 'Persisted Name',
      openGraph: { siteName: 'Persisted OG' },
    });

    expect(merged.siteUrl).toBe('https://example.com');
    expect(merged.siteName).toBe('Persisted Name');
    expect(merged.openGraph.siteName).toBe('Persisted OG');
  });

  it('deep-merges robots and schema', () => {
    const bootstrap = defineSeoSuiteConfig({
      ...baseBootstrap,
      schema: {
        enableBreadcrumb: true,
        organization: {
          name: 'Acme',
          url: 'https://example.com',
        },
      },
    });

    const merged = mergeSeoSuiteConfig(bootstrap, {
      robots: { index: false },
      schema: {
        organization: {
          name: 'Acme Updated',
          url: 'https://example.com',
        },
      },
    });

    expect(merged.robots.index).toBe(false);
    expect(merged.robots.follow).toBe(true);
    expect(merged.schema.organization?.name).toBe('Acme Updated');
  });
});

describe('createFileSettingsAdapter', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(tmpdir(), 'seosuite-settings-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('writes and reads settings plus redirects', async () => {
    const adapter = createFileSettingsAdapter({ directory: tempDir });

    await adapter.saveSiteSettings({
      siteName: 'Saved Site',
      redirects: [{ source: '/a', destination: '/b', permanent: true }],
    });

    const loaded = await adapter.loadSiteSettings();
    expect(loaded.siteName).toBe('Saved Site');
    expect(loaded.redirects).toEqual([{ source: '/a', destination: '/b', permanent: true }]);
    expect(adapter.label).toContain('settings.json');
  });
});
