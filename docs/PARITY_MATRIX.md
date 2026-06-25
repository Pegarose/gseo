# RankMath Parity Matrix

Status of `@seosuite/next` v0.1 vs RankMath Free + next-seo (2026-06).

| Module | RankMath | @seosuite/next | Admin | Persist |
|--------|----------|----------------|-------|---------|
| Metadata / templates | ✓ | ✓ `withSeoMetadata` | Titles & Meta | ✓ |
| JSON-LD (27+ types) | partial | ✓ next-seo vendor | Schema | config |
| Sitemap | ✓ | ✓ `createSitemapRoute` | Sitemap | ✓ |
| robots.txt | ✓ | ✓ `createRobotsRoute` + override | Tools | ✓ |
| Redirects | ✓ | ✓ middleware | Redirections | ✓ |
| General settings | ✓ | ✓ | General (tabs) | ✓ |
| Modules hub | ✓ | ✓ | Modules | ✓ |
| Breadcrumbs | ✓ | ✓ `BreadcrumbJsonLd` | General | ✓ |
| Webmaster verification | ✓ | ✓ | General | ✓ |
| 404 Monitor | ✓ | ✓ `log404Hit` | Modules/Tools | ✓ |
| Image SEO | ✓ | ✓ `resolveImageSeoAttributes` | Tools | ✓ |
| Link Counter | ✓ | ✓ lite `scanPagesForLinks` | Analysis | — |
| Instant Indexing | ✓ | ✓ IndexNow | Indexing | ✓ |
| llms.txt | ✓ | ✓ `createLlmsTxtRoute` | Tools | ✓ |
| SEO Analysis | ✓ | ✓ local checklist | Analysis | — |
| Import/Export | ✓ | ✓ JSON | Tools | — |
| Post SEO box | ✓ | ✓ `SeoPageEditor` | CMS embed | CMS DB |
| Content AI | Pro | Pro API | Editor 🔒 | — |
| SeoSuite Report | Pro | Pro API | Editor 🔒 | — |
| WordPress plugin | ✓ | **Deferred P4** | — | — |
| Keyword/Rank/Backlinks | Pro/SaaS | **Faz 2 Cloud** | Cloud 3001 | — |

See also: [SETTINGS_PERSISTENCE.md](./SETTINGS_PERSISTENCE.md), [NEXTSEO_PARITY.md](./NEXTSEO_PARITY.md), [MIGRATION_FROM_NEXTSEO.md](./MIGRATION_FROM_NEXTSEO.md).
