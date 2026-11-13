import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

export function proxy(request: any) {
  return handleI18nRouting(request);
}

// In Next 16, also export default or named proxy
export default proxy;

export const config = {
  // Match all pathnames except for:
  // - /api routes
  // - /_next (Next.js internals)
  // - /_vercel (Vercel internals)
  // - static files (e.g. /favicon.ico, sitemap.xml, *.svg, etc.)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/']
};

