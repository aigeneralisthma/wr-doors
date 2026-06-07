import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";

import { BRAND } from "@/lib/constants";
import {
  PRODUCT_CATEGORY_SLUGS,
  productsByCategory,
  type ProductCategorySlug,
} from "@/lib/products";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout/container";
import { ProductCard } from "@/components/products/product-card";
import { CategoryPills } from "@/components/products/category-pills";
import { GoldAccent } from "@/components/brand/gold-accent";

/* ── Static params ─────────────────────────────────────────────────────── */
export function generateStaticParams() {
  return PRODUCT_CATEGORY_SLUGS.map((category) => ({ category }));
}

/* ── Metadata ──────────────────────────────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category } = await params;

  if (!PRODUCT_CATEGORY_SLUGS.includes(category as ProductCategorySlug)) {
    return { title: "Not Found" };
  }

  const t = await getTranslations({ locale, namespace: "products" });
  const tCat = await getTranslations({ locale, namespace: "products.categories" });

  const slug = category as ProductCategorySlug;
  const titleKey =
    slug === "wpc-doors"
      ? "wpcDoorsTitle"
      : slug === "pivot-aluminium-doors"
        ? "pivotDoorsTitle"
        : slug === "sliding-systems"
          ? "slidingSystemsTitle"
          : "wallCladdingTitle";

  const title = tCat(titleKey);
  const desc = t("metaDescription");

  return {
    title,
    description: desc,
    alternates: {
      canonical: `/${locale}/products/${category}`,
      languages: {
        en: `/en/products/${category}`,
        ar: `/ar/products/${category}`,
      },
    },
    openGraph: {
      url: `${BRAND.url}/${locale}/products/${category}`,
      type: "website",
    },
  };
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;
  setRequestLocale(locale);

  // Validate slug
  if (!PRODUCT_CATEGORY_SLUGS.includes(category as ProductCategorySlug)) {
    notFound();
  }

  const slug = category as ProductCategorySlug;
  const products = productsByCategory(slug);
  const t = await getTranslations({ locale, namespace: "products" });
  const tCat = await getTranslations({ locale, namespace: "products.categories" });

  // Resolve title / subtitle keys
  const titleKey =
    slug === "wpc-doors"
      ? "wpcDoorsTitle"
      : slug === "pivot-aluminium-doors"
        ? "pivotDoorsTitle"
        : slug === "sliding-systems"
          ? "slidingSystemsTitle"
          : "wallCladdingTitle";

  const descKey =
    slug === "wpc-doors"
      ? "wpcDoorsDesc"
      : slug === "pivot-aluminium-doors"
        ? "pivotDoorsDesc"
        : slug === "sliding-systems"
          ? "slidingSystemsDesc"
          : "wallCladdingDesc";

  const categoryPills = PRODUCT_CATEGORY_SLUGS.map((s) => {
    const lKey =
      s === "wpc-doors"
        ? "wpcDoors"
        : s === "pivot-aluminium-doors"
          ? "pivotDoors"
          : s === "sliding-systems"
            ? "slidingSystems"
            : "wallCladding";
    return { slug: s, label: tCat(lKey) };
  });

  return (
    <main>
      {/* ── Category hero ── */}
      <section className="border-b border-border bg-background py-14 md:py-20">
        <Container>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link
              href="/products"
              className="hover:text-foreground transition-colors"
            >
              {t("allProducts")}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
            <span className="text-foreground font-medium">
              {tCat(titleKey)}
            </span>
          </nav>

          <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
            {t("productsIn")} {tCat(titleKey)}
          </p>
          <h1 className="font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl">
            {tCat(titleKey)}
          </h1>
          <GoldAccent width="medium" className="my-5" />
          <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
            {tCat(descKey)}
          </p>

          {/* Category filter pills */}
          <div className="mt-8">
            <CategoryPills
              pills={categoryPills}
              activeSlug={slug}
              allLabel={t("allProducts")}
            />
          </div>
        </Container>
      </section>

      {/* ── Products grid ── */}
      <section className="py-14 md:py-20">
        <Container>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
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
