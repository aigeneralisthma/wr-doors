"use server";

/**
 * Self-service admin password reset — /admin/forgot-password + /admin/reset-password.
 *
 * Flow:
 *   1. requestPasswordResetAction: admin enters their email → if it matches
 *      an admin_users row, mail a one-hour single-use reset link. Always
 *      returns the same generic message either way — never reveals whether
 *      an account exists for that email (avoids user enumeration).
 *   2. resetPasswordAction: admin follows the link, sets a new password →
 *      token is validated + consumed, password_hash updated.
 *
 * `pnpm admin:create` remains as a break-glass fallback (works even if
 * Resend is down or misconfigured).
 */

import { headers } from "next/headers";
import { createElement } from "react";
import { z } from "zod";

import { hashPassword } from "@/lib/auth/password";
import {
  consumePasswordResetToken,
  createPasswordResetToken,
} from "@/lib/auth/reset-token";
import {
  getAdminUserByEmail,
  updateAdminPasswordHash,
} from "@/lib/db/admin-queries";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getContactInfo } from "@/lib/site-config";
import { sendAdminPasswordReset } from "@/lib/email/send";
import AdminPasswordReset from "@/emails/admin-password-reset";

const GENERIC_REQUEST_MESSAGE =
  "If an account exists for that email, we've sent a password reset link. Check your inbox (and spam folder).";
const GENERIC_ERROR = "Something went wrong. Please try again.";
const TOO_MANY = "Too many attempts. Please wait a few minutes and try again.";

// =============================================================================
// requestPasswordResetAction
// =============================================================================

export interface RequestResetState {
  message?: string;
  error?: string;
}

const requestSchema = z.object({ email: z.string().email() });

export async function requestPasswordResetAction(
  _prev: RequestResetState,
  formData: FormData,
): Promise<RequestResetState> {
  const ip = getClientIp(await headers());
  const rl = checkRateLimit(ip, "requestPasswordReset", 3, 10 * 60 * 1000);
  if (!rl.allowed) return { error: TOO_MANY };

  const parsed = requestSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: "Enter a valid email address." };

  try {
    const admin = await getAdminUserByEmail(parsed.data.email);
    if (admin) {
      const token = await createPasswordResetToken(admin.id);
      const base = (process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
      const resetUrl = `${base}/admin/reset-password?token=${token}`;
      const contact = await getContactInfo("en");

      void sendAdminPasswordReset(
        admin.email,
        createElement(AdminPasswordReset, { resetUrl, contact }),
      ).then((r) => {
        if (!r.ok) console.warn("[requestPasswordResetAction] email failed", r.detail);
      });
    }
    // Same response whether or not `admin` was found.
    return { message: GENERIC_REQUEST_MESSAGE };
  } catch (err) {
    console.error("[requestPasswordResetAction] failed", err);
    return { error: GENERIC_ERROR };
  }
}

// =============================================================================
// resetPasswordAction
// =============================================================================

export interface ResetPasswordState {
  ok?: boolean;
  error?: string;
}

const resetSchema = z
  .object({
    token: z.string().min(1, "Missing reset token."),
    password: z.string().min(10, "Password must be at least 10 characters."),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const ip = getClientIp(await headers());
  const rl = checkRateLimit(ip, "resetPassword", 8, 10 * 60 * 1000);
  if (!rl.allowed) return { error: TOO_MANY };

  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  try {
    const adminUserId = await consumePasswordResetToken(parsed.data.token);
    if (!adminUserId) {
      return {
        error:
          "This reset link is invalid or has expired. Request a new one from the login page.",
      };
    }

    const passwordHash = await hashPassword(parsed.data.password);
    await updateAdminPasswordHash(adminUserId, passwordHash);
    return { ok: true };
  } catch (err) {
    console.error("[resetPasswordAction] failed", err);
    return { error: GENERIC_ERROR };
  }
}
