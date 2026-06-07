import "server-only";

/**
 * Resend email client — server-only.
 *
 * Lazily constructs the Resend instance so the package isn't loaded at
 * module-eval time (e.g. during `next build` when env vars may not be set
 * for a specific page).
 *
 * Why server-only: `RESEND_API_KEY` is a secret. If this file were ever
 * imported by a Client Component, the build would fail rather than ship
 * the key to the browser. (The `import "server-only"` package enforces
 * this at compile time.)
 */
import { Resend } from "resend";

let cachedClient: Resend | null = null;

export function getResendClient(): Resend {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not set. Add it to .env.local — see RESEND_SETUP.md",
    );
  }

  cachedClient = new Resend(apiKey);
  return cachedClient;
}

/** The verified sender address. Configurable so we can swap sandbox → real domain. */
export function getFromAddress(): string {
  return (
    process.env.RESEND_FROM_EMAIL ?? "WR Doors <onboarding@resend.dev>"
  );
}

/** Where admin alerts go. Pulled from env so we can change without code edits. */
export function getAdminEmail(): string {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) {
    throw new Error(
      "ADMIN_NOTIFICATION_EMAIL is not set. Add it to .env.local.",
    );
  }
  return adminEmail;
}
