import "server-only";

/**
 * Admin-only mutations, used by the server actions in `app/admin/actions.ts`.
 * `server-only`. Callers must have verified the admin session first.
 *
 * Each mutation returns `{ ok, error? }` so the caller can map it to a toast
 * or inline error.
 */

import { eq, sql } from "drizzle-orm";

import { db } from "./index";
import { bookings, leads, products, projects, siteSettings } from "./schema";
import type {
  BookingStatus,
  LeadStatus,
  ProductCategory,
  ProjectCategory,
  ProductSpec,
} from "./types";
import { deleteFilesByUrl } from "@/lib/storage/local";

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
  try {
    await db.insert(products).values({ ...input, images: [] });
    return { ok: true, slug: input.slug };
  } catch (err) {
    console.error("[createProduct]", err);
    return { ok: false, error: (err as Error).message };
  }
}

export async function updateProduct(
  slug: string,
  input: Partial<ProductInput> & { images?: string[] },
): Promise<MutationResult> {
  try {
    await db.update(products).set(input).where(eq(products.slug, slug));
    return { ok: true };
  } catch (err) {
    console.error("[updateProduct]", err);
    return { ok: false, error: (err as Error).message };
  }
}

export async function deleteProduct(slug: string): Promise<MutationResult> {
  try {
    const rows = await db
      .select({ images: products.images })
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    await db.delete(products).where(eq(products.slug, slug));

    // Best-effort storage cleanup — failure here doesn't roll back the row.
    const images = rows[0]?.images ?? [];
    if (images.length > 0) await deleteFilesByUrl(images);

    return { ok: true };
  } catch (err) {
    console.error("[deleteProduct]", err);
    return { ok: false, error: (err as Error).message };
  }
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
  try {
    await db.insert(projects).values({ ...input, images: [] });
    return { ok: true, slug: input.slug };
  } catch (err) {
    console.error("[createProject]", err);
    return { ok: false, error: (err as Error).message };
  }
}

export async function updateProject(
  slug: string,
  input: Partial<ProjectInput> & { images?: string[] },
): Promise<MutationResult> {
  try {
    await db.update(projects).set(input).where(eq(projects.slug, slug));
    return { ok: true };
  } catch (err) {
    console.error("[updateProject]", err);
    return { ok: false, error: (err as Error).message };
  }
}

export async function deleteProject(slug: string): Promise<MutationResult> {
  try {
    const rows = await db
      .select({ images: projects.images })
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1);

    await db.delete(projects).where(eq(projects.slug, slug));

    const images = rows[0]?.images ?? [];
    if (images.length > 0) await deleteFilesByUrl(images);

    return { ok: true };
  } catch (err) {
    console.error("[deleteProject]", err);
    return { ok: false, error: (err as Error).message };
  }
}

// =============================================================================
// LEADS + BOOKINGS — admin status updates
// =============================================================================

export async function updateLeadStatusDb(
  leadId: string,
  status: LeadStatus,
  adminNotes: string | null,
): Promise<MutationResult> {
  try {
    await db
      .update(leads)
      .set({ status, admin_notes: adminNotes })
      .where(eq(leads.id, leadId));
    return { ok: true };
  } catch (err) {
    console.error("[updateLeadStatusDb]", err);
    return { ok: false, error: (err as Error).message };
  }
}

export async function updateBookingDb(
  bookingId: string,
  input: {
    status: BookingStatus;
    assignedTechnician: string | null;
    adminNotes: string | null;
  },
): Promise<MutationResult> {
  try {
    await db
      .update(bookings)
      .set({
        status: input.status,
        assigned_technician: input.assignedTechnician,
        admin_notes: input.adminNotes,
      })
      .where(eq(bookings.id, bookingId));
    return { ok: true };
  } catch (err) {
    console.error("[updateBookingDb]", err);
    return { ok: false, error: (err as Error).message };
  }
}

// =============================================================================
// SITE SETTINGS — bulk upsert
// =============================================================================

export interface SiteSettingUpdate {
  key: string;
  value_en: string | null;
  value_ar: string | null;
}

export async function updateSiteSettings(
  updates: SiteSettingUpdate[],
): Promise<MutationResult> {
  if (updates.length === 0) return { ok: true };

  try {
    await db
      .insert(siteSettings)
      .values(updates)
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value_en: sql`excluded.value_en`,
          value_ar: sql`excluded.value_ar`,
        },
      });
    return { ok: true };
  } catch (err) {
    console.error("[updateSiteSettings]", err);
    return { ok: false, error: (err as Error).message };
  }
}
