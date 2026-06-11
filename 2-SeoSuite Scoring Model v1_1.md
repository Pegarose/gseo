# SeoSuite Scoring Model v1.1

### TL;DR

SeoSuite Scoring Model v1.1, SeoSuite’in URL, içerik ve site düzeyi SEO performansını ölçmek için kullanacağı açıklanabilir puanlama çerçevesidir. Model; Google Search Essentials, Core Web Vitals, structured data, semantic SEO, NeuronWriter enrichment akışları, EfesusStone’da kullanılan Next.js SEO yöntemleri, next-seo gibi açık kaynak pratikleri ve 2026 AI visibility/GEO pazar bulgularını tek bir ürünleştirilebilir skor sisteminde birleştirir.

v1.1 güncellemesinin ana farkı, scoring mimarisini daha net yedi modüle ayırmasıdır: Indexability & Crawlability, Technical SEO & Metadata, Content Quality & Intent, Semantic Coverage, Page Experience, Internal Linking ve AI Visibility Readiness. Ayrıca FAQPage rich result deprecation, Experimental severity seviyesi, AI platform readiness alt sinyalleri, NeuronWriter fallback yaklaşımı ve API response modelinde scoreVersion/platformReadiness alanları bu sürüme eklenmiştir.

---

## Goals

### Business Goals

* SeoSuite’in MVP aşamasında güvenilir, açıklanabilir ve ürünleştirilebilir bir scoring engine’e sahip olmasını sağlamak.
* GMedya müşterilerinde ve EfesusStone projesinde kullanılan SEO yaklaşımını SaaS/API formatına dönüştürmek.
* WordPress, Next.js, Shopify, Go ve custom CMS entegrasyonlarında aynı çekirdek scoring mantığını çalıştırabilmek.
* Rank Math, Yoast, Surfer SEO, NeuronWriter, Screaming Frog ve modern GEO araçlarından öğrenilen iyi pratikleri CMS-agnostik bir yapıda sunmak.
* AI visibility ve semantic SEO tarafında klasik WordPress SEO plugin’lerinden ayrışan bir ürün katmanı oluşturmak.

### User Goals

* SEO uzmanları, bir URL’nin neden düşük veya yüksek puan aldığını açıkça görebilmeli.
* İçerik ekipleri, semantic coverage, information gain ve NeuronWriter destekli content gap önerilerini CMS içinde alabilmeli.
* Geliştiriciler, Next.js veya custom altyapılarda API üzerinden title, canonical, JSON-LD, Open Graph, robots ve indexability sorunlarını doğrulayabilmeli.
* Ajans yöneticileri, çok müşterili projelerde site sağlığını merkezi olarak takip edebilmeli.
* Müşteriler, yalnızca hata listesi değil, önceliklendirilmiş ve uygulanabilir öneriler alabilmeli.

### Non-Goals

* v1.1 modelinde tam backlink veri tabanı oluşturulmayacak.
* v1.1 modelinde Semrush veya Ahrefs ölçeğinde keyword database kurulmayacak.
* v1.1 modelinde AI platformlarından otomatik gerçek zamanlı citation scraping zorunlu olmayacak.
* v1.1 modelinde “kesin sıralama garantisi” veya “AI’da görünürlük garantisi” verilmeyecek.
* v1.1 modelinde manipülatif GEO/AEO hack’leri ürün kuralı olarak kullanılmayacak.
* FAQPage schema eksikliği artık skor kıran bir rich result problemi olarak değerlendirilmeyecek.

---

## Scoring Philosophy

SeoSuite puanlama sistemi beş prensibe dayanır:

1. Resmi kaynak önceliği

  * Google Search Central, Bing Webmaster Guidelines, Schema.org, Next.js resmi dokümantasyonu ve Core Web Vitals eşikleri modelin temel kaynaklarıdır.
  * Blog kaynakları, SEO araç metodolojileri ve pazar araştırmaları yardımcı içgörü olarak kullanılır.

2. Açıklanabilir skor

  * Her skor alt sinyallere bölünmelidir.
  * Kullanıcı “neden 72 aldım?” sorusuna net yanıt almalıdır.
  * Her sorun severity, impact, evidence, recommendation ve confidence alanlarıyla dönmelidir.

3. CMS-agnostik yapı

  * Skor motoru WordPress, Next.js, Shopify, Go veya custom HTML fark etmeksizin aynı çekirdek API ile çalışmalıdır.
  * Platforma özel kontroller plugin/SDK katmanında zenginleştirilebilir.

4. SEO + AI visibility birlikteliği

  * AI visibility, klasik SEO’nun yerine geçmez.
  * Crawlability, helpful content, structured data, entity consistency ve citation-worthy content, AI görünürlük için temel kabul edilir.

5. Kanıt seviyesi ayrımı

  * Resmi SEO gereksinimleri kesin kural olarak değerlendirilir.
  * Piyasa gözlemleri ve AI citation pattern bulguları “experimental” veya “readiness” sinyali olarak etiketlenir.

---

## Global Score Architecture

SeoSuite toplam skor 100 üzerinden hesaplanır.

| Modül | Ağırlık | Açıklama |
| --- | --- | --- |
| Indexability & Crawlability | 20 | Sayfanın keşfedilebilir, erişilebilir ve indekslenebilir olup olmadığını ölçer. |
| Technical SEO & Metadata | 20 | Title, description, heading, URL, canonical, Open Graph, Twitter card ve temel structured data kalitesini ölçer. |
| Content Quality & Intent | 20 | İçeriğin kullanıcı niyetini karşılama, okunabilirlik, güven sinyalleri, güncellik ve helpful content kalitesini ölçer. |
| Semantic Coverage | 15 | NLP term coverage, entity coverage, competitor gap, topical depth ve NeuronWriter enrichment sinyallerini ölçer. |
| Page Experience & Performance | 10 | Core Web Vitals, mobil uyumluluk, HTTPS ve temel performans sinyallerini ölçer. |
| Internal Linking & Site Architecture | 10 | Sayfanın site içindeki keşfedilebilirliğini, link bağlamını ve cluster ilişkisini ölçer. |
| AI Visibility Readiness | 5 | AI cevap motorlarında anlaşılabilirlik, kaynak gösterilebilirlik, entity netliği ve platform readiness sinyallerini ölçer. |

