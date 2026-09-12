# Admin Guide — WR Doors

> The `/admin` area is where you (and only you, for now) manage leads, bookings, and technicians. English-only — internal interface.

---

## Before you can log in

The admin account lives in the `admin_users` table. Create it (full setup in `NEON_SETUP.md`):

```bash
# bash
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-strong-password' pnpm admin:create
# PowerShell
$env:ADMIN_EMAIL="you@example.com"; $env:ADMIN_PASSWORD="a-strong-password"; pnpm admin:create
```

Sample technicians for the bookings page are loaded by `pnpm db:seed` (along with the rest of the baseline content).

---

## Logging in

1. Go to `http://localhost:3000/admin/login` (or your prod URL `/admin/login`)
2. Enter the email + password you set above
3. Click **Sign in**
4. You'll land on `/admin/dashboard`

If you visit `/admin/dashboard` (or any other admin route) while signed out, you'll be bounced to `/admin/login?next=<the-page-you-wanted>` and returned there after sign-in.

---

## What each page does

### `/admin/dashboard`
Single-screen overview:
- **4 stat cards** at the top: new leads, upcoming bookings, conversion rate, locale split
- **Leads breakdown** — count per status (new / contacted / converted / lost) + per source (quote / contact / product-page)
- **Bookings breakdown** — count per status
- **Recent activity** — last 8 leads + bookings combined, time-ordered

Updates auto-refresh whenever you change a status on a lead or booking (revalidation is wired in the server actions).

### `/admin/leads`
Table of all leads (most recent first, up to 50).

- **Filter pills** at the top: All / New / Contacted / Converted / Lost (counts shown on each)
- **Search**: by name, phone, or email (instant client filter)
- **Click any row** → side drawer opens with:
  - Tap-to-call + WhatsApp buttons (one-tap on mobile)
  - The customer's message (rendered RTL if they wrote in Arabic, with a reminder to reply in their language)
  - Status dropdown (update + Save)
  - Internal notes textarea (private — customer never sees this)
- **Save** → toast confirms, dashboard counts update

### `/admin/bookings`
Two views, toggle between them:

- **Calendar** (default) — react-big-calendar month view. Events color-coded by status (gold=new, navy=confirmed, blue=in-progress, green=completed, gray=cancelled). Click any event → drawer.
- **Table** — same data as a sortable list with technician + status columns

Booking drawer lets you:
- Set status (new → confirmed → in_progress → completed)
- Assign a technician (from the seeded list of 3, or unassign)
- Add internal scheduling notes
- One-tap WhatsApp / call the customer

---

## Sign out

Bottom-left of the sidebar has a **Sign out** button. After clicking, you're returned to `/admin/login`.

---

## Managing the admin account

Auth is **Auth.js (NextAuth) Credentials** against the `admin_users` table.
There's one account and no role tiers.

| Need | How |
|------|-----|
| **Create the admin** | `ADMIN_EMAIL=… ADMIN_PASSWORD='…' pnpm admin:create` |
| **Reset / change the password** | Run `pnpm admin:create` again with the same email and a new password — it updates the row |
| **Add a second admin** | `pnpm admin:create` with a different email (both get full access) |
| **Remove an admin** | Delete the row: `pnpm db:studio` → `admin_users` → delete. Their next request fails auth (their JWT stays valid until it expires — up to 30 days — so also rotate `AUTH_SECRET` and redeploy if you need to kill sessions immediately) |

### Security notes

- `/admin/login` is unlinked from the public site and disallowed in `robots.txt`.
- Passwords are bcrypt-hashed (12 rounds); the plain password is only ever read from the environment by `admin:create`.
- The session is a JWT in an `httpOnly` cookie signed with `AUTH_SECRET`.
- Use a strong unique password from a password manager.
- No MFA in this build — if it's needed later, that's an Auth.js provider add.

---

## Content management

These pages manage everything customers see:

### `/admin/products`
- Table of all products, filterable by category, with thumbnails
- **New** button → create a product (slug, name + description in EN/AR, category, price-from, specs, gallery images)
- Click any row → edit, including upload/replace/reorder gallery images
- Toggle `is_active` to publish/hide
- Delete supported

### `/admin/projects`
- Same shape as products: list, create, edit, gallery upload
- Toggle `is_published`

### `/admin/site-settings`
- Single-form mini-CMS: hero headline, eyebrow, contact info, business hours, social links
- All bilingual (EN/AR side-by-side), saved to the `site_settings` table
- Public pages read these via ISR — changes propagate within 60s

