# SeoSuite SEO & AI Visibility Research Brief

### TL;DR

SeoSuite’in başarılı bir ürün olarak konumlanabilmesi için klasik SEO, semantic content analizi ve AI görünürlük optimizasyonu tek bir bilgi omurgasında birleştirilmelidir. Bu brief; Google Search Central, Schema.org, Core Web Vitals, önde gelen SEO araçları ve AI search/GEO pratiklerini temel alarak SeoSuite’in scoring engine, audit logic, öneri motoru ve ürünleştirme stratejisine yön verecek ilk çerçeveyi tanımlar.

---

## 1\. Amaç ve Kapsam

Bu dokümanın amacı, SeoSuite geliştirilmeden önce ürünün hangi SEO ve AI visibility prensiplerine dayanacağını netleştirmektir. Phase 0 teknik iskeletine geçmeden önce şu sorulara cevap verir:

* SeoSuite hangi SEO kurallarını ölçmeli?
* Hangi sinyaller kesin kural, hangileri öneri veya deneysel içgörü olarak ele alınmalı?
* AI görünürlük optimizasyonu klasik SEO’dan nasıl ayrışıyor?
* SeoSuite’in Yoast, Rank Math, Semrush, Ahrefs, Surfer SEO, Clearscope, MarketMuse ve NeuronWriter gibi araçlardan farkı ne olmalı?
* MVP scoring engine’de hangi sinyaller yer almalı?
* Phase 0 teknik geliştirmeye hangi bilgi gereksinimleri aktarılmalı?

## 2\. Kaynak Güvenilirlik Hiyerarşisi

SeoSuite’in scoring ve audit mantığı güvenilir kaynak katmanlarına göre inşa edilmelidir. Her kaynak türü aynı ağırlıkta değerlendirilmemelidir.

### 2.1 Birincil Kaynaklar

Bu kaynaklar SeoSuite’in truth layer’ı olarak ele alınmalıdır.

| Kaynak | Kullanım Alanı | Güven Seviyesi |
| --- | --- | --- |
| Google Search Central SEO Starter Guide | Temel SEO prensipleri, içerik yapısı, keşfedilebilirlik | Çok yüksek |
| Google Search Essentials | Crawlability, spam policies, people-first content | Çok yüksek |
| Google Helpful Content ve E-E-A-T rehberleri | İçerik kalitesi, güven, uzmanlık, şeffaflık | Çok yüksek |
| Google Core Web Vitals dokümantasyonu | LCP, INP, CLS ve page experience ölçümü | Çok yüksek |
| Google structured data dokümantasyonu | Rich results ve schema uygunluğu | Çok yüksek |
| Google AI/generative search guidance | AI search için resmi yaklaşım | Çok yüksek |
| Schema.org | Structured data vocabulary | Çok yüksek |
| Bing Webmaster Guidelines | Bing ve Microsoft ekosistemi için SEO prensipleri | Yüksek |
| Chrome Web Vitals / PageSpeed dokümantasyonu | Performans ve kullanıcı deneyimi ölçümü | Yüksek |

Önemli prensip: Resmi kaynaklarda desteklenmeyen iddialar SeoSuite içinde kesin ranking kuralı olarak sunulmamalıdır.

### 2.2 İkincil Güvenilir Kaynaklar

Bu kaynaklar resmi rehberleri yorumlamak, uygulama örnekleri geliştirmek ve piyasa pratiğini anlamak için kullanılmalıdır.

* Ahrefs
* Semrush
* Moz
* Search Engine Journal
* Search Engine Land
* Backlinko
* Screaming Frog
* Yoast
* Rank Math
* Surfer SEO
* Clearscope
* MarketMuse
* NeuronWriter

Bu kaynaklardan gelen bilgiler ürün içinde “best practice”, “recommended action” veya “competitive benchmark” olarak kullanılabilir.

### 2.3 Deneysel ve Üçüncül Kaynaklar

Bu kaynaklar fikir üretmek için değerlidir, ancak scoring engine’in çekirdek kural setine doğrudan alınmamalıdır.

* LinkedIn SEO paylaşımları
* Reddit ve forum tartışmaları
* Ajans blogları
* “GEO hack” veya “AI SEO trick” iddiaları
* Doğrulanmamış crawler veya LLM davranışı analizleri

