# Neon Migration Plan — Supabase → Neon

> Execution spec + status tracker for moving off Supabase. One commit per phase.
> Created 2026-09-06.

---

## Decision summary

| Concern | From | To |
|---|---|---|
| DB host | Supabase Postgres | **Neon** (region: AWS closest to UAE) |
| DB access | `@supabase/supabase-js` PostgREST | **Drizzle ORM** + `postgres` (postgres.js) driver |
| Migrations / seed | manual SQL in dashboard | `drizzle-kit` + `scripts/seed.ts` |
| Types | hand-written `lib/supabase/database.types.ts` | inferred from `lib/db/schema.ts`, re-exported under the same names |
| Admin auth | Supabase Auth | **Auth.js (NextAuth v5)** Credentials, JWT session, `admin_users` table, `bcryptjs` |
| Middleware gate | `supabase.auth.getUser()` (network call) | JWT cookie check (no DB, edge-safe) |
| Image storage | Supabase Storage (5 buckets) | **Local filesystem** — `public/uploads/<bucket>/<slug>/<uuid>.<ext>` |
| Security | Postgres RLS | App layer: `server-only` modules + auth-checked server actions + Zod (all present) + DB `CHECK` constraints |
| Existing data | live in Supabase | **migrated** via `pg_dump` → `psql`; Storage objects pulled to disk |
| Hosting | Vercel | **unchanged plan** — full Next.js app on Hostinger Node.js hosting + CDN on public routes (separate task, after this migration) |

No new paid services.

---

## Environment variables

**Remove:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

**Add:**

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Neon **pooled** connection string — app runtime |
| `DATABASE_URL_UNPOOLED` | Neon **direct** connection — `drizzle-kit` migrations, seed, data load |
| `AUTH_SECRET` | `openssl rand -base64 33` |
| `AUTH_URL` | `http://localhost:3000` (dev) / prod URL |
| `ADMIN_EMAIL` | the single admin login email |
| `ADMIN_PASSWORD_HASH` | bcrypt hash from `scripts/create-admin.ts` |
| `UPLOADS_DIR` | optional, default `public/uploads` |
| `NEXT_PUBLIC_UPLOADS_BASE_URL` | optional, default `/uploads` |

---

## Phase 1 — Database layer  → `feat(db): migrate from Supabase Postgres to Neon + Drizzle ORM`

**Deps:** `+ drizzle-orm postgres` · `+ drizzle-kit` (dev). Keep `@supabase/*` for now.

**New files**
- `drizzle.config.ts`
- `lib/db/schema.ts` — 6 tables + `admin_users`. Mirror every CHECK constraint, default, and partial index from `supabase/migrations/0001`+`0002`+`0003`. `updated_at` auto-refresh trigger kept as raw SQL in the first generated migration.
- `lib/db/index.ts` — `postgres()` client + `drizzle()` singleton. *(Fallback: swap to `@neondatabase/serverless` HTTP driver if Hostinger blocks port 5432.)*
- `lib/db/types.ts` — re-export inferred types under existing names: `ProductRow`, `ProjectRow`, `LeadRow`, `LeadInsert`, `BookingRow`, `BookingInsert`, `TechnicianRow`, `SiteSettingRow`, `ProductSpec`, the string-unions (`ProductCategory`, `ProjectCategory`, `Locale`, `LeadSource`, `LeadStatus`, `BookingService`, `BookingStatus`, `TechnicianStatus`, `SiteSettingType`), plus `ProductInput`, `ProjectInput`, `SiteSettingUpdate`.
- `lib/db/queries.ts` — port of `lib/supabase/queries.ts` (public reads).
- `lib/db/admin-queries.ts` — port of `lib/supabase/admin-queries.ts`. `import "server-only"`.
- `lib/db/mutations.ts` — port of `lib/supabase/admin-mutations.ts`. `import "server-only"`.
- `lib/media/image-helpers.ts` — moved from `lib/supabase/image-helpers.ts` (type import swap only for now).
- `scripts/seed.ts` — port `supabase/seed/0001_seed.sql` + `0002_seed_technicians.sql` → Drizzle inserts w/ `onConflictDoNothing` (8 products, 6 projects, 10 site_settings, 3 technicians).
- `scripts/test-db.ts` — replaces `scripts/test-supabase.ts`: connect, count seeded rows, insert a lead, check `admin_users`.
- `drizzle/` — generated migration + custom trigger SQL.

