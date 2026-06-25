import type { Metadata } from 'next';
import { getSeoSuiteConfig, SeoSuiteConfig } from './config';
import { PageType, resolvePageDescription, resolvePageTitle } from './templates';

export interface PageSeoInput {
  title: string;
  description?: string;
  pageType?: PageType;
  excerpt?: string;
  date?: string;
  category?: string;
  tag?: string;
  author?: string;
  page?: string;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  robots?: string;
  og?: {
    title?: string;
    description?: string;
    type?: string;
    url?: string;
    images?: Array<{ url: string; width?: number; height?: number; alt?: string }>;
  };
  twitter?: {
    card?: 'summary' | 'summary_large_image' | 'app' | 'player';
    site?: string;
    creator?: string;
    title?: string;
    description?: string;
    images?: string[];
  };
  alternates?: Metadata['alternates'];
}

export function withSeoMetadata(input: PageSeoInput, pathname?: string): Metadata {
  const config = getSeoSuiteConfig();

  const isHomepage = input.pageType === 'homepage';
  const resolvedTitle = resolvePageTitle(
    {
      pageType: input.pageType,
      title: input.title,
      excerpt: input.excerpt,
      date: input.date,
      category: input.category,
      tag: input.tag,
      author: input.author,
      page: input.page,
    },
    config
  );
  const resolvedDescription = resolvePageDescription(
    {
      pageType: input.pageType,
      title: input.title,
      description: input.description,
      excerpt: input.excerpt,
      date: input.date,
      category: input.category,
      tag: input.tag,
      author: input.author,
    },
    config
  );
  const resolvedCanonical = input.canonical ?? (pathname ? `${config.siteUrl}${pathname}` : undefined);

  const noindex = input.noindex ?? (isHomepage ? config.homepage?.noindex : undefined) ?? config.noindex;
  const nofollow = input.nofollow ?? (isHomepage ? config.homepage?.nofollow : undefined) ?? config.nofollow;

  const metadata: Metadata = {
    title: resolvedTitle,
    description: resolvedDescription,
    alternates: {
      canonical: resolvedCanonical,
      ...input.alternates,
    },
    robots: {
      index: !noindex,
      follow: !nofollow,
      nocache: config.robots.nocache,
      googleBot: config.robots.googleBot,
    },
    openGraph: buildOpenGraph(input, config, resolvedCanonical),
    twitter: buildTwitter(input, config),
    verification: buildVerification(config),
    metadataBase: new URL(config.siteUrl),
  };

  return metadata;
}

function buildOpenGraph(input: PageSeoInput, config: SeoSuiteConfig, canonical?: string) {
  const ogImages = input.og?.images ?? config.openGraph.images;
  return {
    type: input.og?.type ?? config.openGraph.type ?? 'website',
    siteName: config.openGraph.siteName ?? config.siteName,
    title: input.og?.title ?? input.title,
    description: input.og?.description ?? input.description ?? config.openGraph.description,
    url: input.og?.url ?? canonical ?? config.openGraph.url,
    locale: config.openGraph.locale ?? config.defaultLocale,
    images: ogImages?.map((img) => ({
      url: img.url,
      width: img.width,
      height: img.height,
      alt: img.alt,
    })),
  };
}

function buildTwitter(input: PageSeoInput, config: SeoSuiteConfig) {
  const twImages = input.twitter?.images ?? config.twitter.images;
  return {
    card: input.twitter?.card ?? config.twitter.card ?? 'summary_large_image',
    site: input.twitter?.site ?? config.twitter.site,
    creator: input.twitter?.creator ?? config.twitter.creator,
    title: input.twitter?.title ?? input.title,
    description: input.twitter?.description ?? input.description ?? config.twitter.description,
    images: twImages,
  };
}

function buildVerification(config: SeoSuiteConfig): Metadata['verification'] {
  const v = config.verification;
  const result: Metadata['verification'] = {};
  if (v.google) result.google = v.google;
  if (v.yandex) result.yandex = v.yandex;
  if (v.yahoo) result.yahoo = v.yahoo;
  if (v.bing) {
    result.other = { ...(result.other ?? {}), 'msvalidate.01': v.bing };
  }
  if (v.other) {
    result.other = { ...(result.other ?? {}), ...v.other };
  }
  return Object.keys(result).length > 0 ? result : undefined;
}
