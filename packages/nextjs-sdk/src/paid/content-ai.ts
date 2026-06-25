import { createSeoSuiteClient, CloudConfigInput, getDefaultSiteId } from './cloud-config';
import { normalizeContentAiResult, ContentAiResult } from './types';

export interface GetContentAiSuggestionsInput {
  html: string;
  url?: string;
  targetKeyword?: string;
  pageType?: string;
  siteId?: string;
}

export async function getContentAiSuggestions(
  input: GetContentAiSuggestionsInput,
  config?: CloudConfigInput
): Promise<ContentAiResult> {
  const client = createSeoSuiteClient(config);
  const siteId = input.siteId ?? getDefaultSiteId(config);

  const raw = await client.analyzeSemantic({
    siteId,
    html: input.html,
    url: input.url,
    targetKeyword: input.targetKeyword,
    pageType: input.pageType,
  });

  return normalizeContentAiResult(raw);
}
