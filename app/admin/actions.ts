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
