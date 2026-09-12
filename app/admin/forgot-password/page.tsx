import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";

import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password — WR Doors Admin",
  robots: { index: false, follow: false },
};

/**
 * Forgot-password page — outside the `(authed)` group, exempted from the
 * auth gate in middleware.ts (same reasoning as /admin/login: gating it
 * would make it unreachable for the person who actually needs it).
 */
export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            WR Doors
          </p>
          <h1 className="mt-1 font-serif text-2xl font-bold text-foreground">
            Reset your password
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Enter your admin email — we&apos;ll send a link to choose a new
            password.
          </p>
        </div>

        <Suspense fallback={null}>
          <ForgotPasswordForm />
        </Suspense>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/admin/login" className="underline hover:text-foreground">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
