# SeoSuite GSEO API Endpoint Spec v1

### TL;DR

GSEO API, SeoSuite’in CMS-agnostik SEO ve AI visibility intelligence katmanıdır. Bu doküman Phase 0 için API sözleşmelerini, auth modelini, quota davranışını, scoring response formatını, semantic enrichment, internal linking, AI visibility readiness ve NeuronWriter provider endpointlerini tanımlar.

Amaç, WordPress plugin, Next.js SDK, dashboard, embeddable widget ve custom CMS entegrasyonlarının aynı API core üzerinden çalışmasını sağlamaktır.

---

## Goals

### Business Goals

* SeoSuite’in API-first konumlandırmasını teknik sözleşmeye dönüştürmek.
* GMedya müşterileri, ajanslar ve geliştiriciler için platformdan bağımsız entegrasyon modeli sağlamak.
* Phase 0 geliştirmesinde belirsizliği azaltmak ve AGY implementasyonunu hızlandırmak.
* Scoring Model v1.1 çıktısını ürün API’sine bağlamak.
* WordPress, Next.js ve custom entegrasyonları aynı response modeliyle beslemek.

### User Goals

* Geliştiriciler, tek endpoint ile URL veya içerik skoru alabilmeli.
* SEO ekipleri, issue ve recommendation objelerini dashboard veya CMS içinde gösterebilmeli.
* Ajans yöneticileri, tenant/site/page bazlı score history ve quota kullanımını takip edebilmeli.
* İçerik ekipleri, semantic ve NeuronWriter destekli önerileri editör akışında görebilmeli.
* Ürün ekipleri, AI visibility readiness skorlarını güvenli ve abartısız şekilde raporlayabilmeli.

### Non-Goals

* Phase 0’da gerçek zamanlı rank tracking yapılmayacak.
* Phase 0’da backlink database veya keyword database kurulmayacak.
* Phase 0’da ChatGPT, Perplexity veya Gemini sonuçlarından otomatik scraping zorunlu olmayacak.
* Phase 0’da billing provider entegrasyonu tamamlanmayacak; yalnızca quota/usage altyapısı kurulacak.
* Phase 0’da Shopify app store veya WordPress.org public release hedeflenmeyecek.

---

## API Principles

* REST-first: Phase 0’da REST endpointleri önceliklidir.
* JSON-only: Request ve response formatı JSON olmalıdır.
* Versioned API: Tüm endpointler `/v1` prefix’i ile başlamalıdır.
* Tenant-aware: Her request API key üzerinden tenant ve site context’ine bağlanmalıdır.
* Explainable output: Her skor issue, evidence, recommendation ve confidence ile açıklanmalıdır.
* CMS-agnostic core: API core WordPress, Next.js, Shopify veya custom CMS bağımlılığı taşımamalıdır.
* Platform hints: Platforma özel uygulama önerileri `implementationHint` içinde verilmelidir.
* Safe AI language: AI visibility endpointleri garanti değil readiness ölçümü sunmalıdır.

---

## Base URL and Versioning

Production base URL:

```text
https://api.seosuite.app/v1
```

Alternative early deployment:

```text
https://api.prclipper.com/gseo/v1
```

Versioning strategy:

* `/v1`: Phase 0 ve MVP API.
* Breaking change durumunda `/v2` açılmalıdır.
* Score modeli ayrıca `scoreVersion` alanıyla versiyonlanmalıdır.

Example:

```json
{
  "apiVersion": "v1",
  "scoreVersion": "1.1.0"
}
```

---

## Authentication

### API Key Authentication

Phase 0’da ana auth modeli API key olmalıdır.

Header:

```text
Authorization: Bearer gseo_live_xxxxxxxxx
```

Alternative header:

```text
X-GSEO-API-Key: gseo_live_xxxxxxxxx
```

Recommended behavior:

* `Authorization` header öncelikli kabul edilir.
* `X-GSEO-API-Key` legacy/custom client kolaylığı için desteklenebilir.
* API key tenant, site scope ve quota planına bağlanmalıdır.

### API Key Types

| Key Type | Kullanım | Not |
| --- | --- | --- |
| live | Production entegrasyonları | Gerçek quota tüketir |
| test | Test ve staging | Ayrı quota veya sınırlı kullanım |
| internal | GMedya internal tooling | Sadece admin context |

### Scopes

| Scope | Açıklama |
| --- | --- |
| `score:read` | URL ve content scoring çalıştırabilir |
| `site:read` | Site detaylarını okuyabilir |
| `site:write` | Site oluşturabilir/güncelleyebilir |
| `semantic:read` | Semantic analysis çalıştırabilir |
| `links:read` | Internal link suggestion alabilir |
| `ai:read` | AI visibility readiness kontrolü çalıştırabilir |
| `quota:read` | Kullanım/quota bilgisini okuyabilir |
| `webhook:write` | Webhook endpoint yönetebilir |

