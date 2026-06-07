-- =============================================================================
-- WR Doors × DODA — Technicians Seed (Prompt 9a)
-- =============================================================================
-- Three sample technicians so the /admin/bookings page can assign someone
-- to a booking. Real technicians get added via /admin/technicians in 9b
-- (CRUD interface coming next prompt).
--
-- Apply: Supabase Dashboard → SQL Editor → New query → paste → Run.
-- Idempotent: ON CONFLICT DO NOTHING means re-running is safe.
--
-- Note: ids are hard-coded UUIDs so the seed is reproducible across
-- environments (handy for E2E tests + dev parity with prod).
-- =============================================================================

INSERT INTO technicians (id, name, phone, email, skills, hourly_rate_aed, status) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'Karim Hassan',
    '+971501112233',
    'karim@wrdoors.local',
    ARRAY['wpc-doors', 'pivot-aluminium-doors', 'sliding-systems'],
    180,
    'active'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Mohammed Al-Suwaidi',
    '+971502223344',
    'mohammed@wrdoors.local',
    ARRAY['wpc-doors', 'wall-cladding'],
    160,
    'active'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Yusuf Rahman',
    '+971503334455',
    'yusuf@wrdoors.local',
    ARRAY['pivot-aluminium-doors', 'sliding-systems', 'wall-cladding'],
    200,
    'active'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- DONE. Verify in Supabase Dashboard → Table Editor → technicians (3 rows).
-- =============================================================================
