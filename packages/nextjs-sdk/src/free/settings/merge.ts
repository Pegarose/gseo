import { seoSuiteConfigSchema, type SeoSuiteConfig, type SeoSuiteConfigInput } from '../config';
import type { PersistableSeoSettings } from './types';

function mergeRecords<T extends Record<string, unknown>>(
  base: T | undefined,
  patch: T | undefined
): T | undefined {
  if (!base && !patch) return undefined;
  return { ...(base ?? {}), ...(patch ?? {}) } as T;
}

/** Deep-merge bootstrap config with adapter-persisted overrides. `siteUrl` stays from bootstrap. */
export function mergeSeoSuiteConfig(
  bootstrap: SeoSuiteConfig,
  persisted: PersistableSeoSettings
): SeoSuiteConfig {
  const mergedInput: SeoSuiteConfigInput = {
    ...bootstrap,
    ...persisted,
    siteUrl: bootstrap.siteUrl,
    openGraph: mergeRecords(bootstrap.openGraph, persisted.openGraph),
    twitter: mergeRecords(bootstrap.twitter, persisted.twitter),
    robots: mergeRecords(bootstrap.robots, persisted.robots),
    verification: mergeRecords(bootstrap.verification, persisted.verification),
    schema: {
      ...bootstrap.schema,
      ...persisted.schema,
      organization: persisted.schema?.organization ?? bootstrap.schema.organization,
      website: persisted.schema?.website ?? bootstrap.schema.website,
    },
    sitemap: mergeRecords(bootstrap.sitemap, persisted.sitemap),
    homepage: mergeRecords(bootstrap.homepage, persisted.homepage),
    titleTemplates: persisted.titleTemplates ?? bootstrap.titleTemplates,
    descriptionTemplates: persisted.descriptionTemplates ?? bootstrap.descriptionTemplates,
    redirects: persisted.redirects ?? bootstrap.redirects,
    modules: mergeRecords(bootstrap.modules, persisted.modules),
    robotsTxt: persisted.robotsTxt ?? bootstrap.robotsTxt,
  };

  return seoSuiteConfigSchema.parse(mergedInput);
}
