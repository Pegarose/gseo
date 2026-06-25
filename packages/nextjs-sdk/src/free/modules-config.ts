import { z } from 'zod';

export const seoModulesSchema = z.object({
  breadcrumbs: z.object({ enabled: z.boolean().default(true) }).default({ enabled: true }),
  imageSeo: z
    .object({
      enabled: z.boolean().default(false),
      altTemplate: z.string().default('%title%'),
      titleTemplate: z.string().default('%title%'),
    })
    .default({ enabled: false, altTemplate: '%title%', titleTemplate: '%title%' }),
  linkCounter: z.object({ enabled: z.boolean().default(false) }).default({ enabled: false }),
  instantIndexing: z
    .object({
      enabled: z.boolean().default(false),
      indexNowKey: z.string().optional(),
      history: z
        .array(
          z.object({
            url: z.string().url(),
            submittedAt: z.string(),
            status: z.enum(['sent', 'failed']),
          })
        )
        .default([]),
    })
    .default({ enabled: false, history: [] }),
  llmsTxt: z
    .object({
      enabled: z.boolean().default(false),
      content: z.string().default(''),
    })
    .default({ enabled: false, content: '' }),
  monitor404: z
    .object({
      enabled: z.boolean().default(false),
    })
    .default({ enabled: false }),
  links: z
    .object({
      nofollowExternal: z.boolean().default(false),
      openExternalInNewTab: z.boolean().default(false),
    })
    .default({ nofollowExternal: false, openExternalInNewTab: false }),
});

export type SeoModulesConfig = z.infer<typeof seoModulesSchema>;

export const defaultSeoModules = seoModulesSchema.parse({});
