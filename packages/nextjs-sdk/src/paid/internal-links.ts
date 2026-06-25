import { createSeoSuiteClient, CloudConfigInput, getDefaultSiteId } from './cloud-config';
import { normalizeInternalLinksResult, InternalLinksResult } from './types';

export interface SuggestInternalLinksInput {
  sourceUrl: string;
  html?: string;
  targetKeyword?: string;
  pageType?: string;
  siteId?: string;
}

export async function suggestInternalLinks(
  input: SuggestInternalLinksInput,
  config?: CloudConfigInput
): Promise<InternalLinksResult> {
  const client = createSeoSuiteClient(config);
  const siteId = input.siteId ?? getDefaultSiteId(config);

  const raw = await client.suggestInternalLinks({
    siteId,
    sourceUrl: input.sourceUrl,
    html: input.html,
    targetKeyword: input.targetKeyword,
    pageType: input.pageType,
  });

  return normalizeInternalLinksResult(raw);
}
