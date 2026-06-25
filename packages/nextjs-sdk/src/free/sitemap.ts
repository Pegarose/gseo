import { MetadataRoute } from 'next';
import { resolveRuntimeSeoConfig } from './settings/load-settings';

export interface SitemapEntry {
  url: string;
  lastModified?: Date;
  changeFrequency?: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority?: number;
}

export interface CreateSitemapRouteOptions {
  entries?: SitemapEntry[];
  /**
   * Optional async function returning additional entries.
   * Useful when pulling from a CMS or database.
   */
  fetchEntries?: () => Promise<SitemapEntry[]>;
}

export function createSitemapRoute(options: CreateSitemapRouteOptions = {}) {
  return async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const config = await resolveRuntimeSeoConfig();
    const trailingSlash = config.sitemap.trailingSlash;
    const baseEntries = options.entries ?? [];
    const fetched = options.fetchEntries ? await options.fetchEntries() : [];

    const all = [...baseEntries, ...fetched];

    return all
      .filter((entry) => !isExcluded(entry.url, config.sitemap.exclude))
      .map((entry) => {
        let url = entry.url;
        if (trailingSlash && !url.endsWith('/')) {
          url = `${url}/`;
        } else if (!trailingSlash && url.endsWith('/') && url !== config.siteUrl) {
          url = url.slice(0, -1);
        }

        return {
          url,
          lastModified: entry.lastModified ?? new Date(),
          changeFrequency: entry.changeFrequency ?? config.sitemap.changefreq ?? 'weekly',
          priority: entry.priority ?? config.sitemap.priority ?? 0.5,
        };
      });
  };
}

function isExcluded(url: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    const normalized = pattern.replace(/\*/g, '.*');
    const regex = new RegExp(normalized);
    return regex.test(url);
  });
}

/** Standalone XML generator for custom sitemap output or tests */
export function generateSitemapXml(entries: SitemapEntry[]): string {
  const urlset = entries.map((entry) => {
    const lastmod = entry.lastModified ? `<lastmod>${entry.lastModified.toISOString()}</lastmod>` : '';
    const changefreq = entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : '';
    const priority = entry.priority !== undefined ? `<priority>${entry.priority}</priority>` : '';
    return `
      <url>
        <loc>${escapeXml(entry.url)}</loc>
        ${lastmod}
        ${changefreq}
        ${priority}
      </url>
    `;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urlset}
</urlset>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