Bu katmandaki bilgiler SeoSuite içinde “experimental signal” veya “observation” olarak etiketlenmelidir.

---

## 3\. Güncel SEO Temelleri

SeoSuite’in temel ürün değeri, farklı CMS ve altyapılarda aynı SEO kalitesini ölçebilmesidir. Bu nedenle ilk scoring engine aşağıdaki ana SEO alanlarını kapsamalıdır.

## 3.1 Crawlability & Indexability

Bir sayfanın arama motorlarında performans gösterebilmesi için önce keşfedilebilir, erişilebilir ve indexlenebilir olması gerekir.

### Kontrol Edilecek Sinyaller

* URL HTTP 200 status döndürüyor mu?
* Robots.txt sayfayı veya kritik kaynakları engelliyor mu?
* Meta robots içinde noindex veya nofollow var mı?
* Canonical URL doğru ve tutarlı mı?
* Sayfa sitemap içinde yer alıyor mu?
* Sayfa iç linklerle keşfedilebilir mi?
* Redirect chain veya redirect loop var mı?
* 404, soft 404 veya 5xx hatası var mı?
* JavaScript ile render edilen ana içerik botlar tarafından görülebiliyor mu?
* Sayfa self-canonical mı yoksa başka URL’ye mi canonical veriyor?

### SeoSuite Ürün Karşılığı

* Indexability Score
* Crawl Blocker Detection
* Robots.txt Risk Check
* Canonical Conflict Warning
* Sitemap Coverage Check
* Redirect Chain Detector
* Rendered vs Raw HTML Content Diff

## 3.2 Technical SEO

Technical SEO, SeoSuite’in site audit ve CMS plugin tarafında en erken ürünleştirilecek alanlarından biridir.

### Kontrol Edilecek Sinyaller

* Title tag var mı, benzersiz mi, aşırı kısa veya uzun mu?
* Meta description var mı, sayfa içeriğiyle uyumlu mu?
* H1 var mı ve sayfanın ana amacıyla uyumlu mu?
* Birden fazla H1 varsa bu sayfa yapısını bozuyor mu?
* Heading hiyerarşisi mantıklı mı?
* URL kısa, okunabilir ve anlamlı mı?
* Görsellerde alt text var mı?
* Internal linkler crawlable anchor elementleriyle verilmiş mi?
* Broken internal veya external link var mı?
* Open Graph ve Twitter card metadata var mı?
* Hreflang gerekiyorsa doğru uygulanmış mı?
* Pagination, canonical ve faceted navigation kuralları doğru mu?

### SeoSuite Ürün Karşılığı

* Technical SEO Score
* Meta Quality Score
* Heading Structure Audit
* Image SEO Audit
* Broken Link Scanner
* URL Quality Check
* Social Metadata Check

## 3.3 Core Web Vitals & Page Experience

Google’ın page experience yaklaşımı doğrudan tek başına tüm sıralamayı belirlemez; ancak kullanıcı deneyimi, crawl verimliliği ve dönüşüm performansı açısından ürünün teknik kalite modülünde yer almalıdır.

### Güncel Core Web Vitals Eşikleri

| Metrik | İyi Eşik | Açıklama |
| --- | --- | --- |
| LCP | 2.5 saniye veya altı | Ana içeriğin yüklenme süresi |
| INP | 200 ms veya altı | Kullanıcı etkileşimlerine yanıt süresi |
| CLS | 0.1 veya altı | Görsel stabilite |

### Kontrol Edilecek Sinyaller

* Sayfa mobilde hızlı mı?
* Görseller optimize edilmiş mi?
* Render-blocking kaynaklar var mı?
* Layout shift yaratan görsel, reklam veya font davranışı var mı?
* Ana içerik geç mi yükleniyor?
* Client-side rendering SEO ve performans riski yaratıyor mu?

### SeoSuite Ürün Karşılığı

* Page Experience Score
* Core Web Vitals Snapshot
* Mobile SEO Risk Detection
* Performance Recommendation Engine
* Image Optimization Suggestions

## 3.4 Structured Data & Rich Results

Structured data, Google’ın içeriği anlamasını kolaylaştırır ve rich result eligibility sağlayabilir. AI görünürlük tarafında da entity netliği için destekleyici rol oynar.

### Öncelikli Schema Tipleri

