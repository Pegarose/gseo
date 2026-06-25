'use server';

import { scoreOnPublish } from '@seosuite/next';

export interface PublishScoreInput {
  url: string;
  html: string;
  title?: string;
  metaDescription?: string;
  targetKeyword?: string;
  pageType?: string;
}

/** Example CMS publish hook — scores content server-side without blocking publish on failure. */
export async function scoreContentOnPublish(input: PublishScoreInput) {
  const result = await scoreOnPublish({
    url: input.url,
    html: input.html,
    title: input.title,
    metaDescription: input.metaDescription,
    targetKeyword: input.targetKeyword,
    pageType: input.pageType,
    options: { includeAiVisibility: true, storeSnapshot: true },
  });

  return result;
}