Toplam: 100

Not: AI Visibility Readiness v1.1’de 5 puan ile başlar. Ölçüm metodolojisi sektör genelinde olgunlaştıkça bu modül ayrı bir 100’lük “AI Visibility Score” ve “AI Share of Voice” modülüne genişletilebilir.

---

## Score Bands

| Skor Aralığı | Durum | Açıklama |
| --- | --- | --- |
| 90–100 | Excellent | Sayfa teknik, içerik ve semantic açıdan güçlü. Yalnızca optimizasyon fırsatları olabilir. |
| 75–89 | Good | Genel olarak sağlıklı; bazı orta öncelikli geliştirmeler gerekir. |
| 60–74 | Needs Improvement | SEO performansını sınırlayan net sorunlar vardır. Önceliklendirilmiş aksiyon gerekir. |
| 40–59 | Poor | Teknik veya içerik tarafında ciddi eksikler vardır. Trafik ve görünürlük etkilenebilir. |
| 0–39 | Critical | İndekslenme, erişilebilirlik veya içerik kalitesi açısından ağır problem vardır. |

---

## Severity Model

Her issue bir severity ile dönmelidir.

| Severity | Anlam | Örnek |
| --- | --- | --- |
| Critical | İndekslenmeyi veya sayfanın görünürlüğünü doğrudan engeller. | noindex, 5xx, robots block, canonical başka sayfaya hatalı işaret ediyor. |
| High | Sıralama, CTR, indexability veya structured understanding performansını güçlü etkileyebilir. | Eksik title, bozuk JSON-LD, çok zayıf içerik, H1 yok. |
| Medium | Optimizasyon kalitesini düşürür ama görünürlüğü tamamen engellemez. | Meta description eksik, OG image eksik, alt text eksikleri. |
| Low | Nice-to-have iyileştirme fırsatıdır. | Description daha ikna edici olabilir, tablo veya özet bloğu eklenebilir. |
| Info | Bilgilendirici öneridir. | Global default metadata standardizasyonu, developer docs önerisi. |
| Experimental | AI visibility, GEO veya henüz standartlaşmamış piyasa gözlemine dayalı öneridir. | AI crawler policy değerlendirme, third-party mention gap, platform-specific citation fit. |

Experimental kuralı: Bu seviyedeki öneriler toplam SEO skorunu ağır şekilde düşürmemelidir. UI’da ayrı bir etiketle gösterilmeli ve “doğrudan ranking garantisi değildir” açıklaması taşımalıdır.

---

## Functional Requirements

### 1\. Indexability & Crawlability Score

Priority: P0

Ağırlık: 20 puan

Amaç: Sayfanın arama motorları tarafından erişilebilir, taranabilir ve indekslenebilir olmasını ölçmek.

| Sinyal | Puan | Ölçüm Yöntemi | Severity |
| --- | --- | --- | --- |
| HTTP status | 4 | URL fetch sonucu 200 olmalı. 3xx, 4xx, 5xx ayrı değerlendirilir. | Critical/High |
| Robots.txt erişimi | 3 | User-agent için path engelleniyor mu kontrol edilir. | Critical |
| Meta robots indexability | 3 | noindex/nofollow var mı kontrol edilir. | Critical/High |
| Canonical doğruluğu | 4 | Canonical mevcut mu, self-referential mı, farklı URL’ye hatalı mı gidiyor. | High |
| Sitemap coverage | 2 | URL sitemap içinde var mı veya sitemap keşfedilebilir mi. | Medium |
| Crawlable internal link | 2 | Sayfa en az bir crawlable internal link ile keşfedilebilir mi. | High |
| JS-render indexability risk | 1 | Ana içerik raw HTML’de yoksa veya render sonrası farklıysa risk işaretlenir. | Medium/High |
| Duplicate URL risk | 1 | Slash, query, canonical, duplicate title/content varyasyonları kontrol edilir. | Medium |

EfesusStone referans uygulaması:

* Next.js tarafında canonical ve metadata her sayfa template’inde sistematik üretilmeli.
* SSR/SSG çıktısında ana içerik botlar için görünür olmalı.
* Dinamik ürün/kategori/blog sayfalarında canonical, slug ve sitemap üretimi aynı veri kaynağından beslenmeli.
* Çok dilli sayfalarda canonical, hreflang ve sitemap bütünlüğü merkezi yönetilmeli.

Örnek issue:

```json
{
  "code": "CANONICAL_MISSING",
  "severity": "high",
  "module": "indexability_crawlability",
  "impact": "Search engines may treat duplicate URL variants as separate pages.",
  "evidence": {
    "url": "https://example.com/blog/sample"
  },
  "recommendation": "Add a self-referential canonical URL generated from the canonical page slug.",
  "confidence": 0.94
}
```

---

### 2\. Technical SEO & Metadata Score

Priority: P0

Ağırlık: 20 puan

Amaç: Sayfanın arama motoru sonuçları, sosyal paylaşımlar, schema understanding ve temel HTML yapısı için doğru teknik sinyallere sahip olmasını ölçmek.