| Schema Tipi | Kullanım Alanı |
| --- | --- |
| Organization | Marka ve kurum entity sinyalleri |
| WebSite | Site kimliği ve arama aksiyonları |
| WebPage | Sayfa bağlamı |
| Article / BlogPosting | İçerik ve blog sayfaları |
| Product | E-ticaret ve ürün sayfaları |
| FAQPage | Soru-cevap formatındaki içerikler |
| BreadcrumbList | Site yapısı ve hiyerarşi |
| LocalBusiness | Yerel işletmeler |
| Review / AggregateRating | Uygun durumlarda değerlendirme sinyalleri |

### SeoSuite Ürün Karşılığı

* Schema Detection
* Schema Validation
* Rich Result Eligibility Checklist
* Organization Entity Audit
* Breadcrumb Schema Recommendation

---

## 4\. Helpful Content, E-E-A-T ve İçerik Kalitesi

SeoSuite, sadece teknik checklist sunan bir araç olmamalıdır. İçeriğin kullanıcıya gerçek değer sağlayıp sağlamadığını ölçmeye yönelik kalite katmanı içermelidir.

## 4.1 People-First Content Prensipleri

İçerik şu kriterlere göre değerlendirilmelidir:

* Gerçek bir kullanıcı ihtiyacını karşılıyor mu?
* Konuyu yüzeysel değil, yeterli derinlikte ele alıyor mu?
* Sayfa başlığı ve içerik vaat uyumu sağlıyor mu?
* Kullanıcı bu sayfadan sonra başka kaynak arama ihtiyacı hisseder mi?
* İçerik güncel mi?
* Kaynak, örnek, deneyim, vaka veya uzman görüşü içeriyor mu?
* AI destekli üretildiyse insan editoryal kontrolünden geçmiş mi?
* Ana amaç kullanıcıya yardım etmek mi, yoksa yalnızca arama motorlarından trafik almak mı?

## 4.2 E-E-A-T Sinyalleri

E-E-A-T doğrudan basit bir skor faktörü olarak ele alınmamalıdır; kalite değerlendirme çerçevesi olarak kullanılmalıdır.

| Boyut | SeoSuite Kontrolü |
| --- | --- |
| Experience | Yazar veya marka gerçek deneyim gösteriyor mu? |
| Expertise | Konu uzmanlığı, teknik doğruluk ve terminoloji var mı? |
| Authoritativeness | Marka, yazar veya site konu alanında otorite sinyali taşıyor mu? |
| Trustworthiness | Şeffaflık, kaynak, iletişim bilgisi, güvenlik ve doğruluk mevcut mu? |

### SeoSuite Ürün Karşılığı

* Helpful Content Score
* E-E-A-T Signal Checklist
* Author/Profile Signal Audit
* Content Freshness Check
* Source and Citation Quality Check
* Thin Content Detection

---

## 5\. Semantic SEO ve Topical Authority

Semantic SEO, SeoSuite’in en önemli farklılaşma alanlarından biri olmalıdır. Klasik keyword yoğunluğu yerine konu kapsamı, entity ilişkileri ve arama niyeti uyumu ölçülmelidir.

## 5.1 Semantic SEO Sinyalleri

* Sayfa ana arama niyetini karşılıyor mu?
* İçerik, ana konuya bağlı alt konuları kapsıyor mu?
* Rakip SERP sonuçlarında sık geçen entity ve kavramlar içerikte yer alıyor mu?
* İçerik gereksiz keyword tekrarına düşmeden doğal dil kullanıyor mu?
* Sayfada tanımlar, örnekler, karşılaştırmalar ve karar destek bilgileri var mı?
* Site içinde aynı konuya bağlı supporting page’ler var mı?
* Pillar page ve cluster content ilişkisi kurulmuş mu?
* İç linkler semantik olarak anlamlı mı?

## 5.2 Search Intent Sınıflandırması

SeoSuite içerikleri şu intent türlerine göre değerlendirmelidir:

| Intent | Örnek | İçerik Beklentisi |
| --- | --- | --- |
| Informational | “SEO nedir?” | Açıklayıcı rehber, tanım, örnekler |
| Commercial | “en iyi SEO araçları” | Karşılaştırma, avantaj/dezavantaj, tablo |
| Transactional | “SEO aracı satın al” | Ürün, fiyat, CTA, güven sinyalleri |
| Navigational | “Ahrefs login” | Marka veya hedef sayfa odaklı net yönlendirme |
| Local | “İstanbul SEO ajansı” | Yerel sinyaller, adres, hizmet alanı, yorumlar |

