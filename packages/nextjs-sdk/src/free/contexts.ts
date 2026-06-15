export interface PageSeoContext {
  title: string;
  description?: string;
  canonical?: string;
  og?: {
    title?: string;
    description?: string;
    image?: string;
    type?: string;
  };
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export function generateMetaTags(context: PageSeoContext): Record<string, string> {
  const tags: Record<string, string> = {
    title: context.title,
  };

  if (context.description) {
    tags['description'] = context.description;
  }

  if (context.canonical) {
    tags['canonical'] = context.canonical;
  }

  if (context.og?.title) {
    tags['og:title'] = context.og.title;
  }

  if (context.og?.description) {
    tags['og:description'] = context.og.description;
  }

  if (context.og?.image) {
    tags['og:image'] = context.og.image;
  }

  return tags;
}

export function generateJsonLdScript(context: PageSeoContext): string | null {
  if (!context.jsonLd) return null;
  return JSON.stringify(context.jsonLd, null, 2);
}
