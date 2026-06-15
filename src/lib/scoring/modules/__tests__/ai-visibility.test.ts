import { describe, it, expect } from 'vitest';
import { AiVisibilityModule } from '../ai-visibility';
import { ScoreContext } from '../../types';

function buildContext(html: string, url = 'https://example.com/page'): ScoreContext {
  return {
    url,
    normalizedUrl: url,
    pageType: 'article',
    locale: 'en-US',
    platform: 'custom',
    parsed: {
      statusCode: 200,
      headers: {},
      title: 'Test Page',
      metaDescription: 'A test page',
      canonical: url,
      metaRobots: { noindex: false, nofollow: false },
      headings: [{ level: 1, text: 'Test Page' }],
      links: [],
      images: [],
      jsonLd: [],
      rawHtml: html,
      textContent: html.replace(/<[^>]+>/g, ' ').trim(),
    },
    enrichments: [],
    tenantId: 'tenant_test',
  };
}

describe('AiVisibilityModule', () => {
  it('returns a result with platform readiness', async () => {
    const module = new AiVisibilityModule();
    const context = buildContext('<h1>Test</h1><p>This is a test page with enough content to pass entity clarity heuristics.</p>');
    const result = await module.run(context);

    expect(result.key).toBe('ai_visibility_readiness');
    expect(result.aiVisibilityData).toBeDefined();
    expect(result.aiVisibilityData?.platformReadiness.length).toBeGreaterThan(0);
  });

  it('penalizes missing FAQ and structured formatting', async () => {
    const module = new AiVisibilityModule();
    const context = buildContext('<h1>Test</h1><p>Short.</p>');
    const result = await module.run(context);

    const hasAnswerBlockIssue = result.issues.some(i => i.code === 'ANSWER_BLOCK_OPPORTUNITY');
    const hasParseabilityIssue = result.issues.some(i => i.code === 'AI_PARSEABILITY_RISK');

    expect(hasAnswerBlockIssue || hasParseabilityIssue).toBe(true);
  });
});
