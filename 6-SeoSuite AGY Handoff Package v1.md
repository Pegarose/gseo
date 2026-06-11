# SeoSuite AGY Handoff Package v1

### TL;DR

Bu doküman, SeoSuite Phase 0 geliştirmesini başlatmak için AGY’ye verilecek ana talimat paketidir. AGY’nin önce ürün bağlamını, scoring modelini ve API endpoint sözleşmesini okuması; ardından Phase 0 PRD ve Implementation Prompt doğrultusunda API core, tenant modeli, auth, quota ve scoring engine skeleton geliştirmesine başlaması beklenir.

---

## 1\. AGY’ye Verilecek Dosya Sırası

AGY’ye aşağıdaki dokümanları bu sırayla verin. Sıra önemlidir; önce ürünün nedenini, sonra neyin ölçüleceğini, en son nasıl uygulanacağını anlamalıdır.

### 1\. SeoSuite SEO & AI Visibility Research Brief

Amaç:

* Ürünün SEO, semantic SEO ve AI visibility bilgi temelini açıklar.
* Hangi SEO kurallarının resmi kaynaklara dayandığını, hangilerinin experimental sayılacağını netleştirir.
* SeoSuite’in Yoast, Rank Math, Semrush, Ahrefs, Surfer, Clearscope ve NeuronWriter gibi araçlardan nasıl ayrışacağını anlatır.

AGY için kullanım:

* Scoring engine kararlarında bu dokümanı bilgi omurgası olarak kullan.
* AI visibility alanında kesin iddia üretme; yalnızca readiness ve citation hazırlığı sun.

Document UUID:

```text
9cffbe67-4f88-4f36-aa33-d081addb6997
```

---

### 2\. SeoSuite Scoring Model v1.1

Amaç:

* 100 puanlık scoring modelini ve modül ağırlıklarını tanımlar.
* Issue severity, recommendation modeli, scoring cap kuralları, schema öncelikleri ve AI visibility readiness sinyallerini içerir.

AGY için kullanım:

* Scoring engine skeleton bu dokümana göre modüler inşa edilmeli.
* Her modül kendi score, issue ve recommendation çıktısını üretmeli.
* Global skor, modül skorlarının ağırlıklı toplamından oluşmalı.

Document UUID:

```text
0c215800-a2d2-4965-8c7a-4c7cf6e24dc8
```

---

### 3\. SeoSuite GSEO API Endpoint Spec v1

Amaç:

* GSEO API endpoint sözleşmelerini, auth modelini, quota yanıtlarını, score response formatını, error modelini ve webhook eventlerini tanımlar.

AGY için kullanım:

* Tüm endpoint isimleri, request/response formatları ve hata modelleri bu dokümana göre uygulanmalı.
* Phase 0’da minimum endpoint seti önceliklendirilmeli.

Document UUID:

```text
ab465c86-b6de-4f0b-bea0-31fb7901012b
```

---

### 4\. SeoSuite Phase 0 PRD: API Core, Scoring Engine Skeleton ve CMS-Agnostik Entegrasyon

Amaç:

* Phase 0 ürün kapsamını, kullanıcı hikayelerini, non-goals listesini, başarı metriklerini ve lean faz planını tanımlar.

AGY için kullanım:

* Ürün kapsamını aşmadan Phase 0 teslimlerini planla.
* Dashboard, gelişmiş AI tracking, full billing, Shopify app ve enterprise özellikleri Phase 0 dışında tutulmalı.

Document UUID:

```text
9519c79e-c8e2-4a62-97c2-5e9320f63e2c
```

---

### 5\. SeoSuite Phase 0 AGY Implementation Prompt

Amaç:

* AGY’nin doğrudan geliştirmeye başlayabilmesi için repo yapısı, DB şeması, endpoint skeletonları, scoring engine interface’leri, test ve kabul kriterlerini verir.

AGY için kullanım:

* Uygulama sırasında ana çalışma dokümanı budur.
* Kod iskeleti, migration, endpoint handler, scoring module, SDK ve WordPress plugin skeleton bu dokümana göre üretilmeli.

