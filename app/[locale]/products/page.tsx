import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { BRAND } from "@/lib/constants";
import { PRODUCTS, PRODUCT_CATEGORY_SLUGS } from "@/lib/products";
import { Container } from "@/components/layout/container";
import { ProductCard } from "@/components/products/product-card";
import { CategoryPills } from "@/components/products/category-pills";
import { GoldAccent } from "@/components/brand/gold-accent";

/* ── Static params ─────────────────────────────────────────────────────── */
export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }];
}

/* ── Metadata ──────────────────────────────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "products" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `/${locale}/products`,
      languages: { en: "/en/products", ar: "/ar/products" },
    },
    openGraph: {
      url: `${BRAND.url}/${locale}/products`,
      type: "website",
    },
  };
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "products" });
  const tCat = await getTranslations({ locale, namespace: "products.categories" });

  const categoryPills = PRODUCT_CATEGORY_SLUGS.map((slug) => {
    const labelKey =
      slug === "wpc-doors"
        ? "wpcDoors"
        : slug === "pivot-aluminium-doors"
          ? "pivotDoors"
          : slug === "sliding-systems"
            ? "slidingSystems"
            : "wallCladding";
    return { slug, label: tCat(labelKey) };
  });

  return (
    <main>
      {/* ── Page hero ── */}
      <section className="border-b border-border bg-background py-14 md:py-20">
        <Container>
          <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
            {t("heroEyebrow")}
          </p>
          <h1 className="font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl">
            {t("heroTitle")}
          </h1>
          <GoldAccent width="medium" className="my-5" />
          <p className="max-w-xl text-base text-muted-foreground leading-relaxed">
            {t("heroSubtitle")}
          </p>

          {/* Category filter pills */}
          <div className="mt-8">
            <CategoryPills
              pills={categoryPills}
              activeSlug="all"
              allLabel={t("allProducts")}
            />
          </div>
        </Container>
      </section>

      {/* ── Product grid ── */}
      <section className="py-14 md:py-20">
        <Container>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {PRODUCTS.map((product) => (
              <ProductCard
                key={product.slug}
                product={product}
                locale={locale}
                viewDetailsLabel={t("viewDetails")}
                priceOnRequestLabel={t("priceOnRequest")}
              />
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
