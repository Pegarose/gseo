import type { NextRequest } from 'next/server';
import {
  getSettingsAdapter,
  loadSeoSuiteConfig,
  saveAdminSettingsSnapshot,
} from '../free/settings/load-settings';
import { serializeAdminConfig } from './serialize-config';
import type { AdminConfigSnapshot } from './types';

export interface SeoSettingsRouteHandlersOptions {
  /** Optional auth guard — return a Response to block the request. */
  authorize?: (request: NextRequest) => Response | null | Promise<Response | null>;
}

/**
 * App Router route handlers for admin persistence.
 *
 * @example
 * ```ts
 * // app/api/seo/settings/route.ts
 * export const { GET, PUT } = createSeoSettingsRouteHandlers();
 * ```
 */
export function createSeoSettingsRouteHandlers(options: SeoSettingsRouteHandlersOptions = {}) {
  async function guard(request: NextRequest): Promise<Response | null> {
    if (!options.authorize) return null;
    return options.authorize(request);
  }

  return {
    async GET(request: NextRequest) {
      const blocked = await guard(request);
      if (blocked) return blocked;

      const adapter = getSettingsAdapter();
      const config = await loadSeoSuiteConfig();

      return Response.json({
        config: serializeAdminConfig(config),
        adapter: adapter
          ? { kind: adapter.kind, label: adapter.label }
          : null,
      });
    },

    async PUT(request: NextRequest) {
      const blocked = await guard(request);
      if (blocked) return blocked;

      const adapter = getSettingsAdapter();
      if (!adapter) {
        return Response.json(
          { error: 'No SettingsAdapter registered. Configure registerSettingsAdapter() on the server.' },
          { status: 501 }
        );
      }

      const body = (await request.json()) as Partial<AdminConfigSnapshot>;
      const config = await saveAdminSettingsSnapshot(body);

      return Response.json({
        ok: true,
        config: serializeAdminConfig(config),
        adapter: { kind: adapter.kind, label: adapter.label },
      });
    },
  };
}
