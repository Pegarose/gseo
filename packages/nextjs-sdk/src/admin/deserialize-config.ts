import type { SeoSuiteConfigInput } from '../free/config';
import type { AdminConfigSnapshot } from './types';

/** Convert admin form snapshot back to persistable SDK settings. */
export function adminSnapshotToSettings(
  snapshot: Partial<AdminConfigSnapshot>
): Partial<SeoSuiteConfigInput> {
  const settings: Partial<SeoSuiteConfigInput> = {};

  if (snapshot.siteName !== undefined) settings.siteName = snapshot.siteName;
  if (snapshot.defaultLocale !== undefined) settings.defaultLocale = snapshot.defaultLocale;
  if (snapshot.defaultTitle !== undefined) settings.defaultTitle = snapshot.defaultTitle;
  if (snapshot.defaultDescription !== undefined) {
    settings.defaultDescription = snapshot.defaultDescription;
  }
  if (snapshot.separator !== undefined) settings.separator = snapshot.separator;
  if (snapshot.titleTemplate !== undefined) settings.titleTemplate = snapshot.titleTemplate;
  if (snapshot.titleTemplates !== undefined) settings.titleTemplates = snapshot.titleTemplates;
  if (snapshot.descriptionTemplate !== undefined) {
    settings.descriptionTemplate = snapshot.descriptionTemplate;
  }
  if (snapshot.descriptionTemplates !== undefined) {
    settings.descriptionTemplates = snapshot.descriptionTemplates;
  }
  if (snapshot.homepage !== undefined) settings.homepage = snapshot.homepage;
  if (snapshot.noindex !== undefined) settings.noindex = snapshot.noindex;
  if (snapshot.nofollow !== undefined) settings.nofollow = snapshot.nofollow;

  if (snapshot.openGraph !== undefined) {
    settings.openGraph = {
      type: snapshot.openGraph.type,
      siteName: snapshot.openGraph.siteName,
      title: snapshot.openGraph.title,
      description: snapshot.openGraph.description,
      url: snapshot.openGraph.url,
      locale: snapshot.openGraph.locale,
    };
  }

  if (snapshot.twitter !== undefined) {
    settings.twitter = {
      card: snapshot.twitter.card as 'summary' | 'summary_large_image' | 'app' | 'player',
      site: snapshot.twitter.site,
      creator: snapshot.twitter.creator,
    };
  }

  if (snapshot.robots !== undefined) {
    settings.robots = {
      index: snapshot.robots.index,
      follow: snapshot.robots.follow,
      nocache: snapshot.robots.nocache,
    };
  }

  if (snapshot.schema !== undefined) {
    settings.schema = {
      organization: snapshot.schema.organization,
      website: snapshot.schema.website,
      enableBreadcrumb: snapshot.schema.enableBreadcrumb,
    };
  }

  if (snapshot.sitemap !== undefined) {
    settings.sitemap = {
      exclude: snapshot.sitemap.exclude,
      changefreq: snapshot.sitemap.changefreq as
        | 'always'
        | 'hourly'
        | 'daily'
        | 'weekly'
        | 'monthly'
        | 'yearly'
        | 'never'
        | undefined,
      priority: snapshot.sitemap.priority,
      includeImages: snapshot.sitemap.includeImages,
      trailingSlash: snapshot.sitemap.trailingSlash,
    };
  }

  if (snapshot.redirects !== undefined) {
    settings.redirects = snapshot.redirects.map((rule) => ({
      source: rule.source,
      destination: rule.destination,
      permanent: rule.permanent,
      statusCode: rule.statusCode,
    }));
  }

  if (snapshot.verification !== undefined) {
    settings.verification = snapshot.verification;
  }

  if (snapshot.robotsTxt !== undefined) {
    settings.robotsTxt = snapshot.robotsTxt;
  }

  if (snapshot.modules !== undefined) {
    settings.modules = snapshot.modules;
  }

  return settings;
}
