import { defineRouting } from "next-intl/routing";

/**
 * i18n routing config for DODA × WR Doors.
 *
 * Supports two locales:
 * - `en` (English) - default, LTR
 * - `ar` (Arabic)  - RTL
 *
 * URL strategy: subdirectory (`/en/...` and `/ar/...`)
 * Default locale is shown in URL ("as-needed" strategy)
 * to keep canonical URLs explicit for SEO and hreflang.
 */
export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

/**
 * Maps locale to text direction. Used in <html dir="..."> and CSS logical
 * properties. Arabic is RTL; English is LTR.
 */
export const localeDirection: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
};

/**
 * Maps locale to its native display name. Used in the language toggle.
 */
export const localeNames: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};
