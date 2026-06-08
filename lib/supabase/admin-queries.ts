import "server-only";

/**
 * Admin-only Supabase queries.
 *
 * These use the cookie-based `@supabase/ssr` server client so they carry
 * the admin session — RLS then grants `authenticated` access (read +
 * write on leads, bookings, technicians).
 *
 * NEVER import this from a Client Component or unauthenticated route.
 * The `"server-only"` import will fail the build if anyone tries.
 */

import { createClient } from "./server";
import type {
  BookingRow,
  BookingStatus,
  LeadRow,
  LeadStatus,
  LeadSource,
  Locale,
  ProductRow,
  ProjectRow,
  SiteSettingRow,
  TechnicianRow,
} from "./database.types";

// =============================================================================
// LEADS
// =============================================================================

export interface LeadsFilter {
  status?: LeadStatus;
  source?: LeadSource;
  /** Free-text search over name, phone, email */
  search?: string;
  limit?: number;
  offset?: number;
}

export async function getLeadsAdmin(
  filter: LeadsFilter = {},
): Promise<{ rows: LeadRow[]; count: number }> {
  const supabase = await createClient();
  const limit = filter.limit ?? 50;
  const offset = filter.offset ?? 0;

  let q = supabase
    .from("leads")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filter.status) q = q.eq("status", filter.status);
  if (filter.source) q = q.eq("source", filter.source);
  if (filter.search && filter.search.trim().length > 0) {
    const term = `%${filter.search.trim()}%`;
    q = q.or(`name.ilike.${term},phone.ilike.${term},email.ilike.${term}`);
  }

  const { data, error, count } = await q;
  if (error) throw new Error(`getLeadsAdmin failed: ${error.message}`);
  return { rows: data ?? [], count: count ?? 0 };
}

// =============================================================================
// BOOKINGS + TECHNICIANS
// =============================================================================

export interface BookingsFilter {
  status?: BookingStatus;
  technicianId?: string;
}

export async function getBookingsAdmin(
  filter: BookingsFilter = {},
): Promise<BookingRow[]> {
  const supabase = await createClient();

  let q = supabase
    .from("bookings")
    .select("*")
    .order("preferred_date", { ascending: true });

  if (filter.status) q = q.eq("status", filter.status);
  if (filter.technicianId) q = q.eq("assigned_technician", filter.technicianId);

  const { data, error } = await q;
  if (error) throw new Error(`getBookingsAdmin failed: ${error.message}`);
  return data ?? [];
}

// =============================================================================
// PRODUCTS (admin — sees all, including inactive)
// =============================================================================

export async function getAllProductsAdmin(): Promise<ProductRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`getAllProductsAdmin failed: ${error.message}`);
  return data ?? [];
}

export async function getProductBySlugAdmin(
  slug: string,
): Promise<ProductRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`getProductBySlugAdmin failed: ${error.message}`);
  return data;
}

// =============================================================================
// PROJECTS (admin — sees all, including unpublished)
// =============================================================================

export async function getAllProjectsAdmin(): Promise<ProjectRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw new Error(`getAllProjectsAdmin failed: ${error.message}`);
  return data ?? [];
}

export async function getProjectBySlugAdmin(
  slug: string,
): Promise<ProjectRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`getProjectBySlugAdmin failed: ${error.message}`);
  return data;
}

// =============================================================================
// SITE SETTINGS (admin)
// =============================================================================

export async function getAllSiteSettingsAdmin(): Promise<SiteSettingRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .order("key", { ascending: true });
  if (error) throw new Error(`getAllSiteSettingsAdmin failed: ${error.message}`);
  return data ?? [];
}

// =============================================================================
// TECHNICIANS
// =============================================================================

export async function getTechniciansAdmin(): Promise<TechnicianRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("technicians")
    .select("*")
    .eq("status", "active")
    .order("name", { ascending: true });

  if (error) throw new Error(`getTechniciansAdmin failed: ${error.message}`);
  return data ?? [];
}

// =============================================================================
// DASHBOARD STATS
// =============================================================================

export interface DashboardStats {
  leads: {
    total: number;
    byStatus: Record<LeadStatus, number>;
    bySource: Record<LeadSource, number>;
    byLocale: Record<Locale, number>;
    last7days: number;
  };
  bookings: {
    total: number;
    byStatus: Record<BookingStatus, number>;
    upcoming: number; // status='new' or 'confirmed' AND preferred_date >= today
    last7days: number;
  };
  recent: {
    leads: LeadRow[];
    bookings: BookingRow[];
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const todayIso = now.toISOString().slice(0, 10);

  // Run in parallel — all queries are independent
  const [
    { data: leadsAll },
    { data: bookingsAll },
    { data: recentLeads },
    { data: recentBookings },
  ] = await Promise.all([
    supabase.from("leads").select("status, source, locale, created_at"),
    supabase.from("bookings").select("status, preferred_date, created_at"),
    supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const leads = leadsAll ?? [];
  const bookings = bookingsAll ?? [];

  // Lead breakdowns
  const leadsByStatus: Record<LeadStatus, number> = {
    new: 0,
    contacted: 0,
    converted: 0,
    lost: 0,
  };
  const leadsBySource: Record<LeadSource, number> = {
    quote: 0,
    contact: 0,
    "product-page": 0,
  };
  const leadsByLocale: Record<Locale, number> = { en: 0, ar: 0 };
  let leadsLast7days = 0;
  for (const l of leads) {
    leadsByStatus[l.status as LeadStatus] = (leadsByStatus[l.status as LeadStatus] ?? 0) + 1;
    leadsBySource[l.source as LeadSource] = (leadsBySource[l.source as LeadSource] ?? 0) + 1;
    leadsByLocale[l.locale as Locale] = (leadsByLocale[l.locale as Locale] ?? 0) + 1;
    if (l.created_at >= sevenDaysAgo) leadsLast7days += 1;
  }

  // Booking breakdowns
  const bookingsByStatus: Record<BookingStatus, number> = {
    new: 0,
    confirmed: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
  };
  let bookingsUpcoming = 0;
  let bookingsLast7days = 0;
  for (const b of bookings) {
    bookingsByStatus[b.status as BookingStatus] =
      (bookingsByStatus[b.status as BookingStatus] ?? 0) + 1;
    if (
      (b.status === "new" || b.status === "confirmed") &&
      b.preferred_date >= todayIso
    ) {
      bookingsUpcoming += 1;
    }
    if (b.created_at >= sevenDaysAgo) bookingsLast7days += 1;
  }

  return {
    leads: {
      total: leads.length,
      byStatus: leadsByStatus,
      bySource: leadsBySource,
      byLocale: leadsByLocale,
      last7days: leadsLast7days,
    },
    bookings: {
      total: bookings.length,
      byStatus: bookingsByStatus,
      upcoming: bookingsUpcoming,
      last7days: bookingsLast7days,
    },
    recent: {
      leads: recentLeads ?? [],
      bookings: recentBookings ?? [],
    },
  };
}
