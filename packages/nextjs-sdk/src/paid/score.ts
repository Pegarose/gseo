import { createSeoSuiteClient, CloudConfigInput, getDefaultSiteId } from './cloud-config';
import { ScoreContentPayload, SeoSuiteClient } from './client';
import { normalizeScoreResult, ScoreContentResult } from './types';

export interface ScorePageContentInput extends Omit<ScoreContentPayload, 'siteId'> {
  siteId?: string;
}

export async function scorePageContent(
  input: ScorePageContentInput,
  config?: CloudConfigInput
): Promise<ScoreContentResult> {
  const client = createSeoSuiteClient(config);
  const siteId = input.siteId ?? getDefaultSiteId(config);

  const raw = await client.scoreContent({
    ...input,
    siteId,
    options: {
      includeAiVisibility: true,
      storeSnapshot: true,
      ...input.options,
    },
  });

  return normalizeScoreResult(raw);
}

export async function scoreOnPublish(
  input: ScorePageContentInput,
  config?: CloudConfigInput
): Promise<ScoreContentResult | null> {
  try {
    return await scorePageContent(input, config);
  } catch (error) {
    console.error('[@seosuite/next] scoreOnPublish failed:', error);
    return null;
  }
}

export { createSeoSuiteClient };
export type { SeoSuiteClient };
