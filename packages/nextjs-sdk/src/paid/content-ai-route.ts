import { getContentAiSuggestions, GetContentAiSuggestionsInput } from './content-ai';
import { CloudConfigInput } from './cloud-config';
import { normalizeContentAiResult } from './types';

export interface CreateContentAiApiRouteOptions {
  config?: CloudConfigInput;
}

export function createContentAiApiRoute(options: CreateContentAiApiRouteOptions = {}) {
  return async function POST(req: Request): Promise<Response> {
    try {
      const body = (await req.json()) as GetContentAiSuggestionsInput;

      if (!body.html) {
        return Response.json(
          { success: false, error: { message: 'Missing required field: html' } },
          { status: 400 }
        );
      }

      const result = await getContentAiSuggestions(body, options.config);

      return Response.json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Content AI suggestions failed';
      return Response.json({ success: false, error: { message } }, { status: 500 });
    }
  };
}

export { normalizeContentAiResult };
