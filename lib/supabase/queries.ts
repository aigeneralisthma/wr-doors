/**
 * Typed query helpers for public-facing data reads.
 *
 * All helpers use the **server** Supabase client and run server-side
 * (Server Components, generateStaticParams, route handlers).
 *
 * RLS is the source of truth — these helpers don't bypass it. If you
 * need admin-only reads (leads, bookings, technicians), you must be
 * authenticated via Supabase Auth (handled in Prompt 9 admin dashboard).
 *
 * NOTE: These helpers are wired but NOT yet called from public pages.
 * Prompt 8 replaces the in-memory `lib/products.ts` / `lib/projects.ts`
 * reads with these queries. For now this file provides the typed surface.
 */

import { createClient } from "./server";
import type {
  ProductRow,
  ProjectRow,
  ProductCategory,
  ProjectCategory,
  SiteSettingRow,
} from "./database.types";

// =============================================================================
// PRODUCTS
// =============================================================================

/** Fetch all active products, ordered by featured first then name. */
export async function getProducts(): Promise<ProductRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("name_en", { ascending: true });

  if (error) throw new Error(`getProducts failed: ${error.message}`);
  return data ?? [];
}

/** Fetch one product by slug, or null if missing/inactive. */
export async function getProductBySlug(slug: string): Promise<ProductRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(`getProductBySlug(${slug}) failed: ${error.message}`);
  return data;
}

/** Fetch all active products in a category. */
export async function getProductsByCategory(
  category: ProductCategory,
): Promise<ProductRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("category", category)
    .order("is_featured", { ascending: false })
    .order("name_en", { ascending: true });

  if (error) {
    throw new Error(`getProductsByCategory(${category}) failed: ${error.message}`);
  }
  return data ?? [];
}

/** Fetch featured products only (homepage category grid). */
export async function getFeaturedProducts(): Promise<ProductRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("name_en", { ascending: true });

  if (error) throw new Error(`getFeaturedProducts failed: ${error.message}`);
  return data ?? [];
}

// =============================================================================
// PROJECTS
// =============================================================================

/** Fetch all published projects, ordered by display_order ascending. */
export async function getProjects(): Promise<ProjectRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true });

  if (error) throw new Error(`getProjects failed: ${error.message}`);
  return data ?? [];
}

/** Fetch published projects in a single category. */
export async function getProjectsByCategory(
  category: ProjectCategory,
): Promise<ProjectRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("is_published", true)
    .eq("category", category)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(`getProjectsByCategory(${category}) failed: ${error.message}`);
  }
  return data ?? [];
}

// =============================================================================
// SITE SETTINGS (mini CMS)
// =============================================================================

/**
 * Fetch a single site setting by key, or null if missing.
 * Use locale to pick `value_en` vs `value_ar` for text-type settings.
 */
export async function getSiteSetting(
  key: string,
): Promise<SiteSettingRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    throw new Error(`getSiteSetting(${key}) failed: ${error.message}`);
  }
  return data;
}

/** Fetch all site settings — useful for admin dashboard listing. */
export async function getAllSiteSettings(): Promise<SiteSettingRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .order("key", { ascending: true });

  if (error) throw new Error(`getAllSiteSettings failed: ${error.message}`);
  return data ?? [];
}

/**
 * Resolve a site setting to the locale-appropriate text value.
 * Falls back to English if Arabic is missing (defensive).
 */
export function localizeSiteSetting(
  setting: SiteSettingRow | null,
  locale: string,
): string | null {
  if (!setting) return null;
  if (locale === "ar" && setting.value_ar) return setting.value_ar;
  return setting.value_en;
}
