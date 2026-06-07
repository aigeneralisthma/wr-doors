-- =============================================================================
-- WR Doors × DODA — Initial Schema (Prompt 7)
-- =============================================================================
-- Six tables + ENUMs + Row Level Security + indexes.
--
-- Apply: open Supabase Dashboard → SQL Editor → New query → paste this file →
-- click "Run". Should complete in < 1 second with no errors.
--
-- All user-facing content uses bilingual columns: <field>_en + <field>_ar.
-- Admin-facing tables (leads, bookings, technicians) are English-only.
--
-- Security model:
--   - RLS enabled on every table (even technicians — no anonymous reads)
--   - Public (anonymous) can SELECT products, projects, site_settings
--   - Public can INSERT into leads + bookings (lead-capture forms)
--   - Authenticated users (admins) can do everything
--
-- ENUMs use explicit CHECK constraints (rather than CREATE TYPE) so we can
-- add new values via ALTER TABLE without dropping/recreating the type.
-- =============================================================================

-- Required Postgres extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- for gen_random_uuid()

-- =============================================================================
-- TABLE: products
-- =============================================================================
CREATE TABLE products (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT NOT NULL UNIQUE,
  name_en      TEXT NOT NULL,
  name_ar      TEXT NOT NULL,
  category     TEXT NOT NULL
               CHECK (category IN ('wpc-doors', 'pivot-aluminium-doors', 'sliding-systems', 'wall-cladding')),
  category_en  TEXT NOT NULL,
  category_ar  TEXT NOT NULL,
  description_en  TEXT NOT NULL,
  description_ar  TEXT NOT NULL,
  price_from_aed  INT,           -- nullable: "by quote only"
  images       TEXT[] NOT NULL DEFAULT '{}',  -- public storage URLs
  is_featured  BOOLEAN NOT NULL DEFAULT FALSE,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category    ON products (category) WHERE is_active = TRUE;
CREATE INDEX idx_products_featured    ON products (is_featured) WHERE is_featured = TRUE AND is_active = TRUE;
CREATE INDEX idx_products_slug_active ON products (slug) WHERE is_active = TRUE;

-- =============================================================================
-- TABLE: projects
-- =============================================================================
CREATE TABLE projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,
  category        TEXT NOT NULL
                  CHECK (category IN ('residential', 'commercial', 'luxury')),
  title_en        TEXT NOT NULL,
  title_ar        TEXT NOT NULL,
  location_en     TEXT NOT NULL,
  location_ar     TEXT NOT NULL,
  description_en  TEXT NOT NULL,
  description_ar  TEXT NOT NULL,
  images          TEXT[] NOT NULL DEFAULT '{}',  -- public storage URLs
  tags            TEXT[] NOT NULL DEFAULT '{}',
  is_published    BOOLEAN NOT NULL DEFAULT TRUE,
  display_order   INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_category  ON projects (category) WHERE is_published = TRUE;
CREATE INDEX idx_projects_order     ON projects (display_order) WHERE is_published = TRUE;

-- =============================================================================
-- TABLE: leads (quote requests + contact form submissions)
-- =============================================================================
CREATE TABLE leads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT,                  -- optional on /quote, required on /contact
  phone         TEXT NOT NULL,
  subject       TEXT,                  -- contact form: free-form
  product       TEXT,                  -- quote form: product category interest
  quantity      TEXT,                  -- quote form: approximate quantity
  location      TEXT,                  -- quote form: project location
  budget        TEXT,                  -- quote form: budget bucket key (e.g. 'from5k')
  message       TEXT NOT NULL,
  locale        TEXT NOT NULL DEFAULT 'en'
                CHECK (locale IN ('en', 'ar')),
  source        TEXT NOT NULL DEFAULT 'contact'
                CHECK (source IN ('quote', 'contact', 'product-page')),
  status        TEXT NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'contacted', 'converted', 'lost')),
  admin_notes   TEXT,                  -- internal CRM notes (admin-only writes)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leads_status        ON leads (status, created_at DESC);
CREATE INDEX idx_leads_source        ON leads (source, created_at DESC);
CREATE INDEX idx_leads_locale        ON leads (locale);

