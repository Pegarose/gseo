# SeoSuite Phase 0 PRD: API Core, Scoring Engine Skeleton ve CMS-Agnostik Entegrasyon

### TL;DR

SeoSuite Phase 0, GMedya’nın SEO ve AI visibility altyapısını ürünleştirmek için gereken teknik çekirdeği kurar. Bu fazda çok müşterili SaaS temeli, API key auth, tenant/site/page veri modeli, scoring engine skeleton, ilk URL scoring endpoint’i, NeuronWriter enrichment adapter iskeleti, Next.js SDK başlangıcı ve WordPress plugin skeleton hazırlanacaktır.

Amaç, tüm özellikleri tamamlamak değil; SeoSuite’in WordPress, Next.js, Shopify, Go ve custom CMS entegrasyonlarına genişleyebilecek API-first çekirdeğini hızlı ve güvenilir şekilde ayağa kaldırmaktır.

---

## Goals

### Business Goals

* GMedya’nın EfesusStone’da doğruladığı SEO altyapısını tekrar kullanılabilir SaaS/API katmanına dönüştürmek.
* İlk 2–4 hafta içinde çalışan bir scoring API ve temel dashboard iskeleti üretmek.
* WordPress ve Next.js projelerinde aynı scoring mantığını kullanılabilir hale getirmek.
* SeoSuite’i klasik WordPress SEO plugin’lerinden ayrıştıracak CMS-agnostik temel mimariyi kurmak.
* GMedya müşterileriyle dogfooding yapılabilecek minimum güvenilir ürünü hazırlamak.

### User Goals

* SEO uzmanı, bir URL’nin teknik, içerik, semantic ve AI readiness skorunu tek API veya panel üzerinden görebilmeli.
* Geliştirici, Next.js veya custom CMS içinde SeoSuite API’ye bağlanıp metadata/schema önerisi alabilmeli.
* WordPress editörü, içerik kaydedildiğinde SeoSuite skorunu ve önerilerini alabilmeli.
* Ajans yöneticisi, birden fazla müşteri/site için skor snapshot’larını merkezi takip edebilmeli.
* İçerik ekibi, NeuronWriter veya fallback semantic analyzer kaynaklı konu kapsamı önerilerini görebilmeli.

### Non-Goals

* Phase 0’da tam billing/subscription sistemi geliştirilmeyecek.
* Phase 0’da Semrush/Ahrefs ölçeğinde keyword veya backlink veritabanı oluşturulmayacak.
* Phase 0’da gerçek zamanlı ChatGPT/Perplexity/Gemini scraping yapılmayacak.
* Phase 0’da Shopify app store yayını yapılmayacak.
* Phase 0’da gelişmiş white-label ajans paneli hedeflenmeyecek.

---

## User Stories

### GMedya SEO Uzmanı

* As a SEO specialist, I want to score a customer URL, so that I can identify critical technical and content issues before publishing recommendations.
* As a SEO specialist, I want issues to be grouped by severity, so that I can prioritize noindex, canonical, robots and content quality problems first.
* As a SEO specialist, I want semantic gaps from NeuronWriter or fallback analysis, so that I can improve topic coverage without keyword stuffing.

### GMedya Developer

* As a developer, I want a documented REST API, so that I can integrate SeoSuite into Next.js, WordPress and custom CMS projects.
* As a developer, I want suggested metadata and JSON-LD outputs, so that I can implement SEO fixes faster.
* As a developer, I want score responses to include implementation hints, so that each platform can apply recommendations correctly.

### WordPress Editor

* As a WordPress editor, I want SeoSuite to analyze a post when I save it, so that I can see SEO issues directly in the publishing workflow.
* As a WordPress editor, I want simple recommendations in Gutenberg, so that I can improve title, description, headings and content gaps without leaving WordPress.

### Agency Admin

* As an agency admin, I want tenant and site separation, so that customer data remains organized and secure.
* As an agency admin, I want quota usage tracking, so that API consumption can be controlled per customer or plan.

---

## Functional Requirements

### Platform Foundation (Priority: P0)