### Unauthorized Response

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid API key.",
    "requestId": "req_abc123"
  }
}
```

---

## Common Request Context

Birçok endpoint aşağıdaki context alanlarını kabul edebilir.

```json
{
  "siteId": "site_123",
  "url": "https://example.com/blog/sample",
  "locale": "en-US",
  "platform": "nextjs",
  "pageType": "article"
}
```

### Supported Platform Values

* `wordpress`
* `nextjs`
* `shopify`
* `go`
* `custom`
* `unknown`

### Supported Page Type Values

* `homepage`
* `article`
* `product`
* `category`
* `landing_page`
* `documentation`
* `local_business`
* `generic`

---

## Common Response Objects

## Score Module Object

```json
{
  "key": "indexability_crawlability",
  "label": "Indexability & Crawlability",
  "score": 17,
  "maxScore": 20,
  "status": "good",
  "confidence": 0.92
}
```

Status values:

* `excellent`
* `good`
* `needs_improvement`
* `poor`
* `critical`
* `not_available`

## Issue Object

```json
{
  "code": "CANONICAL_MISSING",
  "title": "Canonical tag is missing",
  "severity": "high",
  "module": "technical_seo_metadata",
  "impact": "Duplicate URL variants may be treated as separate pages.",
  "evidence": {
    "expected": "self-referential canonical",
    "found": null
  },
  "recommendation": "Add a self-referential canonical URL generated from the canonical page slug.",
  "implementationHint": {
    "platform": "nextjs",
    "hint": "Add alternates.canonical in generateMetadata for this route."
  },
  "estimatedEffort": "low",
  "estimatedImpact": "high",
  "confidence": 0.95
}
```

Severity values:

* `critical`
* `high`
* `medium`
* `low`
* `info`
* `experimental`

## Recommendation Object

```json
{
  "code": "ADD_BREADCRUMB_SCHEMA",
  "title": "Add BreadcrumbList structured data",
  "module": "technical_seo_metadata",
  "recommendation": "Add BreadcrumbList JSON-LD to clarify site hierarchy.",
  "estimatedEffort": "low",
  "estimatedImpact": "medium",
  "confidence": 0.88
}
```

## Experimental Signal Object

```json
{
  "code": "PERPLEXITY_SOURCE_FIT_LOW",
  "label": "Perplexity citation fit is limited",
  "severity": "experimental",
  "explanation": "The page has limited outbound references and extractable source-backed claims.",
  "confidence": 0.61
}
```

## Provider Enrichment Object

```json
{
  "provider": "neuronwriter",
  "status": "success",
  "contentScore": 72,
  "targetKeyword": "marble countertops",
  "termsAnalyzed": 48,
  "competitorGapsCount": 6,
  "durationMs": 2400
}
```

Provider status values:

* `success`
* `partial`
* `failed`
* `skipped`

---

## Error Model

All errors should follow this shape.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The url field must be a valid absolute URL.",
    "details": {
      "field": "url"
    },
    "requestId": "req_abc123"
  }
}
```

Common error codes:

| Code | HTTP Status | Açıklama |
| --- | --- | --- |
| `UNAUTHORIZED` | 401 | API key eksik veya geçersiz |
| `FORBIDDEN` | 403 | Scope veya tenant erişimi yok |
| `VALIDATION_ERROR` | 400 | Request formatı hatalı |
| `NOT_FOUND` | 404 | Site, page veya snapshot bulunamadı |
| `QUOTA_EXCEEDED` | 429 | Plan kotası aşıldı |
| `RATE_LIMITED` | 429 | Kısa süreli rate limit aşıldı |
| `FETCH_FAILED` | 422 | URL fetch edilemedi |
| `PROVIDER_FAILED` | 502 | NeuronWriter veya external provider hatası |
| `INTERNAL_ERROR` | 500 | Beklenmeyen hata |

---

## Endpoint Groups

## 1\. Health

### GET /health

Amaç: API servisinin çalıştığını doğrulamak.

Response:

```json
{
  "status": "ok",
  "apiVersion": "v1",
  "timestamp": "2026-06-10T12:00:00Z"
}
```

---

## 2\. API Keys and Auth

### GET /auth/me

Amaç: API key’in bağlı olduğu tenant, site scope ve izinleri döndürmek.

Required scope: any valid key

Response:

```json
{
  "tenantId": "tenant_123",
  "keyId": "key_123",
  "keyType": "live",
  "scopes": \["score:read", "site:read", "quota:read"\],
  "allowedSiteIds": \["site_123"\],
  "plan": "professional"
}
```

### POST /api-keys

Amaç: Dashboard/admin context üzerinden yeni API key oluşturmak.

Required scope: `site:write`

Request:

```json
{
  "name": "WordPress Production Key",
  "siteId": "site_123",
  "keyType": "live",
  "scopes": \["score:read", "semantic:read", "links:read"\]
}
```

Response:

```json
{
  "keyId": "key_456",
  "apiKey": "gseo_live_xxxxxxxxx",
  "name": "WordPress Production Key",
  "createdAt": "2026-06-10T12:00:00Z"
}
```

