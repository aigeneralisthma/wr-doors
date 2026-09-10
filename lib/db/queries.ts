/**
 * Typed query helpers for public-facing data reads.
 *
 * These are the ONLY DB helpers public pages are allowed to import. They
 * read `products`, `projects`, and `site_settings` — never `leads`,
 * `bookings`, `technicians`, or `admin_users`. That import boundary is what
 * replaces Supabase RLS.
 *
 * Admin-only reads live in `./admin-queries.ts` (`server-only`).
 */

import { and, asc, desc, eq } from "drizzle-orm";

import { db } from "./index";
import { products, projects, siteSettings } from "./schema";
import type {
  ProductCategory,
  ProductRow,
  ProjectCategory,
  ProjectRow,
  SiteSettingRow,
} from "./types";

// =============================================================================
// PRODUCTS
// =============================================================================

/** All active products, featured first then A–Z by English name. */
export async function getProducts(): Promise<ProductRow[]> {
  return db
    .select()
    .from(products)
    .where(eq(products.is_active, true))
    .orderBy(desc(products.is_featured), asc(products.name_en));
}

/** One product by slug, or null if missing/inactive. */
export async function getProductBySlug(slug: string): Promise<ProductRow | null> {
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.is_active, true)))
    .limit(1);
  return rows[0] ?? null;
}

/** All active products in a category. */
export async function getProductsByCategory(
  category: ProductCategory,
): Promise<ProductRow[]> {
  return db
    .select()
    .from(products)
    .where(and(eq(products.is_active, true), eq(products.category, category)))
    .orderBy(desc(products.is_featured), asc(products.name_en));
}

/** Featured products only (homepage category grid). */
export async function getFeaturedProducts(): Promise<ProductRow[]> {
  return db
    .select()
    .from(products)
    .where(and(eq(products.is_active, true), eq(products.is_featured, true)))
    .orderBy(asc(products.name_en));
}

/** Build-time: all active product slugs + categories for `generateStaticParams`. */
export async function getProductSlugsForStaticParams(): Promise<
  Array<{ category: string; slug: string }>
> {
  return db
    .select({ slug: products.slug, category: products.category })
    .from(products)
    .where(eq(products.is_active, true));
}

/** Slug + category + updated_at for every active product — used by the sitemap. */
export async function getProductsForSitemap(): Promise<
  Array<{ slug: string; category: string; updated_at: string }>
> {
  return db
    .select({
      slug: products.slug,
      category: products.category,
      updated_at: products.updated_at,
    })
    .from(products)
    .where(eq(products.is_active, true));
}

// =============================================================================
// PROJECTS
// =============================================================================

/** All published projects, ascending by display_order. */
export async function getProjects(): Promise<ProjectRow[]> {
  return db
    .select()
    .from(projects)
    .where(eq(projects.is_published, true))
    .orderBy(asc(projects.display_order));
}

/** Published projects in a single category. */
export async function getProjectsByCategory(
  category: ProjectCategory,
): Promise<ProjectRow[]> {
  return db
    .select()
    .from(projects)
    .where(
      and(eq(projects.is_published, true), eq(projects.category, category)),
    )
    .orderBy(asc(projects.display_order));
}

/** One published project by slug, or null if missing/unpublished. */
export async function getProjectBySlug(
  slug: string,
): Promise<ProjectRow | null> {
  const rows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.slug, slug), eq(projects.is_published, true)))
    .limit(1);
  return rows[0] ?? null;
}

/** Build-time: all published project slugs for `generateStaticParams`. */
export async function getProjectSlugsForStaticParams(): Promise<
  Array<{ slug: string }>
> {
  return db
    .select({ slug: projects.slug })
    .from(projects)
    .where(eq(projects.is_published, true));
}

/** Slug + updated_at for every published project — used by the sitemap. */
export async function getProjectsForSitemap(): Promise<
  Array<{ slug: string; updated_at: string }>
> {
  return db
    .select({ slug: projects.slug, updated_at: projects.updated_at })
    .from(projects)
    .where(eq(projects.is_published, true));
}

// =============================================================================
// SITE SETTINGS (mini CMS)
// =============================================================================

/** One site setting by key, or null. */
export async function getSiteSetting(
  key: string,
): Promise<SiteSettingRow | null> {
  const rows = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, key))
    .limit(1);
  return rows[0] ?? null;
}

/** All site settings, ascending by key. */
export async function getAllSiteSettings(): Promise<SiteSettingRow[]> {
  return db.select().from(siteSettings).orderBy(asc(siteSettings.key));
}

/**
 * Resolve a site setting to the locale-appropriate text value.
 * Falls back to English if Arabic is missing.
 */
export function localizeSiteSetting(
  setting: SiteSettingRow | null,
  locale: string,
): string | null {
  if (!setting) return null;
  if (locale === "ar" && setting.value_ar) return setting.value_ar;
  return setting.value_en;
}
