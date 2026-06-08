import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { ChevronRight, MessageSquare } from "lucide-react";

import { BRAND, whatsappUrl } from "@/lib/constants";
import {
  PRODUCT_CATEGORY_SLUGS,
  type ProductCategorySlug,
} from "@/lib/products";
import {
  getProductBySlug,
  getProducts,
  getProductSlugsForStaticParams,
} from "@/lib/supabase/queries";
import { localized, productImage } from "@/lib/supabase/image-helpers";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout/container";
import { ProductImage } from "@/components/ui/product-image";
import { Badge } from "@/components/ui/badge";
import { GoldAccent } from "@/components/brand/gold-accent";
import { TripleGuardPanel } from "@/components/products/triple-guard-panel";
import { RelatedProducts } from "@/components/products/related-products";
import { QuoteModal } from "@/components/products/quote-modal";
import { ProductJsonLd } from "@/components/seo/product-json-ld";

/* ── ISR: revalidate from Supabase every 60s ──────────────────────────── */
export const revalidate = 60;

/* ── Static params ─────────────────────────────────────────────────────── */
export async function generateStaticParams() {
  // Use the static (no-cookies) client here — `generateStaticParams` runs at
  // build time without an HTTP request, so the cookie-based server client
  // throws. See lib/supabase/static.ts.
  return await getProductSlugsForStaticParams();
}

/* ── Metadata ──────────────────────────────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, category, slug } = await params;

  const product = await getProductBySlug(slug);
  if (!product || product.category !== category) {
    return { title: "Not Found" };
  }

  const name = localized(product.name_en, product.name_ar, locale);
  const description = localized(
    product.description_en,
    product.description_ar,
    locale,
  );

  return {
    title: name,
    description,
    alternates: {
      canonical: `/${locale}/products/${category}/${slug}`,
      languages: {
        en: `/en/products/${category}/${slug}`,
        ar: `/ar/products/${category}/${slug}`,
      },
    },
    openGraph: {
      url: `${BRAND.url}/${locale}/products/${category}/${slug}`,
      type: "website",
      title: `${name} | ${BRAND.name}`,
      description,
    },
  };
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}) {
  const { locale, category, slug } = await params;
  setRequestLocale(locale);

  // Validate and find product
  if (!PRODUCT_CATEGORY_SLUGS.includes(category as ProductCategorySlug)) {
    notFound();
  }

  const product = await getProductBySlug(slug);
  if (!product || product.category !== category) {
    notFound();
  }

  const image = productImage(product);
  if (!image) notFound(); // can't render without resolvable image

  const specs = product.specs ?? [];

  const t = await getTranslations({ locale, namespace: "products" });
  const tCat = await getTranslations({ locale, namespace: "products.categories" });

  const name = localized(product.name_en, product.name_ar, locale);
  const description = localized(
    product.description_en,
    product.description_ar,
    locale,
  );

  // Category display label
  const catLabelKey =
    category === "wpc-doors"
      ? "wpcDoorsTitle"
      : category === "pivot-aluminium-doors"
        ? "pivotDoorsTitle"
        : category === "sliding-systems"
          ? "slidingSystemsTitle"
          : "wallCladdingTitle";

  const categoryLabel = tCat(catLabelKey);

  // Related: pull all products and split same-category vs other-category.
  // Same-category first, padded with others if we don't have 3.
  const allProducts = await getProducts();
  const sameCategoryOthers = allProducts.filter(
    (p) => p.category === product.category && p.slug !== slug,
  );
  const otherCategory = allProducts.filter(
    (p) => p.category !== product.category && p.slug !== slug,
  );
  const related = [...sameCategoryOthers, ...otherCategory].slice(0, 3);

  // WhatsApp link pre-filled with product name
  const waMessage =
    locale === "ar"
      ? `مرحباً، أنا مهتم بـ ${product.name_ar}`
      : `Hi, I'm interested in the ${product.name_en}`;
  const waUrl = whatsappUrl(waMessage);

  return (
    <main>
      {/* Product rich-result schema — picked up by Google product cards */}
      <ProductJsonLd product={product} locale={locale === "ar" ? "ar" : "en"} />

      {/* ── Product hero ── */}
      <section className="py-10 md:py-16">
        <Container>
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
          >
            <Link href="/products" className="hover:text-foreground transition-colors">
              {t("allProducts")}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
            <Link
              href={`/products/${category}` as Parameters<typeof Link>[0]["href"]}
              className="hover:text-foreground transition-colors"
            >
              {categoryLabel}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
            <span className="text-foreground font-medium line-clamp-1">{name}</span>
          </nav>

          {/* Two-column layout: image left, info right */}
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[55fr_45fr] xl:gap-16">
            {/* ── Image column ── */}
            <div className="sticky top-24">
              <ProductImage
                image={image}
                alt={name}
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="aspect-[4/3] w-full rounded-2xl overflow-hidden"
              />
              {/* "More images on request" note */}
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {locale === "ar"
                  ? "صور إضافية متاحة عند الطلب"
                  : "Additional photos available on request"}
              </p>
            </div>

            {/* ── Info column ── */}
            <div className="flex flex-col gap-6">
              {/* Category badge */}
              <Badge variant="outline" className="w-fit">
                {categoryLabel}
              </Badge>

              {/* Product name */}
              <div>
                <h1 className="font-serif text-3xl font-bold leading-tight text-foreground md:text-4xl">
                  {name}
                </h1>
                <GoldAccent width="short" className="mt-4" />
              </div>

              {/* Price */}
              <p className="font-mono text-sm font-medium text-muted-foreground">
                {product.price_from_aed
                  ? t("priceFrom", { price: product.price_from_aed.toLocaleString() })
                  : t("priceOnRequest")}
              </p>

              {/* Description */}
              <p className="text-base leading-relaxed text-foreground/80">
                {description}
              </p>

              {/* Specs table */}
              {specs.length > 0 && (
                <div>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("specsTitle")}
                  </h2>
                  <dl className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                    {specs.map((spec) => (
                      <div
                        key={spec.label_en}
                        className="flex items-start justify-between gap-4 px-4 py-3 text-sm even:bg-muted/30"
                      >
                        <dt className="font-medium text-foreground whitespace-nowrap">
                          {locale === "ar" ? spec.label_ar : spec.label_en}
                        </dt>
                        <dd className="text-muted-foreground text-end">
                          {locale === "ar" ? spec.value_ar : spec.value_en}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* CTAs */}
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                {/* Quote modal trigger (client component) */}
                <QuoteModal
                  product={{
                    slug: product.slug,
                    name_en: product.name_en,
                    name_ar: product.name_ar,
                  }}
                  locale={locale}
                />

                {/* WhatsApp direct link */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md border-2 border-[#25D366] px-6 py-3 text-sm font-semibold text-[#25D366] transition-colors hover:bg-[#25D366] hover:text-white"
                >
                  <MessageSquare className="h-4 w-4" />
                  {locale === "ar" ? "واتساب" : "WhatsApp"}
                </a>
              </div>

              {/* Warranty note */}
              <p className="rounded-lg bg-accent px-4 py-3 text-xs text-muted-foreground leading-relaxed border border-border">
                {locale === "ar"
                  ? "✓ جميع المنتجات مشمولة بضمان WR Doors لمدة 10 سنوات وخدمة التركيب في الإمارات."
                  : "✓ All products come with the WR Doors 10-year warranty and UAE installation service."}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Triple Guard ── */}
      <TripleGuardPanel locale={locale} />

      {/* ── Related products ── */}
      {related.length > 0 && (
        <RelatedProducts products={related} locale={locale} />
      )}
    </main>
  );
}
