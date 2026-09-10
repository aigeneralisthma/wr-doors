/**
 * Drizzle schema — the single source of truth for the WR Doors database.
 *
 * Ported 1:1 from the old Supabase SQL migrations:
 *   - supabase/migrations/0001_initial_schema.sql
 *   - supabase/migrations/0002_add_product_specs.sql
 *   - supabase/migrations/0003_storage_rls.sql  (RLS dropped — see below)
 *
 * Design notes carried over from the Supabase era:
 *   - "ENUM" columns use TEXT + CHECK constraints (not pg enums) so values
 *     can be added with a plain migration instead of ALTER TYPE. The TS
 *     string unions are pinned onto the columns with `.$type<>()`.
 *   - All user-facing content uses bilingual `<field>_en` / `<field>_ar`
 *     columns. Admin tables (leads, bookings, technicians, admin_users) are
 *     English-only.
 *   - Timestamps are `mode: "string"` so rows come back as ISO strings —
 *     the app compares them as strings in several places.
 *   - `updated_at` auto-refresh is a Postgres trigger (`refresh_updated_at`),
 *     added as raw SQL in the first generated migration.
 *
 * Security model change (vs Supabase): there is no RLS. A single
 * `DATABASE_URL` has full access. The boundary is now the application:
 *   - public pages import ONLY `lib/db/queries.ts`
 *   - `lib/db/admin-queries.ts` + `lib/db/mutations.ts` are `server-only`
 *   - `leads` / `bookings` public inserts are constrained by CHECK + Zod
 */

import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ── String unions (mirror the CHECK constraints below) ──────────────────────

export type ProductCategory =
  | "wpc-doors"
  | "pivot-aluminium-doors"
  | "sliding-systems"
  | "wall-cladding";

export type ProjectCategory = "residential" | "commercial" | "luxury";

export type Locale = "en" | "ar";

export type LeadSource = "quote" | "contact" | "product-page";
export type LeadStatus = "new" | "contacted" | "converted" | "lost";

export type BookingService =
  | "consultation"
  | "installation"
  | "technician"
  | "custom";
export type BookingStatus =
  | "new"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type TechnicianStatus = "active" | "inactive" | "on_leave";

export type SiteSettingType = "text" | "image" | "video" | "json";

/** Bilingual spec row stored in `products.specs` (JSONB array). */
export interface ProductSpec {
  label_en: string;
  label_ar: string;
  value_en: string;
  value_ar: string;
}

// ── Shared column helpers ────────────────────────────────────────────────────

const createdAt = timestamp("created_at", { withTimezone: true, mode: "string" })
  .notNull()
  .defaultNow();
const updatedAt = timestamp("updated_at", { withTimezone: true, mode: "string" })
  .notNull()
  .defaultNow();

// ── products ────────────────────────────────────────────────────────────────

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    name_en: text("name_en").notNull(),
    name_ar: text("name_ar").notNull(),
    category: text("category").$type<ProductCategory>().notNull(),
    category_en: text("category_en").notNull(),
    category_ar: text("category_ar").notNull(),
    description_en: text("description_en").notNull(),
    description_ar: text("description_ar").notNull(),
    price_from_aed: integer("price_from_aed"),
    images: text("images").array().notNull().default(sql`'{}'::text[]`),
    specs: jsonb("specs")
      .$type<ProductSpec[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    is_featured: boolean("is_featured").notNull().default(false),
    is_active: boolean("is_active").notNull().default(true),
    created_at: createdAt,
    updated_at: updatedAt,
  },
  (t) => [
    check(
      "products_category_check",
      sql`${t.category} IN ('wpc-doors', 'pivot-aluminium-doors', 'sliding-systems', 'wall-cladding')`,
    ),
    index("idx_products_category").on(t.category).where(sql`${t.is_active} = true`),
    index("idx_products_featured")
      .on(t.is_featured)
      .where(sql`${t.is_featured} = true AND ${t.is_active} = true`),
    index("idx_products_slug_active").on(t.slug).where(sql`${t.is_active} = true`),
  ],
);

// ── projects ────────────────────────────────────────────────────────────────

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    category: text("category").$type<ProjectCategory>().notNull(),
    title_en: text("title_en").notNull(),
    title_ar: text("title_ar").notNull(),
    location_en: text("location_en").notNull(),
    location_ar: text("location_ar").notNull(),
    description_en: text("description_en").notNull(),
    description_ar: text("description_ar").notNull(),
    images: text("images").array().notNull().default(sql`'{}'::text[]`),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    is_published: boolean("is_published").notNull().default(true),
    display_order: integer("display_order").notNull().default(0),
    created_at: createdAt,
    updated_at: updatedAt,
  },
  (t) => [
    check(
      "projects_category_check",
      sql`${t.category} IN ('residential', 'commercial', 'luxury')`,
    ),
    index("idx_projects_category")
      .on(t.category)
      .where(sql`${t.is_published} = true`),
    index("idx_projects_order")
      .on(t.display_order)
      .where(sql`${t.is_published} = true`),
  ],
);