-- =============================================================================
-- TABLE: bookings (consultation + technician requests)
-- =============================================================================
CREATE TABLE bookings (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name        TEXT NOT NULL,
  phone                TEXT NOT NULL,
  email                TEXT,
  service              TEXT NOT NULL
                       CHECK (service IN ('consultation', 'installation', 'technician', 'custom')),
  area                 TEXT NOT NULL,            -- emirate / area
  preferred_date       DATE NOT NULL,
  preferred_time_slot  TEXT,                     -- nullable: confirmed by admin
  duration_minutes     INT,                      -- nullable: estimated by admin
  notes                TEXT,                     -- customer notes
  locale               TEXT NOT NULL DEFAULT 'en'
                       CHECK (locale IN ('en', 'ar')),
  status               TEXT NOT NULL DEFAULT 'new'
                       CHECK (status IN ('new', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  assigned_technician  UUID,                     -- FK added after technicians table exists (see ALTER TABLE below)
  admin_notes          TEXT,                     -- internal scheduling notes
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- NOTE: the FK to technicians is added AFTER the technicians table is created
-- because of the dependency order. We use ALTER TABLE below.

CREATE INDEX idx_bookings_status     ON bookings (status, preferred_date DESC);
CREATE INDEX idx_bookings_service    ON bookings (service);
CREATE INDEX idx_bookings_technician ON bookings (assigned_technician) WHERE assigned_technician IS NOT NULL;
CREATE INDEX idx_bookings_date       ON bookings (preferred_date);

-- =============================================================================
-- TABLE: technicians
-- =============================================================================
CREATE TABLE technicians (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  phone          TEXT NOT NULL,
  email          TEXT,
  skills         TEXT[] NOT NULL DEFAULT '{}',  -- e.g. {'wpc-doors', 'pivot-aluminium-doors'}
  hourly_rate_aed INT,
  availability   JSONB,                          -- e.g. { "sun": ["09:00-18:00"], ... }
  status         TEXT NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active', 'inactive', 'on_leave')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_technicians_status ON technicians (status);

-- =============================================================================
-- TABLE: site_settings (mini CMS for editable site copy)
-- =============================================================================
CREATE TABLE site_settings (
  key         TEXT PRIMARY KEY,
  value_en    TEXT,                  -- nullable when type='json' or 'image'
  value_ar    TEXT,
  value_json  JSONB,                 -- used when type='json'
  type        TEXT NOT NULL DEFAULT 'text'
              CHECK (type IN ('text', 'image', 'video', 'json')),
  description TEXT,                  -- admin-facing label
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Now that all tables exist, wire up the bookings → technicians FK
ALTER TABLE bookings
  DROP CONSTRAINT IF EXISTS bookings_assigned_technician_fkey,
  ADD CONSTRAINT bookings_assigned_technician_fkey
    FOREIGN KEY (assigned_technician) REFERENCES technicians(id) ON DELETE SET NULL;

-- =============================================================================
-- updated_at auto-refresh trigger (applied to all tables with updated_at)
-- =============================================================================
CREATE OR REPLACE FUNCTION refresh_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_products_updated_at        BEFORE UPDATE ON products       FOR EACH ROW EXECUTE FUNCTION refresh_updated_at();
CREATE TRIGGER trg_projects_updated_at        BEFORE UPDATE ON projects       FOR EACH ROW EXECUTE FUNCTION refresh_updated_at();
CREATE TRIGGER trg_leads_updated_at           BEFORE UPDATE ON leads          FOR EACH ROW EXECUTE FUNCTION refresh_updated_at();
CREATE TRIGGER trg_bookings_updated_at        BEFORE UPDATE ON bookings       FOR EACH ROW EXECUTE FUNCTION refresh_updated_at();
CREATE TRIGGER trg_technicians_updated_at     BEFORE UPDATE ON technicians    FOR EACH ROW EXECUTE FUNCTION refresh_updated_at();
CREATE TRIGGER trg_site_settings_updated_at   BEFORE UPDATE ON site_settings  FOR EACH ROW EXECUTE FUNCTION refresh_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY — enable on every table
-- =============================================================================
ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects       ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads          ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians    ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings  ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- POLICIES — products (public read active rows; admin full access)
-- =============================================================================
CREATE POLICY "public_read_active_products" ON products
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

CREATE POLICY "admin_full_access_products" ON products
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================================
-- POLICIES — projects (public read published; admin full access)
-- =============================================================================
CREATE POLICY "public_read_published_projects" ON projects
  FOR SELECT TO anon, authenticated
  USING (is_published = TRUE);

CREATE POLICY "admin_full_access_projects" ON projects
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================================
-- POLICIES — leads (anon insert allowed, no anon read; admin full access)
-- =============================================================================
CREATE POLICY "anon_insert_leads" ON leads
  FOR INSERT TO anon
  WITH CHECK (
    -- enforce required fields + sane locale/source/status values at insert
    name IS NOT NULL AND length(name) > 0
    AND phone IS NOT NULL AND length(phone) > 0
    AND message IS NOT NULL AND length(message) > 0
    AND locale IN ('en', 'ar')
    AND source IN ('quote', 'contact', 'product-page')
    AND (status IS NULL OR status = 'new')  -- anon can't set arbitrary status
  );

CREATE POLICY "admin_full_access_leads" ON leads
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================================
-- POLICIES — bookings (anon insert allowed, no anon read; admin full access)
-- =============================================================================
CREATE POLICY "anon_insert_bookings" ON bookings
  FOR INSERT TO anon
  WITH CHECK (
    customer_name IS NOT NULL AND length(customer_name) > 0
    AND phone IS NOT NULL AND length(phone) > 0
    AND service IN ('consultation', 'installation', 'technician', 'custom')
    AND area IS NOT NULL AND length(area) > 0
    AND preferred_date IS NOT NULL
    AND preferred_date >= CURRENT_DATE  -- can't book in the past
    AND locale IN ('en', 'ar')
    AND (status IS NULL OR status = 'new')  -- anon can't set arbitrary status
    AND assigned_technician IS NULL          -- anon can't assign a technician
  );

CREATE POLICY "admin_full_access_bookings" ON bookings
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================================
-- POLICIES — technicians (admin-only; no public access whatsoever)
-- =============================================================================
CREATE POLICY "admin_full_access_technicians" ON technicians
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================================
-- POLICIES — site_settings (public read; admin write)
-- =============================================================================
CREATE POLICY "public_read_site_settings" ON site_settings
  FOR SELECT TO anon, authenticated
  USING (TRUE);

CREATE POLICY "admin_full_access_site_settings" ON site_settings
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================================
-- DONE. Run the seed file next: supabase/seed/0001_seed.sql
-- =============================================================================