| Sinyal | Puan | Ölçüm Yöntemi | Severity |
| --- | --- | --- | --- |
| Title presence and quality | 3 | Title var mı, benzersiz mi, çok kısa/uzun mu, sayfa niyetiyle uyumlu mu. | High |
| Meta description quality | 2 | Var mı, açıklayıcı mı, CTR odaklı mı, duplicate mı. | Medium |
| H1 and heading structure | 3 | H1 var mı, H2/H3 hiyerarşisi mantıklı mı. | High/Medium |
| URL quality | 1 | URL okunabilir, kısa ve canonical slug ile uyumlu mu. | Low/Medium |
| Open Graph completeness | 2 | og:title, og:description, og:image, og:url, og:type. | Medium |
| Twitter card completeness | 1 | twitter:card, title, description, image. | Low/Medium |
| Image alt text basics | 2 | Önemli görsellerde anlamlı alt text var mı. | Medium |
| JSON-LD presence by page type | 2 | Sayfa tipine göre öncelikli schema var mı. | Medium/High |
| JSON-LD validity | 3 | JSON parse edilebilir mi, gerekli alanlar var mı, URL’ler absolute mu. | High |
| Breadcrumb schema | 1 | Özellikle blog, kategori, ürün gibi sayfalarda breadcrumb var mı. | Medium |

### Structured Data Priority Matrix

| Öncelik | Schema Tipleri | Kullanım Notu |
| --- | --- | --- |
| P0 Global | Organization, WebSite, WebPage, BreadcrumbList | Marka, site kimliği, sayfa bağlamı ve site hiyerarşisi için temel. |
| P0/P1 Page Type | Article, BlogPosting, Product, Offer, LocalBusiness, CollectionPage | Sayfa tipine göre uygulanmalı. |
| P1/P2 Conditional | Review, AggregateRating, TechArticle, HowTo | Yalnızca içerik ve Google guideline uygunluğu varsa. |
| Legacy/Optional | FAQPage | Google FAQ rich result görünümü Mayıs 2026 itibarıyla kaldırıldığı için rich result kazanımı amacıyla skor kırmamalı. Gerçek FAQ sayfalarında valid semantic markup olarak kalabilir. |

FAQPage v1.1 kuralı:

* FAQPage eksikliği skor kıran bir issue değildir.
* FAQ içeriği kullanıcı değeri ve answerability açısından hâlâ önerilebilir.
* `FAQ_SCHEMA_MISSING` issue kodu kullanılmamalıdır.
* Bunun yerine `ANSWER_BLOCK_OPPORTUNITY` veya `USER_QUESTION_COVERAGE_OPPORTUNITY` kullanılmalıdır.
* FAQPage varsa ve hatalıysa, yalnızca “schema validity” kapsamında uyarı üretilebilir.

Next SEO ve Next.js referansları:

* Next.js App Router’da standart metadata için `generateMetadata` veya `metadata` export kullanılmalı.
* JSON-LD native `script type="application/ld+json"` ile page veya layout içinde render edilmeli.
* JSON-LD payload sanitize edilmeli; özellikle kullanıcı girdileri içeren alanlarda XSS riski kontrol edilmeli.
* next-seo yaklaşımından öğrenilecek iyi pratikler:
  * ArticleJsonLd, OrganizationJsonLd, LocalBusinessJsonLd, ProductJsonLd, BreadcrumbJsonLd gibi reusable structured data bileşenleri.
  * Open Graph ve Twitter card alanlarının sayfa tipi bazlı standardizasyonu.
  * Global default SEO config + per-page override mantığı.

EfesusStone referans uygulaması:

* Her sayfa tipi için metadata factory mantığı kullanılmalı.
* Blog/detail sayfaları için Article/BlogPosting schema.
* Kategori veya listeleme sayfaları için CollectionPage/BreadcrumbList.
* Kurumsal sayfalarda Organization ve WebSite schema.
* Görsellerde absolute URL, width, height ve alt bilgisi mümkün olduğunca üretilmeli.

---

### 3\. Content Quality & Intent Score

Priority: P0

Ağırlık: 20 puan

Amaç: İçeriğin kullanıcı niyetini karşılama, özgünlük, güvenilirlik, okunabilirlik, güncellik ve E-E-A-T sinyallerini ölçmek.

| Sinyal | Puan | Ölçüm Yöntemi | Severity |
| --- | --- | --- | --- |
| Search intent alignment | 4 | Hedef query veya konu ile içerik tipi uyumlu mu. | High |
| Content depth | 3 | Konu yüzeysel mi, alt başlıklar yeterli mi, temel sorular cevaplanıyor mu. | High |
| Readability and structure | 3 | Paragraf uzunluğu, heading düzeni, listeler, tablo kullanımı, taranabilirlik. | Medium |
| E-E-A-T signals | 3 | Yazar, kurum, uzmanlık, kaynak, referans, about/contact sinyalleri. | Medium/High |
| Freshness | 2 | Tarih, güncelleme, eski bilgi riski, sektör değişim hızı. | Medium |
| Uniqueness and information gain | 3 | Rakiplere göre yeni örnek, veri, bakış açısı veya uzman yorumu var mı. | High |
| Spam/over-optimization risk | 2 | Keyword stuffing, aşırı tekrar, düşük değerli AI içerik riski. | High |

Helpful content ilkeleri:

* Skor, yalnızca kelime sayısına göre verilmemelidir.
* Uzun içerik otomatik olarak kaliteli kabul edilmemelidir.
* İçerik gerçek kullanıcı ihtiyacını çözmüyorsa teknik olarak temiz olsa bile sınırlı skor almalıdır.
* AI destekli içerik kabul edilebilir; ancak doğruluk, kaynak, insan editörü ve özgün değer sinyalleri aranmalıdır.

AI-assisted content policy:

* İçeriğin AI ile yazılmış olması tek başına negatif sinyal değildir.
* Negatif sinyal; yüzeysel, kaynak göstermeyen, tekrar eden, niyeti karşılamayan ve manipülasyon amaçlı seri üretilmiş içeriktir.

---

### 4\. Semantic Coverage Score

Priority: P0/P1

Ağırlık: 15 puan

Amaç: İçeriğin hedef konu etrafındaki semantic coverage, entity coverage, NLP term kullanımı ve competitor SERP gap düzeyini ölçmek.

