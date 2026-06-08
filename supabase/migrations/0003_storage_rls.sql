-- =============================================================================
-- WR Doors × DODA — Storage RLS Policies (Prompt 9b)
-- =============================================================================
-- Locks down WRITE access to the 5 Storage buckets to authenticated admins
-- only. SELECT (read) stays open because the buckets are "public" — visitors
-- need to load product/project images without auth.
--
-- Buckets covered: products, projects, homepage, services, misc
-- (created during Prompt 7 Supabase setup)
--
-- Apply: Supabase Dashboard → SQL Editor → paste → Run.
--
-- Idempotent: DROP POLICY IF EXISTS before each CREATE so re-running works.
-- =============================================================================

-- ── SELECT (read) — public ───────────────────────────────────────────────
-- Anyone (anonymous + authenticated) can view files in our 5 buckets.
-- This matches the "Public bucket" toggle set during Prompt 7 Step 6.
DROP POLICY IF EXISTS "public_read_storage" ON storage.objects;
CREATE POLICY "public_read_storage" ON storage.objects
  FOR SELECT
  USING (
    bucket_id IN ('products', 'projects', 'homepage', 'services', 'misc')
  );

-- ── INSERT (upload) — admin only ─────────────────────────────────────────
DROP POLICY IF EXISTS "admin_insert_storage" ON storage.objects;
CREATE POLICY "admin_insert_storage" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND bucket_id IN ('products', 'projects', 'homepage', 'services', 'misc')
  );

-- ── UPDATE (replace/rename) — admin only ─────────────────────────────────
DROP POLICY IF EXISTS "admin_update_storage" ON storage.objects;
CREATE POLICY "admin_update_storage" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL
    AND bucket_id IN ('products', 'projects', 'homepage', 'services', 'misc')
  )
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND bucket_id IN ('products', 'projects', 'homepage', 'services', 'misc')
  );

-- ── DELETE — admin only ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "admin_delete_storage" ON storage.objects;
CREATE POLICY "admin_delete_storage" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL
    AND bucket_id IN ('products', 'projects', 'homepage', 'services', 'misc')
  );

-- =============================================================================
-- DONE. Verify in Supabase Dashboard → Authentication → Policies →
-- storage > objects (4 policies should be listed).
--
-- After applying:
--   - Anonymous visitor can still GET https://<project>.supabase.co/storage/...
--   - Anonymous attempt to upload (PUT) returns 403
--   - Logged-in admin can upload/replace/delete from /admin/products etc.
-- =============================================================================
