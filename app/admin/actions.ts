"use server";

/**
 * Admin-only server actions.
 *
 * All actions in this file require an authenticated session — they re-check
 * `supabase.auth.getUser()` at the top as defense in depth (even though the
 * middleware already blocks unauthenticated `/admin/*` requests).
 *
 * Returns the same `{ ok, error?, ... }` shape as the public actions for
 * UI consistency.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import {
  createProduct as dbCreateProduct,
  updateProduct as dbUpdateProduct,
  deleteProduct as dbDeleteProduct,
  createProject as dbCreateProject,
  updateProject as dbUpdateProject,
  deleteProject as dbDeleteProject,
  updateSiteSettings as dbUpdateSiteSettings,
  type ProductInput,
  type ProjectInput,
  type SiteSettingUpdate,
} from "@/lib/supabase/admin-mutations";
import {
  uploadFile as storageUpload,
  deleteFileByUrl as storageDelete,
  type StorageBucket,
} from "@/lib/supabase/storage";
import type {
  BookingStatus,
  LeadStatus,
} from "@/lib/supabase/database.types";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const GENERIC_ERROR = "Something went wrong. Please try again.";
const NOT_AUTHED = "Your session expired. Please sign in again.";

// =============================================================================
// Sign out
// =============================================================================

/**
 * Sign out the current admin and redirect to /admin/login.
 * Wired to the sidebar sign-out button.
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// =============================================================================
// updateLeadStatus
// =============================================================================

const LEAD_STATUS = ["new", "contacted", "converted", "lost"] as const;

const updateLeadStatusSchema = z.object({
  leadId: z.string().uuid(),
  status: z.enum(LEAD_STATUS),
  adminNotes: z.string().optional(),
});

export async function updateLeadStatus(input: {
  leadId: string;
  status: LeadStatus;
  adminNotes?: string;
}): Promise<ActionResult> {
  const parsed = updateLeadStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: GENERIC_ERROR };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: NOT_AUTHED };

  const { error } = await supabase
    .from("leads")
    .update({
      status: parsed.data.status,
      admin_notes: parsed.data.adminNotes ?? null,
    })
    .eq("id", parsed.data.leadId);

  if (error) {
    console.error("[updateLeadStatus] failed:", error.message);
    return { ok: false, error: GENERIC_ERROR };
  }

  revalidatePath("/admin/leads");
  revalidatePath("/admin/dashboard");
  return { ok: true };
}

// =============================================================================
// updateBookingStatus + assignTechnician (combined — single save button)
// =============================================================================

const BOOKING_STATUS = [
  "new",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
] as const;

const updateBookingSchema = z.object({
  bookingId: z.string().uuid(),
  status: z.enum(BOOKING_STATUS),
  assignedTechnician: z.string().uuid().nullable(),
  adminNotes: z.string().optional(),
});

export async function updateBooking(input: {
  bookingId: string;
  status: BookingStatus;
  assignedTechnician: string | null;
  adminNotes?: string;
}): Promise<ActionResult> {
  const parsed = updateBookingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: GENERIC_ERROR };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: NOT_AUTHED };

  const { error } = await supabase
    .from("bookings")
    .update({
      status: parsed.data.status,
      assigned_technician: parsed.data.assignedTechnician,
      admin_notes: parsed.data.adminNotes ?? null,
    })
    .eq("id", parsed.data.bookingId);

  if (error) {
    console.error("[updateBooking] failed:", error.message);
    return { ok: false, error: GENERIC_ERROR };
  }

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/dashboard");
  return { ok: true };
}

// =============================================================================
// PRODUCTS — create / update / delete
// =============================================================================

async function requireAuth(): Promise<ActionResult | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: NOT_AUTHED };
  return null;
}

const productInputSchema = z.object({
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  category: z.enum(["wpc-doors", "pivot-aluminium-doors", "sliding-systems", "wall-cladding"]),
  category_en: z.string().min(1),
  category_ar: z.string().min(1),
  name_en: z.string().min(1),
  name_ar: z.string().min(1),
  description_en: z.string().min(1),
  description_ar: z.string().min(1),
  price_from_aed: z.number().int().nonnegative().nullable(),
  specs: z.array(
    z.object({
      label_en: z.string(),
      label_ar: z.string(),
      value_en: z.string(),
      value_ar: z.string(),
    }),
  ),
  is_featured: z.boolean(),
  is_active: z.boolean(),
});

export async function createProductAction(
  input: ProductInput,
): Promise<ActionResult & { slug?: string }> {
  const authErr = await requireAuth();
  if (authErr) return authErr;
  const parsed = productInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };

  const result = await dbCreateProduct(parsed.data);
  if (!result.ok) return { ok: false, error: result.error ?? GENERIC_ERROR };

  revalidatePath("/admin/products");
  revalidatePath("/[locale]/products", "page");
  revalidatePath("/[locale]/products/[category]", "page");
  return { ok: true, slug: result.slug };
}

export async function updateProductAction(
  slug: string,
  input: Partial<ProductInput> & { images?: string[] },
): Promise<ActionResult> {
  const authErr = await requireAuth();
  if (authErr) return authErr;

  const result = await dbUpdateProduct(slug, input);
  if (!result.ok) return { ok: false, error: result.error ?? GENERIC_ERROR };

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${slug}`);
  revalidatePath("/[locale]/products", "page");
  revalidatePath("/[locale]/products/[category]", "page");
  revalidatePath("/[locale]/products/[category]/[slug]", "page");
  return { ok: true };
}

export async function deleteProductAction(slug: string): Promise<ActionResult> {
  const authErr = await requireAuth();
  if (authErr) return authErr;

  const result = await dbDeleteProduct(slug);
  if (!result.ok) return { ok: false, error: result.error ?? GENERIC_ERROR };

  revalidatePath("/admin/products");
  revalidatePath("/[locale]/products", "page");
  return { ok: true };
}

// =============================================================================
// PROJECTS — create / update / delete
// =============================================================================

const projectInputSchema = z.object({
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  category: z.enum(["residential", "commercial", "luxury"]),
  title_en: z.string().min(1),
  title_ar: z.string().min(1),
  location_en: z.string().min(1),
  location_ar: z.string().min(1),
  description_en: z.string().min(1),
  description_ar: z.string().min(1),
  is_published: z.boolean(),
  display_order: z.number().int(),
});

export async function createProjectAction(
  input: ProjectInput,
): Promise<ActionResult & { slug?: string }> {
  const authErr = await requireAuth();
  if (authErr) return authErr;
  const parsed = projectInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };

  const result = await dbCreateProject(parsed.data);
  if (!result.ok) return { ok: false, error: result.error ?? GENERIC_ERROR };

  revalidatePath("/admin/projects");
  revalidatePath("/[locale]/projects", "page");
  return { ok: true, slug: result.slug };
}

export async function updateProjectAction(
  slug: string,
  input: Partial<ProjectInput> & { images?: string[] },
): Promise<ActionResult> {
  const authErr = await requireAuth();
  if (authErr) return authErr;

  const result = await dbUpdateProject(slug, input);
  if (!result.ok) return { ok: false, error: result.error ?? GENERIC_ERROR };

  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${slug}`);
  revalidatePath("/[locale]/projects", "page");
  return { ok: true };
}

export async function deleteProjectAction(slug: string): Promise<ActionResult> {
  const authErr = await requireAuth();
  if (authErr) return authErr;

  const result = await dbDeleteProject(slug);
  if (!result.ok) return { ok: false, error: result.error ?? GENERIC_ERROR };

  revalidatePath("/admin/projects");
  revalidatePath("/[locale]/projects", "page");
  return { ok: true };
}

// =============================================================================
// SITE SETTINGS — bulk update
// =============================================================================

const settingsUpdateSchema = z.array(
  z.object({
    key: z.string().min(1),
    value_en: z.string().nullable(),
    value_ar: z.string().nullable(),
  }),
);

export async function updateSiteSettingsAction(
  updates: SiteSettingUpdate[],
): Promise<ActionResult> {
  const authErr = await requireAuth();
  if (authErr) return authErr;
  const parsed = settingsUpdateSchema.safeParse(updates);
  if (!parsed.success) return { ok: false, error: GENERIC_ERROR };

  const result = await dbUpdateSiteSettings(parsed.data);
  if (!result.ok) return { ok: false, error: result.error ?? GENERIC_ERROR };

  revalidatePath("/admin/site-settings");
  // Site settings affect many pages — revalidate the public root
  revalidatePath("/", "layout");
  return { ok: true };
}

// =============================================================================
// STORAGE — upload / delete (per-image, called from gallery editor)
// =============================================================================

const uploadInputSchema = z.object({
  bucket: z.enum(["products", "projects", "homepage", "services", "misc"]),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be url-safe"),
});

export async function uploadImageAction(
  formData: FormData,
): Promise<ActionResult & { url?: string }> {
  const authErr = await requireAuth();
  if (authErr) return authErr;

  const bucket = formData.get("bucket");
  const slug = formData.get("slug");
  const file = formData.get("file");

  const parsed = uploadInputSchema.safeParse({ bucket, slug });
  if (!parsed.success || !(file instanceof File)) {
    return { ok: false, error: "Invalid upload request." };
  }

  const result = await storageUpload({
    bucket: parsed.data.bucket as StorageBucket,
    slug: parsed.data.slug,
    file,
  });
  if (!result.ok) return { ok: false, error: result.error ?? GENERIC_ERROR };

  return { ok: true, url: result.url };
}

export async function deleteImageAction(url: string): Promise<ActionResult> {
  const authErr = await requireAuth();
  if (authErr) return authErr;

  const result = await storageDelete(url);
  if (!result.ok) return { ok: false, error: result.error ?? GENERIC_ERROR };

  return { ok: true };
}
