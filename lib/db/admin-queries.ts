import "server-only";

/**
 * Admin-only queries. `server-only` — importing this from a Client Component
 * (or any unauthenticated/public path) fails the build.
 *
 * Callers are the authenticated `/admin/*` Server Components and the
 * auth-checked server actions in `app/admin/actions.ts`.
 */

import { and, asc, desc, eq, ilike, or, type SQL } from "drizzle-orm";

import { db } from "./index";
import { bookings, leads, products, projects, siteSettings, technicians } from "./schema";
import type {
  BookingRow,
  BookingStatus,
  LeadRow,
  LeadSource,
  LeadStatus,
  Locale,
  ProductRow,
  ProjectRow,
  SiteSettingRow,
  TechnicianRow,
} from "./types";

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
  const limit = filter.limit ?? 50;
  const offset = filter.offset ?? 0;

  const conditions: SQL[] = [];
  if (filter.status) conditions.push(eq(leads.status, filter.status));
  if (filter.source) conditions.push(eq(leads.source, filter.source));
  if (filter.search && filter.search.trim().length > 0) {
    const term = `%${filter.search.trim()}%`;
    conditions.push(
      or(
        ilike(leads.name, term),
        ilike(leads.phone, term),
        ilike(leads.email, term),
      )!,
    );
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, count] = await Promise.all([
    db
      .select()
      .from(leads)
      .where(where)
      .orderBy(desc(leads.created_at))
      .limit(limit)
      .offset(offset),
    db.$count(leads, where),
  ]);

  return { rows, count };
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
  const conditions: SQL[] = [];
  if (filter.status) conditions.push(eq(bookings.status, filter.status));
  if (filter.technicianId) {
    conditions.push(eq(bookings.assigned_technician, filter.technicianId));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  return db
    .select()
    .from(bookings)
    .where(where)
    .orderBy(asc(bookings.preferred_date));
}

// =============================================================================
// PRODUCTS (admin — sees all, including inactive)
// =============================================================================

export async function getAllProductsAdmin(): Promise<ProductRow[]> {
  return db.select().from(products).orderBy(desc(products.created_at));
}

export async function getProductBySlugAdmin(
  slug: string,
): Promise<ProductRow | null> {
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

// =============================================================================
// PROJECTS (admin — sees all, including unpublished)
// =============================================================================

export async function getAllProjectsAdmin(): Promise<ProjectRow[]> {
  return db.select().from(projects).orderBy(asc(projects.display_order));
}

export async function getProjectBySlugAdmin(
  slug: string,
): Promise<ProjectRow | null> {
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

// =============================================================================
// SITE SETTINGS (admin)
// =============================================================================

export async function getAllSiteSettingsAdmin(): Promise<SiteSettingRow[]> {
  return db.select().from(siteSettings).orderBy(asc(siteSettings.key));
}

// =============================================================================
// TECHNICIANS
// =============================================================================

export async function getTechniciansAdmin(): Promise<TechnicianRow[]> {
  return db
    .select()
    .from(technicians)
    .where(eq(technicians.status, "active"))
    .orderBy(asc(technicians.name));
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
    upcoming: number;
    last7days: number;
  };
  recent: {
    leads: LeadRow[];
    bookings: BookingRow[];
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const sevenDaysAgo = new Date(
    now.getTime() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const todayIso = now.toISOString().slice(0, 10);

  const [leadRows, bookingRows, recentLeads, recentBookings] = await Promise.all(
    [
      db
        .select({
          status: leads.status,
          source: leads.source,
          locale: leads.locale,
          created_at: leads.created_at,
        })
        .from(leads),
      db
        .select({
          status: bookings.status,
          preferred_date: bookings.preferred_date,
          created_at: bookings.created_at,
        })
        .from(bookings),
      db.select().from(leads).orderBy(desc(leads.created_at)).limit(5),
      db.select().from(bookings).orderBy(desc(bookings.created_at)).limit(5),
    ],
  );

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
  for (const l of leadRows) {
    leadsByStatus[l.status as LeadStatus] =
      (leadsByStatus[l.status as LeadStatus] ?? 0) + 1;
    leadsBySource[l.source as LeadSource] =
      (leadsBySource[l.source as LeadSource] ?? 0) + 1;
    leadsByLocale[l.locale as Locale] =
      (leadsByLocale[l.locale as Locale] ?? 0) + 1;
    if (l.created_at >= sevenDaysAgo) leadsLast7days += 1;
  }

  const bookingsByStatus: Record<BookingStatus, number> = {
    new: 0,
    confirmed: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
  };
  let bookingsUpcoming = 0;
  let bookingsLast7days = 0;
  for (const b of bookingRows) {
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
      total: leadRows.length,
      byStatus: leadsByStatus,
      bySource: leadsBySource,
      byLocale: leadsByLocale,
      last7days: leadsLast7days,
    },
    bookings: {
      total: bookingRows.length,
      byStatus: bookingsByStatus,
      upcoming: bookingsUpcoming,
      last7days: bookingsLast7days,
    },
    recent: {
      leads: recentLeads,
      bookings: recentBookings,
    },
  };
}
