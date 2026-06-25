import { getKeywordIntel, GetKeywordIntelInput } from './keywords';
import { CloudConfigInput } from './cloud-config';

export interface CreateKeywordsApiRouteOptions {
  config?: CloudConfigInput;
}

export function createKeywordsApiRoute(options: CreateKeywordsApiRouteOptions = {}) {
  return async function POST(req: Request): Promise<Response> {
    try {
      const body = (await req.json()) as GetKeywordIntelInput;

      if (!body.keyword || body.keyword.trim().length < 2) {
        return Response.json(
          { success: false, error: { message: 'Missing required field: keyword (min 2 chars)' } },
          { status: 400 }
        );
      }

      const result = await getKeywordIntel(body, options.config);

      return Response.json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Keyword research failed';
      const status = message.includes('not configured') ? 503 : 500;
      return Response.json({ success: false, error: { message } }, { status });
    }
  };
}
