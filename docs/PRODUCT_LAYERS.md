# GSeoSuite — Ürün Katmanları (Site içi vs Platform)

> **Öncelik:** Faz 1 = `@seosuite/next` + WordPress eklentisi. Faz 2 = OpenSEO referanslı cloud intelligence.
>
> OpenSEO kaynak: [every-app/open-seo](https://github.com/every-app/open-seo) — yerel kopya: `.reference/open-seo/` (gitignore)

---

## İki katman

```
┌─────────────────────────────────────────────────────────────────┐
│  FAZ 1 — EXECUTION (site içi, RankMath modeli)                  │
│  @seosuite/next · WordPress eklentisi · müşteri admin/embed   │
│  meta, schema, sitemap, redirect, sayfa skoru, internal link    │
└────────────────────────────┬────────────────────────────────────┘
                             │ score/content, sync, telemetry
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  GSeoSuite Cloud — tenant, çok site, skor geçmişi              │
│  Site detayı: audit, URL scan, snapshot'lar (siteye özel)        │
└────────────────────────────┬────────────────────────────────────┘
                             │ Faz 1 bittikten sonra
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  FAZ 2 — INTELLIGENCE (OpenSEO / Semrush modeli)                │
│  /dashboard/intelligence/* — pazar araştırması, domain, SERP      │
└─────────────────────────────────────────────────────────────────┘
```

---

## OpenSEO nav grupları → GSeoSuite eşlemesi

OpenSEO (`src/client/navigation/items.ts`) üç workflow grubu kullanır:

| OpenSEO grubu | OpenSEO sayfaları | GSeoSuite | Faz |
|---------------|-------------------|-----------|-----|
| **Keywords** | Keyword Research, Saved Keywords, Rank Tracking | `/dashboard/intelligence/keywords` | 2 |
| **Domain** | Domain Overview, Backlinks, Site Audit | `/dashboard/intelligence/domain`, `backlinks` | 2 |
| **AI Visibility** | Brand Lookup, Prompt Explorer | `/dashboard/ai-visibility` (kısmen) | 2 |
| — | AI & MCP | `/dashboard/intelligence/mcp` | 2+ |

OpenSEO'da **Site Audit** domain grubunda ama **siteye özel crawl** — GSeoSuite'te Faz 1 karşılığı:

- SDK `SeoAssistant` + URL scan (`score-url`)
- Cloud site detayı: `PageAnalyzer`, `RunSiteAudit`, audit history

OpenSEO'da **Keyword Research** ayrı route (`/p/$projectId/keywords`) — asla site audit ile karışmaz.
GSeoSuite aynı ayrımı uygular: keyword explorer **site detayında değil**, `intelligence/keywords` altında.

---

## Site içi (Faz 1) — nerede yaşar?

| Özellik | SDK / WP | Cloud dashboard |
|---------|----------|-----------------|
| Meta, canonical, OG | `@seosuite/next` free | — |
| Sitemap, robots, redirect | SDK free | — |
| Schema manager | SDK free/admin | — |
| Sayfa skoru (draft/URL) | `SeoAssistant` Pro | Site detay `PageAnalyzer` |
| Internal link önerileri | `SeoAssistant` Pro | Aynı proxy |
| Content AI (meta/title) | `SeoAssistant` Pro | Aynı proxy |
| Focus keyword (içerik yazarken) | Editör Keywords tab | — |
| Publish → snapshot | SDK hook | Site audit history |
| Admin settings UI | `/admin/seo` embed | — |

**Focus keyword vs Keyword Explorer:** Editördeki Keywords tab RankMath "focus keyword" kutusudur (içerik optimizasyonu). Platform keyword explorer (hacim, CPC, rekabet) Faz 2'dir.

---

## Platform dışı (Faz 2) — `GSEO_PLATFORM_INTEL_ENABLED=true` ile açılır

| Özellik | Route | Provider (plan) |
|---------|-------|-----------------|
| Keyword explorer | `/dashboard/intelligence/keywords` | VebAPI bridge → DataForSEO |
| Saved keywords | `/dashboard/intelligence/keywords/saved` | — |
| Rank tracking | `/dashboard/intelligence/rank-tracking` | SEOCrawl |
| Domain overview | `/dashboard/intelligence/domain` | DomainDetailer + SimilarWeb |
| Backlink checker | `/dashboard/intelligence/backlinks` | VebAPI → DataForSEO |
| GSC dashboard | `/dashboard/intelligence/gsc` | SEOCrawl OAuth |
| Brand / prompt AI | `/dashboard/ai-visibility` | VebAPI + genişletme |

Varsayılan: bu route'lar nav'da gizli; env ile dev/test açılır.

---

## Cloud dashboard nav (Faz 1 odaklı)

```
Overview
Sites          ← site listesi + site detay (audit, URL scan)
AI Visibility  ← readiness (site snapshot'larından; Faz 1.5)
Settings
```

Faz 2 açıkken eklenir:

```
Intelligence   ← OpenSEO grupları: Keywords | Domain | AI
```

---

## OpenSEO'dan kopyalanacak desenler (Faz 2 sprint)

| Dosya (referans) | Ne alınır |
|------------------|-----------|
| `src/client/navigation/items.ts` | Nav grupları |
| `src/client/features/keywords/page/KeywordResearchPage.tsx` | Arama + tab + sonuç tablosu |
| `src/client/features/keywords/state/*` | URL search params, controller |
| `src/routes/_project/p/$projectId/audit/*` | Crawl launch + results UX |
| `src/serverFunctions/*` | DataForSEO adapter sınırı |

GSeoSuite farkı: execution SDK'da kalır; intelligence sadece cloud'da. OpenSEO her şeyi tek app'te toplar.

---

## Uygulama sırası (güncel)

| Sıra | İş | Durum |
|------|-----|-------|
| 1 | SDK 1A runtime (config, sitemap, robots, redirect) | Devam |
| 2 | SDK 1B cloud score + SeoAssistant | Kısmen |
| 3 | SDK 1C–1E admin embed | Kısmen |
| 4 | WordPress eklentisi (aynı cloud API) | Bekliyor |
| 5 | Faz 2 intelligence (OpenSEO parity) | **SDK + WP sonrası** |

---

*Son güncelleme: 2026-06-16*
