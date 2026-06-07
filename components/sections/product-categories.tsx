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
import { featuredByCategory, type ProductCategorySlug } from "@/lib/products";

/**
 * ProductCategoriesSection — visual entry point into the four product lines.
 *
 * Layout: 2-column grid on tablet, 4-column on desktop. Mobile stacks
 * vertically with the image as the dominant element on each card.
 *
 * Each card is a full <Link> so the entire tile is clickable (better
 * touch target than a tiny "view" link).
 *
 * Card structure: image (aspect 4/5) → gold meta line → title + subtitle
 * → "Explore" affordance with an arrow that subtly nudges on hover.
 */
const CATEGORY_ORDER: ReadonlyArray<{
  slug: ProductCategorySlug;
  titleKey: string;
  subtitleKey: string;
}> = [
  {
    slug: "wpc-doors",
    titleKey: "products.categories.wpcDoors",
    subtitleKey: "products.categories.wpcDoorsSubtitle",
  },
  {
    slug: "pivot-aluminium-doors",
    titleKey: "products.categories.pivotDoors",
    subtitleKey: "products.categories.pivotDoorsSubtitle",
  },
  {
    slug: "sliding-systems",
    titleKey: "products.categories.slidingSystems",
    subtitleKey: "products.categories.slidingSystemsSubtitle",
  },
  {
    slug: "wall-cladding",
    titleKey: "products.categories.wallCladding",
    subtitleKey: "products.categories.wallCladdingSubtitle",
  },
];

export async function ProductCategoriesSection({ locale }: { locale: string }) {
  const t = await getTranslations();
  const featured = featuredByCategory();

  return (
    <section
      className="relative bg-[var(--color-brand-cream)] py-20 sm:py-28"
      aria-labelledby="categories-heading"
    >
      <Container>
        <FadeIn>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-secondary">
                {t("home.categoriesEyebrow")}
              </p>
              <h2
                id="categories-heading"
                className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl"
              >
                {t("home.categoriesTitle")}
              </h2>
              <GoldAccent className="mt-4" />
              <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
                {t("home.categoriesSubtitle")}
              </p>
            </div>

            <BrandButton brand="navy" size="lg" asChild className="shrink-0">
              <Link href="/products">{t("home.categoriesCta")}</Link>
            </BrandButton>
          </div>
        </FadeIn>

        <StaggerChildren className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORY_ORDER.map(({ slug, titleKey, subtitleKey }) => {
            const product = featured[slug];

            return (
              <StaggerItem key={slug}>
                <Link
                  href={`/products`}
                  className="group block h-full overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={t(titleKey)}
                >
                  {product ? (
                    <ProductImage
                      image={product.image}
                      alt={
                        locale === "ar" ? product.name_ar : product.name_en
                      }
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="aspect-[4/5] transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="aspect-[4/5] bg-muted" />
                  )}

                  <div className="p-5 sm:p-6">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-brand-gold-dark)]">
                      {locale === "ar" ? "فئة المنتج" : "Product line"}
                    </p>
                    <h3 className="mt-2 font-serif text-xl font-bold leading-tight">
                      {t(titleKey)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {t(subtitleKey)}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-secondary">
                      <span>{t("common.explore")}</span>
                      <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
                        aria-hidden
                      />
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      </Container>
    </section>
  );
}
