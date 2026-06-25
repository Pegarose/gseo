# Settings persistence

GSeoSuite follows the RankMath model: **SEO settings live on the customer's site**, not in GSeoSuite Cloud.

Cloud is optional (Pro API, Faz 2 intelligence, multi-site agency views). The free OSS tier never requires a cloud account.

## Architecture

```
seosuite.config.ts     → bootstrap (siteUrl, adapter wiring)
        +
SettingsAdapter        → load/save site-wide overrides
        ↓
mergeSeoSuiteConfig    → runtime config for metadata, sitemap, robots, JSON-LD
```

- **`siteUrl`** always comes from bootstrap (`seosuite.config.ts`) — it is not overwritten by the adapter.
- Everything else (titles, robots, OG defaults, redirects, schema org block, …) can be persisted.

## Adapters

| Adapter | Storage | Use case |
|---------|---------|----------|
| **file** | `.seosuite/settings.json` + `.seosuite/redirects.json` | OSS quickstart, VPS/Docker self-host |
| **database** | Customer PostgreSQL (Prisma or custom) | Headless CMS (EfesusStone, etc.) |
| **cloud** | GSeoSuite API | Optional sync — **not** the primary store |

### File adapter (server-only)

```ts
// lib/seo-settings.ts
import { createFileSettingsAdapter, registerSettingsAdapter } from '@seosuite/next';

registerSettingsAdapter(createFileSettingsAdapter({ directory: '.seosuite' }));
```

Import this file from your API route and anywhere you call `loadSeoSuiteConfig()`.

**Note:** File writes do not work on read-only serverless disks (e.g. Vercel). Use the **database** adapter with your own Postgres (Neon, Supabase, CMS DB).

### Database adapter

```ts
import { createDatabaseSettingsAdapter, registerSettingsAdapter } from '@seosuite/next';

registerSettingsAdapter(
  createDatabaseSettingsAdapter({
    label: 'PostgreSQL (seo_site_settings)',
    loadSiteSettings: () => prisma.seoSiteSettings.findUnique({ where: { id: 1 } }),
    saveSiteSettings: (data) =>
      prisma.seoSiteSettings.upsert({ where: { id: 1 }, create: data, update: data }),
  })
);
```

Page-level SEO (per product/post) stays in your CMS tables — the adapter covers **site-wide** settings only.

## Admin save API

```ts
// app/api/seo/settings/route.ts
import { createSeoSettingsRouteHandlers } from '@seosuite/next/admin';
import '../../../seosuite.config';
import '../../../lib/seo-settings';

export const { GET, PUT } = createSeoSettingsRouteHandlers();
```

Pass `saveUrl="/api/seo/settings"` to `SeoAdminLayout`. The Save bar appears when the form is dirty.

## Runtime loading

Async routes automatically merge adapter data when registered:

- `createSitemapRoute()`
- `createRobotsRoute()`
- `createRedirectMiddleware()`
- `loadSeoSuiteConfig()` in admin layouts

Call `await loadSeoSuiteConfig()` on the server before rendering admin pages.

## Environment matrix

| Environment | Recommended adapter | Cloud required? |
|-------------|---------------------|-----------------|
| Local / starter demo | `file` | No |
| Self-hosted Node (VPS) | `file` or `database` | No |
| Headless CMS + Postgres | `database` | No |
| Serverless, no DB | Export/import JSON or add Postgres | No* |
| Agency multi-site dashboard | `database` + optional cloud read sync | For dashboard only |

\* Pro scoring still uses Cloud **API** (`GSEO_API_KEY`) — not the settings store.

## Example

See `examples/nextjs-starter`:

- `lib/seo-settings.ts` — file adapter registration
- `app/api/seo/settings/route.ts` — save API
- `app/admin/seo/layout.tsx` — async load + Save bar
