"use server";

/**
 * Server actions for lead capture — /quote and /contact forms.
 *
 * Flow (both actions):
 *   1. Honeypot check (silent OK to fool bots)
 *   2. Rate limit by client IP
 *   3. Zod re-validate (defense in depth — client also validated)
 *   4. Insert into Supabase `leads` (RLS allows anon insert)
 *   5. Fire-and-forget admin alert email + customer confirmation email
 *   6. Return { ok, error? } — UI handles toast / success state
 *
 * Email failures NEVER block the response — the lead is already saved
 * and the customer should see success.
 */

import { headers } from "next/headers";
import { createElement } from "react";

import { createStaticClient } from "@/lib/supabase/static";
import { contactSchema } from "@/lib/schemas/contact";
import { quoteSchema } from "@/lib/schemas/quote";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getContactInfo } from "@/lib/site-config";

import AdminLeadAlert from "@/emails/admin-lead-alert";
import CustomerContactConfirmation from "@/emails/customer-contact-confirmation";
import CustomerQuoteConfirmation from "@/emails/customer-quote-confirmation";
import {
  sendAdminLeadAlert,
  sendCustomerContactConfirmation,
  sendCustomerQuoteConfirmation,
} from "@/lib/email/send";

export interface ActionResult {
  ok: boolean;
  /** Generic, user-safe error message (never leaks internals) */
  error?: string;
  /** The inserted row id, if successful — useful for analytics later */
  id?: string;
}

const GENERIC_ERROR_EN = "Something went wrong. Please try again or call us directly.";
const GENERIC_ERROR_AR = "حدث خطأ ما. يرجى المحاولة مرة أخرى أو الاتصال بنا مباشرة.";

function genericError(locale: "en" | "ar"): string {
  return locale === "ar" ? GENERIC_ERROR_AR : GENERIC_ERROR_EN;
}

/**
 * Map a quote-form `product` key (e.g. "wpcDoors") to a human-readable
 * label in the customer's locale. Used in the customer email subject/body.
 * Kept in sync with messages/{en,ar}.json `quote.products.*`.
 */
function productLabel(productKey: string, locale: "en" | "ar"): string | undefined {
  if (!productKey) return undefined;
  const labels: Record<string, { en: string; ar: string }> = {
    wpcDoors: { en: "WPC Doors", ar: "أبواب WPC" },
    pivotDoors: { en: "Pivot Aluminium Doors", ar: "أبواب ألمنيوم محورية" },
    sliding: { en: "Sliding Systems", ar: "أنظمة منزلقة" },
    cladding: { en: "Wall Cladding", ar: "كسوة الجدران" },
    other: { en: "Other", ar: "أخرى" },
  };
  return labels[productKey]?.[locale];
}

// =============================================================================
// submitQuoteLead — /quote form
// =============================================================================

interface QuoteSubmitInput {
  data: unknown;
  /** Customer's submission locale, derived from /[locale]/quote URL */
  locale: "en" | "ar";
}