### SeoSuite Ürün Karşılığı

* Semantic Coverage Score
* Entity Gap Analysis
* Search Intent Match Score
* Topic Cluster Mapper
* Internal Link Opportunity Engine
* SERP-Based Content Brief Generator

---

## 6\. AI Visibility, GEO ve AEO Çerçevesi

AI visibility, markanın veya içeriğin ChatGPT, Gemini, Perplexity, Claude, Bing Copilot ve Google AI Overviews gibi cevap sistemlerinde görünür, anlaşılır ve referans verilebilir hale gelmesini hedefler.

Önemli not: Google’ın resmi yaklaşımı, AI search için özel hileler yerine temel SEO, kaliteli içerik, crawlability ve güvenilirlik üzerine kuruludur. Bu nedenle SeoSuite, “AI hack” vaat eden bir araç olarak değil, “AI-readable, citation-worthy, entity-consistent content optimization layer” olarak konumlanmalıdır.

## 6.1 AI Citation Readiness

AI sistemleri net, yapılandırılmış ve kaynak gösterilebilir içerikleri daha kolay kullanır.

### Kontrol Edilecek Sinyaller

* Sayfa net bir soruya cevap veriyor mu?
* İlk bölümde kısa ve net özet var mı?
* İçerik başlıklar, listeler ve tablolarla okunabilir hale getirilmiş mi?
* Tanım, karşılaştırma, avantaj/dezavantaj ve örnek içeriyor mu?
* İstatistik veya iddialar kaynaklandırılmış mı?
* Sayfa güncel tarih veya “last updated” bilgisi taşıyor mu?
* İçerik doğrudan alıntılanabilecek açıklıkta cümleler içeriyor mu?

### SeoSuite Ürün Karşılığı

* AI Citation Readiness Score
* Answerability Score
* Extractable Summary Check
* FAQ Opportunity Detector
* Comparison Content Detector

## 6.2 Brand Entity Consistency

AI sistemleri marka ve entity ilişkilerini farklı kaynaklardan sentezleyebilir. Bu nedenle site dışı sinyaller de önemlidir.

### Kontrol Edilecek Sinyaller

* Marka adı web genelinde tutarlı mı?
* Organization schema var mı?
* About page güçlü mü?
* Ürün/hizmet tanımı net mi?
* Sosyal profiller ve üçüncü taraf profiller tutarlı mı?
* Marka sektörel listelerde, karşılaştırmalarda veya review kaynaklarında yer alıyor mu?
* Kurucu/yazar/uzman profilleri açık mı?

### SeoSuite Ürün Karşılığı

* Brand Entity Score
* Organization Schema Audit
* About Page Quality Check
* External Mention Tracker
* Competitor Mention Gap Analysis

## 6.3 Multi-Source Presence

AI cevap sistemleri yalnızca markanın kendi sitesinden değil, web genelindeki güvenilir kaynaklardan da yararlanabilir.

### İzlenmesi Gereken Platformlar

* Google Search sonuçları
* Bing sonuçları
* YouTube
* Reddit
* LinkedIn
* Medium/Substack
* Review platformları
* Sektörel dizinler
* Haber ve PR kaynakları
* “Best tools”, “alternatives”, “comparison” listeleri

### SeoSuite Ürün Karşılığı

* Off-Site Visibility Checklist
* Source Opportunity Suggestions
* AI Share of Voice Tracking
* Competitor AI Mention Comparison

## 6.4 AI Crawler Accessibility

AI crawler erişimi konusunda dengeli yaklaşım gerekir. Her markanın içerik erişim politikası farklı olabilir. SeoSuite burada kesin yönlendirme değil, görünürlük ve risk analizi sunmalıdır.

### Kontrol Edilecek Sinyaller

* Robots.txt GPTBot, ClaudeBot, PerplexityBot veya benzeri botları engelliyor mu?
* Kritik içerikler HTML içinde görülebiliyor mu?
* İçerik tamamen client-side rendering’e mi bağlı?
* Paywall, login veya script bağımlılığı AI crawler erişimini engelliyor mu?
* Structured data içeriği destekliyor mu?

### SeoSuite Ürün Karşılığı