> Uploaded images are written to `public/uploads/<bucket>/<slug>/` on the server
> (re-encoded to WebP) and served at `/uploads/...`. On a server, that folder
> must persist across deploys — see `NEON_SETUP.md`. Specs live in the
> `products.specs` JSONB column.

---

## Deploying to production

> ⚠️ This section still describes the **old Vercel** setup. The plan is to
> self-host the whole Next.js app on **Hostinger Node.js hosting** — those
> steps will be written when that move happens. The environment variables
> below are current.

### Package manager on Hostinger: use npm, not pnpm

Local dev uses **pnpm** (`pnpm-lock.yaml`) — keep using it day to day. But
Hostinger's Node.js app builder fetches its package manager via corepack, and
that has been unreliable there (a corrupted corepack cache threw
`MODULE_NOT_FOUND` fetching pnpm, and pinning `packageManager` in
`package.json` didn't change which version it fetched). npm ships with Node
directly, so it sidesteps corepack entirely. A `package-lock.json` is
committed alongside `pnpm-lock.yaml` for exactly this: on Hostinger, set
**Build command**: `npm ci && npm run build`, **Start command**: `npm start`.
Regenerate `package-lock.json` (`npm install --package-lock-only`) whenever
dependencies change — it can drift from `pnpm-lock.yaml` if you forget.

### Required environment variables

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SITE_URL` | your public URL | used in sitemap / robots / JSON-LD / OG tags |
| `DATABASE_URL` | Neon **pooled** connection string | app runtime |
| `DATABASE_URL_UNPOOLED` | Neon **direct** connection string | migrations / scripts only |
| `AUTH_SECRET` | `openssl rand -base64 33` | signs the admin session JWT |
| `AUTH_URL` | your public URL | Auth.js callback base |
| `RESEND_API_KEY` | from Resend dashboard | `re_…` token |
| `RESEND_FROM_EMAIL` | e.g. `WR Doors <noreply@wrdoors.com>` | must match a verified Resend domain |
| `ADMIN_NOTIFICATION_EMAIL` | where new-lead / new-booking alerts go | |
| `NEXT_PUBLIC_SPLINE_SCENE_URL` | from Spline (optional) | homepage 3D hero; placeholder if unset |
| `UPLOADS_DIR` | absolute path (optional) | only if uploads live outside the app dir |

`ADMIN_EMAIL` / `ADMIN_PASSWORD` are **not** deployed — they're passed inline
to `pnpm admin:create` once, on the server, to seed the `admin_users` row.

### Post-deploy checks

| Check | URL | Expected |
|-------|-----|----------|
| Homepage EN / AR | `/en`, `/ar` | load; AR renders RTL |
| Sitemap / robots | `/sitemap.xml`, `/robots.txt` | valid; robots disallows `/admin/` + `/api/` |
| OG image | `/en/opengraph-image` | 1200×630 PNG |
| Admin login | `/admin/login` | renders; sign in works |
| CSP header | DevTools → Network → Response Headers | `Content-Security-Policy` present |
| Image upload | `/admin/products/<slug>` → gallery | file lands under `/uploads/…`, renders on the public page |

### Analytics

`@vercel/analytics` + `@vercel/speed-insights` are still wired in but only
report on Vercel. Off Vercel they're inert — swap for Hostinger analytics,
Plausible, or GA4 as part of the host move.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Invalid email or password" | Wrong credentials | Reset it: `pnpm admin:create` with the same email + a new password |
| Empty dashboard | No leads/bookings yet | Submit a test form via `/en/contact` etc. |
| Calendar shows blank month | All events on a different month | Use the Back/Forward buttons in the calendar toolbar |
| Drawer doesn't save | Session expired (long idle) | Refresh — middleware will bounce you to login and back |
| Sign-out doesn't redirect | Cookie deletion race | Refresh manually; you should see /admin/login |

---

## Reference

- Auth config: `auth.ts` / `auth.config.ts` · Layouts: `app/admin/layout.tsx`, `app/admin/(authed)/layout.tsx`, `app/admin/login/`
- Pages: `app/admin/(authed)/{dashboard,leads,bookings,products,projects,site-settings}/page.tsx`
- Server actions: `app/admin/actions.ts`
- Queries / mutations: `lib/db/admin-queries.ts`, `lib/db/mutations.ts`
- Auth gate: `middleware.ts` (composes locale routing + the admin JWT check)
- Setup: `NEON_SETUP.md`
