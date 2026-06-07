import * as React from "react";

import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import type { ProductCategorySlug } from "@/lib/products";

export interface CategoryPill {
  slug: ProductCategorySlug | "all";
  label: string;
}

export interface CategoryPillsProps {
  pills: CategoryPill[];
  activeSlug: ProductCategorySlug | "all";
  allLabel: string;
  className?: string;
}

/**
 * CategoryPills — horizontal filter bar linking to catalog pages.
 *
 * "All" → /products
 * Each category → /products/[category]
 *
 * Server Component: navigation is link-based (no JS state).
 * Active pill is highlighted with navy bg + white text.
 */
export function CategoryPills({
  pills,
  activeSlug,
  allLabel,
  className,
}: CategoryPillsProps) {
  const allPills: CategoryPill[] = [
    { slug: "all", label: allLabel },
    ...pills,
  ];

  return (
    <div
      role="navigation"
      aria-label="Product categories"
      className={cn(
        "flex flex-wrap gap-2",
        className,
      )}
    >
      {allPills.map(({ slug, label }) => {
        const isActive = slug === activeSlug;
        const href = slug === "all" ? "/products" : `/products/${slug}`;

        return (
          <Link
            key={slug}
            href={href as Parameters<typeof Link>[0]["href"]}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
              "border border-border",
              isActive
                ? "bg-secondary text-secondary-foreground border-secondary shadow-sm"
                : "bg-background text-foreground hover:bg-muted hover:border-secondary/40",
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
