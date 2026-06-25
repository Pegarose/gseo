import { z } from 'zod';
import { seoModulesSchema } from './modules-config';

export const seoSuiteConfigSchema = z.object({
  siteUrl: z.string().url(),
  siteName: z.string().min(1),
  defaultLocale: z.string().default('en-US'),
  defaultTitle: z.string().optional(),
  defaultDescription: z.string().optional(),
  separator: z.string().default('|'),
  titleTemplate: z.string().default('%title% %sep% %sitename%'),
  titleTemplates: z.record(z.string(), z.string()).optional(),
  descriptionTemplate: z.string().optional(),
  descriptionTemplates: z.record(z.string(), z.string()).optional(),
  homepage: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    noindex: z.boolean().optional(),
    nofollow: z.boolean().optional(),
  }).optional(),
  noindex: z.boolean().default(false),
  nofollow: z.boolean().default(false),
  canonical: z.string().url().optional(),
  openGraph: z.object({
    type: z.string().default('website'),
    siteName: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    url: z.string().url().optional(),
    locale: z.string().optional(),
    images: z.array(z.object({
      url: z.string().url(),
      width: z.number().optional(),
      height: z.number().optional(),
      alt: z.string().optional(),
    })).optional(),
  }).default({ type: 'website' }),
  twitter: z.object({
    card: z.enum(['summary', 'summary_large_image', 'app', 'player']).default('summary_large_image'),
    site: z.string().optional(),
    creator: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    images: z.array(z.string().url()).optional(),
  }).default({ card: 'summary_large_image' }),
  robots: z.object({
    index: z.boolean().default(true),
    follow: z.boolean().default(true),
    nocache: z.boolean().default(false),
    googleBot: z.string().optional(),
  }).default({ index: true, follow: true, nocache: false }),
  verification: z.object({
    google: z.string().optional(),
    yandex: z.string().optional(),
    yahoo: z.string().optional(),
    bing: z.string().optional(),
    other: z.record(z.string(), z.string()).optional(),
  }).default({} as { google?: string; yandex?: string; yahoo?: string; bing?: string; other?: Record<string, string> }),
  schema: z.object({
    organization: z.object({
      name: z.string(),
      url: z.string().url().optional(),
      logo: z.string().url().optional(),
      sameAs: z.array(z.string().url()).optional(),
    }).optional(),
    website: z.object({
      name: z.string().optional(),
      url: z.string().url().optional(),
      searchUrl: z.string().optional(),
    }).optional(),
    enableBreadcrumb: z.boolean().default(true),
  }).default({ enableBreadcrumb: true }),
  sitemap: z.object({
    exclude: z.array(z.string()).default([]),
    changefreq: z.enum(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']).optional(),
    priority: z.number().min(0).max(1).optional(),
    includeImages: z.boolean().default(false),
    trailingSlash: z.boolean().default(false),
  }).default({ exclude: [], includeImages: false, trailingSlash: false }),
  redirects: z.union([
    z.string(), // path to redirects.json
    z.array(z.object({
      source: z.string(),
      destination: z.string(),
      permanent: z.boolean().default(false),
      statusCode: z.number().optional(),
    })),
  ]).optional(),
  modules: seoModulesSchema.default({}),
  robotsTxt: z.string().optional(),
});

export type SeoSuiteConfigInput = z.input<typeof seoSuiteConfigSchema>;
export type SeoSuiteConfig = z.infer<typeof seoSuiteConfigSchema>;

let bootstrapConfig: SeoSuiteConfig | null = null;
let cachedConfig: SeoSuiteConfig | null = null;

export function defineSeoSuiteConfig(input: SeoSuiteConfigInput): SeoSuiteConfig {
  const parsed = seoSuiteConfigSchema.parse(input);
  bootstrapConfig = parsed;
  cachedConfig = parsed;
  return parsed;
}

/** Immutable bootstrap values from seosuite.config.ts (before adapter merge). */
export function getBootstrapSeoSuiteConfig(): SeoSuiteConfig {
  if (!bootstrapConfig) {
    throw new Error(
      '[@seosuite/next] Config not found. Call defineSeoSuiteConfig() in your seosuite.config.ts and ensure it is imported before using SDK helpers.'
    );
  }
  return bootstrapConfig;
}

/** Update runtime config after adapter merge (internal). */
export function setRuntimeSeoSuiteConfig(config: SeoSuiteConfig): void {
  cachedConfig = config;
}

export function getSeoSuiteConfig(): SeoSuiteConfig {
  if (!cachedConfig) {
    throw new Error(
      '[@seosuite/next] Config not found. Call defineSeoSuiteConfig() in your seosuite.config.ts and ensure it is imported before using SDK helpers.'
    );
  }
  return cachedConfig;
}

export { resolveTitleTemplate, resolvePageTitle, resolvePageDescription, applyTemplate } from './templates';
export type { PageType, TitleTemplateVars, ResolvePageTitleInput } from './templates';
export { serializeAdminConfig } from '../admin/serialize-config';
export type { AdminConfigSnapshot } from '../admin/types';