Security note:

* Full API key only once returned.
* Store hashed key in DB.
* Display only prefix later.

---

## 3\. Sites

### POST /sites

Amaç: Tenant altında yeni site oluşturmak.

Required scope: `site:write`

Request:

```json
{
  "name": "EfesusStone",
  "baseUrl": "https://efesusstone.com",
  "platform": "nextjs",
  "defaultLocale": "en-US"
}
```

Response:

```json
{
  "siteId": "site_123",
  "tenantId": "tenant_123",
  "name": "EfesusStone",
  "baseUrl": "https://efesusstone.com",
  "platform": "nextjs",
  "defaultLocale": "en-US",
  "createdAt": "2026-06-10T12:00:00Z"
}
```

### GET /sites

Amaç: Tenant altındaki siteleri listelemek.

Required scope: `site:read`

Response:

```json
{
  "sites": \[
    {
      "siteId": "site_123",
      "name": "EfesusStone",
      "baseUrl": "https://efesusstone.com",
      "platform": "nextjs",
      "latestAverageScore": 82
    }
  \]
}
```

### GET /sites/{siteId}

Amaç: Site detaylarını almak.

Required scope: `site:read`

Response:

```json
{
  "siteId": "site_123",
  "name": "EfesusStone",
  "baseUrl": "https://efesusstone.com",
  "platform": "nextjs",
  "defaultLocale": "en-US",
  "createdAt": "2026-06-10T12:00:00Z",
  "updatedAt": "2026-06-10T12:00:00Z"
}
```

---

## 4\. Score

## POST /score/url

Amaç: Canlı bir URL’yi fetch ederek Scoring Model v1.1’e göre analiz etmek.

Required scope: `score:read`

Request:

```json
{
  "siteId": "site_123",
  "url": "https://example.com/blog/marble-countertops",
  "targetKeyword": "marble countertops",
  "locale": "en-US",
  "platform": "nextjs",
  "pageType": "article",
  "options": {
    "renderJavascript": false,
    "includePerformance": true,
    "includeSemantic": true,
    "includeNeuronWriter": true,
    "includeAiVisibility": true,
    "saveSnapshot": true
  }
}
```

Response:

```json
{
  "snapshotId": "snap_123",
  "apiVersion": "v1",
  "scoreVersion": "1.1.0",
  "siteId": "site_123",
  "url": "https://example.com/blog/marble-countertops",
  "normalizedUrl": "https://example.com/blog/marble-countertops",
  "platform": "nextjs",
  "pageType": "article",
  "locale": "en-US",
  "finalScore": 78,
  "scoreBand": "good",
  "modules": \[
    {
      "key": "indexability_crawlability",
      "label": "Indexability & Crawlability",
      "score": 18,
      "maxScore": 20,
      "status": "good",
      "confidence": 0.94
    },
    {
      "key": "technical_seo_metadata",
      "label": "Technical SEO & Metadata",
      "score": 15,
      "maxScore": 20,
      "status": "needs_improvement",
      "confidence": 0.9
    },
    {
      "key": "content_quality_intent",
      "label": "Content Quality & Intent",
      "score": 16,
      "maxScore": 20,
      "status": "good",
      "confidence": 0.78
    },
    {
      "key": "semantic_coverage",
      "label": "Semantic Coverage",
      "score": 11,
      "maxScore": 15,
      "status": "needs_improvement",
      "confidence": 0.72
    },
    {
      "key": "page_experience_performance",
      "label": "Page Experience & Performance",
      "score": 8,
      "maxScore": 10,
      "status": "good",
      "confidence": 0.82
    },
    {
      "key": "internal_linking_architecture",
      "label": "Internal Linking & Site Architecture",
      "score": 7,
      "maxScore": 10,
      "status": "good",
      "confidence": 0.75
    },
    {
      "key": "ai_visibility_readiness",
      "label": "AI Visibility Readiness",
      "score": 3,
      "maxScore": 5,
      "status": "needs_improvement",
      "confidence": 0.65
    }
  \],
  "topIssues": \[
    {
      "code": "ARTICLE_SCHEMA_MISSING",
      "title": "Article structured data is missing",
      "severity": "medium",
      "module": "technical_seo_metadata",
      "impact": "Search engines may have less structured context about this article.",
      "evidence": {
        "pageType": "article",
        "detectedJsonLdTypes": \["BreadcrumbList"\]
      },
      "recommendation": "Add BlogPosting or Article JSON-LD with headline, image, author, datePublished and dateModified.",
      "implementationHint": {
        "platform": "nextjs",
        "hint": "Render BlogPosting JSON-LD inside page.tsx using a sanitized application/ld+json script."
      },
      "estimatedEffort": "low",
      "estimatedImpact": "medium",
      "confidence": 0.9
    }
  \],
  "quickWins": \[
    {
      "code": "ADD_BREADCRUMB_SCHEMA",
      "title": "Add BreadcrumbList structured data",
      "estimatedEffort": "low",
      "estimatedImpact": "medium"
    }
  \],
  "nextActions": \[
    "Add BlogPosting JSON-LD",
    "Add 2 relevant internal links from cluster pages",
    "Expand content with missing semantic subtopics"
  \],
  "providerEnrichments": \[
    {
      "provider": "neuronwriter",
      "status": "success",
      "contentScore": 72,
      "termsAnalyzed": 48,
      "competitorGapsCount": 6,
      "durationMs": 2400
    }
  \],
  "experimentalSignals": \[
    {
      "code": "PERPLEXITY_SOURCE_FIT_LOW",
      "label": "Perplexity citation fit is limited",
      "severity": "experimental",
      "explanation": "The page has limited source-backed statements and outbound references.",
      "confidence": 0.61
    }
  \],
  "platformReadiness": {
    "chatgpt": 0.68,
    "perplexity": 0.54,
    "googleAiOverviews": 0.72,
    "bingCopilot": 0.66
  },
  "durationMs": 5300,
  "createdAt": "2026-06-10T12:00:00Z"
}
```

