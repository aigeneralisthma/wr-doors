import { Suspense } from "react";
import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin Sign In — WR Doors",
  robots: { index: false, follow: false },
};

/**
 * Admin login page — NO sidebar, NO auth redirect (it'd loop).
 *
 * Lives outside the `(authed)` route group so it bypasses the
 * sidebar-wrapping layout. Middleware redirects already-authed users
 * away from here back to /admin/dashboard.
 */
export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            WR Doors
          </p>
          <h1 className="mt-1 font-serif text-2xl font-bold text-foreground">
            Admin Sign In
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Use the email + password you created in Supabase Dashboard.
          </p>
        </div>

        {/* useSearchParams() in the client form needs a Suspense boundary */}
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