Document UUID:

```text
540617a0-35c9-42da-9001-af01fa80fe4f
```

---

## 2\. AGY’ye Verilecek Ana Talimat

Aşağıdaki metni AGY’ye doğrudan ana görev talimatı olarak verebilirsiniz.

```text
SeoSuite Phase 0 geliştirmesine başla.

```

`Önce aşağıdaki dokümanları sırayla oku ve kapsamı anladığını kısa bir implementation plan ile doğrula:`

1. `SeoSuite SEO & AI Visibility Research Brief`
2. `SeoSuite Scoring Model v1.1`
3. `SeoSuite GSEO API Endpoint Spec v1`
4. `SeoSuite Phase 0 PRD`
5. `SeoSuite Phase 0 AGY Implementation Prompt`

`Bu proje, GMedya’nın müşterileri için CMS-agnostik, API-first SEO ve AI visibility intelligence platformu geliştirme projesidir. Amaç, EfesusStone projesinde kullanılan başarılı SEO yaklaşımını ürünleştirerek WordPress, Next.js, Go, Shopify ve custom CMS altyapılarına API/SDK/plugin katmanlarıyla bağlanabilir hale getirmektir.`

`Phase 0’da hedef, tam ürün değil; sağlam ve genişletilebilir teknik iskelet oluşturmaktır.`

`Öncelikli deliverable’lar:`

1. `API core skeleton`
2. `Multi-tenant data model`
3. `API key authentication`
4. `Quota tracking skeleton`
5. `Site onboarding endpointleri`
6. `Score URL ve Score Content endpointleri`
7. `Scoring engine module interface`
8. `Indexability, technical metadata ve basic content quality modüllerinin ilk implementasyonu`
9. `Score snapshot storage`
10. `TypeScript SDK skeleton`
11. `WordPress plugin skeleton`
12. `Temel testler ve örnek API request/response dosyaları`

`Öncelikli endpointler:`

* `GET /health`
* `GET /auth/me`
* `POST /sites`
* `GET /sites`
* `POST /score/url`
* `POST /score/content`
* `GET /quota`

`İkinci dalga endpointler için sadece skeleton veya minimal implementation yeterlidir:`

* `POST /semantic/analyze`
* `POST /internal-links/suggest`
* `POST /ai-visibility/check`
* `POST /nw/enrich`
* `GET /sites/{siteId}/scores`
* `POST /webhooks`

`Önemli kurallar:`

* `SeoSuite AI visibility için kesin görünürlük garantisi vermemelidir. Yalnızca AI Visibility Readiness, Citation Readiness ve Entity Clarity skorları üretmelidir.`
* `NeuronWriter zorunlu bağımlılık olmamalıdır. Optional enrichment provider olarak soyutlanmalıdır.`
* `NeuronWriter yoksa fallback semantic analyzer çalışmalıdır.`
* `FAQPage artık priority rich result schema değildir. FAQPage eksikliğinden skor kırma. Bunun yerine answer block ve user question coverage önerileri üret.`
* `Scoring modelinde 20/20/20/15/10/10/5 ağırlık modeli kullanılmalıdır.`
* `Critical teknik hatalar toplam skoru cap edebilmelidir.`
* `Her issue evidence, impact, recommendation, severity, confidence ve implementationHint içermelidir.`
* `Platforma özel hint üret: WordPress, Next.js, custom CMS.`
* `Tam sayfa HTML’i uzun süre saklama. Snapshot, parsed metadata, issue ve recommendation sakla.`
* `API key, NeuronWriter token ve diğer integration credential bilgileri encrypted storage mantığıyla tasarlanmalıdır.`
* `Multi-tenant mimaride tenant_id her ana tabloda bulunmalıdır.`
* `Phase 0’da billing, full dashboard, gerçek zamanlı ChatGPT/Perplexity scraping, Shopify app store yayını ve enterprise SSO yapılmayacak.`

`İlk çıktı olarak şunları üret:`

1. `Kısa implementation plan`
2. `Önerilen repo/file structure`
3. `DB schema/migration taslağı`
4. `Endpoint skeletonları`
5. `Scoring engine interface ve modül tasarımı`
6. `Örnek /score/url response`
7. `Test planı`

