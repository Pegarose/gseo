import { describe, it, expect } from 'vitest';
import { generateSitemapXml } from '../sitemap';

describe('generateSitemapXml', () => {
  it('generates valid sitemap XML', () => {
    const xml = generateSitemapXml([
      { url: 'https://example.com/', lastModified: new Date('2026-01-01'), changeFrequency: 'weekly', priority: 1.0 },
    ]);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<loc>https://example.com/</loc>');
    expect(xml).toContain('<lastmod>2026-01-01T00:00:00.000Z</lastmod>');
    expect(xml).toContain('<changefreq>weekly</changefreq>');
    expect(xml).toContain('<priority>1</priority>');
  });

  it('escapes special XML characters', () => {
    const xml = generateSitemapXml([{ url: 'https://example.com/?a=1&b=2' }]);
    expect(xml).toContain('&amp;');
  });
});
