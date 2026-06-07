import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "./i18n/routing";
import type { Database } from "./lib/supabase/database.types";

/**
 * Composite middleware: locale handling for the public site + auth gate
 * for /admin/*.
 *
 * Why one file instead of two? Next.js only supports a single
 * `middleware.ts` per project. We dispatch based on the URL pathname.
 *
 * Flow:
 *   - /admin/login       → if already authed, redirect to /admin/dashboard
 *   - /admin/*           → if NOT authed, redirect to /admin/login?next=<path>
 *   - everything else    → next-intl handles locale routing
 *
 * Admin auth uses the cookie-based `@supabase/ssr` server client. The cookie
 * jar is bridged via the NextRequest/NextResponse pair so the session token
 * can be refreshed transparently.
 */

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin routes: gate by Supabase Auth ──────────────────────────────────
  if (pathname.startsWith("/admin")) {
    return await handleAdminAuth(request);
  }

  // ── Everything else: locale routing ──────────────────────────────────────
  return intlMiddleware(request);
}

async function handleAdminAuth(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/admin/login";

  // Build a response we can mutate cookies on (Supabase needs this to
  // refresh tokens transparently). Never reassigned — cookies are mutated
  // in-place by Supabase's setAll callback below.
  const response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Mirror cookie writes onto both the request (for subsequent reads
          // in this same handler) and the response (so the browser sees them)
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isLoginRoute) {
    // Not signed in — bounce to login with a `next` param so we can return
    // them after sign-in
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isLoginRoute) {
    // Already signed in — skip the login page
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return response;
}

export const config = {
  // Run on everything EXCEPT API, static assets, and Next internals.
  // /admin/* is included here (was previously excluded) so we can gate it.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
