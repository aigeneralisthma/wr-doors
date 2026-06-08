import "server-only";

/**
 * Admin-only Supabase mutations.
 *
 * Used by `app/admin/actions.ts` server actions. All callers must have
 * verified `auth.uid()` via the cookie-based server client — these helpers
 * trust they're called from an authenticated context (RLS at the DB
 * layer is the actual gate).
 *
 * Pattern: each mutation returns `{ ok: boolean, error?: string }` so the
 * caller can map the result to a UI toast or inline error.
 */

import { createClient } from "./server";
import { deleteFilesByUrl } from "./storage";
import type {
  ProductCategory,
  ProductSpec,
  ProjectCategory,
} from "./database.types";

export interface MutationResult {
  ok: boolean;
  error?: string;
}

// =============================================================================
// PRODUCTS
// =============================================================================

export interface ProductInput {
  slug: string;
  category: ProductCategory;
  category_en: string;
  category_ar: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price_from_aed: number | null;
  specs: ProductSpec[];
  is_featured: boolean;
  is_active: boolean;
}

export async function createProduct(
  input: ProductInput,
): Promise<MutationResult & { slug?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("products").insert({
    ...input,
    images: [], // gallery is built up after creation
  });
  if (error) {
    console.error("[createProduct]", error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true, slug: input.slug };
}

export async function updateProduct(
  slug: string,
  input: Partial<ProductInput> & { images?: string[] },
): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update(input)
    .eq("slug", slug);
  if (error) {
    console.error("[updateProduct]", error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function deleteProduct(slug: string): Promise<MutationResult> {
  const supabase = await createClient();

  // Fetch images first so we can clean up Storage after the row delete
  const { data: product, error: fetchErr } = await supabase
    .from("products")
    .select("images")
    .eq("slug", slug)
    .maybeSingle();

  if (fetchErr) {
    console.error("[deleteProduct] fetch", fetchErr.message);
    return { ok: false, error: fetchErr.message };
  }

  const { error: delErr } = await supabase.from("products").delete().eq("slug", slug);
  if (delErr) {
    console.error("[deleteProduct] delete", delErr.message);
    return { ok: false, error: delErr.message };
  }

  // Best-effort Storage cleanup — failures here don't roll back the row
  if (product?.images && product.images.length > 0) {
    await deleteFilesByUrl(product.images);
  }

  return { ok: true };
}

// =============================================================================
// PROJECTS
// =============================================================================

export interface ProjectInput {
  slug: string;
  category: ProjectCategory;
  title_en: string;
  title_ar: string;
  location_en: string;
  location_ar: string;
  description_en: string;
  description_ar: string;
  is_published: boolean;
  display_order: number;
}

export async function createProject(
  input: ProjectInput,
): Promise<MutationResult & { slug?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").insert({
    ...input,
    images: [],
  });
  if (error) {
    console.error("[createProject]", error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true, slug: input.slug };
}

export async function updateProject(
  slug: string,
  input: Partial<ProjectInput> & { images?: string[] },
): Promise<MutationResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update(input)
    .eq("slug", slug);
  if (error) {
    console.error("[updateProject]", error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function deleteProject(slug: string): Promise<MutationResult> {
  const supabase = await createClient();

  const { data: project, error: fetchErr } = await supabase
    .from("projects")
    .select("images")
    .eq("slug", slug)
    .maybeSingle();

  if (fetchErr) {
    console.error("[deleteProject] fetch", fetchErr.message);
    return { ok: false, error: fetchErr.message };
  }

  const { error: delErr } = await supabase.from("projects").delete().eq("slug", slug);
  if (delErr) {
    console.error("[deleteProject] delete", delErr.message);
    return { ok: false, error: delErr.message };
  }

  if (project?.images && project.images.length > 0) {
    await deleteFilesByUrl(project.images);
  }

  return { ok: true };
}

// =============================================================================
// SITE SETTINGS — bulk upsert
// =============================================================================

export interface SiteSettingUpdate {
  key: string;
  value_en: string | null;
  value_ar: string | null;
}

/**
 * Bulk update site settings — receives a map of `{ key → { value_en, value_ar } }`.
 * Uses upsert so any setting can be added (admin might add a new key in v2).
 * All-or-nothing via Supabase's atomic batch.
 */
export async function updateSiteSettings(
  updates: SiteSettingUpdate[],
): Promise<MutationResult> {
  if (updates.length === 0) return { ok: true };

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert(updates, { onConflict: "key" });

  if (error) {
    console.error("[updateSiteSettings]", error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
