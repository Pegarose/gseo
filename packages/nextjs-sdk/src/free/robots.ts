export interface RobotsConfig {
  userAgent?: string;
  allow?: string[];
  disallow?: string[];
  sitemap?: string[];
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
