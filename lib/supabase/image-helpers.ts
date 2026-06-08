/**
 * Bridges Supabase product/project rows (which store image URLs as strings)
 * to the renderer used by `<ProductImage>`.
 *
 * Two URL shapes we handle:
 *   - **Local manifest paths** (`/assets/products/wpc-doors/foo-1024.webp`) —
 *     seeded products use these. We look up the full `OptimizedImage` with
 *     responsive variants (3 sizes × 3 formats + blurDataURL) for an
 *     optimal `<picture>` render.
 *   - **Supabase Storage URLs** (`https://<project>.supabase.co/storage/...`)
 *     — admin-uploaded images live here. No manifest entry, so we fall back
 *     to a simpler shape that `<ProductImage>` renders via plain `<img>` or
 *     `next/image` (loses blur + responsive variants but works).
 *
 * Use `productImageSmart(row)` from admin-touched code paths and pages that
 * may render either kind. The legacy `productImage(row)` returns the
 * OptimizedImage variant only (legacy callers that haven't been updated).
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

/** A plain image with just a URL — no responsive variants. Used as the
 *  fallback shape when an image comes from Supabase Storage instead of
 *  the local optimized manifest. */
export interface SimpleImage {
  src: string;
  /** Best-effort display width hint — defaults to 1024 */
  width: number;
  height: number;
}

/** Discriminated union: either the full OptimizedImage or a plain URL */
export type RenderableImage =
  | { kind: "manifest"; image: OptimizedImage }
  | { kind: "url"; image: SimpleImage };

/**
 * Smart image resolver: returns the best-available shape for rendering.
 * Falls back to a plain URL if the image isn't in the local manifest
 * (i.e. it was admin-uploaded to Supabase Storage).
 */
export function productImageSmart(row: ProductRow): RenderableImage | null {
  const url = row.images[0];
  if (!url) return null;

  // Try the local manifest first (optimal — responsive variants + blur)
  const local = productImage(row);
  if (local) return { kind: "manifest", image: local };

  // Fall back to plain URL render
  return { kind: "url", image: { src: url, width: 1024, height: 768 } };
}

/** Same idea for projects. */
export function projectImageSmart(row: ProjectRow): RenderableImage | null {
  const url = row.images[0];
  if (!url) return null;

  const local = projectImage(row);
  if (local) return { kind: "manifest", image: local };

  return { kind: "url", image: { src: url, width: 1024, height: 768 } };
}
