export interface LinkCounterPageResult {
  url: string;
  internalLinks: number;
  externalLinks: number;
  totalLinks: number;
}

const HREF_REGEX = /<a\b[^>]*\shref=["']([^"']+)["'][^>]*>/gi;

export function countLinksInHtml(html: string, siteHost: string): Omit<LinkCounterPageResult, 'url'> {
  const host = siteHost.replace(/^https?:\/\//, '').replace(/\/$/, '');
  let internalLinks = 0;
  let externalLinks = 0;

  for (const match of html.matchAll(HREF_REGEX)) {
    const href = match[1];
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      continue;
    }

    if (href.startsWith('/') || href.includes(host)) {
      internalLinks += 1;
    } else if (href.startsWith('http')) {
      externalLinks += 1;
    }
  }

  return {
    internalLinks,
    externalLinks,
    totalLinks: internalLinks + externalLinks,
  };
}

export async function scanPagesForLinks(
  pages: Array<{ url: string; html: string }>,
  siteUrl: string
): Promise<LinkCounterPageResult[]> {
  const host = new URL(siteUrl).host;
  return pages.map(({ url, html }) => ({
    url,
    ...countLinksInHtml(html, host),
  }));
}
