import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Locale-detection middleware.
 *
 * - Detects browser language via Accept-Language header
 * - Redirects `/` to `/en` (default) or `/ar` if browser prefers Arabic
 * - All locale-prefixed paths (e.g. `/en/products`) pass through unchanged
 *
 * Excluded from the matcher:
 * - API routes (don't need locale)
 * - Static files (_next, favicon, robots.txt, sitemap.xml)
 * - Admin routes (English-only, no locale prefix per spec)
 */
export default createMiddleware(routing);

export const config = {
  // Match all paths except api, _next, admin, and static files
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
