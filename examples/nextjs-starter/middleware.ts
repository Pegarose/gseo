import { createRedirectMiddleware } from '@seosuite/next';
import './seosuite.config';
import './lib/seo-settings';

export const middleware = createRedirectMiddleware();

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
