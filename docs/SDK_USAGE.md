# SeoSuite SDK Usage Guide

The `@seosuite/client` (or `gseo-client`) provides a strongly typed TypeScript interface for interacting with the API from your Node.js or Next.js backend.

> [!WARNING]
> **Security Notice:** The SDK should **only** be used server-side (e.g., Next.js App Router Server Actions, Server Components, or API Routes). Never expose your `gseo_live_*` API key in a client-side bundle.

## Installation

```bash
npm install gseo-client
```

## Initialization

```typescript
import { createClient } from 'gseo-client';

const seosuite = createClient({
  apiKey: process.env.GSEO_API_KEY, // e.g. gseo_live_xxx
  // baseUrl: 'https://api.seosuite.app/v1' // optional
});
```

## Scoring a URL

```typescript
const result = await seosuite.scoreUrl({
  url: 'https://example.com/blog/how-to-seo',
  targetKeyword: 'how to seo',
  options: {
    includeNeuronWriter: true,
    storeSnapshot: true
  }
});

console.log(`Score: ${result.finalScore} / 100 (${result.scoreBand})`);
```

## Scoring Raw HTML (CMS Drafts)

```typescript
const result = await seosuite.scoreContent({
  html: '<main><h1>Draft Title</h1><p>...</p></main>',
  url: 'https://example.com/draft', // Optional, helps with internal link detection
  options: {
    includeNeuronWriter: true,
    storeSnapshot: false // typically false for live drafts
  }
});

console.log('Top Issue:', result.topIssues[0]?.title);
console.log('AI Visibility:', result.aiVisibility?.platformReadiness);
```

## Disclaimers
- **AI Visibility**: The `aiVisibility` output reflects readiness estimates based on structured data and NLP heuristics. It does not guarantee visibility on platforms like ChatGPT, Perplexity, Google AIO, or Bing Copilot.
- **Headless Rendering**: The SDK evaluates the raw HTML provided. Phase 2 does not include headless browser parsing for client-side rendered (CSR) apps.