* Multi-tenant model: System must support tenants, users, sites and pages with tenant-level isolation.
* API key authentication: Each tenant/site can use API keys for server-to-server access.
* Score versioning: Every score snapshot must store the scoring model version, starting with `seosuite-score-v1.1`.
* Quota tracking: API calls must be tracked by tenant, endpoint, date and usage count.
* Secure integration storage: Third-party credentials such as NeuronWriter tokens must be encrypted at rest.

### Scoring API Core (Priority: P0)

* URL score endpoint: `POST /v1/score/url` must fetch a URL and return final score, module scores, issues and recommendations.
* Content score endpoint: `POST /v1/score/content` must accept raw HTML or extracted content for CMS/plugin use cases.
* Score modules: Phase 0 must include skeletons for indexability, technical metadata, content quality, semantic coverage, performance placeholder, internal linking placeholder and AI readiness placeholder.
* Severity model: Issues must support `critical`, `high`, `medium`, `low`, `info`, and `experimental`.
* Cap rules: Critical blockers such as 5xx, robots block, noindex and missing main content must cap final score.

### Metadata and Structured Data (Priority: P0)

* Metadata extraction: Parse title, description, canonical, robots, Open Graph and Twitter card tags.
* JSON-LD detection: Parse and validate basic JSON-LD syntax and common schema types.
* Schema priority: Prioritize Organization, WebSite, WebPage, BreadcrumbList, Article/BlogPosting, Product and LocalBusiness.
* FAQ handling: FAQPage must be treated as optional/legacy and should not create score penalties when missing.
* Suggested output: API should return `suggestedMetadata` and `suggestedJsonLd` where safe and useful.

### Semantic and NeuronWriter Layer (Priority: P1)

* Optional provider adapter: NeuronWriter must be implemented as optional enrichment provider, not hard dependency.
* Fallback analyzer: If NeuronWriter is unavailable, basic semantic checks must still run.
* Normalized terms: Provider output must normalize terms into basic, complementary and contextual groups.
* Recommendation style: Recommendations must focus on topic coverage, information gain and readability, not mechanical term repetition.

### CMS-Agnostic Integration Layer (Priority: P1)

* TypeScript SDK skeleton: Provide client methods for scoring URLs/content and rendering suggested metadata.
* Next.js helper direction: Support Next.js App Router metadata generation and sanitized JSON-LD render guidance.
* WordPress plugin skeleton: Provide admin settings, API token storage, save_post hook and Gutenberg sidebar placeholder.
* Platform hints: API recommendations should include platform-specific implementation hints for WordPress, Next.js and custom CMS.

### Dashboard MVP Skeleton (Priority: P2)

* Tenant/site listing: Basic authenticated view for tenants and sites.
* Score history: Show recent score snapshots for a selected site.
* Issue list: Display top issues by severity.
* Quota usage: Show basic API usage count.

---

## User Experience

### Entry Point & First-Time User Experience

* Internal GMedya user creates a tenant for a customer.
* User adds a site with domain, platform type, locale and optional integration settings.
* System generates an API key for that site or tenant.
* User can immediately test a URL through dashboard or API.
* For WordPress, user installs plugin, enters API key and triggers first score.
* For Next.js, developer installs or copies TypeScript client and calls score endpoint.

### Core Experience

* Step 1: User submits a URL or content payload.

  * System validates URL, tenant access and quota.
  * If URL is invalid or quota exceeded, response returns structured error.

* Step 2: System fetches and parses the page.

  * HTML fetcher captures status code, headers, metadata and body.
  * Optional JavaScript rendering is prepared but not required for MVP default.
  * Parser extracts title, meta description, canonical, robots, headings, links, images and JSON-LD.

* Step 3: Scoring modules run.

  * Indexability checks run first because critical blockers can cap the score.
  * Technical metadata and structured data checks run next.
  * Content and semantic modules run based on available content and target keyword.
  * AI readiness runs as a lightweight readiness check, not a guaranteed visibility prediction.

* Step 4: System returns score response.

  * Response includes final score, score band, module scores, issues, quick wins and next actions.
  * Each issue includes evidence, recommendation, severity, confidence and implementation hint.

* Step 5: User applies recommendations.

  * WordPress user applies edits in post editor.
  * Next.js developer uses suggested metadata/JSON-LD in code.
  * SEO specialist re-runs the score and compares delta.

