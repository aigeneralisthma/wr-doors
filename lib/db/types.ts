/**
 * Row / insert types + the string-union "enum" types.
 *
 * Row and Insert types are INFERRED from the Drizzle schema so they can
 * never drift from the actual columns. The string unions are defined in
 * `schema.ts` (pinned onto the columns with `.$type<>()`) and re-exported
 * here for convenience.
 *
 * Names match the old `lib/supabase/database.types.ts` exactly so the rest
 * of the app didn't have to change when we swapped Supabase for Neon.
 *
 * This file imports ONLY `./schema` (no DB connection), so it's safe to
 * import from anywhere, including type-only imports in Client Components.
 */

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type {
  adminUsers,
  bookings,
  leads,
  products,
  projects,
  siteSettings,
  technicians,
} from "./schema";

export type {
  BookingService,
  BookingStatus,
  Locale,
  LeadSource,
  LeadStatus,
  ProductCategory,
  ProductSpec,
  ProjectCategory,
  SiteSettingType,
  TechnicianStatus,
} from "./schema";

// ── Row + Insert types (inferred) ───────────────────────────────────────────

export type ProductRow = InferSelectModel<typeof products>;
export type ProductInsert = InferInsertModel<typeof products>;

export type ProjectRow = InferSelectModel<typeof projects>;
export type ProjectInsert = InferInsertModel<typeof projects>;

export type LeadRow = InferSelectModel<typeof leads>;
export type LeadInsert = InferInsertModel<typeof leads>;

export type BookingRow = InferSelectModel<typeof bookings>;
export type BookingInsert = InferInsertModel<typeof bookings>;

export type TechnicianRow = InferSelectModel<typeof technicians>;
export type TechnicianInsert = InferInsertModel<typeof technicians>;

export type SiteSettingRow = InferSelectModel<typeof siteSettings>;
export type SiteSettingInsert = InferInsertModel<typeof siteSettings>;

export type AdminUserRow = InferSelectModel<typeof adminUsers>;
export type AdminUserInsert = InferInsertModel<typeof adminUsers>;
