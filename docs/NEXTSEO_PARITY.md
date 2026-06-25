# next-seo Parity (Sprint −1)

`@seosuite/next` vendors [next-seo](https://github.com/garmeeh/next-seo) v7.2.0 JSON-LD components under `src/vendor/next-seo/`. Users import everything from `@seosuite/next` — not from `next-seo` directly.

## Covered today

| Area | Status |
|------|--------|
| JSON-LD components (~27 types) | Vendored + re-exported |
| `processors` namespace | Re-exported |
| `JsonLdScript` | Server-safe (no `'use client'`) |
| Config-aware wrappers | `OrganizationJsonLd`, `WebSiteJsonLd`, `WebPageJsonLd` |
| FAQ backward compat | `items` prop maps to next-seo `questions` |
| Metadata (`withSeoMetadata`) | App Router helper; OG `siteName` + Bing verification fixed |

## GSeoSuite extras (not in next-seo)

- `defineSeoSuiteConfig`, title/description templates
- `generateSitemap`, `generateRobots`, redirects
- Admin embed (`@seosuite/next/admin`)
- Pro cloud features (`@seosuite/next` paid exports)

## Attribution

See [NOTICE.md](../packages/nextjs-sdk/NOTICE.md) and `src/vendor/next-seo/LICENSE`.