Bu katman SeoSuite’in NeuronWriter entegrasyonundan, EfesusStone’da kullanılan semantic content yaklaşımından ve fallback semantic analyzer’dan beslenir.

| Sinyal | Puan | Ölçüm Yöntemi | Severity |
| --- | --- | --- | --- |
| Primary topic clarity | 2 | İçeriğin ana konusu net mi, H1/title/intro ile uyumlu mu. | High |
| NLP term coverage | 3 | NeuronWriter veya fallback analyzer’dan gelen basic/complementary/contextual terms kapsanıyor mu. | Medium/High |
| Entity coverage | 3 | Konu için beklenen kişi, yer, ürün, kavram, kategori entity’leri işleniyor mu. | High |
| Heading term coverage | 2 | Önemli semantic terms H2/H3 yapısında doğal şekilde yer alıyor mu. | Medium |
| Competitor gap coverage | 2 | SERP rakiplerinin yanıtladığı temel alt sorular içerikte var mı. | Medium/High |
| Information gain | 2 | Rakiplerden farklı özgün bilgi, örnek, case, veri veya uzman görüşü var mı. | High |
| Semantic stuffing risk | 1 | Terimler doğal mı, gereksiz tekrar var mı. | Medium |

NeuronWriter entegrasyon prensipleri:

* NeuronWriter v1.1’de zorunlu bağımlılık değildir; optional enrichment provider olarak konumlanır.
* NeuronWriter proxy veya API katmanı varsa, hedef keyword/topic için content score, NLP terms, competitor pages ve recommended headings alınabilir.
* SeoSuite bu verileri doğrudan kopyalamak yerine normalize etmelidir.
* NeuronWriter yoksa fallback semantic analyzer çalışır:
  * Title, H1, headings, body ve internal links üzerinden primary topic çıkarımı.
  * Basit entity ve noun phrase extraction.
  * Heading coverage ve content depth kontrolü.
  * Search intent template kontrolü.
* Kullanıcıya “şu kelimeyi 7 kez kullan” gibi mekanik öneriler verilmemelidir.
* Öneriler “şu alt konuyu doğal biçimde ele al” şeklinde verilmelidir.

Örnek semantic issue:

```json
{
  "code": "SEMANTIC_GAP_DETECTED",
  "severity": "medium",
  "module": "semantic_coverage",
  "impact": "The content may not fully satisfy the expected topical coverage for the target query.",
  "evidence": {
    "missingEntities": \["limestone maintenance", "natural stone sealing", "travertine durability"\],
    "source": "neuronwriter_proxy"
  },
  "recommendation": "Add a short section explaining maintenance, sealing, and durability considerations with practical examples.",
  "confidence": 0.81
}
```

---

### 5\. Page Experience & Performance Score

Priority: P1

Ağırlık: 10 puan

Amaç: Sayfanın kullanıcı deneyimi, performans, mobil uyumluluk ve güvenlik açısından temel SEO beklentilerini karşılamasını ölçmek.

| Sinyal | Puan | Ölçüm Yöntemi | Severity |
| --- | --- | --- | --- |
| LCP | 2 | 2.5 saniye veya altı iyi kabul edilir. | Medium/High |
| INP | 2 | 200 ms veya altı iyi kabul edilir. | Medium/High |
| CLS | 2 | 0.1 veya altı iyi kabul edilir. | Medium |
| Mobile friendliness | 1 | Responsive layout ve viewport kontrolü. | Medium |
| HTTPS | 1 | HTTPS aktif mi, mixed content var mı. | High |
| Image optimization | 1 | Boyut, lazy loading, next/image veya benzeri optimizasyon. | Medium |
| Render-blocking risk | 1 | Aşırı JS/CSS, geç yüklenen main content riski. | Medium |

Notlar:

* Core Web Vitals skorları v1.1’de PageSpeed Insights API, CrUX, Lighthouse veya entegrasyon durumuna göre hesaplanabilir.
* Veri yoksa fallback olarak lab-based Lighthouse veya basit HTML asset analizi kullanılabilir.
* Page Experience skoru tek başına ranking garantisi olarak sunulmamalıdır; teknik kalite ve kullanıcı deneyimi göstergesi olarak konumlandırılmalıdır.

---

### 6\. Internal Linking & Site Architecture Score

Priority: P0/P1

Ağırlık: 10 puan

Amaç: Sayfanın site içinde doğru bağlamda konumlandırılıp konumlandırılmadığını, topic cluster ilişkilerini ve link equity dağılımını ölçmek.

| Sinyal | Puan | Ölçüm Yöntemi | Severity |
| --- | --- | --- | --- |
| Incoming internal links | 2 | Sayfaya gelen anlamlı internal link sayısı. | High |
| Outgoing internal links | 2 | Sayfadan alakalı destek sayfalara link var mı. | Medium |
| Anchor text relevance | 2 | Anchor text açıklayıcı ve doğal mı. | Medium |
| Topic cluster relationship | 2 | Pillar/supporting page ilişkisi kurulmuş mu. | Medium/High |
| Orphan page risk | 1 | Sayfa site içinde keşfedilemiyor mu. | High |
| Broken internal links | 1 | İç linklerde 404/redirect zinciri var mı. | High |

EfesusStone referans uygulaması:

* İçerik ve ürün sayfaları arasında semantic internal linking önerileri oluşturulmalı.
* Yeni içerik yayına alınırken ilişkili eski içerikler ve kategori sayfaları otomatik önerilmeli.
* Link önerisi yalnızca anahtar kelime eşleşmesine göre değil, entity/topic yakınlığına göre yapılmalı.

Internal link suggestion output:

```json
{
  "sourceUrl": "https://example.com/blog/marble-countertops",
  "targetUrl": "https://example.com/products/calacatta-marble",
  "anchorSuggestion": "Calacatta marble countertop options",
  "reason": "The target product page is semantically related to marble countertop selection intent.",
  "confidence": 0.82
}
```

---

### 7\. AI Visibility Readiness Score

