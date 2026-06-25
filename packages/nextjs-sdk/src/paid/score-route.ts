import { scorePageContent, ScorePageContentInput } from './score';
import { CloudConfigInput } from './cloud-config';
import { normalizeScoreResult } from './types';

export interface CreateScoreApiRouteOptions {
  config?: CloudConfigInput;
}

/**
 * Creates a Next.js App Router POST handler that proxies score/content
 * so the API key stays server-side.
 *
 * Usage in app/api/seo/score/route.ts:
 *   export const POST = createScoreApiRoute();
 */
export function createScoreApiRoute(options: CreateScoreApiRouteOptions = {}) {
  return async function POST(req: Request): Promise<Response> {
    try {
      const body = (await req.json()) as ScorePageContentInput;

      if (!body.html || !body.url) {
        return Response.json(
          { success: false, error: { message: 'Missing required fields: html, url' } },
          { status: 400 }
        );
      }

      const result = await scorePageContent(body, options.config);

      return Response.json({
        success: true,
        data: result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Scoring failed';
      return Response.json(
        { success: false, error: { message } },
        { status: 500 }
      );
    }
  };
}

export { normalizeScoreResult };
