# SeoSuite Phase 0 AGY Implementation Prompt

Bu doküman, SeoSuite Phase 0 geliştirmesini başlatmak için AGY veya geliştirici ajanına verilecek uygulama promptudur. Amaç; API-first, CMS-agnostik, multi-tenant SEO ve AI visibility scoring altyapısının ilk çalışan iskeletini kurmaktır.

---

## Role and Mission

You are a senior full-stack engineer building the Phase 0 foundation for SeoSuite, an API-first SEO and AI visibility intelligence platform for GMedya.

Build a lean but production-oriented MVP skeleton. Prioritize clean architecture, extensible scoring modules, multi-tenant data isolation, API key authentication, reliable URL scoring, and integration-ready outputs for WordPress and Next.js.

Do not overbuild. The goal is not to create a complete Semrush/Ahrefs competitor. The goal is to create a solid core that can score URLs/content, store score snapshots, return actionable recommendations, and support future CMS integrations.

---

## Product Context

SeoSuite is a multi-tenant SaaS/API platform for:

* Technical SEO audit
* Indexability and crawlability checks
* Metadata and structured data validation
* Helpful content and search intent checks
* Semantic SEO and NeuronWriter enrichment
* Internal linking suggestions
* AI visibility readiness checks
* WordPress, Next.js, Shopify, Go and custom CMS integrations

The scoring model version for this implementation is:

```text
seosuite-score-v1.1
```

Scoring weights:

| Module | Weight |
| --- | --- |
| Indexability & Crawlability | 20 |
| Technical SEO & Metadata | 20 |
| Content Quality & Intent | 20 |
| Semantic Coverage | 15 |
| Page Experience & Performance | 10 |
| Internal Linking & Site Architecture | 10 |
| AI Visibility Readiness | 5 |

---

## Recommended Tech Direction

Use the simplest stack that supports fast development and future separation.

Preferred Phase 0 setup:

* Next.js app for dashboard and API routes, or a small Node/Fastify API if already preferred
* TypeScript across the codebase
* PostgreSQL for persistence
* Prisma or equivalent ORM
* API key authentication for server-to-server calls
* Basic session/auth placeholder for dashboard users
* Optional Redis later; do not require it for Phase 0
* Modular scoring engine in plain TypeScript

If using a monorepo, use this shape:

```text
/apps
  /web
    /app
    /api
/packages
  /scoring-engine
  /gseo-client
  /shared-types
/plugins
  /wordpress
```

If using a single repo for speed, use this shape:

```text
/seosuite
  /app
  /api
  /lib
    /auth
    /db
    /scoring
    /providers
    /parsers
    /recommendations
  /packages
    /gseo-client
  /plugins
    /wordpress
```

---

## Implementation Principles

* Keep scoring modules independent and testable.
* Every issue must include evidence, severity, recommendation and confidence.
* Critical technical blockers must be evaluated before content recommendations.
* NeuronWriter must be optional, not a hard dependency.
* If provider enrichment fails, fallback semantic analysis must still run.
* AI visibility must be framed as readiness, not guaranteed AI ranking.
* FAQPage schema must not be treated as a priority rich result opportunity in 2026.
* All tenant-owned data must be tenant-scoped.
* Do not store full page HTML long-term by default.
* Store third-party credentials encrypted or create encryption-ready abstraction.

---

## Phase 0 Deliverables

### 1\. Project Skeleton

Create the base project with:

* TypeScript configuration
* Environment variable handling
* Database connection
* API route structure
* Shared types
* Basic error handling
* Logging utility
* Health check endpoint

Required endpoint:

```http
GET /v1/health
```

Example response:

```json
{
  "status": "ok",
  "service": "seosuite-api",
  "version": "0.1.0"
}
```

---

### 2\. Database Schema

Create the initial database models.

Required entities:

* Tenant
* User
* Site
* Page
* ApiKey
* QuotaUsage
* ScoreSnapshot
* ScoreModuleResult
* AuditIssue
* Recommendation
* Integration
* ProviderEnrichment
* InternalLinkOpportunity
* AiVisibilityCheck

Minimum fields:

Tenant

* id
* name
* slug
* plan
* createdAt
* updatedAt

User

* id
* tenantId
* email
* name
* role
* createdAt
* updatedAt

Site

* id
* tenantId
* name
* domain
* platform
* locale
* createdAt
* updatedAt

Allowed platform values:

* wordpress
* nextjs
* shopify
* go
* custom
* unknown