### Advanced Features & Edge Cases

* If URL returns 5xx, scoring stops early and caps score.
* If robots.txt blocks the URL, response highlights this as critical.
* If no target keyword is provided, semantic score uses page title, H1 and inferred topic with lower confidence.
* If NeuronWriter fails, fallback semantic analyzer runs and provider failure is logged without blocking the score.
* If JSON-LD is invalid, system returns parsing evidence without attempting unsafe auto-fix.
* If FAQ schema exists, system validates it but does not treat it as priority rich-result opportunity.

### UI/UX Highlights

* Use score cards per module rather than one opaque number.
* Show critical blockers before content suggestions.
* Label AI/GEO findings as readiness or experimental where appropriate.
* Keep editor recommendations concise and action-oriented.
* Avoid “keyword count” language; use “topic coverage” and “missing subtopic” language.

---

## Narrative

GMedya ekibi, farklı altyapılardaki müşteriler için SEO kalitesini merkezi şekilde yönetmek istiyor. EfesusStone gibi Next.js projelerinde geliştirilen SEO pratikleri başarılı olsa da bu pratiklerin her müşteri için yeniden elle uygulanması zaman kaybı yaratıyor. WordPress tarafında ise Yoast ve Rank Math gibi araçlar kolay kullanım sağlasa da API-first, semantic SEO, NeuronWriter enrichment ve AI visibility readiness gibi katmanları merkezi bir ajans workflow’una bağlamakta sınırlı kalıyor.

SeoSuite Phase 0 bu problemi çözmek için ürünün çekirdeğini kurar. GMedya ekibi bir müşteri sitesi tanımlar, API key üretir ve URL skorlamasını başlatır. Sistem sayfanın indekslenebilirliğini, metadata kalitesini, structured data durumunu, içerik kalitesini, semantic coverage sinyallerini ve AI readiness hazırlığını modüler şekilde değerlendirir. Çıktı yalnızca bir puan değil; uygulanabilir öneriler, kanıtlar ve platforma özel implementation hint’lerdir.

Bu faz sonunda GMedya, ilk müşterilerde dogfooding yapabilecek, WordPress ve Next.js projelerine entegre edilebilecek, ileride Shopify, Go ve custom CMS katmanlarına genişleyebilecek sağlam bir API-first SEO intelligence çekirdeğine sahip olur.

---

## Success Metrics

### User-Centric Metrics

* İlk test kullanıcılarının en az yüzde 80’i skor çıktısını anlaşılır bulmalı.
* İlk 20 test URL’sinde kritik teknik sorunların en az yüzde 90’ı doğru tespit edilmeli.
* WordPress veya Next.js entegrasyonu ile ilk skor alma süresi 30 dakikanın altında olmalı.
* Kullanıcı başına en az 3 recommendation viewed eventi oluşmalı.

### Business Metrics

* İlk dogfooding fazında en az 3 GMedya müşteri sitesi sisteme eklenmeli.
* Phase 0 sonunda en az 100 URL skor snapshot’ı üretilmeli.
* GMedya iç SEO denetim süresinde ilk kullanımda en az yüzde 30 operasyonel hızlanma hedeflenmeli.

### Technical Metrics

* `POST /v1/score/url` p95 response süresi JavaScript render olmadan 8 saniyenin altında olmalı.
* API availability internal dogfooding sürecinde yüzde 99 üzerinde olmalı.
* Score response schema validation başarı oranı yüzde 99 üzerinde olmalı.
* Provider failure durumunda core scoring akışı çalışmaya devam etmeli.

### Tracking Plan

* `tenant_created`
* `site_created`
* `api_key_created`
* `score_requested`
* `score_completed`
* `score_failed`
* `issue_detected`
* `recommendation_viewed`
* `recommendation_applied`
* `rescore_requested`
* `neuronwriter_enrichment_requested`
* `ai_visibility_check_completed`
* `quota_limit_reached`

---

## Technical Considerations

### Technical Needs

