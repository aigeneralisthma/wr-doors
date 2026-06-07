import * as React from "react";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { ProductImage } from "@/components/ui/product-image";
import { Badge } from "@/components/ui/badge";
import type { OptimizedImage } from "@/lib/image-manifest";
import type { ProductCategory } from "@/lib/supabase/database.types";

/** Maps category slug to a display label (used for the badge on the card). */
const CATEGORY_LABELS: Record<ProductCategory, { en: string; ar: string }> = {
  "wpc-doors": { en: "WPC Doors", ar: "أبواب WPC" },
  "pivot-aluminium-doors": { en: "Pivot Aluminium", ar: "محوري ألمنيوم" },
  "sliding-systems": { en: "Sliding Systems", ar: "أنظمة منزلقة" },
  "wall-cladding": { en: "Wall Cladding", ar: "كسوة الجدران" },
};

/**
 * Subset of fields the card actually renders. Compatible with both the
 * Supabase `ProductRow` and the old `Product` type from `lib/products.ts`
 * (during transition).
 */
export interface ProductCardData {
  slug: string;
  category: ProductCategory;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price_from_aed?: number | null;
}

export interface ProductCardProps {
  product: ProductCardData;
  /** Resolved OptimizedImage (caller looks up via `productImage(row)` from lib/supabase/image-helpers) */
  image: OptimizedImage;
  locale: string;
  /** Label for the "View Details" link (passed from server translation context). */
  viewDetailsLabel: string;
  /** Label for "Price on request" (passed from server translation context). */
  priceOnRequestLabel: string;
  /** Label for "From AED X" prefix (passed from server, already interpolated). */
  priceFromLabel?: string;
  className?: string;
}

/**
 * ProductCard — used on /products and /products/[category] grid pages.
 *
 * Server Component: receives translated strings as props from the page.
 * No client-side hooks needed — the "View Details" is a plain <Link>.
 */
export function ProductCard({
  product,
  image,
  locale,
  viewDetailsLabel,
  priceOnRequestLabel,
  priceFromLabel,
  className,
}: ProductCardProps) {
  const name = locale === "ar" ? product.name_ar : product.name_en;
  const description = locale === "ar" ? product.description_ar : product.description_en;
  const categoryLabel = locale === "ar"
    ? CATEGORY_LABELS[product.category].ar
    : CATEGORY_LABELS[product.category].en;

  const href = `/products/${product.category}/${product.slug}` as const;

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-xl overflow-hidden border border-border bg-card",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10",
        className,
      )}
    >
      {/* Image */}
      <Link href={href} className="block" tabIndex={-1} aria-hidden>
        <ProductImage
          image={image}
          alt={name}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="aspect-[16/10] w-full"
        />
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5 gap-3">
        {/* Category badge */}
        <Badge variant="outline" className="w-fit text-[11px]">
          {categoryLabel}
        </Badge>

        {/* Name */}
        <h3 className="font-serif text-lg font-semibold leading-snug text-foreground line-clamp-2">
          <Link href={href} className="hover:text-primary transition-colors">
            {name}
          </Link>
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
          {description}
        </p>

        {/* Price */}
        <p className="text-xs font-medium text-muted-foreground font-mono">
          {product.price_from_aed
            ? priceFromLabel ?? `From AED ${product.price_from_aed}`
            : priceOnRequestLabel}
        </p>

        {/* View details link */}
        <Link
          href={href}
          className={cn(
            "mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary",
            "transition-colors hover:text-primary",
            "[&_svg]:transition-transform [&:hover_svg]:translate-x-0.5",
            "rtl:[&_svg]:-scale-x-100 rtl:[&:hover_svg]:-translate-x-0.5",
          )}
        >
          {viewDetailsLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