## POST /score/content

Amaç: CMS editörü içindeki henüz yayınlanmamış içeriği analiz etmek.

Required scope: `score:read`

Request:

```json
{
  "siteId": "site_123",
  "contentId": "draft_789",
  "url": "https://example.com/blog/draft-url",
  "title": "Marble Countertops Guide",
  "metaDescription": "A practical guide to choosing marble countertops.",
  "html": "<article><h1>Marble Countertops Guide</h1><p>...</p></article>",
  "targetKeyword": "marble countertops",
  "locale": "en-US",
  "platform": "wordpress",
  "pageType": "article",
  "options": {
    "includeSemantic": true,
    "includeNeuronWriter": true,
    "includeAiVisibility": true,
    "saveSnapshot": false
  }
}
```

Response: Same shape as `/score/url`, but fetch/indexability fields may be marked `not_available` if no live URL exists.

Important rule:

* Draft content scoring should not penalize unavailable live sitemap or HTTP status too aggressively.
* Response must include `sourceType: "draft_content"`.

---

## 5\. Semantic Analysis

## POST /semantic/analyze

Amaç: İçeriğin target keyword/topic etrafında semantic coverage, entity coverage ve content gaps durumunu analiz etmek.

Required scope: `semantic:read`

Request:

```json
{
  "siteId": "site_123",
  "url": "https://example.com/blog/marble-countertops",
  "html": "<article>...</article>",
  "targetKeyword": "marble countertops",
  "locale": "en-US",
  "options": {
    "useNeuronWriter": true,
    "includeCompetitorGaps": true
  }
}
```

Response:

```json
{
  "semanticScore": 73,
  "targetKeyword": "marble countertops",
  "primaryTopic": "marble countertops",
  "terms": \[
    {
      "term": "natural stone",
      "category": "basic",
      "importance": "high",
      "used": true,
      "usageCount": 3
    },
    {
      "term": "sealing",
      "category": "complementary",
      "importance": "medium",
      "used": false,
      "usageCount": 0
    }
  \],
  "missingEntities": \["maintenance", "durability", "cost comparison"\],
  "competitorGaps": \[
    "maintenance requirements",
    "marble vs quartz comparison",
    "sealing frequency"
  \],
  "recommendations": \[
    {
      "code": "SEMANTIC_GAP_DETECTED",
      "title": "Important subtopics are missing",
      "recommendation": "Add a practical section covering maintenance, sealing frequency and durability trade-offs.",
      "estimatedEffort": "medium",
      "estimatedImpact": "high",
      "confidence": 0.82
    }
  \],
  "providerEnrichment": {
    "provider": "neuronwriter",
    "status": "success"
  }
}
```

Fallback rule:

* If NeuronWriter is unavailable, return `providerEnrichment.status = "failed"` and run internal basic semantic analyzer.
* Do not fail the whole endpoint only because provider enrichment failed.

---

## 6\. Internal Links

## POST /internal-links/suggest

Amaç: Bir URL veya draft content için site içi link önerileri üretmek.

Required scope: `links:read`

Request:

```json
{
  "siteId": "site_123",
  "sourceUrl": "https://example.com/blog/marble-countertops",
  "sourceHtml": "<article>...</article>",
  "targetKeyword": "marble countertops",
  "pageType": "article",
  "options": {
    "maxSuggestions": 10,
    "includeAnchorSuggestions": true,
    "excludeUrls": \["https://example.com/contact"\]
  }
}
```

Response:

```json
{
  "sourceUrl": "https://example.com/blog/marble-countertops",
  "suggestions": \[
    {
      "targetUrl": "https://example.com/products/calacatta-marble",
      "anchorSuggestion": "Calacatta marble countertop options",
      "reason": "The target product page is semantically related to marble countertop selection intent.",
      "relationship": "article_to_product",
      "confidence": 0.82,
      "estimatedImpact": "medium"
    }
  \],
  "orphanRisk": false,
  "siteGraphStatus": "partial",
  "createdAt": "2026-06-10T12:00:00Z"
}
```

