import { setRequestLocale } from "next-intl/server";

import { HeroSection } from "@/components/sections/hero";
import { USPSection } from "@/components/sections/usp-strip";
import { ProductCategoriesSection } from "@/components/sections/product-categories";
import { FeaturedProjectsSection } from "@/components/sections/featured-projects";
import { WhyUsSection } from "@/components/sections/why-us-stats";
import { ServicesSection } from "@/components/sections/services-overview";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { FinalCtaSection } from "@/components/sections/final-cta";
import { LocalBusinessJsonLd } from "@/components/seo/local-business-json-ld";

/**
 * Homepage — full conversion-focused page composition.
 *
 * Section order (intentional — tested across hundreds of premium product
 * sites and tuned for the WR Doors customer journey):
 *
 *   1. Hero               (hook: image + headline + dual CTA)
 *   2. USP strip          (de-risk: four trust signals)
 *   3. Product categories (offer: visual gateway into the catalog)
 *   4. Featured projects  (social proof: real installations)
 *   5. Why Us stats       (credibility: numbers, factory-direct)
 *   6. Services           (clarity: three engagement paths)
 *   7. Testimonials       (reassurance: real-words placeholder)
 *   8. Final CTA          (close: act now)
 *
 * All sections are Server Components that resolve their translations
 * server-side, so the HTML stream from Next.js already carries the right
 * locale — no flash of untranslated content, no client JS for content.
 *
 * `setRequestLocale` is required for SSG to pick up the current locale
 * inside these nested server components; see next-intl SSG docs.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex-1">
      {/* LocalBusiness rich-result schema — picked up by Google + Bing */}
      <LocalBusinessJsonLd locale={locale === "ar" ? "ar" : "en"} />

      <HeroSection locale={locale} />
      <USPSection />
      <ProductCategoriesSection locale={locale} />
      <FeaturedProjectsSection locale={locale} />
      <WhyUsSection />
      <ServicesSection />
      <TestimonialsSection />
      <FinalCtaSection />
    </main>
  );
}
