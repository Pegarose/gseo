import { NextRequest, NextResponse } from 'next/server';
import { resolveRuntimeSeoConfig } from './settings/load-settings';

export interface RedirectRule {
  source: string;
  destination: string;
  permanent?: boolean;
  statusCode?: number;
}

export interface CreateRedirectMiddlewareOptions {
  matcher?: string[];
  fetchRedirects?: () => Promise<RedirectRule[]>;
}

export function createRedirectMiddleware(options: CreateRedirectMiddlewareOptions = {}) {
  return async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
      return NextResponse.next();
    }

    let redirects: RedirectRule[] = [];

    if (options.fetchRedirects) {
      redirects = await options.fetchRedirects();
    } else {
      const config = await resolveRuntimeSeoConfig();
      if (Array.isArray(config.redirects)) {
        redirects = config.redirects;
      }
    }

    for (const rule of redirects) {
      if (matchRule(pathname, rule.source)) {
        const url = req.nextUrl.clone();
        url.pathname = rule.destination;
        const status = rule.statusCode ?? (rule.permanent ? 308 : 307);
        return NextResponse.redirect(url, status);
      }
    }

    return NextResponse.next();
  };
}

function matchRule(pathname: string, source: string): boolean {
  if (source === pathname) return true;

  const normalized = source
    .replace(/\*/g, '.*')
    .replace(/\/:([^/]+)/g, '/([^/]+)');
  return new RegExp(`^${normalized}$`).test(pathname);
}
