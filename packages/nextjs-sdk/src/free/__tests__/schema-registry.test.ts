import { describe, it, expect } from 'vitest';
import { buildSchema, buildSchemaGraph } from '../schema-registry';

describe('buildSchema', () => {
  it('builds Organization schema', () => {
    const schema = buildSchema('Organization', {
      name: 'Acme',
      url: 'https://acme.com',
      logo: 'https://acme.com/logo.png',
    });

    expect(schema['@type']).toBe('Organization');
    expect(schema.name).toBe('Acme');
    expect(schema['@context']).toBe('https://schema.org');
  });

  it('builds Article schema with author', () => {
    const schema = buildSchema('Article', {
      url: 'https://acme.com/blog/post',
      headline: 'Hello',
      datePublished: '2026-01-01',
      author: { name: 'Jane Doe' },
    });

    expect(schema['@type']).toBe('Article');
    expect(schema.headline).toBe('Hello');
    expect(schema.author).toEqual([{ '@type': 'Person', name: 'Jane Doe', url: undefined }]);
  });

  it('builds FAQPage schema', () => {
    const schema = buildSchema('FAQPage', {
      items: [
        { question: 'What is SEO?', answer: 'Search engine optimization.' },
      ],
    });

    expect(schema['@type']).toBe('FAQPage');
    expect(schema.mainEntity).toHaveLength(1);
    expect((schema.mainEntity as Array<Record<string, unknown>>)[0].name).toBe('What is SEO?');
  });

  it('builds HowTo schema', () => {
    const schema = buildSchema('HowTo', {
      name: 'Install SDK',
      steps: [{ name: 'Step 1', text: 'Run npm install' }],
    });

    expect(schema['@type']).toBe('HowTo');
    expect(schema.step).toHaveLength(1);
  });
});

describe('buildSchemaGraph', () => {
  it('combines multiple schemas into @graph', () => {
    const graph = buildSchemaGraph([
      { type: 'Organization', props: { name: 'Acme', url: 'https://acme.com' } },
      { type: 'WebSite', props: { name: 'Acme', url: 'https://acme.com' } },
    ]);

    expect(graph['@graph']).toHaveLength(2);
    expect((graph['@graph'] as Array<Record<string, unknown>>)[0]['@type']).toBe('Organization');
  });
});
