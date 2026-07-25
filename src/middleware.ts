import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always', // /en/..., /es/... — every locale gets an indexable, crawlable URL
  localeDetection: true
});

export const config = {
  // Skip API routes, static files, and Next internals
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