* AI Crawler Access Audit
* Robots.txt AI Bot Policy Check
* AI Parseability Score
* Rendered vs Raw HTML Content Diff

---

## 7\. Rakip Araç Analizi

SeoSuite’in ürün stratejisi, mevcut SEO araçlarının güçlü ve zayıf yönlerine göre konumlanmalıdır.

## 7.1 Araç Kategorileri

| Kategori | Örnek Araçlar | Güçlü Yönler | SeoSuite İçin Ders |
| --- | --- | --- | --- |
| WordPress SEO | Yoast, Rank Math, AIOSEO | WP içinde kullanım kolaylığı, meta, schema, sitemap | Plugin UX basit olmalı, ancak SeoSuite CMS bağımsız kalmalı |
| All-in-one SEO | Semrush, Ahrefs, SE Ranking | Keyword, rakip, backlink, rank tracking | Büyük veri değerli ama MVP’de pahalı veri bağımlılığı azaltılmalı |
| Technical SEO | Screaming Frog, Sitebulb | Crawl, teknik audit, broken links, status codes | Audit motoru teknik olarak güvenilir ve detaylı olmalı |
| Content Optimization | Surfer SEO, Clearscope, Frase, NeuronWriter | NLP terim önerileri, content score, brief | SeoSuite semantic scoring ve NeuronWriter proxy ile fark yaratabilir |
| Content Strategy | MarketMuse | Topic clusters, content inventory, topical authority | Topic cluster ve content gap modülü uzun vadede önemli |
| AI Visibility | Profound, Peec AI, Otterly AI, Ahrefs Brand Radar, Semrush AI Toolkit | AI mention, citation, share of voice | Yeni kategoriye erken girme fırsatı var |

## 7.2 SeoSuite’in Farklılaşma Tezi

SeoSuite klasik bir WordPress SEO plugin’i veya yalnızca content score aracı olmamalıdır. Ana farklılaşma şu olmalıdır:

* API-first ve CMS-agnostik mimari
* WordPress, Next.js, Shopify, Go ve custom CMS entegrasyonları
* Teknik SEO, semantic SEO ve AI visibility scoring’in tek motorda birleşmesi
* NeuronWriter proxy ve ajans workflow entegrasyonu
* Multi-tenant ajans yönetimi
* Internal linking öneri motoru
* EfesusStone gibi gerçek müşteri projelerinde test edilen SEO altyapısının ürünleşmesi

Kısa konumlandırma:

> SeoSuite, farklı CMS ve web altyapılarına entegre edilebilen API-first SEO ve AI visibility intelligence platformudur. Teknik SEO audit, semantic content analizi, internal linking, AI citation readiness ve çok müşterili ajans yönetimini tek ürün katmanında birleştirir.

---

## 8\. MVP Scoring Engine Taslağı

İlk sürümde skor sistemi fazla karmaşık olmamalı, ancak genişletilebilir tasarlanmalıdır. Her skor alanı hem toplam skor hem de aksiyon önerisi üretmelidir.

## 8.1 Önerilen Ana Skorlar

| Skor Alanı | Ağırlık | Açıklama |
| --- | --- | --- |
| Indexability & Crawlability | 20% | Sayfanın keşfedilebilir ve indexlenebilir olması |
| Technical SEO | 20% | Meta, heading, URL, link, schema gibi teknik sinyaller |
| Content Quality & Intent | 20% | İçerik kalitesi, search intent uyumu, helpful content |
| Semantic Coverage | 15% | Entity, topic coverage, rakip içerik boşlukları |
| Page Experience | 10% | Core Web Vitals ve mobil deneyim |
| Internal Linking | 10% | İç link fırsatları, anchor uyumu, orphan page riski |
| AI Visibility Readiness | 5% | AI citation, answerability, entity clarity |

Not: AI Visibility Readiness MVP’de düşük ağırlıkla başlamalıdır, çünkü ölçüm metodolojisi henüz sektör genelinde standartlaşmamıştır. Ancak ürün farklılaşması için ayrı rapor kartı olarak görünür olmalıdır.

## 8.2 Sinyal Seviyeleri

Her sinyal şu seviyelerden biriyle etiketlenmelidir:

| Seviye | Anlamı | Ürün Davranışı |
| --- | --- | --- |
| Critical | Indexing veya ciddi SEO problemi yaratır | Kırmızı uyarı, öncelikli aksiyon |
| High | Performansı belirgin etkileyebilir | Turuncu uyarı, kısa vadeli aksiyon |
| Medium | İyileştirme fırsatı | Sarı öneri |
| Low | Nice-to-have optimizasyon | Bilgilendirici öneri |
| Experimental | AI visibility veya doğrulanmamış piyasa gözlemi | Ayrı etiket ve açıklama |

## 8.3 Örnek MVP Kontrol Listesi

### Critical

* Sayfa noindex
* Robots.txt engeli
* HTTP 4xx/5xx
* Yanlış canonical
* Ana içerik render edilemiyor
* Title tamamen eksik

### High

* Meta description eksik
* H1 eksik
* Broken internal links
* Sitemap dışında önemli sayfa
* Çok yavaş LCP
* CLS yüksek
* Schema hatalı

### Medium

* Title çok uzun veya çok kısa
* Heading hiyerarşisi zayıf
* Görsel alt text eksik
* İçerik search intent ile zayıf uyumlu
* İç link fırsatları kullanılmamış
* FAQ bölümü eksik

### Low

* Open Graph eksik
* Last updated bilgisi yok
* Sosyal profil bağlantıları eksik
* Daha iyi tablo/list formatı önerisi

### Experimental

* AI bot erişim politikası belirsiz
* AI citation readiness zayıf
* Marka entity tutarsızlığı
* Üçüncü taraf mention gap

---

## 9\. Phase 0’a Aktarılacak Ürün Gereksinimleri

Phase 0 teknik geliştirme başlamadan önce aşağıdaki gereksinimler backlog’a eklenmelidir.

## 9.1 Veri Modeli Gereksinimleri

Temel entity’ler:

* Tenant
* User
* Site
* Page
* AuditRun
* AuditIssue
* ScoreSnapshot
* Recommendation
* ApiKey
* QuotaUsage
* Integration
* Keyword veya Topic
* InternalLinkOpportunity
* AiVisibilityCheck

## 9.2 API Gereksinimleri

İlk endpoint grupları:

* Auth ve API key yönetimi
* Site onboarding
* Page scoring
* Technical audit
* Semantic content analysis
* Internal link suggestions
* AI visibility readiness
* Quota ve usage tracking

## 9.3 CMS Entegrasyon Gereksinimleri

İlk entegrasyon önceliği:

1. API Core
2. TypeScript SDK
3. WordPress plugin skeleton
4. Next.js reference client
5. Embeddable widget hazırlığı

WordPress için MVP özellikleri:

* API token wp_options içinde güvenli saklama
* Gutenberg sidebar paneli
* save_post hook ile analysis trigger
* Meta/title/content gönderimi
* Skor ve önerilerin editörde gösterimi

Next.js için MVP özellikleri:

* gseo-client.ts
* Page metadata ve content analysis call
* Build-time veya on-demand analysis desteği
* EfesusStone referans implementasyonundan öğrenilen pattern’lerin paketlenmesi

---

## 10\. Riskler ve Dikkat Edilecek Noktalar

## 10.1 Aşırı Vaat Riski

AI visibility halen gelişen bir alandır. SeoSuite “AI’da kesin görünürlük garantisi” vermemelidir. Bunun yerine “AI visibility readiness”, “citation readiness” ve “brand entity consistency” gibi ölçülebilir hazırlık skorları sunmalıdır.

## 10.2 Yanlış Scoring Riski

Tüm SEO sinyalleri aynı ağırlıkta değildir. Örneğin noindex kritik iken meta description eksikliği daha düşük önceliklidir. Skor sistemi bu farkı açıkça yansıtmalıdır.

## 10.3 Veri Bağımlılığı Riski

Semrush/Ahrefs benzeri büyük keyword ve backlink veritabanlarını MVP’de yeniden üretmek gerçekçi değildir. SeoSuite ilk aşamada CMS içi veri, page content, technical audit ve seçili API entegrasyonlarıyla değer üretmelidir.

## 10.4 CMS Karmaşıklığı

WordPress, Next.js, Shopify ve custom CMS’ler farklı veri modellerine sahiptir. Bu nedenle çekirdek API, CMS-specific pluginlerden bağımsız ve standart kontratlarla çalışmalıdır.

