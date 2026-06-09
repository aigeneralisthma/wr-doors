/**
 * Resolves the public contact info (email, phone, address, WhatsApp) from
 * the admin-editable `site_settings` table, with a clean fallback to the
 * hardcoded constants in `lib/constants.ts`.
 *
 * Why this exists:
 *   The footer, contact page, and email-template footer used to read
 *   `CONTACT.email` etc. directly from the code constants — meaning the
 *   admin's edits in `/admin/site-settings → contact.email` had no effect
 *   on the public site. This helper wires those edits through so a single
 *   admin save propagates everywhere within the next ISR revalidate (60s).
 *
 * Lookup precedence (per field):
 *   1. site_settings row with non-empty `value_<locale>`
 *   2. site_settings row with non-empty `value_en` (defensive fallback)
 *   3. Constant from `lib/constants.ts` (so the site never breaks if a row
 *      is missing, empty, or RLS hides it)
 *
 * Used by:
 *   - components/layout/footer.tsx (server component)
 *   - app/[locale]/contact/page.tsx InfoPanel (server component)
 *   - lib/email/send.ts → emails/_layout.tsx (template footer)
 */

import "server-only";

import { CONTACT } from "@/lib/constants";
import { getAllSiteSettings } from "@/lib/supabase/queries";
import type { SiteSettingRow } from "@/lib/supabase/database.types";

export interface ContactInfo {
  /** Email address shown to customers + used in mailto: links. */
  email: string;
  /** Phone number in display form (`+971 55 403 9966`). */
  phone: string;
  /** Phone number in E.164 form (digits only) for `tel:` and `wa.me` links. */
  phoneE164: string;
  /** Base `https://wa.me/<E.164>` URL — pass to whatsappUrl() builder below. */
  whatsappBase: string;
  /** Locale-appropriate display address (single string). */
  address: string;
}

/**
 * Picks the locale-appropriate value from a site_settings row, falling
 * back to value_en, then to undefined (so caller chains to a constant).
 */
function localized(row: SiteSettingRow | undefined, locale: string): string | undefined {
  if (!row) return undefined;
  const preferred = locale === "ar" ? row.value_ar : row.value_en;
  const value = preferred?.trim() || row.value_en?.trim();
  return value || undefined;
}

/**
 * Strip non-digits from any phone format. Resilient to admins entering
 * `+971 55 403 9966`, `971-554039966`, etc.
 */
function toE164(displayPhone: string): string {
  return displayPhone.replace(/\D/g, "");
}

/**
 * Fetches the current ContactInfo for the given locale.
 * Server-only — relies on the static (cookie-free) Supabase client.
 *
 * @example
 *   const contact = await getContactInfo(locale);
 *   <a href={`mailto:${contact.email}`}>{contact.email}</a>
 */
export async function getContactInfo(locale: string): Promise<ContactInfo> {
  // Single DB round-trip for all settings, then index by key.
  let byKey: Map<string, SiteSettingRow>;
  try {
    const rows = await getAllSiteSettings();
    byKey = new Map(rows.map((r) => [r.key, r]));
  } catch (err) {
    // Network/DB error → log + fall back to constants. The site stays up.
    console.error("[site-config] getAllSiteSettings failed, using constants", err);
    byKey = new Map();
  }

  const emailRow = byKey.get("contact.email");
  const phoneRow = byKey.get("contact.phone");
  const whatsappRow = byKey.get("contact.whatsapp");
  const addressRow = byKey.get("contact.address");

  const email = localized(emailRow, locale) ?? CONTACT.email;
  const phone = localized(phoneRow, locale) ?? CONTACT.phone;
  const whatsappBase =
    localized(whatsappRow, locale) ?? CONTACT.whatsappBase;
  const address =
    localized(addressRow, locale) ??
    [CONTACT.address.line1, CONTACT.address.city, CONTACT.address.country]
      .filter(Boolean)
      .join(", ");

  return {
    email,
    phone,
    phoneE164: toE164(phone),
    whatsappBase,
    address,
  };
}

/**
 * Build a `wa.me` URL with an optional pre-filled message, using the
 * admin-configured WhatsApp base. Mirrors the `whatsappUrl()` helper in
 * `lib/constants.ts` but driven by site_settings.
 */
export function whatsappUrlFor(contact: ContactInfo, message?: string): string {
  if (!message) return contact.whatsappBase;
  return `${contact.whatsappBase}?text=${encodeURIComponent(message)}`;
}