Priority: P1/P2

Ağırlık: 5 puan

Amaç: Sayfanın AI cevap motorları ve generative search deneyimlerinde anlaşılabilir, alıntılanabilir ve güvenilir bir kaynak olma potansiyelini ölçmek.

| Sinyal | Puan | Ölçüm Yöntemi | Severity |
| --- | --- | --- | --- |
| Answerability | 1 | Sayfa net sorulara kısa ve doğrudan cevap blokları içeriyor mu. | Medium |
| Citation readiness | 1 | Tanımlar, listeler, tablolar, kaynaklar ve güncel bilgiler var mı. | Medium |
| Entity clarity | 1 | Marka, ürün, yazar, organizasyon ve konu entity’leri net mi. | Medium |
| AI parseability | 1 | Ana içerik HTML’de okunabilir mi, gereksiz JS bariyeri var mı. | Medium |
| Brand/source trust signals | 1 | About, author, schema, external reference, review veya mention sinyalleri var mı. | Medium/Experimental |

AI visibility prensipleri:

* Bu modül “AI’de kesin görünürlük” iddiası taşımaz.
* Google’ın özel AI hack’leri önermediği dikkate alınır.
* Structured, helpful, source-worthy ve entity-rich içerik temel kabul edilir.
* llms.txt gibi tartışmalı veya henüz standartlaşmamış yaklaşımlar scoring engine’de P0 kuralı yapılmamalıdır. En fazla optional check olarak sunulmalıdır.

### Platform Readiness Alt Sinyalleri

2026 araştırma bulguları, ChatGPT, Perplexity ve Google AI Overviews’un kaynak tercihleri arasında farklar olduğunu göstermektedir. Bu bulgular SeoSuite’te kesin ranking kuralı olarak değil, platform readiness ve experimental insight olarak kullanılmalıdır.

| Platform | Readiness Yorumu | SeoSuite Kontrolü |
| --- | --- | --- |
| ChatGPT | Daha kurumsal, ansiklopedik, net entity ve güvenilir kaynak sinyallerine yatkın olabilir. | Organization/WebSite schema, About page, net marka tanımı, kaynaklı içerik. |
| Perplexity | Kaynak/citation odaklı çalıştığı için net referanslar, güncel bilgi ve üçüncü taraf mention sinyalleri önemlidir. | Citation blocks, outbound references, updated date, third-party mentions. |
| Google AI Overviews | Klasik SEO temelleri, search intent uyumu, helpful content ve Google indexability sinyalleriyle güçlü ilişkilidir. | Indexability, structured content, semantic coverage, topical authority. |
| Bing/Copilot | Bing indexability ve schema uygunluğu ek fırsat yaratabilir. | Bing-friendly indexability, schema validity, crawlable HTML. |

AI-ready content önerileri:

* Ana sorular için 40–80 kelimelik net cevap blokları.
* Karşılaştırma tabloları.
* Güncel tarih ve son güncelleme bilgisi.
* Kaynak/referans bağlantıları.
* Markanın veya ürünün ne olduğuna dair net tanım.
* FAQ içeriği yalnızca kullanıcı değeri için önerilmeli; FAQPage rich result beklentisiyle önerilmemeli.

Örnek platform readiness output:

```json
{
  "aiVisibility": {
    "score": 3,
    "maxScore": 5,
    "platformReadiness": {
      "chatgpt": {
        "status": "needs_improvement",
        "signals": \["brand_entity_clear", "about_page_missing"\]
      },
      "perplexity": {
        "status": "good",
        "signals": \["citations_present", "updated_date_present"\]
      },
      "googleAiOverviews": {
        "status": "needs_improvement",
        "signals": \["indexable", "semantic_gap_detected"\]
      }
    },
    "experimentalSignals": \[
      {
        "code": "THIRD_PARTY_MENTION_GAP",
        "severity": "experimental",
        "description": "The brand has limited visible mentions in third-party sources for this topic."
      }
    \]
  }
}
```

---

## Page Type Profiles

SeoSuite scoring modeli her sayfa tipine aynı ağırlığı kör biçimde uygulamamalıdır. Page type tespit edilirse bazı sinyallerin ağırlığı değişebilir.

| Page Type | Öncelikli Modüller | Özel Kontroller |
| --- | --- | --- |
| Blog Article | Content Quality, Semantic Coverage, Structured Data, AI Visibility | Article/BlogPosting schema, author, published/modified date, answer block opportunity. |
| Product Page | Metadata, Structured Data, Internal Links, Content Quality | Product schema, offers, images, specs, reviews, related products. |
| Category Page | Indexability, Metadata, Internal Links, Content Depth | CollectionPage/Breadcrumb, intro text, pagination/canonical. |
| Homepage | Brand Entity, Metadata, Organization Schema, Performance | Organization/WebSite schema, brand clarity, global Open Graph. |
| Landing Page | Intent Alignment, Metadata, Conversion Clarity, AI Readiness | Value proposition, proof, CTA, user question coverage. |
| Documentation Page | Answerability, Structured Data, Internal Links | TechArticle/Article schema, versioning, code block clarity. |
| Local Business Page | LocalBusiness Schema, NAP Consistency, Reviews | Address, geo, opening hours, local intent. |

---

## Scoring Calculation Logic

### Base Formula

```text
Total Score = weighted sum of module scores
Module Score = sum of passed signal points - penalties
Final Score = clamp(Total Score, 0, 100)
```

### Penalty and Cap Rules

Bazı kritik sorunlar toplam puanı sınırlamalıdır.

| Durum | Maksimum Toplam Skor |
| --- | --- |
| URL 5xx dönüyor | 25 |
| URL robots.txt ile engellenmiş | 35 |
| URL noindex içeriyor | 45 |
| Canonical tamamen farklı alakasız URL’ye gidiyor | 60 |
| Ana içerik botlar tarafından görülemiyor | 65 |
| Çok düşük değerli/spam içerik riski | 70 |
| Title yok | 80 |