**Modified**
- `app/actions/leads.ts`, `app/actions/bookings.ts` — swap the Supabase insert for `db.insert(...)`; keep UUID gen, Zod, honeypot, rate-limit, emails.
- `app/sitemap.ts`, `lib/site-config.ts` — import from `@/lib/db/queries`.
- ~15 type-only imports `@/lib/supabase/database.types` → `@/lib/db/types` (components/admin/*, components/products/*, components/projects/*, components/seo/*, components/ui/smart-image.tsx, app/admin/(authed)/**, app/[locale]/products/**, app/[locale]/projects/**).
- ~8 imports of `image-helpers` → `@/lib/media/image-helpers`.
- `package.json` — scripts: `db:generate`, `db:migrate`, `db:seed`, `db:studio`, `test:db`; remove `supabase:check`.
- `.env.local.example`.

**Not deleted yet:** `lib/supabase/*` (`client.ts` still used by login form until Phase 2).

**Verify:** `pnpm db:migrate` (Neon) · `pnpm db:seed` · `pnpm test:db` · `pnpm typecheck` · `pnpm lint` · `pnpm test:run` (40) · `next build`.

---

## Phase 2 — Auth  → `feat(auth): replace Supabase Auth with Auth.js (NextAuth v5) credentials`

**Deps:** `+ next-auth@5 bcryptjs` · `+ @types/bcryptjs` (dev)

**New files**
- `auth.config.ts` — edge-safe: `pages.signIn`, `session.strategy = "jwt"`, `callbacks.authorized` (middleware), `callbacks.jwt`/`session` carry `{ email, role }`.
- `auth.ts` — full config + Credentials provider; `authorize()` looks up `admin_users` by email + `bcrypt.compare`. Exports `{ handlers, auth, signIn, signOut }`.
- `app/api/auth/[...nextauth]/route.ts`
- `lib/auth/password.ts` — `hashPassword` / `verifyPassword`.
- `scripts/create-admin.ts` — CLI: email + password → prints `ADMIN_PASSWORD_HASH` and/or upserts the `admin_users` row.
- `types/next-auth.d.ts` — session augmentation.

**Modified**
- `middleware.ts` — replace Supabase admin-auth block with NextAuth JWT check; keep next-intl for the rest; dispatch by pathname; keep matcher.
- `app/admin/login/login-form.tsx` — drop Supabase browser client; submit to a server action calling `signIn("credentials", …)`; map `AuthError` → "Invalid email or password."
- `app/admin/login/page.tsx` — pass `next` through.
- `app/admin/(authed)/layout.tsx` — `const session = await auth()`.
- `app/admin/actions.ts` — `requireAuth()` via `await auth()`; `signOut()` via NextAuth.
- `.env.local.example`.

**Delete:** `lib/supabase/client.ts`

**Verify:** create admin via script → login flow, middleware redirects (`?next=`), sign-out, every admin page loads · typecheck/lint/tests/build · update `tests/e2e/admin.spec.ts`.

---

## Phase 3 — Storage  → `feat(storage): replace Supabase Storage with local filesystem uploads`

**Deps:** none (Node `fs`). Sharp already present — optimize on upload.

**New files**
- `lib/storage/local.ts` — replaces `lib/supabase/storage.ts`. Same bucket names as subfolders. `uploadFile()`: validate size + MIME → `mkdir -p uploadsDir/bucket/slug` → write `<uuid>.<ext>` (optionally Sharp → WebP + 1024 variant) → return `{ ok, url, path }`. `deleteFileByUrl()`: parse `/uploads/<bucket>/<slug>/<file>` → `unlink`, with path-traversal guard (`path.resolve` must stay inside `uploadsDir`). `deleteFilesByUrl`, `isUploadUrl`.

**Modified**
- `app/admin/actions.ts` — import from `@/lib/storage/local`.
- `lib/media/image-helpers.ts` — `isStorageUrl` → `isUploadUrl` (`/uploads/` prefix); smart-image logic unchanged.
- `components/ui/smart-image.tsx` — type import only.
- `next.config.ts` — `images.remotePatterns`: drop `*.supabase.co`. CSP `img-src`/`connect-src`: drop `*.supabase.co`, keep `data:`/`blob:`/self + resend + spline + google + vercel-insights.
- `.gitignore` — `+ /public/uploads/` (commit `public/uploads/.gitkeep`).
- `.env.local.example`.

**Verify:** admin upload → file in `public/uploads/`, renders on public product page via `next/image`, delete works, traversal blocked · typecheck/lint/tests/build.

---

## Phase 4 — Data migration + cleanup  → `chore(supabase): remove deps/config/docs; add Neon setup guide`

**Data migration (run once, documented in `NEON_SETUP.md`)**
1. Neon project created; `DATABASE_URL*` in `.env.local`.
2. `pnpm db:migrate` → schema on Neon.
3. `pg_dump "$SUPABASE_DB_URL" --data-only --no-owner --no-privileges --disable-triggers -t public.products -t public.projects -t public.leads -t public.bookings -t public.technicians -t public.site_settings > supabase-data.sql` (Supabase → Settings → Database → **direct** connection string).
4. `psql "$DATABASE_URL_UNPOOLED" -f supabase-data.sql`.
5. `pnpm tsx scripts/pull-supabase-storage.ts` — list objects per bucket (temp `SUPABASE_URL` + service key) → download to `public/uploads/<bucket>/…` → `UPDATE products/projects SET images` replacing `https://<ref>.supabase.co/storage/v1/object/public/<bucket>/` → `/uploads/<bucket>/`. Likely a near-no-op (seeded images use the local manifest; only admin uploads went to Storage).
6. Admin account is **not** migrated from `auth.users` — run `pnpm tsx scripts/create-admin.ts` to set a fresh email + password.
7. `pnpm tsx scripts/test-db.ts` + manual spot check of row counts.

**Cleanup**
- Delete `lib/supabase/`, `supabase/`, `scripts/test-supabase.ts`, `scripts/pull-supabase-storage.ts` (after use).
- Remove deps: `@supabase/ssr`, `@supabase/supabase-js`.
- `SUPABASE_SETUP.md` → `NEON_SETUP.md` (Neon project creation, connection strings, `db:migrate`/`db:seed`, `create-admin`, data-migration steps, troubleshooting).
- Update `ADMIN_GUIDE.md` (auth: password reset now via `create-admin` script; env-var table), `.env.local.example` (final), `CLAUDE.md`, `RESUME.md`, `PROGRESS.md`, root `C:\doda-website\CLAUDE.md` tech-stack line.

**Verify:** `pnpm typecheck && pnpm lint && pnpm test:run && next build && pnpm test:e2e` · full manual admin walkthrough.

---

## Risk register

| Risk | Mitigation |
|---|---|
| Hostinger blocks outbound 5432 | Swap `lib/db/index.ts` to `@neondatabase/serverless` (HTTP/443) — one file |
| Drizzle partial-index / trigger fidelity | Keep `updated_at` trigger as raw SQL in the migration; verify with `\d` in `psql` |
| NextAuth v5 is beta | Pin exact version; widely used in production |
| `bcryptjs` slower than native | Fine for a single admin login; zero build step, fully portable |
| next-intl + NextAuth middleware composition | Dispatch by pathname (same as today) |
| `ImageResponse` OG route on self-hosted Node runtime | Verify during Phase 4 build; fallback = static branded PNG |
| `public/uploads/` wiped on deploy | Gitignored; deploy = git pull + build, folder untouched. Documented in `NEON_SETUP.md` |
| Losing RLS | Public pages import only `lib/db/queries.ts`; `server-only` on admin modules; CHECK constraints on `leads`/`bookings` inserts |

---

## Post-migration (separate tasks, not this work)

- Hostinger deploy of the full app on Node.js hosting + CDN for public routes.
- Replace `@vercel/analytics` + `@vercel/speed-insights` with Hostinger analytics / Plausible / GA4.
- Next 16 `middleware` → `proxy` rename.

---

## Status

- [x] **Phase 1 — Database layer** — ✅ done. `db:migrate` + `db:seed` + `test:db` + `build` all green against Neon. Driver: **Neon HTTP** (`drizzle-orm/neon-http`), not `postgres` — a TCP pool drops connections during `next build` (ECONNRESET) and HTTP is port-443-only (Hostinger-safe).
- [ ] Phase 2 — Auth
- [ ] Phase 3 — Storage
- [ ] Phase 4 — Data migration + cleanup
