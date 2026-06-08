import { BRAND, CONTACT } from "@/lib/constants";

interface LocalBusinessJsonLdProps {
  /** Current locale — used in alternateName for AR */
  locale: "en" | "ar";
}

/**
 * LocalBusiness structured data — rendered as a JSON-LD script tag.
 *
 * Tells Google + other search engines this is a real business with
 * address, phone, hours, geo coordinates. Powers rich results like
 * Google Maps callouts and the "Business" knowledge panel.
 *
 * `@type: HomeAndConstructionBusiness` is the most specific match for
 * doors + installation (sub-type of LocalBusiness).
 *
 * Geo coords are Dubai city-center (matches the contact-page map pin).
 * Update when client confirms exact office address.
 */
export function LocalBusinessJsonLd({ locale }: LocalBusinessJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${BRAND.url}#business`,
    name: BRAND.name,
    alternateName: locale === "ar" ? "وَر دورز" : undefined,
    legalName: BRAND.legalName,
    image: `${BRAND.url}/assets/logo.png`,
    url: BRAND.url,
    telephone: `+${CONTACT.phoneE164}`,
    email: CONTACT.email,
    address: {
      "@type": "PostalAddress",
      addressCountry: "AE",
      addressLocality: CONTACT.address.city,
      addressRegion: "Dubai",
    },
    geo: {
      "@type": "GeoCoordinates",
      // Dubai city-center coords (matches contact page map pin)
      latitude: 25.2048,
      longitude: 55.2708,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
    priceRange: "$$",
    areaServed: {
      "@type": "Country",
      name: "United Arab Emirates",
    },
    /** Publisher/parent — DODA platform per co-brand strategy */
    publisher: {
      "@type": "Organization",
      name: BRAND.platform,
    },
    // sameAs would list social URLs — empty for Phase 1, populate when client provides
  };

  return (
    <script
      type="application/ld+json"
      // Safe: JSON.stringify escapes < and other unsafe characters
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