Page

* id
* tenantId
* siteId
* url
* normalizedUrl
* pageType
* targetKeyword
* locale
* lastScoredAt
* createdAt
* updatedAt

Allowed pageType values:

* homepage
* article
* product
* category
* landing
* documentation
* local_business
* unknown

ApiKey

* id
* tenantId
* siteId nullable
* name
* keyHash
* keyPrefix
* scopes
* lastUsedAt
* revokedAt
* createdAt

Never store raw API keys.

ScoreSnapshot

* id
* tenantId
* siteId
* pageId nullable
* url
* normalizedUrl
* scoreVersion
* finalScore
* scoreBand
* pageType
* locale
* platform
* source
* durationMs
* createdAt

ScoreModuleResult

* id
* tenantId
* scoreSnapshotId
* moduleKey
* label
* score
* maxScore
* status
* createdAt

AuditIssue

* id
* tenantId
* scoreSnapshotId
* code
* severity
* module
* title
* impact
* evidenceJson
* recommendation
* implementationHint
* confidence
* createdAt

Severity values:

* critical
* high
* medium
* low
* info
* experimental

Recommendation

* id
* tenantId
* scoreSnapshotId
* code
* title
* module
* severity
* recommendation
* implementationHint
* estimatedEffort
* estimatedImpact
* confidence
* createdAt

Integration

* id
* tenantId
* siteId nullable
* provider
* status
* encryptedCredentials
* configJson
* createdAt
* updatedAt

Providers:

* neuronwriter
* google_search_console
* pagespeed
* wordpress
* nextjs

ProviderEnrichment

* id
* tenantId
* scoreSnapshotId
* provider
* status
* requestMetaJson
* responseMetaJson
* normalizedDataJson
* durationMs
* createdAt

QuotaUsage

* id
* tenantId
* siteId nullable
* endpoint
* units
* date
* createdAt

---

### 3\. API Key Authentication

Implement API key auth for `/v1/*` endpoints except health.

Header format:

```http
Authorization: Bearer gseo_xxxxx
```

Behavior:

* Hash incoming key and compare with stored hash.
* Set request context: tenantId, siteId if scoped, scopes.
* Update lastUsedAt asynchronously if possible.
* Reject revoked keys.
* Return structured errors.

Error response format:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing API key.",
    "requestId": "req_123"
  }
}
```

---

### 4\. Quota Tracking

Implement basic quota tracking middleware.

For Phase 0:

* Track each successful scoring request as 1 unit.
* Store usage per tenant, site, endpoint and date.
* Do not implement billing yet.
* Return quota metadata in scoring responses.

Example:

```json
{
  "quota": {
    "usedToday": 42,
    "limitToday": 1000,
    "unit": "score_request"
  }
}
```

---

## Scoring Engine Architecture

Create a modular scoring engine.

Suggested interface:

```ts
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'experimental';