`Kod üretirken sade, okunabilir ve genişletilebilir ilerle. Önce çalışan skeleton, sonra modül derinliği.`  

---

## 3\. Phase 0 Kapsam Sınırları

AGY’ye özellikle şu sınırlar belirtilmelidir.

### Phase 0 İçinde

* API core
* Tenant/site/page temel modeli
* API key auth
* Quota skeleton
* Score request/response modeli
* Score snapshot storage
* Basic HTML fetcher
* Metadata parser
* Robots/meta robots/canonical/status check
* Basic structured data detection
* Basic content extraction
* Basic content quality checks
* Scoring aggregation
* Issue/recommendation generation
* TypeScript SDK skeleton
* WordPress plugin skeleton
* Minimal docs ve örnek request dosyaları

### Phase 0 Dışında

* Full production dashboard
* Billing/subscription otomasyonu
* Semrush/Ahrefs benzeri keyword database
* Backlink index
* Gerçek zamanlı ChatGPT/Perplexity/Gemini mention scraping
* Shopify app store yayını
* Enterprise SSO
* Full NeuronWriter clone
* Gelişmiş rank tracking
* Tam otomatik content publishing

---

## 4\. Teknik Mimari Talimatları

### Önerilen Yaklaşım

MVP için hızlı ve sade ilerlenmeli:

* API-first yapı
* TypeScript tabanlı backend önerilir
* PostgreSQL veri modeli
* API key auth
* Modüler scoring engine
* Provider adapter pattern
* Platform-specific implementationHint üretimi

### Modüler Scoring Engine

Her scoring modülü aynı interface’e uymalıdır:

```ts
type ScoreModuleResult = {
  key: string;
  label: string;
  score: number;
  maxScore: number;
  status: 'excellent' | 'good' | 'needs_improvement' | 'poor' | 'critical';
  issues: SeoIssue\[\];
  recommendations: SeoRecommendation\[\];
  confidence: number;
};
```

Önerilen modüller:

* indexabilityCrawlabilityModule
* technicalSeoMetadataModule
* contentQualityIntentModule
* semanticCoverageModule
* pageExperienceModule
* internalLinkingModule
* aiVisibilityReadinessModule

Phase 0’da zorunlu minimum:

* indexabilityCrawlabilityModule
* technicalSeoMetadataModule
* basicContentQualityModule
* scoreAggregator

---

## 5\. Scoring Model Özet Talimatı

Global ağırlıklar:

| Modül | Ağırlık |
| --- | --- |
| Indexability & Crawlability | 20 |
| Technical SEO & Metadata | 20 |
| Content Quality & Intent | 20 |
| Semantic Coverage | 15 |
| Page Experience & Performance | 10 |
| Internal Linking & Site Architecture | 10 |
| AI Visibility Readiness | 5 |

Severity seviyeleri:

* critical
* high
* medium
* low
* info
* experimental

Critical cap kuralları:

| Durum | Maksimum Toplam Skor |
| --- | --- |
| URL 5xx | 25 |
| robots.txt block | 35 |
| noindex | 45 |
| alakasız canonical | 60 |
| ana içerik botlara görünmüyor | 65 |
| title yok | 80 |
| spam/thin content riski | 70 |

---

## 6\. İlk Sprint Teslim Planı

### Sprint 1: Core Skeleton

Süre önerisi: 3–5 gün

Deliverable:

* Repo yapısı
* Environment config
* DB schema initial migration
* API key middleware
* GET /health
* GET /auth/me
* POST /sites
* GET /sites
* Score module interface
* Basic score aggregator

Kabul kriteri:

* API local ortamda çalışır.
* Tenant/site modeli oluşturulabilir.
* API key ile endpoint erişimi doğrulanır.

---

### Sprint 2: Score URL MVP

Süre önerisi: 4–6 gün

Deliverable:

* POST /score/url
* HTML fetcher
* Status code check
* Robots/meta robots check
* Canonical parser
* Title/meta description/H1 parser
* Basic JSON-LD detection
* Basic issue generation
* Score snapshot storage

