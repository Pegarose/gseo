import { describe, it, expect } from 'vitest';
import { defineSeoSuiteConfig } from '../../free/config';
import { serializeAdminConfig } from '../serialize-config';

describe('serializeAdminConfig', () => {
  it('serializes config for client admin UI', () => {
    const config = defineSeoSuiteConfig({
      siteUrl: 'https://example.com',
      siteName: 'Example',
      titleTemplates: { article: '%title% — %sitename%' },
      redirects: [{ source: '/a', destination: '/b', permanent: true }],
    });

    const snapshot = serializeAdminConfig(config);

    expect(snapshot.siteName).toBe('Example');
    expect(snapshot.titleTemplates?.article).toBe('%title% — %sitename%');
    expect(snapshot.redirects).toHaveLength(1);
    expect(snapshot.redirects[0].source).toBe('/a');
  });
});
