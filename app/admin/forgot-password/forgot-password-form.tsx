"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  requestPasswordResetAction,
  type RequestResetState,
} from "@/app/actions/auth-reset";

/**
 * Always shows the same generic success message on submit, regardless of
 * whether the email matched an account — the server action never reveals
 * that (see requestPasswordResetAction).
 */
export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<
    RequestResetState,
    FormData
  >(requestPasswordResetAction, {});

  if (state.message) {
    return (
      <div
        role="status"
        className="flex items-start gap-2 rounded-lg border border-green-600/30 bg-green-600/5 p-3 text-sm text-green-800"
      >
        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
        <span>{state.message}</span>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="reset-email">Email</Label>
        <Input
          id="reset-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          autoFocus
          placeholder="you@example.com"
        />
      </div>

      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-[var(--color-brand-gold)] text-[var(--color-brand-navy)] hover:bg-[var(--color-brand-gold)]/90 disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          "Send reset link"
        )}
      </Button>
    </form>
  );
}
