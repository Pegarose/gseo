import * as cheerio from 'cheerio';
import { ParsedPage } from '@/lib/scoring/types';

/**
 * Parses raw HTML into a structured ParsedPage object using Cheerio.
 * Extracts metadata, headings, links, images, JSON-LD, and text content.
 */
export function parseHtml(
  html: string,
  statusCode: number,
  headers: Record<string, string>,
  baseUrl?: string
): ParsedPage {
  const $ = cheerio.load(html);

  // --- Title ---
  const title = $('title').first().text().trim() || undefined;

  // --- Meta Description ---
  const metaDescription =
    $('meta[name="description"]').attr('content')?.trim() || undefined;

  // --- Canonical ---
  const canonical = $('link[rel="canonical"]').attr('href')?.trim() || undefined;

  // --- Meta Robots ---
  const robotsContent = $('meta[name="robots"]').attr('content')?.toLowerCase() || '';
  const metaRobots = {
    noindex: robotsContent.includes('noindex'),
    nofollow: robotsContent.includes('nofollow'),
  };

  // --- Headings ---
  const headings: ParsedPage['headings'] = [];
  for (let level = 1; level <= 6; level++) {
    $(`h${level}`).each((_, el) => {
      const text = $(el).text().trim();
      if (text) {
        headings.push({ level, text });
      }
    });
  }

  // --- Links ---
  const links: ParsedPage['links'] = [];
  let parsedBase: URL | null = null;
  try {
    if (baseUrl) parsedBase = new URL(baseUrl);
  } catch { /* ignore invalid base */ }

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')?.trim();
    const text = $(el).text().trim();
    if (!href) return;

    let isInternal = false;
    try {
      const resolvedUrl = new URL(href, baseUrl || 'https://placeholder.invalid');
      if (parsedBase && resolvedUrl.hostname === parsedBase.hostname) {
        isInternal = true;
      }
    } catch {
      // Relative links without a base default to internal
      if (href.startsWith('/') || href.startsWith('#') || href.startsWith('.')) {
        isInternal = true;
      }
    }

    links.push({ href, text, isInternal });
  });

  // --- Images ---
  const images: ParsedPage['images'] = [];
  $('img').each((_, el) => {
    const src = $(el).attr('src')?.trim();
    const alt = $(el).attr('alt')?.trim();
    if (src) {
      images.push({ src, alt: alt || undefined });
    }
  });

  // --- JSON-LD ---
  const jsonLd: any[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).html();
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // Handle @graph arrays
        if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
          jsonLd.push(...parsed['@graph']);
        } else {
          jsonLd.push(parsed);
        }
      } catch {
        // Invalid JSON-LD — push error marker
        jsonLd.push({ _error: 'INVALID_JSON', _raw: raw.substring(0, 200) });
      }
    }
  });

  // --- Open Graph ---
  // (Stored in headers-like map for potential future use, not part of ParsedPage v1)

  // --- Text Content ---
  // Remove scripts, styles and extract visible text
  $('script, style, noscript, svg, iframe').remove();
  const textContent = $('body').text().replace(/\s+/g, ' ').trim();

  return {
    statusCode,
    headers,
    title,
    metaDescription,
    canonical,
    metaRobots,
    headings,
    links,
    images,
    jsonLd,
    rawHtml: html,
    textContent,
  };
}

/**
 * Normalizes a URL by lowercasing the scheme and host,
 * removing trailing slashes, removing default ports, and sorting query params.
 */
export function normalizeUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    url.hash = ''; // Strip fragment
    // Remove trailing slash (unless path is just "/")
    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1);
    }
    // Sort search params
    url.searchParams.sort();
    return url.toString();
  } catch {
    return rawUrl;
  }
}