Kabul kriteri:

* Bir URL analiz edildiğinde finalScore, modules, issues, recommendations döner.
* noindex, 5xx, missing title, missing canonical gibi temel sorunlar tespit edilir.

---

### Sprint 3: Score Content + SDK Skeleton

Süre önerisi: 4–6 gün

Deliverable:

* POST /score/content
* Content payload analysis
* Basic content quality checks
* suggestedMetadata skeleton
* TypeScript SDK client
* Örnek Next.js usage snippet

Kabul kriteri:

* HTML veya raw content gönderildiğinde skor alınır.
* SDK üzerinden scoreUrl ve scoreContent çağrıları yapılabilir.

---

### Sprint 4: WordPress Skeleton + Provider Hooks

Süre önerisi: 4–6 gün

Deliverable:

* WordPress plugin folder skeleton
* API token settings page
* wp_options token storage tasarımı
* save_post hook placeholder
* Gutenberg sidebar placeholder
* NeuronWriter provider adapter interface
* AI visibility ve internal linking endpoint skeletonları

Kabul kriteri:

* WordPress plugin aktifleşebilir.
* API token kaydedilebilir.
* save_post tetiklenince skor endpointine gönderilecek payload hazırlanır.

---

## 7\. AGY’den Beklenen İlk Yanıt

AGY’den ilk yanıt olarak kod yazmadan önce şunları istemek faydalı olur:

```text
Kod üretmeye başlamadan önce bana şu çıktıları ver:

```

1. `Anladığın ürün kapsamının kısa özeti`
2. `Phase 0 için önerdiğin repo yapısı`
3. `DB schema taslağı`
4. `Endpoint implementation sırası`
5. `Scoring engine module structure`
6. `Belirsizlikler ve sorman gereken sorular`

`Onay aldıktan sonra implementasyona başla.`  

---

## 8\. Kabul Kriterleri

Phase 0 tamam kabul edilebilmesi için:

* API key ile korunan endpointler çalışmalı.
* Tenant ve site oluşturulabilmeli.
* URL scoring çalışmalı.
* Content scoring çalışmalı.
* Score snapshot DB’ye yazılmalı.
* Issue ve recommendation modeli tutarlı olmalı.
* Critical cap kuralları uygulanmalı.
* NeuronWriter optional provider olarak soyutlanmalı.
* TypeScript SDK minimal çalışmalı.
* WordPress plugin skeleton kurulabilir olmalı.
* README veya developer notes içinde setup ve örnek curl istekleri yer almalı.
* Test URL’leriyle örnek response üretilebilmeli.

---

## 9\. AGY’ye Verilecek Örnek İlk Görev

```text
İlk görev: SeoSuite Phase 0 core skeleton oluştur.

```

`Deliverable:`

1. `Repo/file structure`
2. `Environment variable list`
3. `DB schema initial migration`
4. `API key auth middleware`
5. `Tenant/site model CRUD minimum`
6. `GET /health`
7. `GET /auth/me`
8. `POST /sites`
9. `GET /sites`
10. `Scoring engine base interfaces`
11. `Empty scoring modules`
12. `Score aggregator skeleton`

`Bu görevin sonunda henüz tam SEO analizi gerekmiyor. Ama mimari, sonraki /score/url implementasyonunu destekleyecek şekilde hazır olmalı.`  

---

## 10\. Notlar

* AGY’ye tek seferde tüm ürünü yaptırmaya çalışmayın. Önce core skeleton, sonra score/url, sonra score/content, sonra SDK/plugin ilerleyin.
* Her sprint sonunda çalışan endpoint ve örnek response isteyin.
* Scoring engine’de ilk hedef mükemmel doğruluk değil; açıklanabilir, test edilebilir ve genişletilebilir mimaridir.
* AI visibility alanında ürün dili kontrollü tutulmalıdır: readiness, citation potential ve entity clarity.
* NeuronWriter entegrasyonu değerli ama zorunlu değildir; provider interface doğru tasarlanırsa sonra kolay bağlanır.