# Supabase Setup Guide — WR Doors × DODA

> One-time walkthrough to provision Supabase for this project. Estimated time: **15–20 minutes**.

---

## What we're setting up

| Component | What it does |
|-----------|--------------|
| **Supabase project** | Hosted PostgreSQL database + Auth + Storage. Free tier is fine for Phase 1. |
| **6 database tables** | `products`, `projects`, `leads`, `bookings`, `technicians`, `site_settings` |
| **Row Level Security (RLS)** | Anyone can read public content; only authenticated admin can write |
| **Storage buckets** | `products`, `projects`, `homepage`, `services`, `misc` for image uploads |
| **Admin user** | Your login for `/admin` dashboard (Prompt 9) |

---

## Step 1 — Create Supabase account & project (~5 min)

1. Go to **[supabase.com](https://supabase.com)** → click **"Start your project"**
2. Sign up with **GitHub** (easiest) or email
3. Click **"New project"** in the dashboard
4. Fill in:
   - **Name**: `wr-doors-prod`
   - **Database Password**: *generate a strong one* and **save it to a password manager** (you won't need it often, but you'll regret losing it)
   - **Region**: **Middle East (Bahrain) — me-south-1** (closest to UAE customers, ~30ms latency to Dubai)
   - **Pricing Plan**: **Free** (sufficient for Phase 1 — 500MB DB, 1GB storage, unlimited API requests)
5. Click **Create new project** → wait ~2 minutes for provisioning

---

## Step 2 — Grab credentials & paste into `.env.local` (~2 min)

Once your project is ready:

1. In Supabase Dashboard, click **Project Settings** (gear icon, sidebar) → **API**
2. You need **three** values from this page — note Supabase renamed the keys in 2025:

   | What you'll see on the Supabase page | Variable in `.env.local` | What it looks like |
   |---|---|---|
   | **Project URL** *(top of page, not labelled as a "key")* | `NEXT_PUBLIC_SUPABASE_URL` | `https://abcdefghijk.supabase.co` |
   | **Publishable key** *(formerly "anon" key)* | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_...` or `eyJhbGc...` (legacy JWT) |
   | **Secret key** *(formerly "service_role" key)* | `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_...` or `eyJhbGc...` (legacy JWT) |

   > 💡 **Don't confuse the URL with a key.** The Project URL is a `https://...supabase.co` web address shown at the very **top** of the API settings page. It's not in the "Keys" section because it isn't a key — but you still need it.

3. Open `C:\doda-website\wr-doors\.env.local` (create it by copying `.env.example` if it doesn't exist) and fill in:

   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://abcdefghijk.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_..."
   SUPABASE_SERVICE_ROLE_KEY="sb_secret_..."
   ```

> ⚠️ **Security**: The `Secret key` (`sb_secret_...`) bypasses RLS. **NEVER** prefix it with `NEXT_PUBLIC_` and **NEVER** commit `.env.local` (it's already in `.gitignore`).
>
> The `Publishable key` is safe to expose to the browser — RLS at the database layer enforces who can read/write what.

---

## Step 3 — Apply the database schema (~2 min)

1. In Supabase Dashboard, click **SQL Editor** (sidebar)
2. Click **+ New query**
3. Open `supabase/migrations/0001_initial_schema.sql` in this project
4. Copy the **entire file** → paste into the SQL Editor
5. Click **Run** (bottom-right, or Ctrl+Enter)
6. Wait for "Success. No rows returned." (~1 second)

Verify in **Table Editor** (sidebar): you should now see 6 empty tables.

---

## Step 4 — Seed initial data (~1 min)

1. Back in **SQL Editor**, click **+ New query**
2. Open `supabase/seed/0001_seed.sql` → copy entire file → paste
3. Click **Run**

Verify in **Table Editor**:
- `products` → **8 rows**
- `projects` → **6 rows**
- `site_settings` → **10 rows**
- `leads`, `bookings`, `technicians` → empty (filled by form submissions later)

---

## Step 5 — Create your admin user (~1 min)

This is the account you'll use to log into `/admin` (Prompt 9).

1. In Supabase Dashboard → **Authentication** (sidebar) → **Users** tab
2. Click **Add user** → **Create new user**
3. Fill in:
   - **Email**: your personal admin email (can be different from `wahatalruman36@gmail.com` if you prefer)
   - **Password**: *strong password*, save to password manager
   - **Auto Confirm User**: ✅ **ON** (skip email verification — saves time)
4. Click **Create user**

You should see one row in the Users table.

---

## Step 6 — Create Storage buckets (~2 min)

These hold image uploads from the admin dashboard.

1. In Supabase Dashboard → **Storage** (sidebar)
2. Click **New bucket** → create each of these:

   | Bucket name | Public? | Used for |
   |-------------|---------|----------|
   | `products` | ✅ Public | Product images uploaded via admin |
   | `projects` | ✅ Public | Portfolio photos uploaded via admin |
   | `homepage` | ✅ Public | Hero banners, featured imagery |
   | `services` | ✅ Public | Service category illustrations |
   | `misc` | ✅ Public | Anything else (favicons, OG images, etc.) |

   For each bucket: check **"Public bucket"** so the image URLs work for unauthenticated site visitors. (Upload writes will still be locked down via storage RLS — added in Prompt 9.)

3. Click **Create bucket** for each.

You should now have 5 buckets visible.

---

## Step 7 — Verify it all works (~30 seconds)

From `C:\doda-website\wr-doors\`:

```bash
pnpm supabase:check
```

You should see:

```
🔍 Supabase sanity check

  URL:  https://xxxxxxxxxxxx.supabase.co
  KEY:  eyJhbGciOiJIUzI1Ni…

1. Connection
  ✓ Connected to Supabase

2. Public reads (products)
  ✓ Anonymous SELECT on products returned 8 rows (expected 8)

3. Public reads (projects)
  ✓ Anonymous SELECT on projects returned 6 rows (expected 6)

4. RLS blocks anonymous writes (products)
  ✓ Anonymous INSERT on products correctly blocked (42501)

5. RLS blocks anonymous reads (leads)
  ✓ Anonymous SELECT on leads returned 0 rows (RLS hides them — expected)

6. Anonymous INSERT on leads (form submission path)
  ✓ Anonymous INSERT on leads succeeded
      ℹ A test lead row was inserted. Visible in Dashboard → Table Editor → leads.
        Delete it manually after verification, or re-run with a clean DB.

──────────────────────────────────────────
✅ All checks passed. Supabase is wired correctly.
```

If any check fails, the script tells you what's wrong and how to fix it.

> 💡 After running the check, optionally go to **Table Editor → leads** and delete the test row (named "Sanity Check (Prompt 7)").

---

## What now?

Prompt 7 is complete. The Supabase backend is live but **not yet connected** to the public site — that's Prompt 8.

**Current state**:
- ✅ Schema, RLS, seed data, Storage buckets, admin user all set up
- ✅ Typed Supabase clients (`lib/supabase/client.ts`, `server.ts`)
- ✅ Typed query helpers (`lib/supabase/queries.ts`)
- ⏳ Public pages still read from `lib/products.ts` / `lib/projects.ts` (in-memory) — Prompt 8 swaps them to Supabase
- ⏳ Forms still stub-submit with `console.log` — Prompt 8 wires them to insert into `leads` / `bookings`
- ⏳ Admin dashboard doesn't exist yet — Prompt 9

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `pnpm supabase:check` says "Missing env vars" | `.env.local` not created or wrong keys | Re-do Step 2 — make sure file exists at `wr-doors/.env.local` |
| Connection works but products returns 0 rows | Seed not applied | Re-do Step 4 |
| Anonymous INSERT on products SUCCEEDED | RLS broken on products | Re-run Step 3 (migration includes RLS policies) |
| `db.public.products doesn't exist` error in TypeScript | Database types out of sync with migration | If you customized the schema, also update `lib/supabase/database.types.ts` |
| Region in wrong location | You picked wrong region in Step 1 | Project regions can't be changed — delete + recreate the project (data will be lost, but you can re-run migration + seed) |

---

## Reference files

- Migration SQL: `supabase/migrations/0001_initial_schema.sql`
- Seed SQL: `supabase/seed/0001_seed.sql`
- Sanity check: `scripts/test-supabase.ts`
- Typed clients: `lib/supabase/client.ts`, `lib/supabase/server.ts`
- TypeScript types: `lib/supabase/database.types.ts`
- Query helpers: `lib/supabase/queries.ts`
