/**
 * WR Doors × DODA — Brand and business constants.
 *
 * Single source of truth for anything that might change across the project
 * (contact details, brand names, social URLs, etc.). Always import from here
 * instead of hardcoding values in components.
 */

export const BRAND = {
  /** Primary consumer-facing brand name */
  name: "WR Doors",
  /** Co-brand: the platform powering WR Doors */
  platform: "DODA",
  /** Legal entity — used only in footer, T&C, license disclosure */
  legalName: "Wahat Al Ruman Doors Trading LLC",
  /** Legal entity in Arabic */
  legalNameAr: "واحة الرمان لتجارة الأبواب ذ.م.م",
  /** Co-brand tagline used in footer + meta tags */
  endorsement: "WR Doors is a DODA platform brand",
  endorsementAr: "علامة وَر دورز جزء من منصة دودا",
  /** Default site URL — overridden in prod by NEXT_PUBLIC_SITE_URL */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://wrdoors.vercel.app",
} as const;

export const CONTACT = {
  /** UAE phone — used in tel: links, WhatsApp links, footer */
  phone: "+971 55 403 9966",
  /** E.164 format for tel: and wa.me */
  phoneE164: "971554039966",
  email: "wahatalruman36@gmail.com",
  /** WhatsApp click-to-chat base URL — append &text=... in usage */
  whatsappBase: "https://wa.me/971554039966",
  /** Office location (UAE) — fill in real address before launch */
  address: {
    line1: "TBD — UAE",
    city: "Dubai",
    country: "United Arab Emirates",
  },
  /** Business hours (TBD — confirm with client before launch) */
  hours: {
    sunThu: "9:00 AM – 6:00 PM",
    friSat: "Closed",
  },
} as const;

/**
 * Builds a WhatsApp click-to-chat URL with optional pre-filled message.
 * @example
 * whatsappUrl("I'm interested in the WPC interior door")
 */
export function whatsappUrl(message?: string): string {
  if (!message) return CONTACT.whatsappBase;
  return `${CONTACT.whatsappBase}?text=${encodeURIComponent(message)}`;
}

/**
 * Service categories shown in the catalog. Slugs are stable URLs;
 * names live in i18n/messages because they need to be translated.
 */
export const PRODUCT_CATEGORIES = [
  { slug: "wpc-doors", labelKey: "products.categories.wpcDoors" },
  { slug: "pivot-aluminium-doors", labelKey: "products.categories.pivotDoors" },
  { slug: "sliding-systems", labelKey: "products.categories.slidingSystems" },
  { slug: "wall-cladding", labelKey: "products.categories.wallCladding" },
] as const;

export type ProductCategorySlug = (typeof PRODUCT_CATEGORIES)[number]["slug"];

/**
 * Unique selling points pulled from the client flyer. Used on the homepage
 * USP strip and the About page. Each maps to an i18n key for the label.
 */
export const USPS = [
  { iconKey: "factory", labelKey: "home.usps.localFactory" },
  { iconKey: "shield", labelKey: "home.usps.tripleGuard" },
  { iconKey: "award", labelKey: "home.usps.warranty10y" },
  { iconKey: "sparkles", labelKey: "home.usps.exclusiveWpc" },
] as const;

/**
 * Social media URLs — placeholders until the client provides real handles.
 * Footer renders these only when they're non-empty.
 */
export const SOCIAL = {
  instagram: "",
  facebook: "",
  linkedin: "",
  youtube: "",
} as const;
