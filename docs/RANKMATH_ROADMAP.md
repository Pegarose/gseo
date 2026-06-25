# GSeoSuite RankMath Yol Haritası (Next.js First)

> **Strateji kararı:** Faz 1 önceliği **Next.js SDK** (`@seosuite/next`). WordPress eklentisi Faz 1 tamamlandıktan sonra aynı cloud API sözleşmesiyle genişletilir. Faz 2’de [open-seo](https://github.com/every-app/open-seo) referans alınarak cloud’da Semrush-benzeri modüller eklenir.

> Katman ayrımı ve OpenSEO eşlemesi: **[PRODUCT_LAYERS.md](./PRODUCT_LAYERS.md)**

---

## Ürün mimarisi (iki katman)

```
┌─────────────────────────────────────────────────────────────┐
│  Faz 1 — Execution (site içi, RankMath modeli)              │
│  @seosuite/next — meta, schema, sitemap, redirect, editör   │
└──────────────────────────┬──────────────────────────────────┘
                           │ score/content, sync, telemetry
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  GSeoSuite Cloud — scoring engine, tenant, dashboard        │
└──────────────────────────┬──────────────────────────────────┘
                           │ (Faz 2)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Faz 2 — Intelligence (OpenSEO / Semrush modeli)            │
│  keyword, rank track, backlinks, domain insights, GSC, MCP    │
└─────────────────────────────────────────────────────────────┘
```

Headless müşteriler için **SEO paneli** iki yerde olabilir:

1. **Müşteri Next.js admin route’u** — `@seosuite/next/admin` (embed panel, CMS editörü yanında)
2. **GSeoSuite Cloud dashboard** — çok siteli ajans görünümü, raporlama, Faz 2 modülleri

RankMath ekran görüntüleri geldiğinde **admin embed panel** UI’si bu referansa göre eşleştirilecek.

---

## Mevcut durum (`@seosuite/next` v0.1.0)

| Modül | Durum | Not |
|-------|--------|-----|
| `withSeoMetadata` | ✅ | App Router metadata wrapper |
| JSON-LD (27+ types) | ✅ | next-seo v7 vendor |
| `createSitemapRoute` | ✅ | Exclude rules + persist |
| `createRobotsRoute` | ✅ | Custom robots.txt override |
| Redirect middleware | ✅ | Adapter-backed rules |
| SettingsAdapter | ✅ | file + database + Prisma helper |
| Admin embed | ✅ | Modules, General, Titles, Tools, Analysis |
| `SeoPageEditor` | ✅ | CMS embed (EfesusStone tabs) |
| Pro cloud hooks | 🟡 | GSEO_API_KEY gate + API routes |
| WordPress plugin | ⏸ P4 | [WORDPRESS_DEFERRED.md](./WORDPRESS_DEFERRED.md) |

Full matrix: **[PARITY_MATRIX.md](./PARITY_MATRIX.md)**

---

## Faz 1 — Next.js RankMath parity (alt fazlar)

### 1A — Çekirdek runtime (Free tier) — **MVP**

**Hedef:** Kurulum sonrası RankMath Free’nin teknik SEO iskeleti, kod yazmadan.

| Deliverable | Açıklama |
|-------------|----------|
| `createSeoSuite()` config | `siteUrl`, `siteId`, `defaultLocale`, global title template |
| `withSeoMetadata()` | App Router `generateMetadata` wrapper |
| `SeoJsonLd` component | Sayfa + site schema inject |
| `createSitemapRoute()` | `SitemapEntry[]` → Next.js MetadataRoute.Sitemap |
| `createRobotsRoute()` | robots config → MetadataRoute.Robots |
| `redirects.json` + `createRedirectMiddleware()` | RankMath Redirections karşılığı |
| `seosuite.config.ts` şema | Zod-validated site-wide defaults |

**Başarı kriteri:** Boş Next.js 15 projesine SDK kurulur; sitemap, robots, title template ve tek sayfa schema çalışır — cloud olmadan.

---

### 1B — Cloud bağlantı + sayfa skoru (Pro tier başlangıcı)

**Hedef:** Editör/preview anında skor — RankMath post SEO box karşılığı.

| Deliverable | Açıklama |
|-------------|----------|
| `SeoSuiteClient.scoreContent()` | HTML + meta → `/api/v1/score/content` |
| `usePageSeoScore()` hook | Draft/preview URL veya inline HTML ile skor |
| `SeoAssistant` (geliştirilmiş) | Skor band, top issues, quick wins, focus keyword |
| Build-time / ISR revalidate hook | `publish` sonrası otomatik skor tetikleme |
| Tenant API key env | `GSEO_API_KEY`, `GSEO_SITE_ID` |

**Başarı kriteri:** Müşteri admin’de sayfa düzenlerken skor görür; publish’te cloud’a snapshot gider; GSeoSuite dashboard’da görünür.

---

### 1C — Global SEO ayarları (RankMath General + Titles & Meta)

| Deliverable | Açıklama |
|-------------|----------|
| Title/description **şablonları** | `%title%`, `%sep%`, `%sitename%`, post type defaults |
| Homepage overrides | |
| `noindex` / `nofollow` / canonical kuralları | |
| Open Graph + Twitter card defaults | |
| Config sync (opsiyonel) | Cloud’dan tenant site settings pull |

**Headless notu:** Ayarlar `seosuite.config.ts` + isteğe bağlı Cloud Settings API; Sanity/Contentful için ayrı adapter sonra.

---

### 1D — Schema manager (RankMath Schema)

| Deliverable | Açıklama |
|-------------|----------|
| Schema type registry | Article, WebPage, Organization, FAQ, BreadcrumbList |
| `buildSchema(type, props)` | Tip güvenli builder |
| Sayfa frontmatter / CMS alanı → schema | |
| FAQ + HowTo blokları | AI visibility ile uyumlu |

---

### 1E — Admin panel embed (`@seosuite/next/admin`)

RankMath WP admin ekranlarının Next.js karşılığı — **ekran görüntüleri geldikten sonra UI parity matrisi doldurulacak**.

| Ekran (RankMath referans) | Next.js karşılığı | Cloud? |
|---------------------------|-------------------|--------|
| Dashboard | `/admin/seo` overview widget | Kısmen |
| General Settings | Config UI + `seosuite.config` | Hayır |
| Titles & Meta | Template editor | Hayır |
| Sitemap | Route preview + exclude rules | Hayır |
| Redirections | Redirect CRUD → `redirects.json` veya DB | Hayır |
| Schema | Type picker + preview | Hayır |
| Post SEO box | `SeoAssistant` sidebar in CMS admin | Evet |
| Analytics / GSC | — | **Faz 2** |
| Link Builder | Internal link önerileri listesi | Evet |
| Content AI | Meta/title önerisi | Evet |

---

## Dogfooding hedefleri

İlk entegrasyon adayları (headless):

1. **EfesusStone** — mevcut Next.js CMS (`setup-api-key.ts` referansı)
2. **GMedya** kurumsal site(ler)
3. GSeoSuite monorepo içinde `examples/nextjs-starter/` demo app

Her milestone: gerçek domain + tenant + API key ile uçtan uca test.

---

## Faz 2 — OpenSEO / Semrush cloud (SDK + WordPress sonrası)

**Varsayılan kapalı:** `GSEO_PLATFORM_INTEL_ENABLED=true` ile `/dashboard/intelligence/*` açılır.

RankMath katmanı oturduktan sonra cloud dashboard’a ek modüller. OpenSEO nav grupları (`Keywords` | `Domain` | `AI Visibility`) — bkz. [PRODUCT_LAYERS.md](./PRODUCT_LAYERS.md).

| OpenSEO | GSeoSuite aksiyonu | Mevcut |
|---------|---------------------|--------|
| Site audit | Scoring engine + Lighthouse adapter | Kısmen |
| Keyword research | DataForSEO (veya benzeri) adapter | Yok |
| Rank tracking | Scheduled SERP jobs | Yok |
| Domain insights | Labs API | Yok |
| Backlinks | DataForSEO Backlinks | Yok |
| AI brand visibility | `ai-visibility` genişletme | Kısmen |
| GSC | OAuth integration | Yok |
| MCP / Agent | Ajans tier | Yok |

**Monetization:**

- **Free (`@seosuite/next` free):** sitemap, robots, meta helper, temel schema
- **Pro (site + cloud):** score/content, AI visibility, internal links, Content AI
- **Agency (cloud):** keyword, rank, backlink, multi-site — OpenSEO tarzı

---

## RankMath ekran görüntüsü intake (bekleyen)

Her görsel için doldurulacak matris:

```
Ekran:
RankMath işlevi:
Next.js karşılığı (runtime / admin / cloud):
Free / Pro / Agency:
MVP / P1 / P2:
Not (sadeleştir / farklılaştır):
```

Görsel grupları: Dashboard → General/Titles → Sitemap/Redirects → Schema → Post editor box → Pro/Analytics.

---

## Önerilen uygulama sırası (ilk 4 sprint)

| Sprint | Odak | Çıktı |
|--------|------|-------|
| S1 | 1A runtime | Config + metadata + sitemap + robots + redirects |
| S2 | 1B cloud | `scoreContent`, SeoAssistant, publish hook |
| S3 | 1C + 1D | Templates + schema builders |
| S4 | 1E admin v1 | `/admin/seo` settings + RankMath UI parity (görsellerle) |

WordPress eklentisi: **S4 sonrası** — aynı cloud API, farklı execution surface (PHP metabox).

---

## Açık kararlar

- [ ] Admin panel: müşteri projesinde embed mi, sadece cloud dashboard mı, ikisi birden mi? → **Öneri: ikisi birden**
- [ ] Redirect storage: `redirects.json` (git) vs cloud-synced DB → **Öneri: json local free, cloud sync Pro**
- [ ] CMS adapters önceliği: custom admin vs Sanity vs Contentful → **EfesusStone custom admin first**

---

*Son güncelleme: 2026-06-15 — Strateji: C) Next.js SDK first*