## 10.5 Resmi Rehberlerle Çelişme Riski

SeoSuite’in önerileri Google’ın resmi yaklaşımıyla çelişmemelidir. Özellikle AI/GEO alanında “hack” olarak sunulan öneriler deneysel olarak etiketlenmelidir.

---

## 11\. Önerilen Sonraki Çıktılar

Bu brief tamamlandıktan sonra önerilen çalışma sırası:

1. SeoSuite Scoring Model v1

  * Her skor alanı için sinyal listesi
  * Ağırlıklandırma
  * Severity modeli
  * Örnek JSON response yapısı

2. SeoSuite GSEO API Endpoint Spec

  * Auth
  * Score
  * Audit
  * Semantic analysis
  * AI visibility
  * Internal linking
  * Quota

3. SeoSuite Phase 0 PRD

  * Teknik iskelet
  * Tenant/site/page modeli
  * API key auth
  * Dashboard MVP
  * TypeScript SDK
  * WordPress plugin skeleton

4. Phase 0 AGY Promptu

  * Repo yapısı
  * DB şeması
  * Endpoint skeletonları
  * İlk audit ve scoring fonksiyonları

---

## 12\. Referans Kaynaklar

### Resmi ve Birincil Kaynaklar

* Google SEO Starter Guide: [https://developers.google.com/search/docs/fundamentals/seo-starter-guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
* Google Search Essentials: [https://developers.google.com/search/docs/essentials](https://developers.google.com/search/docs/essentials)
* Google Helpful Content Guidance: [https://developers.google.com/search/docs/fundamentals/creating-helpful-content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
* Google Core Web Vitals: [https://developers.google.com/search/docs/appearance/core-web-vitals](https://developers.google.com/search/docs/appearance/core-web-vitals)
* Google SEO Guide for Web Developers: [https://developers.google.com/search/docs/fundamentals/get-started-developers](https://developers.google.com/search/docs/fundamentals/get-started-developers)
* Google guidance for generative AI features on Search: [https://developers.google.com/search/docs/fundamentals/ai-optimization-guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
* Schema.org: [https://schema.org](https://schema.org)

### SEO ve AI Visibility Piyasa Kaynakları

* Ahrefs GEO guide: [https://ahrefs.com/blog/geo-generative-engine-optimization/](https://ahrefs.com/blog/geo-generative-engine-optimization/)
* Backlinko GEO guide: [https://backlinko.com/generative-engine-optimization-geo](https://backlinko.com/generative-engine-optimization-geo)
* Search Engine Journal GEO strategies: [https://www.searchenginejournal.com/boost-search-visibility-geo-writesonic-spa/554057/](https://www.searchenginejournal.com/boost-search-visibility-geo-writesonic-spa/554057/)
* HubSpot GEO overview: [https://blog.hubspot.com/marketing/generative-engine-optimization](https://blog.hubspot.com/marketing/generative-engine-optimization)
* Screaming Frog: [https://www.screamingfrog.co.uk/seo-spider/](https://www.screamingfrog.co.uk/seo-spider/)
* Semrush: [https://www.semrush.com](https://www.semrush.com)
* Ahrefs: [https://ahrefs.com](https://ahrefs.com)
* Surfer SEO: [https://surferseo.com](https://surferseo.com)
* Clearscope: [https://www.clearscope.io](https://www.clearscope.io)
* MarketMuse: [https://www.marketmuse.com](https://www.marketmuse.com)
* NeuronWriter: [https://neuronwriter.com](https://neuronwriter.com)

---

## 13\. Karar Özeti

SeoSuite, SEO dünyasındaki üç ana evrimi tek platformda birleştirmelidir:

1. Teknik SEO ve indexability temeli
2. Semantic SEO ve helpful content kalitesi
3. AI visibility ve citation readiness hazırlığı

MVP’de hedef, Semrush veya Ahrefs gibi dev veri platformlarını taklit etmek olmamalıdır. Daha doğru strateji, GMedya’nın müşteri operasyonlarına doğrudan entegre olabilen, CMS-agnostik, API-first ve aksiyon odaklı bir SEO intelligence layer geliştirmektir.

Bu brief, Phase 0 öncesinde ürünün bilgi omurgası olarak kabul edilmeli ve sonraki Scoring Model, API Spec ve AGY promptu bu prensiplere göre hazırlanmalıdır.