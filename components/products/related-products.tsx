import * as React from "react";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/container";
import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/lib/products";

interface RelatedProductsProps {
  products: Product[];
  locale: string;
}

/**
 * RelatedProducts — a horizontal strip of up to 3 product cards.
 *
 * Used at the bottom of the product detail page. The calling page selects
 * which products to surface (typically other products in the same category,
 * or a handpicked selection).
 *
 * Server Component: receives already-selected products as props.
 */
export async function RelatedProducts({ products, locale }: RelatedProductsProps) {
  if (products.length === 0) return null;

  const t = await getTranslations({ locale, namespace: "products" });

  return (
    <section aria-label={t("relatedTitle")} className="bg-[var(--color-brand-cream)] py-16 md:py-20">
      <Container>
        <h2 className="mb-8 font-serif text-2xl font-semibold text-foreground md:text-3xl">
          {t("relatedTitle")}
        </h2>
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
  );
}
