"use server";

/**
 * Server action for /book consultation booking form.
 *
 * Mirrors the lead actions in pattern (Zod → honeypot → rate-limit →
 * Supabase insert → fire-and-forget email), but writes to the `bookings`
 * table instead of `leads`, and uses the booking-specific email templates.
 */

import { headers } from "next/headers";
import { createElement } from "react";
import { z } from "zod";

import { createStaticClient } from "@/lib/supabase/static";
import {
  SERVICE_TYPES,
  bookingContactSchema,
} from "@/lib/schemas/booking";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getContactInfo } from "@/lib/site-config";

import AdminBookingAlert from "@/emails/admin-booking-alert";
import CustomerBookingConfirmation from "@/emails/customer-booking-confirmation";
import {
  sendAdminBookingAlert,
  sendCustomerBookingConfirmation,
} from "@/lib/email/send";

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

const GENERIC_ERROR_EN = "Something went wrong. Please try again or call us directly.";
const GENERIC_ERROR_AR = "حدث خطأ ما. يرجى المحاولة مرة أخرى أو الاتصال بنا مباشرة.";

function genericError(locale: "en" | "ar"): string {
  return locale === "ar" ? GENERIC_ERROR_AR : GENERIC_ERROR_EN;
}

/** Combined schema = service type (step 1) + contact details (step 2) */
const fullBookingSchema = bookingContactSchema.extend({
  service: z.enum(SERVICE_TYPES),
  /** Customer's email is optional in the booking form (booking is phone-first) */
  email: z.string().email().optional().or(z.literal("")),
});

/** Locale-aware human-readable service label (used in customer email + admin) */
function serviceLabel(
  service: typeof SERVICE_TYPES[number],
  locale: "en" | "ar",
): string {
  const labels: Record<typeof service, { en: string; ar: string }> = {
    consultation: { en: "Free Consultation", ar: "استشارة مجانية" },
    installation: { en: "Supply & Installation", ar: "التوريد والتركيب" },
    technician: { en: "On-Demand Technician", ar: "فني عند الطلب" },
    custom: { en: "Custom Design", ar: "تصميم مخصص" },
  };
  return labels[service][locale];
}

interface BookingSubmitInput {
  data: unknown;
  locale: "en" | "ar";
}

export async function submitBooking({
  data,
  locale,
}: BookingSubmitInput): Promise<ActionResult> {
  const reqHeaders = await headers();
  const ip = getClientIp(reqHeaders);

  // 1. Rate limit (bookings are more sensitive — 3/min not 5)
  const rl = checkRateLimit(ip, "submitBooking", 3);
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
  const parsed = fullBookingSchema.safeParse(data);
  if (!parsed.success) {
    console.warn("[submitBooking] zod failed", parsed.error.issues);
    return { ok: false, error: genericError(locale) };
  }
  const input = parsed.data;

  // 3. Honeypot
  if (input._botField && input._botField.trim().length > 0) {
    console.warn("[submitBooking] honeypot triggered, ip=", ip);
    return { ok: true };
  }

  // 4. Insert into Supabase — generate UUID server-side (anon has no SELECT
  // policy on bookings, so .select() RETURNING would fail RLS).
  const supabase = createStaticClient();
  const bookingId = crypto.randomUUID();
  const { error: dbError } = await supabase.from("bookings").insert({
    id: bookingId,
    customer_name: input.name,
    phone: input.phone,
    email: input.email || null,
    service: input.service,
    area: input.area,
    preferred_date: input.date,
    notes: input.notes || null,
    locale,
    status: "new",
  });

  if (dbError) {
    console.error(
      `[submitBooking] insert failed code=${dbError.code} message="${dbError.message}" details="${dbError.details}" hint="${dbError.hint}"`,
    );
    return { ok: false, error: genericError(locale) };
  }

  // 5. Fire-and-forget emails — fetch contact info once + thread to templates
  const localizedService = serviceLabel(input.service, locale);
  const englishService = serviceLabel(input.service, "en"); // admin always EN
  const contact = await getContactInfo(locale);
  void Promise.allSettled([
    sendAdminBookingAlert(
      createElement(AdminBookingAlert, {
        bookingId,
        customerName: input.name,
        phone: input.phone,
        email: input.email || null,
        service: input.service,
        area: input.area,
        preferredDate: input.date,
        notes: input.notes || null,
        customerLocale: locale,
        contact,
      }),
      { customerName: input.name, service: englishService },
    ),
    // Customer confirmation only if they gave us an email
    input.email
      ? sendCustomerBookingConfirmation(
          input.email,
          createElement(CustomerBookingConfirmation, {
            name: input.name,
            serviceLabel: localizedService,
            preferredDate: input.date,
            area: input.area,
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
      console.warn(`[submitBooking] ${failed.length} email(s) failed`, failed);
    }
  });

  return { ok: true, id: bookingId };
}