Bu cap sistemi, küçük sinyallerin kritik sorunları maskelemesini engeller.

### Confidence Score

Her issue ve recommendation 0–1 arası confidence değeri taşımalıdır.

| Confidence | Anlam |
| --- | --- |
| 0.90–1.00 | Doğrudan HTML/API kanıtına dayalı güçlü bulgu. |
| 0.70–0.89 | Güçlü ama yoruma açık analiz. |
| 0.50–0.69 | Fallback veya heuristic tabanlı öneri. |
| 0.00–0.49 | Experimental veya düşük kanıtlı gözlem. |

---

## API Response Model

Önerilen endpoint:

```text
POST /v1/score/url
```

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
    "includePerformance": true,
    "includeAiVisibility": true,
    "renderJavascript": false
  }
}
```

Response:

```json
{
  "scoreVersion": "1.1.0",
  "url": "https://example.com/blog/sample-page",
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
    },
    {
      "key": "technical_seo_metadata",
      "label": "Technical SEO & Metadata",
      "score": 15,
      "maxScore": 20,
      "status": "needs_improvement"
    },
    {
      "key": "ai_visibility_readiness",
      "label": "AI Visibility Readiness",
      "score": 3,
      "maxScore": 5,
      "status": "needs_improvement"
    }
  \],
  "topIssues": \[
    {
      "code": "JSON_LD_MISSING_ARTICLE",
      "severity": "medium",
      "module": "technical_seo_metadata",
      "impact": "The page may be less eligible for enhanced search understanding and content entity clarity.",
      "recommendation": "Add Article or BlogPosting JSON-LD with headline, author, image, datePublished and dateModified.",
      "confidence": 0.88
    }
  \],
  "experimentalSignals": \[
    {
      "code": "THIRD_PARTY_MENTION_GAP",
      "severity": "experimental",
      "module": "ai_visibility_readiness",
      "impact": "The brand may have limited off-site entity reinforcement for AI answer engines.",
      "recommendation": "Consider earning mentions in relevant industry lists, comparison pages, review platforms or authoritative community discussions.",
      "confidence": 0.52
    }
  \],
  "platformReadiness": {
    "chatgpt": "needs_improvement",
    "perplexity": "good",
    "googleAiOverviews": "needs_improvement"
  },
  "quickWins": \[
    {
      "title": "Add breadcrumb structured data",
      "estimatedEffort": "low",
      "estimatedImpact": "medium"
    }
  \],
  "nextActions": \[
    "Fix missing Article JSON-LD",
    "Add 2 relevant internal links from existing cluster pages",
    "Expand content with missing semantic entities"
  \]
}
```

---

## Recommendation Model

Her öneri aşağıdaki alanlara sahip olmalıdır.

| Alan | Açıklama |
| --- | --- |
| code | Makine okunabilir issue/recommendation kodu. |
| title | Kullanıcı dostu kısa başlık. |
| severity | critical, high, medium, low, info, experimental. |
| module | Hangi skor modülüne ait olduğu. |
| evidence | Sayfadan çıkarılan kanıt. |
| recommendation | Ne yapılmalı. |
| implementationHint | Platforma özel uygulama ipucu. |
| estimatedEffort | low, medium, high. |
| estimatedImpact | low, medium, high. |
| confidence | 0–1 arası güven skoru. |
| sourceType | official, best_practice, provider, heuristic, experimental. |

Platforma özel implementationHint örnekleri:

WordPress:

```text
Add the canonical and Article schema through the SeoSuite WordPress plugin. Store API token securely in wp_options and trigger re-score on save_post.
```

Next.js:

```text
Generate metadata via generateMetadata and render BlogPosting JSON-LD inside page.tsx using a sanitized application/ld+json script.
```

Custom CMS:

```text
Add the provided canonical, Open Graph and JSON-LD tags into the HTML head and re-run the score endpoint.
```

---

## Issue Code Guidelines

v1.1’de issue kodları modül bazlı ve geriye dönük uyumlu tasarlanmalıdır.

### Deprecated or Avoided Codes

| Kod | Durum | Yerine Kullanılacak Kod |
| --- | --- | --- |
| FAQ_SCHEMA_MISSING | Kullanılmamalı | ANSWER_BLOCK_OPPORTUNITY |
| FAQ_RICH_RESULT_OPPORTUNITY | Kullanılmamalı | USER_QUESTION_COVERAGE_OPPORTUNITY |
| AI_RANKING_GUARANTEE | Kullanılmamalı | AI_VISIBILITY_READINESS_LOW |

### Örnek Yeni Kodlar

| Kod | Modül | Severity |
| --- | --- | --- |
| ANSWER_BLOCK_OPPORTUNITY | ai_visibility_readiness | low/medium |
| USER_QUESTION_COVERAGE_OPPORTUNITY | content_quality_intent | low/medium |
| AI_PARSEABILITY_RISK | ai_visibility_readiness | medium |
| THIRD_PARTY_MENTION_GAP | ai_visibility_readiness | experimental |
| PLATFORM_READINESS_CHATGPT_WEAK | ai_visibility_readiness | experimental |
| PLATFORM_READINESS_PERPLEXITY_WEAK | ai_visibility_readiness | experimental |

---

## EfesusStone Method Transfer

EfesusStone projesinden SeoSuite’e aktarılması önerilen yöntemler:

* Next.js tabanlı sayfalarda metadata factory yaklaşımı.
* Canonical, title, description ve Open Graph alanlarının CMS/data modelinden otomatik üretilmesi.
* Blog, kategori, ürün ve landing page tiplerine göre farklı SEO template’leri.
* Internal linking önerilerinin semantic ilişki ve sayfa tipi üzerinden üretilmesi.
* NeuronWriter’dan alınan NLP/content score verilerinin editör sürecine dahil edilmesi.
* İçerik yayına alınmadan önce skor kontrolü yapılması.
* Düşük skorlu sayfalarda “önce kritik teknik sorunlar, sonra içerik optimizasyonu” sıralaması.
* Çok dilli veya bölgesel sayfalarda canonical/hreflang/sitemap bütünlüğünün merkezi yönetilmesi.

Ürünleştirme notu:

EfesusStone özelinde çalışan hard-coded SEO kuralları, SeoSuite içinde tenant/pageType/template bazlı konfigüre edilebilir hale getirilmelidir. Böylece aynı altyapı farklı sektörlerdeki GMedya müşterilerine uygulanabilir.

---

## NeuronWriter Integration Layer

SeoSuite v1.1’de NeuronWriter doğrudan zorunlu bağımlılık değildir; güçlü bir enrichment provider olarak kullanılmalıdır.

### Entegrasyon Amaçları

* Target keyword/topic için semantic term listesi almak.
* Rakip SERP sayfalarından content gap sinyalleri çıkarmak.
* İçerik score veya optimization status almak.
* Başlık ve outline önerilerini SeoSuite recommendation modeline çevirmek.
* Internal link suggestions verisini SeoSuite site graph ile birleştirmek.

### Provider Fallback Modeli

| Durum | Davranış |
| --- | --- |
| NeuronWriter aktif | Provider’dan content score, NLP terms, competitor gaps ve heading suggestions alınır. |
| NeuronWriter geçici hata veriyor | SeoSuite fallback semantic analyzer çalışır ve provider status response’a eklenir. |
| NeuronWriter devre dışı | Semantic score basic analyzer ile hesaplanır; öneriler daha düşük confidence ile döner. |

### Veri Normalizasyonu

NeuronWriter çıktıları aşağıdaki ara modele çevrilmelidir.

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
  "competitorGaps": \["maintenance", "durability", "cost comparison"\]
}
```