Phase 0 note:

* Site graph may initially be built from submitted URLs and previous score snapshots.
* Full crawler can be added in a later phase.

---

## 7\. AI Visibility

## POST /ai-visibility/check

Amaç: Bir sayfa veya içerik için AI visibility readiness değerlendirmesi yapmak.

Required scope: `ai:read`

Request:

```json
{
  "siteId": "site_123",
  "url": "https://example.com/blog/marble-countertops",
  "html": "<article>...</article>",
  "brandName": "Example Brand",
  "targetQuery": "best marble countertops",
  "locale": "en-US",
  "options": {
    "includePlatformReadiness": true,
    "includeExperimentalSignals": true
  }
}
```

Response:

```json
{
  "aiVisibilityReadinessScore": 64,
  "disclaimer": "This score estimates AI visibility readiness, not guaranteed visibility in AI answers.",
  "signals": {
    "answerability": 0.72,
    "citationReadiness": 0.58,
    "entityClarity": 0.7,
    "aiParseability": 0.84,
    "brandTrustSignals": 0.55
  },
  "platformReadiness": {
    "chatgpt": 0.68,
    "perplexity": 0.54,
    "googleAiOverviews": 0.72,
    "bingCopilot": 0.66
  },
  "experimentalSignals": \[
    {
      "code": "THIRD_PARTY_MENTION_GAP",
      "label": "Third-party mention coverage appears limited",
      "severity": "experimental",
      "explanation": "The brand or topic has limited signals from external references in the submitted context.",
      "confidence": 0.56
    }
  \],
  "recommendations": \[
    {
      "code": "ADD_EXTRACTABLE_ANSWER_BLOCK",
      "title": "Add a concise answer block",
      "recommendation": "Add a 40–80 word direct answer near the top of the article summarizing the key decision criteria.",
      "estimatedEffort": "low",
      "estimatedImpact": "medium",
      "confidence": 0.79
    }
  \]
}
```

Important product rule:

* Never claim guaranteed AI citation.
* Mark platform-specific citation pattern insights as `experimental` unless backed by first-party measurement.

---

## 8\. NeuronWriter Provider

## POST /nw/enrich

Amaç: NeuronWriter veya proxy provider’dan semantic SEO enrichment almak ve SeoSuite normalized modele çevirmek.

Required scope: `semantic:read`

Request:

```json
{
  "siteId": "site_123",
  "targetKeyword": "marble countertops",
  "url": "https://example.com/blog/marble-countertops",
  "html": "<article>...</article>",
  "locale": "en-US"
}
```

Response:

```json
{
  "provider": "neuronwriter",
  "status": "success",
  "targetKeyword": "marble countertops",
  "contentScore": 72,
  "terms": \[
    {
      "term": "natural stone",
      "category": "basic",
      "importance": "high",
      "used": true,
      "usageCount": 3
    },
    {
      "term": "sealing",
      "category": "complementary",
      "importance": "medium",
      "used": false,
      "usageCount": 0
    }
  \],
  "competitorGaps": \[
    "maintenance",
    "durability",
    "cost comparison"
  \],
  "recommendedHeadings": \[
    "How often should marble countertops be sealed?",
    "Marble vs quartz: which is better for kitchens?"
  \],
  "durationMs": 2400
}
```

Provider failure response:

```json
{
  "provider": "neuronwriter",
  "status": "failed",
  "error": {
    "code": "PROVIDER_FAILED",
    "message": "NeuronWriter provider is temporarily unavailable."
  },
  "fallbackAvailable": true
}
```

---

## 9\. Score History

## GET /sites/{siteId}/scores

Amaç: Site altındaki son skor snapshotlarını listelemek.

Required scope: `site:read`

Query params:

* `pageType`
* `url`
* `limit`
* `cursor`
* `from`
* `to`

Response:

```json
{
  "scores": \[
    {
      "snapshotId": "snap_123",
      "url": "https://example.com/blog/marble-countertops",
      "pageType": "article",
      "finalScore": 78,
      "scoreBand": "good",
      "criticalIssues": 0,
      "highIssues": 2,
      "createdAt": "2026-06-10T12:00:00Z"
    }
  \],
  "pageInfo": {
    "hasNextPage": false,
    "endCursor": null
  }
}
```

## GET /scores/{snapshotId}

Amaç: Tek bir score snapshot detayını almak.

Required scope: `score:read`

Response:

* Same shape as `/score/url` response.

---

## 10\. Quota and Usage

## GET /quota

Amaç: API key veya tenant için quota kullanımını göstermek.

Required scope: `quota:read`

Response:

