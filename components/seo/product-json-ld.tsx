import { BRAND } from "@/lib/constants";
import type { ProductRow } from "@/lib/supabase/database.types";

interface ProductJsonLdProps {
  product: ProductRow;
  /** Current locale — picks the right name + description */
  locale: "en" | "ar";
}

/**
 * Product structured data — rendered as a JSON-LD script tag on each
 * product detail page.
 *
 * Eligible for Google's product rich results (price, image, availability
 * shown in search snippets). When `price_from_aed` is set we include an
 * Offer; otherwise we omit (Google handles "no price" gracefully — it
 * just won't show the price snippet).
 *
 * Specs map to `additionalProperty[]` so attribute pairs surface in
 * the rich result too.
 */
export function ProductJsonLd({ product, locale }: ProductJsonLdProps) {
  const name = locale === "ar" ? product.name_ar : product.name_en;
  const description =
    locale === "ar" ? product.description_ar : product.description_en;

  // Build absolute image URLs — JSON-LD requires absolute, not relative
  const images = (product.images ?? [])
    .filter(Boolean)
    .map((url) => (url.startsWith("http") ? url : `${BRAND.url}${url}`));

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: images.length > 0 ? images : undefined,
    sku: product.slug,
    brand: {
      "@type": "Brand",
      name: BRAND.name,
    },
    manufacturer: {
      "@type": "Organization",
      name: BRAND.legalName,
    },
    category: locale === "ar" ? product.category_ar : product.category_en,
  };

  // Add Offer only when price is set
  if (product.price_from_aed != null) {
    data.offers = {
      "@type": "Offer",
      priceCurrency: "AED",
      price: product.price_from_aed,
      availability: product.is_active
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${BRAND.url}/${locale}/products/${product.category}/${product.slug}`,
      seller: {
        "@type": "Organization",
        name: BRAND.name,
      },
    };
  }

  // Add specs as additionalProperty array
  if (product.specs && product.specs.length > 0) {
    data.additionalProperty = product.specs.map((spec) => ({
      "@type": "PropertyValue",
      name: locale === "ar" ? spec.label_ar : spec.label_en,
      value: locale === "ar" ? spec.value_ar : spec.value_en,
    }));
  }

  return (
    <script
      type="application/ld+json"
      // Safe: JSON.stringify escapes < and other unsafe characters
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
