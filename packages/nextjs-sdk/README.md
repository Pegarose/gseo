# @seosuite/next

Open-source SEO SDK for Next.js App Router — [next-seo](https://github.com/garmeeh/next-seo) parity plus RankMath-style site tools.

**No cloud account required** for the free tier: metadata, JSON-LD, sitemap, robots, redirects, and an embeddable admin panel.

## Quickstart (5 minutes)

```bash
npm install @seosuite/next
```

```ts
// seosuite.config.ts
import { defineSeoSuiteConfig } from '@seosuite/next';

export default defineSeoSuiteConfig({
  siteUrl: 'https://example.com',
  siteName: 'Example',
  titleTemplate: '%title% %sep% %sitename%',
});
```

Import the config from your root layout before using SDK helpers:

```tsx
// app/layout.tsx
import '../seosuite.config';
```

### Metadata

```ts
import { withSeoMetadata } from '@seosuite/next';

export const metadata = withSeoMetadata(
  { title: 'About', description: 'About our company' },
  '/about'
);
```

### JSON-LD

```tsx
import { ArticleJsonLd, BreadcrumbJsonLd, OrganizationJsonLd } from '@seosuite/next';

<OrganizationJsonLd />
<ArticleJsonLd url="..." headline="..." datePublished="2026-01-01" />
```

27+ schema types and `processors` are included (vendored from next-seo v7). See [docs/NEXTSEO_PARITY.md](../../docs/NEXTSEO_PARITY.md).

### Sitemap & robots

```ts
// app/sitemap.ts
import { createSitemapRoute } from '@seosuite/next';
import '../seosuite.config';

export default createSitemapRoute({
  entries: [{ url: 'https://example.com/', priority: 1 }],
});
```

```ts
// app/robots.ts
import { createRobotsRoute } from '@seosuite/next';
import '../seosuite.config';

export default createRobotsRoute();
```

### Redirects

```ts
// middleware.ts
import { createRedirectMiddleware } from '@seosuite/next';
import './seosuite.config';

export const middleware = createRedirectMiddleware();
```

### Admin panel (RankMath-style embed)

```tsx
// app/admin/seo/layout.tsx
import { loadSeoSuiteConfig, serializeAdminConfig } from '@seosuite/next';
import { SeoAdminLayout } from '@seosuite/next/admin';

export default async function Layout({ children }) {
  const config = serializeAdminConfig(await loadSeoSuiteConfig());
  return (
    <SeoAdminLayout config={config} saveUrl="/api/seo/settings">
      {children}
    </SeoAdminLayout>
  );
}
```

Wire persistence with a `SettingsAdapter` — see [docs/SETTINGS_PERSISTENCE.md](../../docs/SETTINGS_PERSISTENCE.md).

## Exports

| Import | Purpose |
|--------|---------|
| `@seosuite/next` | Config, metadata, JSON-LD, sitemap, robots, redirects, settings adapters |
| `@seosuite/next/admin` | Embeddable RankMath-style admin UI |
| `@seosuite/next/client` | Pro hooks (`usePageSeoScore`, `SeoAssistant`, …) |

## Pro (optional)

Cloud-backed scoring and Content AI require `GSEO_API_KEY` and a GSeoSuite subscription. The OSS core runs fully offline.

## License

MIT — includes vendored [next-seo](https://github.com/garmeeh/next-seo) components (see [NOTICE.md](./NOTICE.md)).
