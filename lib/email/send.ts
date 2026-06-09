import "server-only";

/**
 * Typed email send helpers — server-only.
 *
 * Each helper:
 *   1. Renders the React Email template to HTML
 *   2. Calls Resend with sender, recipient, subject, html
 *   3. Logs success/failure but never throws — email failures must not
 *      block form submissions. The lead/booking is already saved by the
 *      time we get here, and the customer sees the success state.
 */

import { render } from "@react-email/render";
import type { ReactElement } from "react";

import { getAdminEmail, getFromAddress, getResendClient } from "./client";

interface SendResult {
  ok: boolean;
  /** Resend email ID on success; error message on failure */
  detail?: string;
}

/**
 * Generic send helper. Renders the template + fires the Resend call.
 * All public helpers below delegate to this.
 */
async function send(opts: {
  to: string;
  subject: string;
  /** A React Email component instance (e.g. <CustomerContactConfirmation … />) */
  template: ReactElement;
  /** Optional reply-to (defaults to admin business inbox for customer emails) */
  replyTo?: string;
}): Promise<SendResult> {
  try {
    const html = await render(opts.template);
    const text = await render(opts.template, { plainText: true });
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: opts.to,
      subject: opts.subject,
      html,
      text,
      replyTo: opts.replyTo,
    });
    if (error) {
      console.error("[email] Resend returned error", error);
      return { ok: false, detail: error.message };
    }
    console.log(`[email] sent ${data?.id ?? "(no id)"} to ${opts.to}`);
    return { ok: true, detail: data?.id };
  } catch (err) {
    console.error("[email] send threw", err);
    return { ok: false, detail: err instanceof Error ? err.message : String(err) };
  }
}

// ── Customer-facing helpers ────────────────────────────────────────────────

/** Subject line, locale-aware. */
function customerSubject(
  kind: "contact" | "quote" | "booking",
  locale: "en" | "ar",
) {
  if (locale === "ar") {
    return {
      contact: "تم استلام رسالتك — WR Doors",
      quote: "تم استلام طلب عرض السعر — WR Doors",
      booking: "تم تأكيد طلب الحجز — WR Doors",
    }[kind];
  }
  return {
    contact: "We've received your message — WR Doors",
    quote: "We've received your quote request — WR Doors",
    booking: "Your booking request is in — WR Doors",
  }[kind];
}

/**
 * Reply-to header: customer replies bounce to the admin inbox.
 * Pulled from env (via getAdminEmail) so a single env var change reroutes
 * BOTH admin alerts AND customer reply-tos to the new address.
 */
function customerReplyTo(): string {
  return getAdminEmail();
}

export async function sendCustomerContactConfirmation(
  to: string,
  template: ReactElement,
  locale: "en" | "ar",
) {
  return send({
    to,
    subject: customerSubject("contact", locale),
    template,
    replyTo: customerReplyTo(),
  });
}

export async function sendCustomerQuoteConfirmation(
  to: string,
  template: ReactElement,
  locale: "en" | "ar",
) {
  return send({
    to,
    subject: customerSubject("quote", locale),
    template,
    replyTo: customerReplyTo(),
  });
}

export async function sendCustomerBookingConfirmation(
  to: string,
  template: ReactElement,
  locale: "en" | "ar",
) {
  return send({
    to,
    subject: customerSubject("booking", locale),
    template,
    replyTo: customerReplyTo(),
  });
}

// ── Admin-facing helpers ───────────────────────────────────────────────────

export async function sendAdminLeadAlert(
  template: ReactElement,
  context: { name: string; source: string },
) {
  return send({
    to: getAdminEmail(),
    subject: `[Lead] ${context.source} from ${context.name}`,
    template,
  });
}

export async function sendAdminBookingAlert(
  template: ReactElement,
  context: { customerName: string; service: string },
) {
  return send({
    to: getAdminEmail(),
    subject: `[Booking] ${context.service} — ${context.customerName}`,
    template,
  });
}
