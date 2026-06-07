/**
 * Bridges Supabase product/project rows (which store image URLs as strings)
 * to the locally-managed `OptimizedImage` type used by the `<ProductImage>`
 * component.
 *
 * Why this exists: the `images` column holds public storage URLs (`/assets/
 * products/wpc-doors/modern-wpc-interior-door-1024.webp` in the seed). The
 * `<ProductImage>` component renders a `<picture>` with full responsive
 * variants (3 sizes × 3 formats + blurDataURL placeholder) — features that
 * live in `lib/image-manifest.ts`, not in the URL string.
 *
 * For Prompt 8, the seed URLs match the local image manifest paths, so we
 * extract the image slug + category from the URL and look up the full
 * `OptimizedImage`. When admins upload to Supabase Storage in Prompt 9
 * (different URL shape, no local manifest), we can fall back to a plain
 * `next/image` render — until then this path stays optimal.
 */

import { findImage, type OptimizedImage } from "@/lib/image-manifest";
import type { ProductCategorySlug } from "@/lib/products";
import type { ProductRow, ProjectRow } from "./database.types";

/**
 * Extracts the image slug from a manifest URL.
 *
 * `/assets/products/wpc-doors/modern-wpc-interior-door-1024.webp`
 *                          → `modern-wpc-interior-door`
 */
function imageSlugFromUrl(url: string): string | null {
  const match = url.match(/\/([^/]+)-(?:640|1024|1920)\.(?:webp|avif|jpg)$/);
  return match ? match[1] : null;
}

/**
 * Returns the OptimizedImage for a product, or null if it can't be resolved
 * (e.g. URL points at a Storage bucket without a local-manifest counterpart).
 */
export function productImage(row: ProductRow): OptimizedImage | null {
  const url = row.images[0];
  if (!url) return null;
  const imageSlug = imageSlugFromUrl(url);
  if (!imageSlug) return null;
  return findImage(row.category, imageSlug) ?? null;
}

/**
 * Same idea for projects. Projects currently borrow product imagery, so
 * we extract the category from the URL path too.
 */
export function projectImage(row: ProjectRow): OptimizedImage | null {
  const url = row.images[0];
  if (!url) return null;
  const categoryMatch = url.match(/\/assets\/products\/([^/]+)\//);
  const imageSlug = imageSlugFromUrl(url);
  if (!categoryMatch || !imageSlug) return null;
  return findImage(categoryMatch[1] as ProductCategorySlug, imageSlug) ?? null;
}

/** Pick the bilingual field for the active locale (mirrors lib/products.ts.localized) */
export function localized(enValue: string, arValue: string, locale: string): string {
  if (locale === "ar" && arValue) return arValue;
  return enValue;
}
