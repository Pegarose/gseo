import { suggestInternalLinks, SuggestInternalLinksInput } from './internal-links';
import { CloudConfigInput } from './cloud-config';
import { normalizeInternalLinksResult } from './types';

export interface CreateInternalLinksApiRouteOptions {
  config?: CloudConfigInput;
}

export function createInternalLinksApiRoute(options: CreateInternalLinksApiRouteOptions = {}) {
  return async function POST(req: Request): Promise<Response> {
    try {
      const body = (await req.json()) as SuggestInternalLinksInput;

      if (!body.sourceUrl) {
        return Response.json(
          { success: false, error: { message: 'Missing required field: sourceUrl' } },
          { status: 400 }
        );
      }

      const result = await suggestInternalLinks(body, options.config);

      return Response.json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal link suggestions failed';
      return Response.json({ success: false, error: { message } }, { status: 500 });
    }
  };
}

export { normalizeInternalLinksResult };