### Product Rule

SeoSuite, NeuronWriter verisini kullanıcıya mekanik kelime doldurma önerisi olarak göstermemelidir. Öneri formatı konu kapsama, okunabilirlik ve information gain ekseninde olmalıdır.

---

## Next SEO / Open Source Learning Layer

next-seo gibi açık kaynak kaynaklardan alınacak güncel ve güvenli pratikler:

* SEO config’in global defaults ve per-page overrides şeklinde yönetilmesi.
* Sayfa tipine özel JSON-LD bileşenleri.
* Open Graph ve Twitter metadata standardizasyonu.
* BreadcrumbList, Article, Product, Organization, LocalBusiness gibi yaygın schema tiplerinin reusable hale getirilmesi.
* Next.js App Router ve Pages Router farklarının SDK dokümantasyonunda açık belirtilmesi.
* JSON-LD’nin sanitize edilmiş native script tag ile render edilmesi.

SeoSuite için uygulanacak karşılığı:

* TypeScript SDK içinde metadata helper fonksiyonları.
* WordPress plugin içinde schema template generator.
* API response içinde `suggestedMetadata` ve `suggestedJsonLd` alanları.
* Developer docs içinde Next.js App Router örnekleri.

Örnek suggestedJsonLd output:

```json
{
  "type": "BlogPosting",
  "jsonLd": {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "Marble Countertops Guide",
    "datePublished": "2025-01-15",
    "dateModified": "2025-01-20",
    "author": {
      "@type": "Organization",
      "name": "Example Brand"
    }
  }
}
```

---

## Data Requirements for Score Snapshots

Her skor snapshot’ı en az şu alanları taşımalıdır:

* tenantId
* siteId
* pageId
* url
* normalizedUrl
* pageType
* locale
* platform
* scoreVersion
* finalScore
* scoreBand
* moduleScores
* issues
* recommendations
* experimentalSignals
* providerEnrichments
* createdAt
* expiresAt veya recalculationPolicy

Multi-tenant notu:

* Phase 0 Data Model’de shared DB + tenant_id column + Row-Level Security yaklaşımı önerilir.
* Provider credentials encrypted storage içinde tutulmalıdır.
* Tam HTML varsayılan olarak uzun süre saklanmamalıdır; gerektiğinde kısa süreli debug artifact olarak tutulmalıdır.

---

## Tracking Plan

SeoSuite scoring engine için izlenmesi gereken event ve metrikler:

* score_requested
  * tenant_id, site_id, url, page_type, platform, source, include_neuronwriter, include_ai_visibility.
* score_completed
  * score_version, final_score, module_scores, duration_ms, issue_count.
* issue_detected
  * issue_code, severity, module, url, confidence.
* experimental_signal_detected
  * signal_code, module, confidence, platform.
* recommendation_viewed
  * recommendation_code, module, severity.
* recommendation_applied
  * recommendation_code, platform, user_id.
* rescore_requested
  * previous_score, new_score, delta.
* neuronwriter_enrichment_requested
  * target_keyword, provider_status, duration_ms.
* internal_link_suggestion_generated
  * source_url, target_url, confidence.
* ai_visibility_check_completed
  * ai_readiness_score, parseability_score, entity_score, platform_readiness.

---

## Technical Considerations

### Technical Needs

* HTML fetcher
* Optional JavaScript renderer
* Metadata parser
* Robots.txt parser
* Sitemap parser
* Canonical validator
* Structured data parser and validator
* Content extractor
* Language and locale detector
* NLP/semantic term matcher
* NeuronWriter enrichment adapter
* Fallback semantic analyzer
* Internal link graph builder
* Core Web Vitals/PageSpeed adapter
* Recommendation engine
* Score aggregation service
* Experimental signal classifier

### Integration Points

* NeuronWriter
* Google Search Console, sonraki faz
* PageSpeed Insights API veya Lighthouse
* WordPress plugin
* Next.js TypeScript SDK
* Shopify/custom CMS entegrasyonları, sonraki faz
* Schema.org validator veya internal validation rules
* Optional AI visibility providers, sonraki faz

### Data Storage & Privacy

