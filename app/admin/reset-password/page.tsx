import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";

import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password — WR Doors Admin",
  robots: { index: false, follow: false },
};

/**
 * Reset-password page — outside the `(authed)` group, exempted from the
 * auth gate in middleware.ts. Reached via the token link mailed by
 * requestPasswordResetAction.
 */
export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            WR Doors
          </p>
          <h1 className="mt-1 font-serif text-2xl font-bold text-foreground">
            Choose a new password
          </h1>
        </div>

        <Suspense fallback={null}>
          <ResetPasswordForm />
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
