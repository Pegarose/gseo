import { createSeoSuiteClient, CloudConfigInput } from './cloud-config';
import { normalizeKeywordIntelResult, KeywordIntelResult } from './types';

export interface GetKeywordIntelInput {
  keyword: string;
  country?: string;
  mode?: 'research' | 'single';
}

export async function getKeywordIntel(
  input: GetKeywordIntelInput,
  config?: CloudConfigInput
): Promise<KeywordIntelResult> {
  const client = createSeoSuiteClient(config);

  const raw = await client.getKeywordIntel({
    keyword: input.keyword,
    country: input.country ?? 'tr',
    mode: input.mode ?? 'research',
  });

  return normalizeKeywordIntelResult(raw);
}