```json
{
  "tenantId": "tenant_123",
  "plan": "professional",
  "period": {
    "start": "2026-06-01T00:00:00Z",
    "end": "2026-06-30T23:59:59Z"
  },
  "usage": {
    "scoreRequests": 420,
    "scoreRequestsLimit": 5000,
    "semanticRequests": 180,
    "semanticRequestsLimit": 2000,
    "aiVisibilityChecks": 60,
    "aiVisibilityChecksLimit": 500,
    "providerEnrichments": 95,
    "providerEnrichmentsLimit": 1000
  },
  "rateLimit": {
    "limitPerMinute": 60,
    "remaining": 52,
    "resetAt": "2026-06-10T12:01:00Z"
  }
}
```

Quota exceeded response:

```json
{
  "error": {
    "code": "QUOTA_EXCEEDED",
    "message": "Monthly score request quota exceeded for this plan.",
    "details": {
      "metric": "scoreRequests",
      "limit": 5000,
      "used": 5000
    },
    "requestId": "req_abc123"
  }
}
```

---

## 11\. Webhooks

Phase 0’da webhook altyapısı basit tutulabilir; ancak event modeli şimdiden tanımlanmalıdır.

## POST /webhooks

Amaç: Tenant/site için webhook endpoint kaydetmek.

Required scope: `webhook:write`

Request:

```json
{
  "siteId": "site_123",
  "url": "https://example.com/api/seosuite-webhook",
  "events": \["score.completed", "score.failed", "recommendation.created"\],
  "secret": "whsec_xxxxxxxxx"
}
```

Response:

```json
{
  "webhookId": "wh_123",
  "siteId": "site_123",
  "url": "https://example.com/api/seosuite-webhook",
  "events": \["score.completed", "score.failed", "recommendation.created"\],
  "createdAt": "2026-06-10T12:00:00Z"
}
```

### Webhook Event Shape

```json
{
  "eventId": "evt_123",
  "type": "score.completed",
  "createdAt": "2026-06-10T12:00:00Z",
  "tenantId": "tenant_123",
  "siteId": "site_123",
  "data": {
    "snapshotId": "snap_123",
    "url": "https://example.com/blog/marble-countertops",
    "finalScore": 78,
    "scoreBand": "good"
  }
}
```

Recommended headers:

```text
X-GSEO-Event: score.completed
X-GSEO-Signature: t=timestamp,v1=signature
```

### Initial Webhook Events

| Event | Açıklama |
| --- | --- |
| `score.completed` | URL veya content score tamamlandı |
| `score.failed` | Score işlemi hata aldı |
| `recommendation.created` | Yeni öneri üretildi |
| `quota.threshold_reached` | Kullanım belirli eşiği geçti |
| `provider.failed` | External provider enrichment başarısız oldu |

---

## Issue Code Registry v1

Initial issue codes:

### Indexability

* `HTTP_STATUS_NOT_200`
* `ROBOTS_BLOCKED`
* `META_NOINDEX_FOUND`
* `META_NOFOLLOW_FOUND`
* `CANONICAL_MISSING`
* `CANONICAL_CONFLICT`
* `SITEMAP_NOT_FOUND`
* `URL_NOT_IN_SITEMAP`
* `JS_RENDER_RISK`
* `DUPLICATE_URL_RISK`

### Technical SEO & Metadata

* `TITLE_MISSING`
* `TITLE_TOO_SHORT`
* `TITLE_TOO_LONG`
* `TITLE_DUPLICATE`
* `META_DESCRIPTION_MISSING`
* `META_DESCRIPTION_DUPLICATE`
* `H1_MISSING`
* `MULTIPLE_H1_DETECTED`
* `HEADING_STRUCTURE_WEAK`
* `OG_METADATA_INCOMPLETE`
* `TWITTER_CARD_INCOMPLETE`
* `JSON_LD_INVALID`
* `ARTICLE_SCHEMA_MISSING`
* `PRODUCT_SCHEMA_MISSING`
* `ORGANIZATION_SCHEMA_MISSING`
* `BREADCRUMB_SCHEMA_MISSING`

Do not use as scoring penalties:

* `FAQ_SCHEMA_MISSING`
* `FAQ_RICH_RESULT_OPPORTUNITY`

Use instead:

* `ANSWER_BLOCK_OPPORTUNITY`
* `USER_QUESTION_COVERAGE_OPPORTUNITY`

### Content

* `SEARCH_INTENT_MISMATCH`
* `THIN_CONTENT_RISK`
* `CONTENT_DEPTH_LOW`
* `READABILITY_WEAK`
* `EEAT_SIGNALS_WEAK`
* `CONTENT_OUTDATED`
* `INFORMATION_GAIN_LOW`
* `KEYWORD_STUFFING_RISK`

### Semantic

* `SEMANTIC_GAP_DETECTED`
* `ENTITY_COVERAGE_LOW`
* `NLP_TERM_COVERAGE_LOW`
* `HEADING_TERM_COVERAGE_LOW`
* `COMPETITOR_GAP_UNCOVERED`

### Internal Links

