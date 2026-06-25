import { describe, it, expect } from 'vitest';
import { normalizeContentAiResult, normalizeInternalLinksResult, normalizeKeywordIntelResult } from '../types';

describe('normalizeInternalLinksResult', () => {
  it('normalizes API envelope', () => {
    const result = normalizeInternalLinksResult({
      success: true,
      data: {
        sourceUrl: 'https://example.com/a',
        suggestions: [
          {
            targetUrl: 'https://example.com/b',
            anchorSuggestion: 'Related page',
            reason: 'Same site',
            confidence: 0.8,
          },
        ],
        orphanRisk: false,
        siteGraphStatus: 'partial',
      },
    });

    expect(result.suggestions).toHaveLength(1);
    expect(result.suggestions[0].targetUrl).toBe('https://example.com/b');
  });
});

describe('normalizeContentAiResult', () => {
  it('derives title suggestions from headings', () => {
    const result = normalizeContentAiResult({
      success: true,
      data: {
        semanticScore: 72,
        targetKeyword: 'nextjs seo',
        recommendedHeadings: ['SEO for Next.js', 'Technical SEO checklist'],
        recommendations: ['Add target keyword to the introduction.'],
        missingEntities: ['TARGET_KEYWORD_NOT_IN_TITLE'],
      },
    });

    expect(result.suggestedTitles[0]).toBe('SEO for Next.js');
    expect(result.suggestedDescription).toContain('introduction');
    expect(result.missingTopics).toContain('TARGET_KEYWORD_NOT_IN_TITLE');
  });
});

describe('normalizeKeywordIntelResult', () => {
  it('normalizes VebAPI keyword envelope', () => {
    const result = normalizeKeywordIntelResult({
      success: true,
      data: {
        query: 'nextjs seo',
        country: 'tr',
        suggestions: [
          { term: 'nextjs seo', volume: 1200, cpc: 1.5, competition: 'low', score: 0.3 },
        ],
        meta: { provider: 'vebapi', cached: false, disclaimer: 'Estimate only.' },
      },
    });

    expect(result.suggestions).toHaveLength(1);
    expect(result.suggestions[0].volume).toBe(1200);
    expect(result.disclaimer).toBe('Estimate only.');
  });
});
