import type { SeoSuiteConfig } from '../free/config';
import type { AdminConfigSnapshot, RedirectRule } from './types';

export function serializeAdminConfig(config: SeoSuiteConfig): AdminConfigSnapshot {
  let redirects: RedirectRule[] = [];
  let redirectsPath: string | undefined;

  if (Array.isArray(config.redirects)) {
    redirects = config.redirects.map((rule) => ({
      source: rule.source,
      destination: rule.destination,
      permanent: rule.permanent,
      statusCode: rule.statusCode,
    }));
  } else if (typeof config.redirects === 'string') {
    redirectsPath = config.redirects;
  }

  return {
    siteUrl: config.siteUrl,
    siteName: config.siteName,
    defaultLocale: config.defaultLocale,
    defaultTitle: config.defaultTitle,
    defaultDescription: config.defaultDescription,
    separator: config.separator,
    titleTemplate: config.titleTemplate,
    titleTemplates: config.titleTemplates,
    descriptionTemplate: config.descriptionTemplate,
    descriptionTemplates: config.descriptionTemplates,
    homepage: config.homepage,
    noindex: config.noindex,
    nofollow: config.nofollow,
    openGraph: {
      type: config.openGraph.type,
      siteName: config.openGraph.siteName,
      title: config.openGraph.title,
      description: config.openGraph.description,
      url: config.openGraph.url,
      locale: config.openGraph.locale,
    },
    twitter: {
      card: config.twitter.card,
      site: config.twitter.site,
      creator: config.twitter.creator,
    },
    robots: {
      index: config.robots.index,
      follow: config.robots.follow,
      nocache: config.robots.nocache,
    },
    schema: {
      organization: config.schema.organization,
      website: config.schema.website,
      enableBreadcrumb: config.schema.enableBreadcrumb,
    },
    sitemap: {
      exclude: config.sitemap.exclude,
      changefreq: config.sitemap.changefreq,
      priority: config.sitemap.priority,
      includeImages: config.sitemap.includeImages,
      trailingSlash: config.sitemap.trailingSlash,
    },
    redirects,
    redirectsPath,
    verification: {
      google: config.verification.google,
      yandex: config.verification.yandex,
      yahoo: config.verification.yahoo,
      bing: config.verification.bing,
    },
    robotsTxt: config.robotsTxt,
    modules: config.modules,
  };
}