```

`export interface ScoreContext {`  

`tenantId: string;`  

`siteId?: string;`  

`url?: string;`  

`normalizedUrl?: string;`  

`html?: string;`  

`textContent?: string;`  

`targetKeyword?: string;`  

`locale?: string;`  

`pageType?: string;`  

`platform?: string;`  

`options: ScoreOptions;`  

`parsed: ParsedPage;`  

`enrichments?: ProviderEnrichmentResult[];`  

`}`

`export interface ScoreModuleResult {`  

`key: string;`  

`label: string;`  

`score: number;`  

`maxScore: number;`  

`status: 'excellent' | 'good' | 'needs_improvement' | 'poor' | 'critical';`  

`issues: AuditIssue[];`  

`recommendations: Recommendation[];`  

`}`

`export interface ScoreModule {`  

`key: string;`  

`label: string;`  

`maxScore: number;`  

`run(context: ScoreContext): Promise<ScoreModuleResult>;`  

`}`  

Required modules:

* indexability_crawlability, max 20
* technical_seo_metadata, max 20
* content_quality_intent, max 20
* semantic_coverage, max 15
* page_experience_performance, max 10
* internal_linking_architecture, max 10
* ai_visibility_readiness, max 5

---

## URL Fetcher and Parser

Implement:

* URL normalization
* HTTP fetch with timeout
* Redirect tracking
* Status code capture
* HTML body capture
* Header capture
* Basic robots meta parsing
* Title parsing
* Meta description parsing
* Canonical parsing
* Open Graph parsing
* Twitter card parsing
* H1/H2/H3 extraction
* Link extraction
* Image extraction
* JSON-LD script extraction and parse attempt
* Text content extraction

Do not store full HTML long-term by default. Use it only during scoring.

---

## Module Requirements

### Indexability & Crawlability Module

Max score: 20

Check:

* HTTP 200 status
* 4xx/5xx status
* redirect chain risk
* meta robots noindex/nofollow
* canonical presence and correctness
* robots.txt placeholder check
* sitemap coverage placeholder
* crawlable internal links placeholder
* raw HTML main content presence

Cap rules:

| Condition | Max Final Score |
| --- | --- |
| URL returns 5xx | 25 |
| URL blocked by robots.txt | 35 |
| URL has noindex | 45 |
| Canonical points to unrelated URL | 60 |
| Main content not visible in HTML | 65 |
| Title missing | 80 |
| Spam/thin content risk | 70 |

### Technical SEO & Metadata Module

Max score: 20

Check:

* Title presence and quality
* Meta description presence and quality
* Canonical tag
* H1 presence
* Heading hierarchy
* Open Graph completeness
* Twitter card completeness
* Image alt basics
* JSON-LD presence and validity
* BreadcrumbList when page type benefits from it

Schema priority:

P0 global:

* Organization
* WebSite
* WebPage
* BreadcrumbList

P0/P1 page type:

* Article
* BlogPosting
* Product
* Offer
* LocalBusiness
* CollectionPage

Optional/legacy:

* FAQPage

Do not penalize missing FAQPage schema.

### Content Quality & Intent Module

Max score: 20

Check:

* Search intent alignment if targetKeyword exists
* Content depth
* Readability and structure
* E-E-A-T signals
* Freshness signals
* Source/citation presence
* Information gain indicators
* Spam or over-optimization risk

AI-generated content is not automatically negative. Penalize only low-value, repetitive, unverified or manipulative content.

### Semantic Coverage Module

Max score: 15

Check:

* Primary topic clarity
* NLP term coverage if provider data exists
* Entity coverage
* Heading term coverage
* Competitor gap coverage if provider data exists
* Information gain
* Semantic stuffing risk

NeuronWriter behavior:

* Use provider adapter when enabled and credentials/config exist.
* Normalize provider terms into basic, complementary and contextual.
* If provider fails, continue with fallback semantic analyzer.
* Never recommend mechanical keyword stuffing.

### Page Experience & Performance Module

Max score: 10

Phase 0 can implement placeholders plus basic checks:

* HTTPS
* viewport meta
* large image risk placeholder
* render-blocking risk placeholder
* PageSpeed adapter stub

Core Web Vitals target thresholds for later adapter:

* LCP <= 2.5s
* INP <= 200ms
* CLS <= 0.1

### Internal Linking & Site Architecture Module

Max score: 10

Phase 0 checks:

* Outgoing internal links count
* Anchor text quality basics
* Broken internal link placeholder
* Incoming internal links placeholder
* Orphan page placeholder
* Topic cluster placeholder

Return at least basic internal link suggestions when possible.

### AI Visibility Readiness Module

Max score: 5

Check:

* Answerability
* Citation readiness
* Entity clarity
* AI parseability
* Brand/source trust signals

Also return experimental platform readiness object:

```json
{
  "platformReadiness": {
    "chatgpt": {
      "score": 62,
      "signals": \["entity_clarity", "organization_schema"\]
    },
    "perplexity": {
      "score": 58,
      "signals": \["citation_blocks", "outbound_references"\]
    },
    "googleAiOverviews": {
      "score": 70,
      "signals": \["indexability", "helpful_content", "semantic_coverage"\]
    },
    "bingCopilot": {
      "score": 60,
      "signals": \["schema_validity", "crawlable_html"\]
    }
  }
}
```

Label platform readiness as experimental.

---

## Required API Endpoints

### POST /v1/score/url

Request:

```json
{
  "url": "https://example.com/blog/sample-page",
  "targetKeyword": "marble countertops",
  "locale": "en-US",
  "pageType": "article",
  "platform": "nextjs",
  "options": {
    "includeNeuronWriter": true,
    "includePerformance": false,
    "includeAiVisibility": true,
    "renderJavascript": false,
    "storeSnapshot": true
  }
}
```

Response:

```json
{
  "scoreVersion": "seosuite-score-v1.1",
  "url": "https://example.com/blog/sample-page",
  "normalizedUrl": "https://example.com/blog/sample-page",
  "finalScore": 78,
  "scoreBand": "good",
  "pageType": "article",
  "platform": "nextjs",
  "modules": \[
    {
      "key": "indexability_crawlability",
      "label": "Indexability & Crawlability",
      "score": 18,
      "maxScore": 20,
      "status": "good"
    }
  \],
  "topIssues": \[
    {
      "code": "ARTICLE_JSON_LD_MISSING",
      "severity": "medium",
      "module": "technical_seo_metadata",
      "title": "Article structured data is missing",
      "impact": "Search engines may have less explicit context about the article.",
      "evidence": {
        "detectedSchemas": \["WebPage"\]
      },
      "recommendation": "Add BlogPosting JSON-LD with headline, author, image, datePublished and dateModified.",
      "implementationHint": "In Next.js App Router, render a sanitized application/ld+json script inside page.tsx.",
      "confidence": 0.86
    }
  \],
  "quickWins": \[
    {
      "title": "Add breadcrumb structured data",
      "estimatedEffort": "low",
      "estimatedImpact": "medium"
    }
  \],
  "nextActions": \[
    "Fix missing BlogPosting JSON-LD",
    "Add 2 relevant internal links",
    "Add a concise answer block near the top of the page"
  \],
  "experimentalSignals": \[
    {
      "code": "AI_PLATFORM_READINESS_PARTIAL",
      "severity": "experimental",
      "message": "AI platform readiness is estimated from parseability, entity clarity and citation-friendly structure. It is not a guarantee of AI visibility."
    }
  \],
  "quota": {
    "usedToday": 42,
    "limitToday": 1000,
    "unit": "score_request"
  }
}
```

### POST /v1/score/content

Accept raw content from CMS/plugin when URL fetch is not desired.

Request:

```json
{
  "url": "https://example.com/draft/sample",
  "html": "<article><h1>Sample</h1><p>...</p></article>",
  "metadata": {
    "title": "Sample Title",
    "description": "Sample description"
  },
  "targetKeyword": "sample keyword",
  "locale": "en-US",
  "pageType": "article",
  "platform": "wordpress",
  "options": {
    "includeNeuronWriter": false,
    "includeAiVisibility": true,
    "storeSnapshot": true
  }
}
```

### POST /v1/semantic/analyze

Return semantic analysis only.

### POST /v1/internal-links/suggest

Return internal link suggestions for a source page.

### POST /v1/ai-visibility/check

Return AI readiness and platform readiness only.

### POST /v1/nw/enrich

Use NeuronWriter provider adapter. Must be optional and protected by tenant integration settings.

### GET /v1/sites/:siteId/scores

Return recent score snapshots.

### GET /v1/quota

Return tenant/site quota status.

---

## WordPress Plugin Skeleton

Create a minimal plugin folder under:

```text
/plugins/wordpress/seosuite
```

Required files:

```text
seosuite.php
includes/class-seosuite-settings.php
includes/class-seosuite-api-client.php
includes/class-seosuite-hooks.php
assets/editor-sidebar.js
README.md
```

Required behavior:

* Admin settings page for API key and API base URL.
* Store token in `wp_options` using WordPress options API.
* Add `save_post` hook to trigger content score request for posts/pages.
* Send title, content, excerpt, permalink, post type and target keyword if available.
* Add Gutenberg sidebar placeholder showing latest score and top issues.
* Do not block publishing if API fails.

Security:

* Escape output.
* Use nonces for admin actions.
* Do not expose API key in frontend JavaScript.

---

## TypeScript SDK Skeleton

Create package:

```text
/packages/gseo-client
```

Required exports:

```ts
createGseoClient(config)
scoreUrl(input)
scoreContent(input)
analyzeSemantic(input)
suggestInternalLinks(input)
checkAiVisibility(input)
generateSeoMetadata(input)
renderJsonLd(input)
```

Example usage:

```ts
import { createGseoClient } from '@seosuite/gseo-client';

