import type { SeoModulesConfig } from '../free/modules-config';
import type { SchemaType } from '../free/schema-registry';

export interface RedirectRule {
  source: string;
  destination: string;
  permanent?: boolean;
  statusCode?: number;
}

/** Serializable config snapshot passed from server layout to client admin UI. */
export interface AdminConfigSnapshot {
  siteUrl: string;
  siteName: string;
  defaultLocale: string;
  defaultTitle?: string;
  defaultDescription?: string;
  separator: string;
  titleTemplate: string;
  titleTemplates?: Record<string, string>;
  descriptionTemplate?: string;
  descriptionTemplates?: Record<string, string>;
  homepage?: {
    title?: string;
    description?: string;
    noindex?: boolean;
    nofollow?: boolean;
  };
  noindex: boolean;
  nofollow: boolean;
  openGraph: {
    type: string;
    siteName?: string;
    title?: string;
    description?: string;
    url?: string;
    locale?: string;
  };
  twitter: {
    card: string;
    site?: string;
    creator?: string;
  };
  robots: {
    index: boolean;
    follow: boolean;
    nocache: boolean;
  };
  schema: {
    organization?: {
      name: string;
      url?: string;
      logo?: string;
      sameAs?: string[];
    };
    website?: {
      name?: string;
      url?: string;
      searchUrl?: string;
    };
    enableBreadcrumb: boolean;
  };
  sitemap: {
    exclude: string[];
    changefreq?: string;
    priority?: number;
    includeImages: boolean;
    trailingSlash: boolean;
  };
  redirects: RedirectRule[];
  redirectsPath?: string;
  verification?: {
    google?: string;
    yandex?: string;
    yahoo?: string;
    bing?: string;
  };
  robotsTxt?: string;
  modules: SeoModulesConfig;
}

export interface AdminNavItem {
  href: string;
  label: string;
  description: string;
  icon: AdminNavIcon;
}

export type AdminNavIcon =
  | 'dashboard'
  | 'modules'
  | 'general'
  | 'titles'
  | 'sitemap'
  | 'redirects'
  | 'schema'
  | 'analysis'
  | 'tools'
  | 'indexing';

export const VENDOR_SCHEMA_TYPES = [
  'Product',
  'Review',
  'LocalBusiness',
  'Video',
  'Event',
  'JobPosting',
  'SoftwareApplication',
  'Recipe',
  'Course',
  'Dataset',
  'ProfilePage',
] as const;

export const SCHEMA_TYPE_OPTIONS: Array<{ value: SchemaType; label: string }> = [
  { value: 'Organization', label: 'Organization' },
  { value: 'WebSite', label: 'WebSite' },
  { value: 'WebPage', label: 'WebPage' },
  { value: 'Article', label: 'Article' },
  { value: 'BreadcrumbList', label: 'BreadcrumbList' },
  { value: 'FAQPage', label: 'FAQPage' },
  { value: 'HowTo', label: 'HowTo' },
];
