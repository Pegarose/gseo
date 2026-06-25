import type { SeoSuiteConfig } from './config';

export interface SeoAnalysisCheck {
  id: string;
  label: string;
  pass: boolean;
  hint?: string;
}

export interface SeoAnalysisInput {
  config: SeoSuiteConfig;
  samplePages?: Array<{ url: string; title?: string; description?: string; hasCanonical?: boolean }>;
}

export function runSeoAnalysis(input: SeoAnalysisInput): SeoAnalysisCheck[] {
  const { config, samplePages = [] } = input;
  const checks: SeoAnalysisCheck[] = [];

  checks.push({
    id: 'site-url',
    label: 'Site URL configured',
    pass: Boolean(config.siteUrl),
  });

  checks.push({
    id: 'site-name',
    label: 'Site name configured',
    pass: Boolean(config.siteName?.trim()),
  });

  checks.push({
    id: 'title-template',
    label: 'Title template configured',
    pass: Boolean(config.titleTemplate?.includes('%title%') || config.titleTemplate?.includes('%sitename%')),
    hint: 'Use %title% or %sitename% tokens',
  });

  checks.push({
    id: 'default-description',
    label: 'Default meta description set',
    pass: Boolean(config.defaultDescription?.trim()),
  });

  checks.push({
    id: 'robots-index',
    label: 'Global indexing allowed',
    pass: config.robots.index !== false,
    hint: config.robots.index === false ? 'Global noindex is enabled' : undefined,
  });

  checks.push({
    id: 'organization-schema',
    label: 'Organization schema configured',
    pass: Boolean(config.schema.organization?.name),
  });

  checks.push({
    id: 'og-site-name',
    label: 'Open Graph site name set',
    pass: Boolean(config.openGraph.siteName ?? config.siteName),
  });

  checks.push({
    id: 'sitemap-excludes',
    label: 'Sitemap exclude patterns reviewed',
    pass: true,
    hint: `${config.sitemap.exclude.length} exclude pattern(s)`,
  });

  if (samplePages.length) {
    const missingMeta = samplePages.filter((p) => !p.title || !p.description);
    checks.push({
      id: 'sample-meta',
      label: 'Sample pages have title + description',
      pass: missingMeta.length === 0,
      hint: missingMeta.length ? `${missingMeta.length} page(s) missing meta` : undefined,
    });
  }

  return checks;
}

export function seoAnalysisScore(checks: SeoAnalysisCheck[]): number {
  if (!checks.length) return 0;
  const passed = checks.filter((c) => c.pass).length;
  return Math.round((passed / checks.length) * 100);
}
