import { describe, it, expect } from 'vitest';
import { normalizeScoreResult } from '../types';

describe('normalizeScoreResult', () => {
  it('unwraps API envelope', () => {
    const result = normalizeScoreResult({
      success: true,
      data: {
        url: 'https://example.com/page',
        finalScore: 82,
        scoreBand: 'good',
        topIssues: [{ code: 'META_DESC', title: 'Missing description', severity: 'high' }],
        quickWins: [{ title: 'Add meta', recommendation: 'Write a description' }],
      },
    });

    expect(result.finalScore).toBe(82);
    expect(result.scoreBand).toBe('good');
    expect(result.topIssues).toHaveLength(1);
  });

  it('handles raw data object', () => {
    const result = normalizeScoreResult({
      url: 'https://example.com',
      finalScore: 50,
      scoreBand: 'needs_improvement',
      topIssues: [],
      quickWins: [],
    });

    expect(result.finalScore).toBe(50);
  });
});
