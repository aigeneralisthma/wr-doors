import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout/container";
import { GoldAccent } from "@/components/brand/gold-accent";
import { BrandButton } from "@/components/brand/brand-button";
import { ProductImage } from "@/components/ui/product-image";
import { FadeIn } from "@/components/animations/fade-in";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/animations/stagger-children";
import { PRODUCTS } from "@/lib/products";

/**
 * FeaturedProjectsSection — placeholder gallery using product imagery
 * until the client provides real installation photos (deferred to
 * Prompt 6 / post-launch).
 *
 * Picks 3 visually distinct images from the catalog (one pivot exterior,
 * one sliding system, one wall cladding) and pairs them with placeholder
 * project titles. Replacing them with real Supabase-backed projects in
 * Prompt 7 keeps this component intact.
 */
const PROJECT_SLOTS: ReadonlyArray<{
  productSlug: string;
  titleEn: string;
  titleAr: string;
  locationEn: string;
  locationAr: string;
}> = [
  {
    productSlug: "grand-exterior-pivot",
    titleEn: "Villa Renovation — Dubai Hills",
    titleAr: "تجديد فيلا — تلال دبي",
    locationEn: "Residential · Pivot Aluminium Entry",
    locationAr: "سكني · مدخل ألمنيوم محوري",
  },
  {
    productSlug: "glass-aluminium-sliding",
    titleEn: "Penthouse Living Room — JBR",
    titleAr: "غرفة معيشة بنتهاوس — جي بي آر",
    locationEn: "Residential · Sliding System",
    locationAr: "سكني · نظام منزلق",
  },
  {
    productSlug: "modern-fluted-cladding",
    titleEn: "Lobby Feature Wall — Business Bay",
    titleAr: "جدار مميز في الردهة — الخليج التجاري",
    locationEn: "Commercial · Wall Cladding",
    locationAr: "تجاري · كسوة جدران",
  },
];

export async function FeaturedProjectsSection({ locale }: { locale: string }) {
  const t = await getTranslations();

  const projects = PROJECT_SLOTS.map((slot) => {
    const product = PRODUCTS.find((p) => p.slug === slot.productSlug);
    return { slot, product };
  }).filter((p) => p.product !== undefined);

  return (
    <section
      className="relative bg-background py-20 sm:py-28"
      aria-labelledby="projects-heading"
    >
      <Container>
        <FadeIn>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-secondary">
                {t("home.projectsEyebrow")}
              </p>
              <h2
                id="projects-heading"
                className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl"
              >
                {t("home.projectsTitle")}
              </h2>
              <GoldAccent className="mt-4" />
              <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
                {t("home.projectsSubtitle")}
              </p>
            </div>

            <BrandButton brand="navy" size="lg" asChild className="shrink-0">
              <Link href="/projects">{t("home.projectsCta")}</Link>
            </BrandButton>
          </div>
        </FadeIn>

        <StaggerChildren className="mt-12 grid gap-6 lg:grid-cols-3">
          {projects.map(({ slot, product }) =>
            product ? (
              <StaggerItem key={slot.productSlug}>
                <article className="group relative overflow-hidden rounded-2xl bg-card shadow-sm">
                  <ProductImage
                    image={product.image}
                    alt={locale === "ar" ? slot.titleAr : slot.titleEn}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="aspect-[4/3] transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Caption overlay */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-brand-navy)]/85 via-[var(--color-brand-navy)]/30 to-transparent"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-[var(--color-brand-cream)]">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-brand-gold)]">
                      {locale === "ar" ? slot.locationAr : slot.locationEn}
                    </p>
                    <h3 className="mt-2 font-serif text-lg font-bold leading-tight sm:text-xl">
                      {locale === "ar" ? slot.titleAr : slot.titleEn}
                    </h3>
                    <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium opacity-80">
                      <span>{t("common.viewAll")}</span>
                      <ArrowRight
                        className="size-3 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
                        aria-hidden
                      />
                    </div>
                  </div>
                </article>
              </StaggerItem>
            ) : null,
          )}
        </StaggerChildren>
      </Container>
    </section>
  );
}
