# API Examples

This document demonstrates how to interact directly with the SeoSuite API.

> [!WARNING]
> **Important Disclaimers:**
> - AI visibility is strictly a **readiness score**. Visibility on ChatGPT, Perplexity, Google AIO, or Bing Copilot is **not guaranteed**.
> - NeuronWriter enrichments may return mocked fallback data in non-production environments; this is not real production data.
> - Headless rendering of JavaScript-heavy apps is out of scope for Phase 2. Ensure your target pages return HTML from the server to get accurate scores.

## 1. Score a Live URL (`/score/url`)

**cURL Example:**
```bash
curl -X POST "https://api.seosuite.app/v1/score/url" \
  -H "Authorization: Bearer gseo_live_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/blog/seo-audit",
    "targetKeyword": "seo audit",
    "options": {
      "includeNeuronWriter": true,
      "storeSnapshot": true
    }
  }'
```

**Response Snippet:**
```json
{
  "success": true,
  "data": {
    "finalScore": 85,
    "scoreBand": "good",
    "topIssues": [ ... ],
    "semanticAnalysis": { ... },
    "aiVisibility": { ... }
  }
}
```

## 2. Score Raw HTML Content (`/score/content`)

Ideal for draft scoring inside a CMS before publishing.

**cURL Example:**
```bash
curl -X POST "https://api.seosuite.app/v1/score/content" \
  -H "Authorization: Bearer gseo_live_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<html><body><h1>My Post</h1><p>Content...</p></body></html>",
    "url": "https://example.com/draft/my-post",
    "targetKeyword": "my post",
    "options": {
      "includeNeuronWriter": true
    }
  }'
```

## 3. Provider Enrichment (`/nw/enrich`)

Get NeuronWriter term suggestions directly.

**cURL Example:**
```bash
curl -X POST "https://api.seosuite.app/v1/nw/enrich" \
  -H "Authorization: Bearer gseo_live_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "targetKeyword": "best practices"
  }'
```
