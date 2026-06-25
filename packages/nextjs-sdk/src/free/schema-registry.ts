export type SchemaType =
  | 'Organization'
  | 'WebSite'
  | 'WebPage'
  | 'Article'
  | 'BreadcrumbList'
  | 'FAQPage'
  | 'HowTo';

export interface OrganizationSchemaProps {
  name: string;
  url?: string;
  logo?: string;
  sameAs?: string[];
}

export interface WebSiteSchemaProps {
  name: string;
  url: string;
  searchUrl?: string;
}

export interface WebPageSchemaProps {
  url: string;
  name?: string;
  description?: string;
  breadcrumb?: BreadcrumbItem[];
}

export interface ArticleSchemaProps {
  url: string;
  headline: string;
  description?: string;
  image?: string | { url: string; width?: number; height?: number };
  datePublished?: string;
  dateModified?: string;
  author?: { name: string; url?: string } | Array<{ name: string; url?: string }>;
  publisher?: { name: string; logo?: string; url?: string };
}

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export interface BreadcrumbListSchemaProps {
  items: BreadcrumbItem[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FAQPageSchemaProps {
  items: FaqItem[];
}

export interface HowToStep {
  name: string;
  text: string;
  url?: string;
  image?: string;
}

export interface HowToSchemaProps {
  name: string;
  description?: string;
  totalTime?: string;
  image?: string;
  steps: HowToStep[];
}

export type SchemaPropsMap = {
  Organization: OrganizationSchemaProps;
  WebSite: WebSiteSchemaProps;
  WebPage: WebPageSchemaProps;
  Article: ArticleSchemaProps;
  BreadcrumbList: BreadcrumbListSchemaProps;
  FAQPage: FAQPageSchemaProps;
  HowTo: HowToSchemaProps;
};

export const SCHEMA_REGISTRY: Record<SchemaType, SchemaType> = {
  Organization: 'Organization',
  WebSite: 'WebSite',
  WebPage: 'WebPage',
  Article: 'Article',
  BreadcrumbList: 'BreadcrumbList',
  FAQPage: 'FAQPage',
  HowTo: 'HowTo',
};

export function buildSchema<T extends SchemaType>(
  type: T,
  props: SchemaPropsMap[T]
): Record<string, unknown> {
  switch (type) {
    case 'Organization':
      return buildOrganization(props as OrganizationSchemaProps);
    case 'WebSite':
      return buildWebSite(props as WebSiteSchemaProps);
    case 'WebPage':
      return buildWebPage(props as WebPageSchemaProps);
    case 'Article':
      return buildArticle(props as ArticleSchemaProps);
    case 'BreadcrumbList':
      return buildBreadcrumbList(props as BreadcrumbListSchemaProps);
    case 'FAQPage':
      return buildFAQPage(props as FAQPageSchemaProps);
    case 'HowTo':
      return buildHowTo(props as HowToSchemaProps);
    default:
      throw new Error(`[@seosuite/next] Unknown schema type: ${type}`);
  }
}

/** Build multiple schemas as a JSON-LD @graph document. */
export function buildSchemaGraph(
  entries: Array<{ type: SchemaType; props: SchemaPropsMap[SchemaType] }>
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': entries.map(({ type, props }) => {
      const node = buildSchema(type, props as never);
      const { '@context': _ctx, ...rest } = node;
      return rest;
    }),
  };
}

function withContext(schema: Record<string, unknown>): Record<string, unknown> {
  return { '@context': 'https://schema.org', ...schema };
}

function buildOrganization(props: OrganizationSchemaProps): Record<string, unknown> {
  return withContext({
    '@type': 'Organization',
    name: props.name,
    url: props.url,
    logo: props.logo,
    sameAs: props.sameAs,
  });
}

function buildWebSite(props: WebSiteSchemaProps): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@type': 'WebSite',
    name: props.name,
    url: props.url,
  };

  if (props.searchUrl) {
    schema.potentialAction = {
      '@type': 'SearchAction',
      target: props.searchUrl,
      'query-input': 'required name=search_term',
    };
  }

  return withContext(schema);
}

function buildWebPage(props: WebPageSchemaProps): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@type': 'WebPage',
    url: props.url,
    name: props.name,
    description: props.description,
  };

  if (props.breadcrumb?.length) {
    const list = buildBreadcrumbList({ items: props.breadcrumb });
    const { '@context': _ctx, ...breadcrumb } = list;
    schema.breadcrumb = breadcrumb;
  }

  return withContext(schema);
}

function buildArticle(props: ArticleSchemaProps): Record<string, unknown> {
  const image =
    typeof props.image === 'string' ? props.image : props.image?.url;

  const author = props.author
    ? Array.isArray(props.author)
      ? props.author.map((a) => ({ '@type': 'Person', name: a.name, url: a.url }))
      : [{ '@type': 'Person', name: props.author.name, url: props.author.url }]
    : undefined;

  return withContext({
    '@type': 'Article',
    mainEntityOfPage: { '@type': 'WebPage', '@id': props.url },
    headline: props.headline,
    description: props.description,
    image,
    datePublished: props.datePublished,
    dateModified: props.dateModified ?? props.datePublished,
    author,
    publisher: props.publisher
      ? {
          '@type': 'Organization',
          name: props.publisher.name,
          logo: props.publisher.logo,
          url: props.publisher.url,
        }
      : undefined,
  });
}

function buildBreadcrumbList(props: BreadcrumbListSchemaProps): Record<string, unknown> {
  return withContext({
    '@type': 'BreadcrumbList',
    itemListElement: props.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  });
}

function buildFAQPage(props: FAQPageSchemaProps): Record<string, unknown> {
  return withContext({
    '@type': 'FAQPage',
    mainEntity: props.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  });
}

function buildHowTo(props: HowToSchemaProps): Record<string, unknown> {
  return withContext({
    '@type': 'HowTo',
    name: props.name,
    description: props.description,
    totalTime: props.totalTime,
    image: props.image,
    step: props.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      url: step.url,
      image: step.image,
    })),
  });
}
