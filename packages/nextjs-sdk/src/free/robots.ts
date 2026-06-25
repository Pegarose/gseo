import { MetadataRoute } from 'next';
import { resolveRuntimeSeoConfig } from './settings/load-settings';

export interface RobotsConfig {
  userAgent?: string;
  allow?: string[];
  disallow?: string[];
  sitemap?: string[];
}

export function createRobotsRoute() {
  return async function robots(): Promise<MetadataRoute.Robots | Response> {
    const config = await resolveRuntimeSeoConfig();

    if (config.robotsTxt?.trim()) {
      return new Response(`${config.robotsTxt.trim()}\n`, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    const globalIndex = config.robots.index ?? true;
    const globalFollow = config.robots.follow ?? true;

    const rules: MetadataRoute.Robots['rules'] = {
      userAgent: '*',
      allow: globalIndex && globalFollow ? '/' : undefined,
      disallow: !globalIndex ? '/' : undefined,
    };

    const sitemapUrl = `${config.siteUrl}/sitemap.xml`;

    return {
      rules,
      sitemap: sitemapUrl,
    };
  };
}

export function generateRobotsTxt(configs: RobotsConfig[]): string {
  const blocks = configs.map((cfg) => {
    const lines: string[] = [`User-agent: ${cfg.userAgent || '*'}`];
    cfg.allow?.forEach((path) => lines.push(`Allow: ${path}`));
    cfg.disallow?.forEach((path) => lines.push(`Disallow: ${path}`));
    return lines.join('\n');
  });

  const sitemaps = configs
    .flatMap((cfg) => cfg.sitemap || [])
    .filter((value, index, self) => self.indexOf(value) === index)
    .map((url) => `Sitemap: ${url}`);

  return [...blocks, ...sitemaps].join('\n\n');
}
