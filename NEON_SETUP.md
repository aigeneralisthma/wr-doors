# Database & Auth Setup — WR Doors × DODA

> One-time setup for a fresh environment (local or a new server). ~10 minutes.
> Replaces the old Supabase setup — see `NEON_MIGRATION_PLAN.md` for the why.

The stack now:

| Concern | Tech |
|---|---|
| Database | **Neon** (serverless Postgres) via **Drizzle ORM** + the Neon HTTP driver |
| Schema / migrations | `drizzle-kit` — `lib/db/schema.ts` is the source of truth |
| Admin auth | **Auth.js (NextAuth v5)** Credentials, JWT sessions, `admin_users` table |
| Image uploads | Local filesystem — `public/uploads/`, served at `/uploads/` |
| Email | Resend (unchanged — see `RESEND_SETUP.md`) |

---

## 1 — Create a Neon project (~3 min)

1. Go to **[neon.tech](https://neon.tech)** → sign up (GitHub is easiest) → **New Project**.
2. Region: closest to the UAE — **AWS `me-central-1` (UAE)** if offered, else `eu-central-1`.
3. After it provisions, open **Connection Details** (or the **Connect** button).
4. Copy **both** connection strings — toggle "Connection pooling":
   - **pooled** (host contains `-pooler`) → `DATABASE_URL`
   - **direct** (no `-pooler`) → `DATABASE_URL_UNPOOLED`

---

## 2 — Fill in `.env.local` (~2 min)

Copy `.env.local.example` to `.env.local` and set:

```env
DATABASE_URL="postgresql://…-pooler….neon.tech/neondb?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://….neon.tech/neondb?sslmode=require"

AUTH_SECRET="…"          # generate: openssl rand -base64 33   (or: npx auth secret)
AUTH_URL="http://localhost:3000"

RESEND_API_KEY="…"       # see RESEND_SETUP.md
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

`.env.local` is gitignored — never commit it.

---

## 3 — Create the schema + seed content (~1 min)

From `wr-doors/`:

```bash
pnpm db:migrate     # applies drizzle/*.sql to Neon (schema + updated_at triggers)
pnpm db:seed        # 8 products (with specs), 6 projects, 10 site_settings, 3 technicians
```

`db:seed` is idempotent (`ON CONFLICT DO NOTHING`) — safe to re-run; it never
clobbers edits made through the admin dashboard.

---

## 4 — Create the admin login (~1 min)

The admin account lives in the `admin_users` table. Create it (and reset the
password the same way, any time):

```bash
# bash
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-strong-password' pnpm admin:create

# PowerShell
$env:ADMIN_EMAIL="you@example.com"; $env:ADMIN_PASSWORD="a-strong-password"; pnpm admin:create
```

Minimum password length is 10. The plain password is only read from the
environment — only the bcrypt hash is stored.

After the first account exists, the admin can reset their own password from
`/admin/login` → **Forgot password?** (mails a 1-hour single-use link via
Resend) — no terminal access needed. `admin:create` is the break-glass
fallback if that account is locked out or email delivery is down.

---

## 5 — Verify (~30 sec)

```bash
pnpm test:db
```

Expected:

```
🔍 Neon database sanity check

  ✓ connected
  ✓ products: 8 rows (expected ≥ 8)
  ✓ projects: 6 rows (expected ≥ 6)
  ✓ site_settings: 10 rows (expected ≥ 10)
  ✓ technicians: 3 rows (expected ≥ 3)
  ✓ lead insert + delete round-trip
  ✓ admin_users: 1 row(s)

✅ All checks passed.
```

Then `pnpm dev`, open `http://localhost:3000/admin/login`, and sign in.

---

## Everyday commands

| Command | What it does |
|---|---|
| `pnpm db:generate` | after editing `lib/db/schema.ts` — writes a new `drizzle/*.sql` |
| `pnpm db:migrate` | apply pending migrations to `DATABASE_URL_UNPOOLED` |
| `pnpm db:studio` | Drizzle Studio — browse/edit rows in a browser |
| `pnpm db:seed` | (re)load baseline content |
| `pnpm admin:create` | create / reset the admin account |
| `pnpm test:db` | connection + row-count + insert sanity check |

---

## Notes

- **Neon HTTP driver** (not a TCP pool): every query is an HTTPS request on
  port 443. No pool to exhaust during `next build`, and it works on hosts that
  block outbound 5432. `postgres` (TCP) is used only by the CLI scripts.
- **No RLS.** A single `DATABASE_URL` has full access. The security boundary is
  the app: public pages import only `lib/db/queries.ts`; `lib/db/admin-queries.ts`
  and `lib/db/mutations.ts` are `server-only`; `leads` / `bookings` public
  inserts are constrained by DB `CHECK` + Zod.
- **Uploads on a server**: `public/uploads/` must persist across deploys (it's on
  the disk — just don't let the deploy step wipe it). To keep it outside the app
  dir, set `UPLOADS_DIR` to an absolute path (e.g. a mounted volume).

---

## Reference files

- Schema: `lib/db/schema.ts` · Migrations: `drizzle/`
- DB client: `lib/db/index.ts` · Queries: `lib/db/{queries,admin-queries}.ts` · Mutations: `lib/db/{mutations,public-mutations}.ts`
- Auth: `auth.ts` / `auth.config.ts` / `middleware.ts` · Password: `lib/auth/password.ts`
- Password reset: `lib/auth/reset-token.ts` · `app/actions/auth-reset.ts` · `app/admin/{forgot-password,reset-password}/`
- Storage: `lib/storage/local.ts`
- Scripts: `scripts/{seed,test-db,create-admin}.ts`