* REST API layer
* PostgreSQL database
* Tenant, site, page and score snapshot models
* API key authentication middleware
* Quota tracking middleware
* HTML fetcher
* Metadata parser
* Robots.txt parser
* JSON-LD parser
* Content extractor
* Scoring module interface
* Recommendation engine
* Provider adapter interface
* Basic dashboard shell
* TypeScript SDK skeleton
* WordPress plugin skeleton

### Integration Points

* NeuronWriter, optional enrichment provider
* PageSpeed Insights or Lighthouse, later phase or optional in Phase 0
* WordPress plugin
* Next.js TypeScript SDK
* Google Search Console, later phase
* Shopify/custom CMS, later phase

### Data Storage & Privacy

* Store score snapshots, module scores, issues and recommendations.
* Store provider response metadata, but avoid long-term full HTML storage by default.
* Encrypt API keys and third-party credentials.
* Use tenant-level access checks on all data queries.
* Prepare for Row-Level Security even if application-level tenant filtering is used initially.

### Scalability & Performance

* Phase 0 should support internal dogfooding scale, not public SaaS traffic.
* Design queue-ready scoring architecture, but synchronous scoring is acceptable for MVP URL checks.
* Provider calls should have timeout and fallback behavior.
* Scoring modules should be independently testable.

### Potential Challenges

* False positives in content and semantic scoring.
* JavaScript-heavy pages where raw HTML lacks main content.
* NeuronWriter API availability and data normalization.
* FAQPage and AI visibility rules changing over time.
* Tenant isolation mistakes in early implementation.

---

## Milestones & Sequencing

### Project Estimate

Medium: 2–4 weeks

This estimate covers Phase 0 foundation only: API core, scoring skeleton, data model, basic dashboard shell, TypeScript SDK skeleton and WordPress plugin skeleton.

### Team Size & Composition

Lean team:

* 1 full-stack engineer
* 1 product/SEO owner
* Optional: 1 part-time SEO/content specialist for scoring calibration

### Suggested Phases

Phase 0.1: Foundation and Data Model (2–3 days)

Key Deliverables:

* Project structure
* Database schema
* Tenant/site/page/API key models
* Basic auth and API key middleware
* Quota usage table

Dependencies:

* Repo and hosting decision
* Database provisioning

Phase 0.2: Scoring Core Skeleton (3–5 days)

Key Deliverables:

* Score module interface
* URL fetcher
* Metadata parser
* Indexability checks
* Technical metadata checks
* Score aggregation and cap rules
* JSON response schema

Dependencies:

* Scoring Model v1.1

Phase 0.3: Content, Semantic and Provider Layer (4–6 days)

Key Deliverables:

* Content extractor
* Heading and readability checks
* NeuronWriter adapter skeleton
* Fallback semantic analyzer
* Recommendation normalization

Dependencies:

* NeuronWriter access or sample payloads

Phase 0.4: SDK and WordPress Skeleton (4–6 days)

Key Deliverables:

* TypeScript client methods
* Next.js metadata helper examples
* WordPress admin settings page
* API token storage
* `save_post` hook
* Gutenberg sidebar placeholder

Dependencies:

* API contract draft

Phase 0.5: Dashboard, QA and Dogfooding (4–6 days)

Key Deliverables:

* Basic site dashboard
* Score history view
* Issue list UI
* Test with EfesusStone and WordPress sample pages
* Calibration notes
* Developer documentation draft

Dependencies:

* Sample URLs
* Internal user feedback

---

## Open Questions

* Phase 0 backend tek Next.js app içinde mi başlayacak, yoksa API ayrı servis mi olacak?
* Dashboard auth için Auth.js/custom auth mı tercih edilecek?
* NeuronWriter provider erişimi Phase 0’da gerçek API ile mi, mock payload ile mi başlayacak?
* JavaScript rendering Phase 0’da opsiyonel endpoint parametresi mi olacak, yoksa sonraki faza mı bırakılacak?
* GSC entegrasyonu Phase 1’e mi alınacak?
* İlk dogfooding siteleri EfesusStone dışında hangi GMedya müşterileri olacak?

---

## Next Deliverables

1. SeoSuite Phase 0 AGY Implementation Prompt
2. GSEO API Endpoint Spec
3. SeoSuite Data Model v1
4. Next.js SDK Spec
5. WordPress Plugin MVP Spec