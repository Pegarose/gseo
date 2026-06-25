import type { SeoSuiteConfig } from './config';

export type PageType =
  | 'default'
  | 'homepage'
  | 'article'
  | 'page'
  | 'category'
  | 'tag'
  | string;

export interface TitleTemplateVars {
  title?: string;
  excerpt?: string;
  date?: string;
  category?: string;
  tag?: string;
  author?: string;
  page?: string;
  sitename?: string;
  sep?: string;
  currentyear?: string;
}

const TOKEN_PATTERN = /%([a-z]+)%/gi;

/** Replace RankMath-style tokens in a template string. */
export function applyTemplate(template: string, vars: TitleTemplateVars): string {
  const currentYear = vars.currentyear ?? String(new Date().getFullYear());

  const result = template.replace(TOKEN_PATTERN, (_, key: string) => {
    const normalized = key.toLowerCase();
    const map: Record<string, string | undefined> = {
      title: vars.title,
      excerpt: vars.excerpt,
      date: vars.date,
      category: vars.category,
      tag: vars.tag,
      author: vars.author,
      page: vars.page,
      sitename: vars.sitename,
      sep: vars.sep,
      currentyear: currentYear,
    };
    return map[normalized] ?? '';
  });

  return result.replace(/\s+/g, ' ').trim();
}

export function getTitleTemplateForPage(
  pageType: PageType | undefined,
  config: SeoSuiteConfig
): string {
  if (pageType && config.titleTemplates?.[pageType]) {
    return config.titleTemplates[pageType];
  }
  return config.titleTemplate;
}

export function getDescriptionTemplateForPage(
  pageType: PageType | undefined,
  config: SeoSuiteConfig
): string | undefined {
  if (pageType && config.descriptionTemplates?.[pageType]) {
    return config.descriptionTemplates[pageType];
  }
  return config.descriptionTemplate;
}

export interface ResolvePageTitleInput extends TitleTemplateVars {
  pageType?: PageType;
}

/** Resolve the final page title using page-type templates and homepage overrides. */
export function resolvePageTitle(
  input: ResolvePageTitleInput,
  config: SeoSuiteConfig
): string {
  const vars: TitleTemplateVars = {
    ...input,
    sitename: input.sitename ?? config.siteName,
    sep: input.sep ?? config.separator,
  };

  if (input.pageType === 'homepage' && config.homepage?.title) {
    return applyTemplate(config.homepage.title, vars);
  }

  const template = getTitleTemplateForPage(input.pageType, config);
  return applyTemplate(template, vars);
}

export interface ResolvePageDescriptionInput extends TitleTemplateVars {
  pageType?: PageType;
  description?: string;
}

/** Resolve meta description with optional page-type template. */
export function resolvePageDescription(
  input: ResolvePageDescriptionInput,
  config: SeoSuiteConfig
): string | undefined {
  if (input.description) return input.description;

  if (input.pageType === 'homepage' && config.homepage?.description) {
    return applyTemplate(config.homepage.description, {
      ...input,
      sitename: input.sitename ?? config.siteName,
      sep: input.sep ?? config.separator,
    });
  }

  const template = getDescriptionTemplateForPage(input.pageType, config);
  if (!template) return config.defaultDescription;

  return applyTemplate(template, {
    ...input,
    sitename: input.sitename ?? config.siteName,
    sep: input.sep ?? config.separator,
  });
}

/** @deprecated Use resolvePageTitle — kept for backward compatibility */
export function resolveTitleTemplate(title: string, config: SeoSuiteConfig): string {
  return resolvePageTitle({ title }, config);
}
