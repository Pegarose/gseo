import { NextRequest } from 'next/server';
import { errorResponse } from '@/lib/response';
import { verifyApiKey } from './keys';

export interface AuthenticatedContext {
  tenantId: string;
  siteId?: string | null;
  apiKeyId: string;
  scopes: string[];
  requestId: string;
}

export type AuthenticatedHandler = (
  req: NextRequest,
  context: AuthenticatedContext
) => Promise<Response>;

/**
 * Middleware wrapper for API Route Handlers.
 * Extracts, hashes, and validates API keys, injecting tenant context.
 */
export function withAuth(handler: AuthenticatedHandler, requiredScope?: string) {
  return async (req: NextRequest): Promise<Response> => {
    const requestId = crypto.randomUUID();

    // 1. Extract API Key from headers
    let apiKey = '';
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.substring(7);
    } else {
      // Fallback header
      const fallbackKey = req.headers.get('X-GSEO-API-Key');
      if (fallbackKey) {
        apiKey = fallbackKey;
      }
    }

    if (!apiKey) {
      return errorResponse('Missing API key.', 'UNAUTHORIZED', 401, {}, requestId);
    }

    // 2. Verify Key
    try {
      const keyRecord = await verifyApiKey(apiKey);

      if (!keyRecord) {
        return errorResponse('Invalid or missing API key.', 'UNAUTHORIZED', 401, {}, requestId);
      }

      // 3. Scope validation if needed
      if (requiredScope && !keyRecord.scopes.includes(requiredScope)) {
        return errorResponse(
          `Forbidden: Missing required scope '${requiredScope}'`,
          'FORBIDDEN',
          403,
          { requiredScope, availableScopes: keyRecord.scopes },
          requestId
        );
      }

      // 4. Invoke Handler
      const context: AuthenticatedContext = {
        tenantId: keyRecord.tenantId,
        siteId: keyRecord.siteId,
        apiKeyId: keyRecord.id,
        scopes: keyRecord.scopes,
        requestId,
      };

      return await handler(req, context);
    } catch (error: any) {
      console.error('Authentication error:', error);
      return errorResponse(
        'An error occurred during authentication.',
        'INTERNAL_ERROR',
        500,
        { error: error?.message },
        requestId
      );
    }
  };
}
