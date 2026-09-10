import createMiddleware from "next-intl/middleware";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "./auth.config";
import { routing } from "./i18n/routing";

/**
 * Composite middleware: next-intl locale routing for the public site +
 * an auth gate for /admin/*.
 *
 * Next.js only allows one `middleware.ts`, so we dispatch by pathname.
 *
 * The auth check uses `NextAuth(authConfig)` built from the EDGE-SAFE
 * config only (no DB, no bcrypt) — it just verifies the JWT session
 * cookie. Flow:
 *   - /admin/login       → if already authed, bounce to /admin/dashboard
 *   - /admin/*           → if NOT authed, redirect to /admin/login?next=<path>
 *   - everything else    → next-intl
 */

const { auth } = NextAuth(authConfig);
const intlMiddleware = createMiddleware(routing);

export default auth((request) => {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const isLoggedIn = Boolean(request.auth?.user);
    const isLoginRoute = pathname === "/admin/login";

    if (!isLoggedIn && !isLoginRoute) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isLoggedIn && isLoginRoute) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    return NextResponse.next();
  }

  return intlMiddleware(request);
});

export const config = {
  // Run on everything EXCEPT API, static assets, and Next internals.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