```

`const gseo = createGseoClient({`  

`apiKey: process.env.GSEO_API_KEY,`  

`baseUrl: process.env.GSEO_API_URL`  

`});`

`const result = await gseo.scoreUrl({`  

`url: 'https://example.com/blog/sample',`  

`targetKeyword: 'marble countertops',`  

`pageType: 'article',`  

`platform: 'nextjs'`  

`});`  

Next.js metadata helper should align with App Router patterns but does not need to be fully published in Phase 0.

---

## Suggested Issue Codes

Implement these initial issue codes:

Critical/high:

* URL_FETCH_FAILED
* HTTP_5XX
* HTTP_4XX
* ROBOTS_BLOCKED
* META_NOINDEX
* CANONICAL_CONFLICT
* MAIN_CONTENT_NOT_VISIBLE
* TITLE_MISSING
* H1_MISSING
* JSON_LD_INVALID

Medium/low:

* META_DESCRIPTION_MISSING
* TITLE_TOO_LONG
* TITLE_TOO_SHORT
* META_DESCRIPTION_DUPLICATE
* OG_IMAGE_MISSING
* TWITTER_CARD_INCOMPLETE
* IMAGE_ALT_MISSING
* HEADING_HIERARCHY_WEAK
* BREADCRUMB_SCHEMA_MISSING
* ARTICLE_JSON_LD_MISSING
* PRODUCT_JSON_LD_MISSING
* CONTENT_DEPTH_LOW
* CONTENT_FRESHNESS_MISSING
* SEMANTIC_GAP_DETECTED
* INTERNAL_LINK_OPPORTUNITY
* ANSWER_BLOCK_OPPORTUNITY

Experimental:

* AI_PLATFORM_READINESS_PARTIAL
* AI_CRAWLER_POLICY_UNKNOWN
* THIRD_PARTY_MENTION_GAP
* PLATFORM_SOURCE_FIT_WEAK

Do not implement:

* FAQ_SCHEMA_MISSING as a scoring penalty
* FAQ_RICH_RESULT_OPPORTUNITY as a Google rich result recommendation

---

## Testing Requirements

Add tests for:

* URL normalization
* Metadata parsing
* JSON-LD parsing success/failure
* Score aggregation
* Cap rules
* Severity mapping
* API key auth failure
* Provider fallback when NeuronWriter fails
* Missing FAQPage does not reduce score
* Noindex caps final score
* 5xx caps final score

Use fixture HTML files for:

* Healthy article page
* Noindex page
* Missing title page
* Invalid JSON-LD page
* Product page with Product schema
* JS-heavy page with weak raw HTML content

---

## Acceptance Criteria

Phase 0 is complete when:

* Database schema can be migrated locally.
* API key can be generated and used for authenticated scoring requests.
* `POST /v1/score/url` returns a complete structured response.
* Score snapshots and issues are stored when `storeSnapshot` is true.
* Critical cap rules work.
* Missing FAQPage does not create a penalty.
* NeuronWriter adapter can be enabled, disabled or fail without breaking scoring.
* TypeScript SDK can call `scoreUrl` successfully.
* WordPress plugin skeleton can store API key and trigger a score request on `save_post`.
* Basic dashboard can show recent score snapshots or at least an internal admin route can list them.
* README documents setup, environment variables and example API calls.

---

## Environment Variables

Use environment variables similar to:

```text
DATABASE_URL=
APP_URL=
GSEO_API_BASE_URL=
API_KEY_SECRET=
ENCRYPTION_SECRET=
NEURONWRITER_API_KEY=
PAGESPEED_API_KEY=
NODE_ENV=
```

Do not commit secrets.

---

## Documentation to Produce

Create or update:

* README.md
* API examples
* Database setup instructions
* Local development instructions
* Scoring module architecture notes
* WordPress plugin setup notes
* TypeScript SDK usage example

---

## Build Order

Follow this order:

1. Project skeleton and database schema
2. API key auth and tenant context
3. URL fetcher and parser
4. Scoring module interfaces
5. Indexability and technical metadata modules
6. Score aggregation and cap rules
7. Score snapshot persistence
8. Content and semantic fallback module
9. NeuronWriter adapter stub
10. AI readiness lightweight module
11. TypeScript SDK skeleton
12. WordPress plugin skeleton
13. Basic dashboard or admin score listing
14. Tests and documentation

---

## Important Product Rules

* Always show evidence for issues.
* Never claim guaranteed SEO ranking improvement.
* Never claim guaranteed AI visibility.
* Prefer official SEO guidance over speculative GEO tactics.
* Label uncertain AI visibility findings as experimental.
* Do not encourage keyword stuffing.
* Prioritize critical technical blockers before content improvements.
* Keep provider integrations replaceable.
* Keep API responses stable and versioned.

---

## Final Output Expected from AGY

When implementation is complete, provide:

* Summary of implemented files and modules
* Database migration summary
* API endpoint list
* Example `curl` requests
* Example score response
* How to run locally
* Known limitations
* Suggested next steps for Phase 1