* `ORPHAN_PAGE_RISK`
* `INTERNAL_LINKS_LOW`
* `BROKEN_INTERNAL_LINK_FOUND`
* `ANCHOR_TEXT_WEAK`
* `TOPIC_CLUSTER_LINK_MISSING`

### Performance

* `LCP_POOR`
* `INP_POOR`
* `CLS_POOR`
* `MOBILE_VIEWPORT_MISSING`
* `HTTPS_MISSING`
* `MIXED_CONTENT_FOUND`
* `IMAGE_OPTIMIZATION_WEAK`

### AI Visibility

* `ANSWERABILITY_LOW`
* `CITATION_READINESS_LOW`
* `ENTITY_CLARITY_LOW`
* `AI_PARSEABILITY_LOW`
* `BRAND_TRUST_SIGNALS_WEAK`
* `THIRD_PARTY_MENTION_GAP`
* `PERPLEXITY_SOURCE_FIT_LOW`
* `CHATGPT_ENTITY_FIT_LOW`
* `GOOGLE_AIO_READINESS_LOW`

---

## Rate Limiting

Recommended Phase 0 defaults:

| Plan | Requests / Minute | Monthly Score Requests |
| --- | --- | --- |
| Free | 10 | 100 |
| Starter | 30 | 1,000 |
| Professional | 60 | 5,000 |
| Agency | 120 | 25,000 |

Rate limit headers:

```text
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 52
X-RateLimit-Reset: 1718020860
```

---

## Data Storage Requirements

Minimum persisted entities for this API spec:

* Tenant
* User
* Site
* ApiKey
* QuotaUsage
* ScoreSnapshot
* ScoreModuleResult
* AuditIssue
* Recommendation
* ProviderEnrichment
* InternalLinkOpportunity
* WebhookEndpoint
* WebhookEventLog

ScoreSnapshot minimum fields:

```json
{
  "snapshotId": "snap_123",
  "tenantId": "tenant_123",
  "siteId": "site_123",
  "url": "https://example.com/blog/sample",
  "normalizedUrl": "https://example.com/blog/sample",
  "pageType": "article",
  "platform": "nextjs",
  "locale": "en-US",
  "scoreVersion": "1.1.0",
  "finalScore": 78,
  "moduleScores": {},
  "issues": \[\],
  "recommendations": \[\],
  "providerEnrichments": \[\],
  "experimentalSignals": \[\],
  "createdAt": "2026-06-10T12:00:00Z"
}
```

Privacy rule:

* Full fetched HTML should not be stored long-term by default.
* Store extracted metadata, issue evidence, normalized terms and score snapshot.
* Third-party provider credentials must be encrypted at rest.

---

## User Experience

### Entry Point & First-Time Developer Experience

* Developer creates a site in dashboard or via `/sites`.
* Developer creates API key with relevant scopes.
* Developer calls `/auth/me` to verify key.
* Developer runs first `/score/url` request.
* API returns final score, module scores, issues and next actions.
* Developer integrates response into WordPress plugin, Next.js SDK or custom dashboard.

### Core Experience

* Step 1: Register site

  * User provides site name, base URL, platform and locale.
  * API validates base URL.
  * Site receives `siteId`.

* Step 2: Generate API key

  * User selects scopes and environment.
  * API returns key once.
  * WordPress/Next.js stores key securely.

* Step 3: Score URL or draft content

  * CMS sends URL, HTML or metadata context.
  * API runs fetch/parser/scoring modules.
  * Optional providers enrich semantic data.

* Step 4: Show prioritized recommendations

  * UI displays score band and module breakdown.
  * Critical issues appear first.
  * Quick wins appear separately.
  * Platform-specific implementation hints guide the user.

* Step 5: Rescore after fix

  * User applies recommendation.
  * CMS or dashboard triggers rescore.
  * Score delta is tracked.

### Advanced Features & Edge Cases

* Draft content without live URL should skip strict indexability penalties.
* Provider failure should degrade gracefully.
* AI visibility signals should be marked as readiness, not guarantee.
* Platform-specific hints should not change core scoring logic.
* FAQPage should not be treated as required schema after 2026 deprecation.

---

## Success Metrics

### User-Centric Metrics

* First successful API score request within 10 minutes of key generation.
* At least 80% of score responses include one or more actionable recommendations.
* CMS users can understand top issues without reading API documentation.

### Business Metrics

* 5 internal GMedya sites onboarded during dogfooding.
* 3 external beta customers or WordPress/Next.js projects tested.
* At least 50 recurring URLs tracked across tenant accounts.

### Technical Metrics

* `/score/url` p95 response time under 8 seconds without JS rendering.
* `/score/content` p95 response time under 4 seconds.
* Error rate under 2% excluding invalid customer URLs.
* Provider failure does not fail core scoring in at least 95% of cases.

### Tracking Plan

Events to track:

