/**
 * Bridges product/project rows (which store image URLs as strings) to the
 * renderer used by `<ProductImage>` / `<SmartImage>`.
 *
 * Two URL shapes:
 *   - **Local manifest paths** (`/assets/products/wpc-doors/foo-1024.webp`) —
 *     seeded products. We look up the full `OptimizedImage` (3 sizes × 3
 *     formats + blurDataURL) for an optimal `<picture>` render.
 *   - **Uploaded files** (`/uploads/products/<slug>/<uuid>.webp`) — admin
 *     uploads (previously Supabase Storage URLs). No manifest entry, so we
 *     fall back to a plain URL rendered via `next/image`.
 */

import { findImage, type OptimizedImage } from "@/lib/image-manifest";
import type { ProductCategorySlug } from "@/lib/products";
import type { ProductRow, ProjectRow } from "@/lib/db/types";

/**
 * Extracts the image slug from a manifest URL.
 * `/assets/products/wpc-doors/modern-wpc-interior-door-1024.webp` → `modern-wpc-interior-door`
 */
function imageSlugFromUrl(url: string): string | null {
  const match = url.match(/\/([^/]+)-(?:640|1024|1920)\.(?:webp|avif|jpg)$/);
  return match ? match[1] : null;
}

/** OptimizedImage for a product, or null if it can't be resolved from the manifest. */
export function productImage(row: ProductRow): OptimizedImage | null {
  const url = row.images[0];
  if (!url) return null;
  const imageSlug = imageSlugFromUrl(url);
  if (!imageSlug) return null;
  return findImage(row.category as ProductCategorySlug, imageSlug) ?? null;
}

/** Same idea for projects — the category is parsed from the URL path. */
export function projectImage(row: ProjectRow): OptimizedImage | null {
  const url = row.images[0];
  if (!url) return null;
  const categoryMatch = url.match(/\/assets\/products\/([^/]+)\//);
  const imageSlug = imageSlugFromUrl(url);
  if (!categoryMatch || !imageSlug) return null;
  return findImage(categoryMatch[1] as ProductCategorySlug, imageSlug) ?? null;
}

/** Pick the bilingual field for the active locale (mirrors lib/products.ts.localized). */
export function localized(
  enValue: string,
  arValue: string,
  locale: string,
): string {
  if (locale === "ar" && arValue) return arValue;
  return enValue;
}

/** A plain image with just a URL — no responsive variants. Used for uploaded files. */
export interface SimpleImage {
  src: string;
  width: number;
  height: number;
}

/** Discriminated union: either the full OptimizedImage or a plain URL. */
export type RenderableImage =
  | { kind: "manifest"; image: OptimizedImage }
  | { kind: "url"; image: SimpleImage };

/**
 * Smart resolver: manifest shape when available (optimal — responsive
 * variants + blur), otherwise a plain URL (admin-uploaded file).
 */
export function productImageSmart(row: ProductRow): RenderableImage | null {
  const url = row.images[0];
  if (!url) return null;
  const local = productImage(row);
  if (local) return { kind: "manifest", image: local };
  return { kind: "url", image: { src: url, width: 1024, height: 768 } };
}

export function projectImageSmart(row: ProjectRow): RenderableImage | null {
  const url = row.images[0];
  if (!url) return null;
  const local = projectImage(row);
  if (local) return { kind: "manifest", image: local };
  return { kind: "url", image: { src: url, width: 1024, height: 768 } };
}
