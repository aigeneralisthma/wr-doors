"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";

export interface LoginState {
  error?: string;
}

/**
 * Sign the admin in with email + password (Auth.js Credentials provider).
 *
 * On success `signIn` throws a redirect to `redirectTo` — that must
 * propagate, so only `AuthError` (bad credentials) is caught here.
 *
 * `next` is sanitized: must be a relative `/admin/*` path with no `//`
 * or scheme, else we fall back to the dashboard (prevents open redirect).
 */
export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const rawNext = formData.get("next");
  const next =
    typeof rawNext === "string" &&
    rawNext.startsWith("/admin/") &&
    !rawNext.includes("//") &&
    !rawNext.includes(":")
      ? rawNext
      : "/admin/dashboard";

  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: next,
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }
}