Saklanması önerilen veriler:

* URL score snapshot
* Module scores
* Issue list
* Recommendation list
* Extracted metadata
* Normalized semantic terms
* Internal link graph summary
* Provider response metadata
* Platform readiness summary

Saklanmaması veya dikkatli saklanması gerekenler:

* Tam sayfa HTML’i varsayılan olarak uzun süre saklanmamalı.
* Müşteri API key ve NeuronWriter credential bilgileri encrypted storage içinde tutulmalı.
* GSC veya üçüncü taraf entegrasyon token’ları tenant bazlı encrypted saklanmalı.
* AI platform scraping yapılacaksa hukuki, etik ve platform kullanım koşulları ayrıca değerlendirilmelidir.

---

## Milestones & Sequencing

### Project Estimate

Small to Medium: 2–4 hafta

Bu süre, yalnızca scoring engine v1.1 ve temel API output için geçerlidir. Tam dashboard, WordPress plugin ve gelişmiş AI visibility tracking ayrı fazlarda genişletilmelidir.

### Team Size & Composition

Lean team önerisi:

* 1 full-stack engineer
* 1 product/SEO owner
* Opsiyonel: 1 part-time SEO/content specialist

### Suggested Phases

Phase 1: Scoring Core Skeleton (3–5 gün)

Key Deliverables:

* Score module interfaces
* URL fetcher
* Metadata parser
* Technical SEO checks
* Score aggregation model
* Basic JSON response

Dependencies:

* Target URL fetch altyapısı
* DB snapshot modeli

Phase 2: Metadata, Schema and Next.js Rules (3–5 gün)

Key Deliverables:

* Metadata quality checks
* JSON-LD parser and validation basics
* FAQPage deprecation-aware schema rules
* Next.js implementation hints
* suggestedMetadata and suggestedJsonLd output

Dependencies:

* Schema templates
* Page type detection

Phase 3: Content and Semantic Layer (5–7 gün)

Key Deliverables:

* Content extraction
* Heading/readability checks
* NeuronWriter adapter
* Fallback semantic analyzer
* NLP term normalization
* Semantic gap recommendations

Dependencies:

* NeuronWriter access/proxy, optional
* Target keyword input

Phase 4: Internal Linking and AI Readiness (4–6 gün)

Key Deliverables:

* Internal link extraction
* Basic site graph
* Internal link suggestions
* AI readiness checks
* Platform readiness summary
* Answerability/citation readiness recommendations

Dependencies:

* Site crawl or URL inventory
* Page type mapping

Phase 5: Calibration and QA (3–5 gün)

Key Deliverables:

* Test against EfesusStone pages
* Test against WordPress sample pages
* Scoring weight calibration
* False positive review
* Developer documentation draft

Dependencies:

* Real sample URLs
* SEO owner review

---

## Risks and Mitigations

| Risk | Açıklama | Mitigation |
| --- | --- | --- |
| Skor fazla subjektif olur | Content quality ve AI visibility ölçümü yoruma açıktır. | Evidence-based issue, confidence score ve SEO owner calibration kullanılmalı. |
| Keyword stuffing teşvik edilir | NLP term önerileri yanlış sunulursa içerik kalitesi düşebilir. | Term usage yerine topic coverage ve information gain vurgulanmalı. |
| AI visibility iddiaları abartılır | GEO alanında çok sayıda doğrulanmamış öneri var. | Official SEO fundamentals temel alınmalı, AI modülü “readiness” olarak konumlanmalı. |
| Platform farkları skorları bozar | WP ve Next.js metadata üretimi farklıdır. | Core scoring API platform-agnostik kalmalı, implementationHint platform bazlı olmalı. |
| NeuronWriter bağımlılığı artar | Üçüncü taraf API erişimi kesilebilir veya maliyet doğurabilir. | Provider adapter soyutlanmalı, fallback semantic analysis sağlanmalı. |
| FAQPage yanlış önceliklendirilir | Google FAQ rich result kaldırıldığı halde kullanıcılar bunu hâlâ rich result fırsatı sanabilir. | FAQPage legacy/optional etiketlenmeli; answer block ve kullanıcı değeri öne çıkarılmalı. |
| AI platform source patterns değişir | ChatGPT, Perplexity ve Google AIO kaynak davranışları hızlı değişebilir. | Platform readiness sinyalleri experimental tutulmalı ve scoreVersion ile izlenmeli. |

---

## Open Questions

* Target keyword girilmeden semantic score hangi minimum sinyallerle hesaplanacak?
* Site crawl derinliği MVP’de kaç URL ile sınırlı olacak?
* GSC entegrasyonu Phase 0/1 kapsamına alınacak mı?
* AI visibility için gerçek ChatGPT/Perplexity/Gemini mention tracking hangi fazda eklenecek?
* Score weight’leri sektör veya page type bazlı özelleştirilecek mi?
* Platform readiness sinyalleri UI’da ana skorun yanında mı, ayrı sekmede mi gösterilecek?

---

## Next Deliverables

1. GSEO API Endpoint Spec

  * `/score/url`, `/score/content`, `/semantic/analyze`, `/internal-links/suggest`, `/ai-visibility/check`, `/quota` endpoint kontratları.

2. SeoSuite Data Model v1

  * tenant, site, url, score_snapshot, issue, recommendation, provider_enrichment, experimental_signal tabloları.

3. Phase 0 PRD

  * Proje iskeleti, DB şeması, auth, scoring core skeleton ve ilk endpoint implementasyonu.

4. Phase 0 AGY Prompt

  * Repo yapısı, DB şeması, endpoint skeletonları, ilk audit ve scoring fonksiyonları.

5. Next.js SDK Spec

  * generateSeoMetadata, renderJsonLd, scoreUrl, suggestInternalLinks helper’ları.

6. WordPress Plugin MVP Spec

  * Gutenberg sidebar, save_post hook, wp_options token, SeoSuite score paneli.