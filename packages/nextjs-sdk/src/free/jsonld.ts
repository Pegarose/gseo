import React from 'react';
import { getSeoSuiteConfig } from './config';
import { buildSchema } from './schema-registry';
import type {
  BreadcrumbItem,
  FAQPageSchemaProps,
  WebPageSchemaProps,
  WebSiteSchemaProps,
} from './schema-registry';
import { JsonLdScript } from '../vendor/next-seo/core/JsonLdScript';
import VendorOrganizationJsonLd from '../vendor/next-seo/components/OrganizationJsonLd';
import VendorFAQJsonLd from '../vendor/next-seo/components/FAQJsonLd';
import type { FAQJsonLdProps as VendorFAQJsonLdProps } from '../vendor/next-seo/components/FAQJsonLd';
import type { OrganizationJsonLdProps as VendorOrganizationJsonLdProps } from '../vendor/next-seo/types/organization.types';

export { JsonLdScript, type JsonLdScriptProps } from '../vendor/next-seo/core/JsonLdScript';
export * as processors from '../vendor/next-seo/utils/processors.export';
export * from '../vendor/next-seo/types/common.types';

export {
  ArticleJsonLd,
  type ArticleJsonLdProps,
  ClaimReviewJsonLd,
  type ClaimReviewJsonLdProps,
  CreativeWorkJsonLd,
  type CreativeWorkJsonLdProps,
  RecipeJsonLd,
  type RecipeJsonLdProps,
  HowToJsonLd,
  type HowToJsonLdProps,
  LocalBusinessJsonLd,
  type LocalBusinessJsonLdProps,
  MerchantReturnPolicyJsonLd,
  type MerchantReturnPolicyJsonLdProps,
  MovieCarouselJsonLd,
  type MovieCarouselJsonLdProps,
  BreadcrumbJsonLd,
  type BreadcrumbJsonLdProps,
  CarouselJsonLd,
  type CarouselJsonLdProps,
  CourseJsonLd,
  type CourseJsonLdProps,
  EventJsonLd,
  type EventJsonLdProps,
  ImageJsonLd,
  type ImageJsonLdProps,
  QuizJsonLd,
  type QuizJsonLdProps,
  DatasetJsonLd,
  type DatasetJsonLdProps,
  JobPostingJsonLd,
  type JobPostingJsonLdProps,
  DiscussionForumPostingJsonLd,
  type DiscussionForumPostingJsonLdProps,
  EmployerAggregateRatingJsonLd,
  type EmployerAggregateRatingJsonLdProps,
  VacationRentalJsonLd,
  type VacationRentalJsonLdProps,
  VideoJsonLd,
  type VideoJsonLdProps,
  ProfilePageJsonLd,
  type ProfilePageJsonLdProps,
  SoftwareApplicationJsonLd,
  type SoftwareApplicationJsonLdProps,
  ProductJsonLd,
  type ProductJsonLdProps,
  ReviewJsonLd,
  type ReviewJsonLdProps,
  AggregateRatingJsonLd,
  type AggregateRatingJsonLdProps,
} from '../vendor/next-seo/index';

export interface OrganizationJsonLdProps {
  name?: string;
  url?: string;
  logo?: string;
  sameAs?: string[];
  scriptId?: string;
  scriptKey?: string;
}

export function OrganizationJsonLd(props?: OrganizationJsonLdProps): React.JSX.Element {
  const config = getSeoSuiteConfig();
  const org = config.schema.organization;

  const vendorProps: VendorOrganizationJsonLdProps = {
    name: props?.name ?? org?.name ?? config.siteName,
    url: props?.url ?? org?.url ?? config.siteUrl,
    ...(props?.logo ?? org?.logo ? { logo: props?.logo ?? org?.logo } : {}),
    ...(props?.sameAs ?? org?.sameAs ? { sameAs: props?.sameAs ?? org?.sameAs } : {}),
    ...(props?.scriptId ? { scriptId: props.scriptId } : {}),
    ...(props?.scriptKey ? { scriptKey: props.scriptKey } : {}),
  };

  return React.createElement(VendorOrganizationJsonLd, vendorProps);
}

export interface WebSiteJsonLdProps {
  siteUrl?: string;
  siteName?: string;
  searchUrl?: string;
  scriptId?: string;
  scriptKey?: string;
}

export function WebSiteJsonLd(props?: WebSiteJsonLdProps): React.JSX.Element {
  const config = getSeoSuiteConfig();
  const website = config.schema.website;

  const schemaProps: WebSiteSchemaProps = {
    name: props?.siteName ?? website?.name ?? config.siteName,
    url: props?.siteUrl ?? website?.url ?? config.siteUrl,
    searchUrl: props?.searchUrl ?? website?.searchUrl,
  };

  const data = buildSchema('WebSite', schemaProps);

  return React.createElement(JsonLdScript, {
    data,
    scriptKey: props?.scriptKey ?? 'website-jsonld',
    ...(props?.scriptId ? { id: props.scriptId } : {}),
  });
}

export interface WebPageJsonLdProps {
  url?: string;
  title?: string;
  description?: string;
  breadcrumb?: BreadcrumbItem[];
  scriptId?: string;
  scriptKey?: string;
}

export function WebPageJsonLd({ url, title, description, breadcrumb, scriptId, scriptKey }: WebPageJsonLdProps): React.JSX.Element {
  const config = getSeoSuiteConfig();

  const schemaProps: WebPageSchemaProps = {
    url: url ?? config.siteUrl,
    name: title,
    description,
    breadcrumb: breadcrumb && config.schema.enableBreadcrumb ? breadcrumb : undefined,
  };

  const data = buildSchema('WebPage', schemaProps);

  return React.createElement(JsonLdScript, {
    data,
    scriptKey: scriptKey ?? 'webpage-jsonld',
    ...(scriptId ? { id: scriptId } : {}),
  });
}

export interface FAQJsonLdProps extends Omit<VendorFAQJsonLdProps, 'questions'> {
  questions?: VendorFAQJsonLdProps['questions'];
  items?: FAQPageSchemaProps['items'];
}

export function FAQJsonLd({ questions, items, ...rest }: FAQJsonLdProps): React.JSX.Element {
  const resolvedQuestions =
    questions ??
    items?.map((item) => ({
      question: item.question,
      answer: item.answer,
    })) ??
    [];

  return React.createElement(VendorFAQJsonLd, {
    ...rest,
    questions: resolvedQuestions,
  });
}

export interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
  scriptId?: string;
  scriptKey?: string;
}

export function JsonLd({ data, scriptId, scriptKey }: JsonLdProps): React.JSX.Element {
  return React.createElement(JsonLdScript, {
    data,
    scriptKey: scriptKey ?? 'jsonld',
    ...(scriptId ? { id: scriptId } : {}),
  });
}

export type { VendorOrganizationJsonLdProps as NextSeoOrganizationJsonLdProps };
