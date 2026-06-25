# Migrating from next-seo to @seosuite/next

## Install

```bash
npm uninstall next-seo
npm install @seosuite/next
```

## Config

Create `seosuite.config.ts` and import it from your root layout (before using helpers):

```ts
import { defineSeoSuiteConfig } from '@seosuite/next';

defineSeoSuiteConfig({
  siteUrl: 'https://example.com',
  siteName: 'Example',
});
```

## App Router metadata

Replace Pages Router `<NextSeo />` / `generateNextSeo()` with:

```ts
import { withSeoMetadata } from '@seosuite/next';

export const metadata = withSeoMetadata(
  { title: 'About', description: 'About us' },
  '/about'
);
```

## JSON-LD components

Most imports are drop-in renames:

```diff
- import { ArticleJsonLd, BreadcrumbJsonLd } from 'next-seo';
+ import { ArticleJsonLd, BreadcrumbJsonLd } from '@seosuite/next';
```

### FAQ prop rename (optional)

next-seo uses `questions`; GSeoSuite also accepts legacy `items`:

```tsx
<FAQJsonLd
  items={[
    { question: 'Q?', answer: 'A.' },
  ]}
/>
```

### Organization / WebSite defaults

Call with no props to use `defineSeoSuiteConfig()` schema defaults:

```tsx
<OrganizationJsonLd />
<WebSiteJsonLd />
```

For full next-seo prop surfaces, pass explicit props (see next-seo docs).

## Processors

```ts
import { processors } from '@seosuite/next';
```

Same API as `next-seo` `processors` namespace.