export async function submitQuoteLead({
  data,
  locale,
}: QuoteSubmitInput): Promise<ActionResult> {
  const reqHeaders = await headers();
  const ip = getClientIp(reqHeaders);

  // 1. Rate limit
  const rl = checkRateLimit(ip, "submitQuoteLead", 5);
  if (!rl.allowed) {
    return {
      ok: false,
      error:
        locale === "ar"
          ? "كثرة المحاولات. يرجى الانتظار قليلاً ثم المحاولة مجدداً."
          : "Too many attempts. Please wait a moment and try again.",
    };
  }

  // 2. Zod validate
  const parsed = quoteSchema.safeParse(data);
  if (!parsed.success) {
    console.warn("[submitQuoteLead] zod failed", parsed.error.issues);
    return { ok: false, error: genericError(locale) };
  }
  const input = parsed.data;

  // 3. Honeypot: silently succeed if bot filled it
  if (input._botField && input._botField.trim().length > 0) {
    console.warn("[submitQuoteLead] honeypot triggered, ip=", ip);
    return { ok: true }; // Don't reveal the rejection to bots
  }

  // 4. Insert into Supabase. We generate the UUID server-side because anon
  // has no SELECT policy on `leads` — chaining `.select("id").single()`
  // would fail RLS even though the INSERT succeeds (the RETURNING clause
  // needs SELECT permission too).
  const supabase = createStaticClient();
  const leadId = crypto.randomUUID();
  const { error: dbError } = await supabase.from("leads").insert({
    id: leadId,
    name: input.name,
    phone: input.phone,
    email: input.email || null,
    product: input.product || null,
    quantity: input.quantity || null,
    location: input.location || null,
    budget: input.budget || null,
    message: input.message,
    locale,
    source: "quote",
    status: "new",
  });

  if (dbError) {
    console.error(
      `[submitQuoteLead] insert failed code=${dbError.code} message="${dbError.message}" details="${dbError.details}" hint="${dbError.hint}"`,
    );
    return { ok: false, error: genericError(locale) };
  }

  // 5. Fire-and-forget emails (don't block response on email failures).
  //    Fetch admin-editable contact info once and pass it to every template
  //    so the email footer mailto/tel reflect the current site_settings.
  const productLbl = productLabel(input.product, locale);
  const contact = await getContactInfo(locale);
  void Promise.allSettled([
    sendAdminLeadAlert(
      createElement(AdminLeadAlert, {
        leadId,
        source: "quote",
        name: input.name,
        phone: input.phone,
        email: input.email || null,
        product: productLbl ?? input.product,
        budget: input.budget || null,
        location: input.location || null,
        message: input.message,
        customerLocale: locale,
        contact,
      }),
      { name: input.name, source: "quote" },
    ),
    // Customer email: only send if they provided an email
    input.email
      ? sendCustomerQuoteConfirmation(
          input.email,
          createElement(CustomerQuoteConfirmation, {
            name: input.name,
            productLabel: productLbl,
            locale,
            contact,
          }),
          locale,
        )
      : Promise.resolve({ ok: true, detail: "no-email-skip" }),
  ]).then((results) => {
    const failed = results.filter(
      (r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.ok),
    );
    if (failed.length > 0) {
      console.warn(`[submitQuoteLead] ${failed.length} email(s) failed`, failed);
    }
  });

  return { ok: true, id: leadId };
}

// =============================================================================
// submitContactLead — /contact form
// =============================================================================

interface ContactSubmitInput {
  data: unknown;
  locale: "en" | "ar";
}

export async function submitContactLead({
  data,
  locale,
}: ContactSubmitInput): Promise<ActionResult> {
  const reqHeaders = await headers();
  const ip = getClientIp(reqHeaders);

  // 1. Rate limit
  const rl = checkRateLimit(ip, "submitContactLead", 5);
  if (!rl.allowed) {
    return {
      ok: false,
      error:
        locale === "ar"
          ? "كثرة المحاولات. يرجى الانتظار قليلاً ثم المحاولة مجدداً."
          : "Too many attempts. Please wait a moment and try again.",
    };
  }

  // 2. Zod validate
  const parsed = contactSchema.safeParse(data);
  if (!parsed.success) {
    console.warn("[submitContactLead] zod failed", parsed.error.issues);
    return { ok: false, error: genericError(locale) };
  }
  const input = parsed.data;

  // 3. Honeypot
  if (input._botField && input._botField.trim().length > 0) {
    console.warn("[submitContactLead] honeypot triggered, ip=", ip);
    return { ok: true };
  }

  // 4. Insert into Supabase — generate UUID server-side, see submitQuoteLead.
  const supabase = createStaticClient();
  const leadId = crypto.randomUUID();
  const { error: dbError } = await supabase.from("leads").insert({
    id: leadId,
    name: input.name,
    phone: input.phone,
    email: input.email,
    subject: input.subject,
    message: input.message,
    locale,
    source: "contact",
    status: "new",
  });

  if (dbError) {
    console.error(
      `[submitContactLead] insert failed code=${dbError.code} message="${dbError.message}" details="${dbError.details}" hint="${dbError.hint}"`,
    );
    return { ok: false, error: genericError(locale) };
  }

  // 5. Fire-and-forget emails — fetch contact info once + thread to all templates
  const contact = await getContactInfo(locale);
  void Promise.allSettled([
    sendAdminLeadAlert(
      createElement(AdminLeadAlert, {
        leadId,
        source: "contact",
        name: input.name,
        phone: input.phone,
        email: input.email,
        subject: input.subject,
        message: input.message,
        customerLocale: locale,
        contact,
      }),
      { name: input.name, source: "contact" },
    ),
    sendCustomerContactConfirmation(
      input.email,
      createElement(CustomerContactConfirmation, {
        name: input.name,
        locale,
        contact,
      }),
      locale,
    ),
  ]).then((results) => {
    const failed = results.filter(
      (r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.ok),
    );
    if (failed.length > 0) {
      console.warn(`[submitContactLead] ${failed.length} email(s) failed`, failed);
    }
  });

  return { ok: true, id: leadId };
}