// ── leads ───────────────────────────────────────────────────────────────────

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone").notNull(),
    subject: text("subject"),
    product: text("product"),
    quantity: text("quantity"),
    location: text("location"),
    budget: text("budget"),
    message: text("message").notNull(),
    locale: text("locale").$type<Locale>().notNull().default("en"),
    source: text("source").$type<LeadSource>().notNull().default("contact"),
    status: text("status").$type<LeadStatus>().notNull().default("new"),
    admin_notes: text("admin_notes"),
    created_at: createdAt,
    updated_at: updatedAt,
  },
  (t) => [
    check("leads_locale_check", sql`${t.locale} IN ('en', 'ar')`),
    check(
      "leads_source_check",
      sql`${t.source} IN ('quote', 'contact', 'product-page')`,
    ),
    check(
      "leads_status_check",
      sql`${t.status} IN ('new', 'contacted', 'converted', 'lost')`,
    ),
    index("idx_leads_status").on(t.status, t.created_at.desc()),
    index("idx_leads_source").on(t.source, t.created_at.desc()),
    index("idx_leads_locale").on(t.locale),
  ],
);

// ── technicians (defined before bookings for the FK) ─────────────────────────

export const technicians = pgTable(
  "technicians",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    skills: text("skills").array().notNull().default(sql`'{}'::text[]`),
    hourly_rate_aed: integer("hourly_rate_aed"),
    availability: jsonb("availability").$type<Record<string, unknown>>(),
    status: text("status").$type<TechnicianStatus>().notNull().default("active"),
    created_at: createdAt,
    updated_at: updatedAt,
  },
  (t) => [
    check(
      "technicians_status_check",
      sql`${t.status} IN ('active', 'inactive', 'on_leave')`,
    ),
    index("idx_technicians_status").on(t.status),
  ],
);

// ── bookings ────────────────────────────────────────────────────────────────

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customer_name: text("customer_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    service: text("service").$type<BookingService>().notNull(),
    area: text("area").notNull(),
    preferred_date: date("preferred_date", { mode: "string" }).notNull(),
    preferred_time_slot: text("preferred_time_slot"),
    duration_minutes: integer("duration_minutes"),
    notes: text("notes"),
    locale: text("locale").$type<Locale>().notNull().default("en"),
    status: text("status").$type<BookingStatus>().notNull().default("new"),
    assigned_technician: uuid("assigned_technician").references(
      () => technicians.id,
      { onDelete: "set null" },
    ),
    admin_notes: text("admin_notes"),
    created_at: createdAt,
    updated_at: updatedAt,
  },
  (t) => [
    check(
      "bookings_service_check",
      sql`${t.service} IN ('consultation', 'installation', 'technician', 'custom')`,
    ),
    check("bookings_locale_check", sql`${t.locale} IN ('en', 'ar')`),
    check(
      "bookings_status_check",
      sql`${t.status} IN ('new', 'confirmed', 'in_progress', 'completed', 'cancelled')`,
    ),
    index("idx_bookings_status").on(t.status, t.preferred_date.desc()),
    index("idx_bookings_service").on(t.service),
    index("idx_bookings_technician")
      .on(t.assigned_technician)
      .where(sql`${t.assigned_technician} IS NOT NULL`),
    index("idx_bookings_date").on(t.preferred_date),
  ],
);

// ── site_settings ───────────────────────────────────────────────────────────

export const siteSettings = pgTable(
  "site_settings",
  {
    key: text("key").primaryKey(),
    value_en: text("value_en"),
    value_ar: text("value_ar"),
    value_json: jsonb("value_json").$type<Record<string, unknown>>(),
    type: text("type").$type<SiteSettingType>().notNull().default("text"),
    description: text("description"),
    updated_at: updatedAt,
  },
  (t) => [
    check(
      "site_settings_type_check",
      sql`${t.type} IN ('text', 'image', 'video', 'json')`,
    ),
  ],
);

// ── admin_users (NEW — replaces Supabase Auth) ───────────────────────────────

export const adminUsers = pgTable(
  "admin_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    password_hash: text("password_hash").notNull(),
    name: text("name"),
    role: text("role").$type<"admin">().notNull().default("admin"),
    created_at: createdAt,
    updated_at: updatedAt,
  },
  (t) => [check("admin_users_role_check", sql`${t.role} IN ('admin')`)],
);