* `api_key_created`
* `site_created`
* `score_requested`
* `score_completed`
* `score_failed`
* `issue_detected`
* `recommendation_generated`
* `recommendation_viewed`
* `recommendation_applied`
* `rescore_requested`
* `semantic_analysis_completed`
* `neuronwriter_enrichment_requested`
* `ai_visibility_check_completed`
* `quota_threshold_reached`
* `webhook_delivered`
* `webhook_failed`

---

## Technical Considerations

### Technical Needs

* API gateway or route handlers
* API key middleware
* Scope and tenant resolver
* Quota middleware
* URL fetcher
* HTML parser
* Metadata parser
* Robots.txt parser
* Sitemap parser
* JSON-LD parser
* Content extractor
* Scoring engine service
* Recommendation engine
* NeuronWriter provider adapter
* Webhook dispatcher
* Snapshot persistence layer

### Integration Points

* WordPress plugin
* Next.js TypeScript SDK
* NeuronWriter proxy/API
* PageSpeed Insights or Lighthouse later in Phase 1
* Google Search Console later phase
* Dashboard frontend

### Data Storage & Privacy

* API keys must be hashed.
* Provider credentials must be encrypted.
* Request logs must avoid storing full HTML by default.
* Tenant isolation must be enforced by API middleware and DB queries.
* RLS should be considered if PostgreSQL is used.

### Scalability & Performance

* Score jobs may be synchronous in Phase 0 for basic URLs.
* Long-running JS rendering or full audit should become async job later.
* Provider enrichment should have timeout and fallback.
* Cache repeated URL fetches for short windows where safe.

### Potential Challenges

* External URLs may block fetchers.
* JavaScript-heavy pages may need renderer support.
* NeuronWriter provider availability and rate limits may vary.
* AI visibility scoring can be misinterpreted as guarantee.
* Schema rules change over time and require versioned rulesets.

---

## Milestones & Sequencing

### Project Estimate

Small to Medium: 1–2 weeks for API contract implementation skeleton, assuming Phase 0 PRD is already approved.

### Team Size & Composition

Lean team:

* 1 full-stack engineer
* 1 product/SEO owner
* Optional part-time QA/SEO reviewer

### Suggested Phases

## Phase 1: API Foundation (2–3 days)

Key Deliverables:

* `/health`
* API key middleware
* tenant/site context resolver
* quota middleware skeleton
* shared response/error models

Dependencies:

* DB schema
* API key generation logic

## Phase 2: Site and Score Core (3–4 days)

Key Deliverables:

* `/sites`
* `/score/url`
* `/score/content`
* ScoreSnapshot persistence
* issue/recommendation object format

Dependencies:

* URL fetcher
* HTML parser
* scoring engine skeleton

## Phase 3: Semantic, Internal Links and AI Readiness (3–5 days)

Key Deliverables:

* `/semantic/analyze`
* `/internal-links/suggest`
* `/ai-visibility/check`
* experimental signal model
* platform readiness model

Dependencies:

* content extractor
* internal link graph basics
* semantic analyzer fallback

## Phase 4: Provider and Webhooks (2–3 days)

Key Deliverables:

* `/nw/enrich`
* provider status model
* webhook registration
* webhook event delivery skeleton

Dependencies:

* provider credentials
* webhook signing helper

## Phase 5: QA and Documentation (2 days)

Key Deliverables:

* endpoint smoke tests
* example requests/responses
* Postman or OpenAPI draft
* WordPress and Next.js integration examples

Dependencies:

* sample URLs
* internal dogfooding site

---

## Open Questions

* API base domain başlangıçta `api.seosuite.app` mi yoksa `api.prclipper.com/gseo` mu olacak?
* Phase 0’da score işlemleri tamamen synchronous mı kalacak, yoksa async job modeli de kurulacak mı?
* API key oluşturma dashboard üzerinden mi, yoksa sadece admin seed/script ile mi yapılacak?
* NeuronWriter credential tenant bazlı mı yoksa GMedya shared provider key ile mi yönetilecek?
* WordPress plugin draft content için HTML mi gönderecek, yoksa Gutenberg block JSON da desteklenecek mi?
* PageSpeed/Lighthouse entegrasyonu Phase 0’a mı, Phase 1’e mi alınacak?
* Webhook delivery Phase 0’da gerçek implementasyon mu, yoksa event log skeleton mı olacak?

---

## Final Recommendation

Phase 0 için minimum uygulanabilir API seti şu olmalıdır:

* `GET /health`
* `GET /auth/me`
* `POST /sites`
* `GET /sites`
* `POST /score/url`
* `POST /score/content`
* `GET /quota`

İkinci dalga endpointler:

* `POST /semantic/analyze`
* `POST /internal-links/suggest`
* `POST /ai-visibility/check`
* `POST /nw/enrich`
* `GET /sites/{siteId}/scores`
* `POST /webhooks`

Bu sıralama, önce API core ve scoring değerini kanıtlamayı; ardından semantic, AI visibility ve entegrasyon katmanlarını genişletmeyi sağlar.