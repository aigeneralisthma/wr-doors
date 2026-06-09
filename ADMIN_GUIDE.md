# Admin Guide — WR Doors

> The `/admin` area is where you (and only you, for now) manage leads, bookings, and technicians. English-only — internal interface.

---

## Before you can log in

You need an admin user in Supabase Auth. You should have created one during Prompt 7 — if not:

1. Supabase Dashboard → **Authentication** → **Users** → **Add user → Create new user**
2. Use your admin email + a strong password
3. Toggle **Auto Confirm User** ON
4. Save

Optional pre-9a step (if you haven't already): seed three sample technicians so the bookings page has someone to assign:

- Supabase SQL Editor → paste `supabase/seed/0002_seed_technicians.sql` → Run

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

## Managing admin users

> **Where users live**: Supabase Dashboard, NOT inside this admin UI. Any account in **Supabase → Authentication → Users** can sign in here and gets full admin access. There are no role tiers — every admin has the same permissions.

### Quick reference

| Need | Where to click |
|------|----------------|
| **See who has admin access** | [Supabase Dashboard](https://supabase.com/dashboard) → your project → Authentication → Users |
| **Add a new admin** | Same page → **Add user → Create new user** → enter email + strong password → tick **Auto Confirm User: ON** → Save |
| **Reset a forgotten password** | Same page → click the user → **Send password recovery** (or set a new password directly) |
| **Temporarily disable an admin** | Same page → click user → **Ban user** (preserves credentials, blocks login) |
| **Remove an admin permanently** | Same page → click user → **Delete user** (kills any active session immediately) |
| **Enable 2FA for stronger security** | Project Settings → Authentication → **Multi-Factor Authentication** |

### Common workflows

**🆕 Adding a new admin (giving someone access)**
1. Supabase → Authentication → Users → **Add user → Create new user**
2. Email + strong password + **Auto Confirm User: ON** → Save
3. Share credentials through a secure channel (1Password, Signal, in-person — **never** plain email/SMS)
4. They go to `/admin/login`, sign in → full access immediately

**🔄 Transferring admin to someone else (handover)**
1. **First**, add the new admin (above) and confirm they can log in
2. Have them rotate their password to one only they know (use **Send password recovery** or self-reset)
3. **Then** delete the old admin: click old user → **Delete user**
4. Old credentials are dead — handover complete

**🔒 Suspending an admin (vacation, leave, etc.)**
1. Supabase → Authentication → click the user → **Ban user** → pick duration
2. They can't log in until unbanned — credentials stay intact

**🚪 Removing an admin (fired, role change)**
1. Click the user → **Delete user**
2. Any active session is invalidated within seconds

### Security notes

- The admin login URL (`/admin/login`) is unlinked from the public site + disallowed in `robots.txt` — bots won't find it
- Supabase Auth has built-in brute-force protection (5 attempts per IP per 5 min)
- Every admin should use a unique strong password (ideally from a password manager)
- For production: turn on **MFA** in Supabase Authentication settings — requires every admin to scan a TOTP code on their phone at login

### Why no in-site user-management UI?

Intentional. Supabase's Authentication page is a hardened, audited UI with built-in MFA prompts, password-strength meters, and rate-limit warnings. Duplicating it inside `/admin/users` would mean re-implementing those guardrails and giving the site more code to maintain. Bookmark the Supabase Auth page alongside `/admin/login` and you're set.

---

## Content management (Prompt 9b)

These pages let you manage everything customers see, without ever opening Supabase:

### `/admin/products`
- Table of all products, filterable by category, with thumbnails
- **New** button → create a product (slug, name + description in EN/AR, category, price-from, specs JSON, gallery images)
- Click any row → edit, including upload/replace/reorder gallery images (stored in Supabase Storage under `product-images/`)
- Toggle `is_active` to publish/hide
- Soft-delete supported

### `/admin/projects`
- Same shape as products: list, create, edit
- Upload hero + gallery to `project-images/` bucket
- Toggle `is_published`

### `/admin/site-settings`
- Single-form mini-CMS: hero headline, eyebrow, contact info, business hours, social links
- All bilingual (EN/AR side-by-side)
- Saves to `site_settings` table (1 row, `singleton = true` constraint)
- Public pages read these via ISR — changes propagate within 60s

> Specs are now stored in `products.specs` JSONB column (migration `0002`), not in code. Storage RLS (migration `0003`) ensures only signed-in admins can upload/replace/delete; public reads are open.

---

## Deploying to production (Prompt 10)

The app is wired for one-click Vercel deployment with full SEO, analytics, and security headers.

### 1. Vercel project setup
1. Go to **vercel.com → Add New → Project**
2. Import `aigeneralisthma/wr-doors` from GitHub
3. Framework Preset: **Next.js** (auto-detected)
4. Root Directory: `./` (leave default)
5. Don't deploy yet — click **Environment Variables** first

### 2. Required environment variables
Paste these into Vercel's env-var UI (apply to Production + Preview + Development):

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SITE_URL` | `https://wrdoors.vercel.app` | Override later if/when you swap to a custom domain |
| `NEXT_PUBLIC_SUPABASE_URL` | from Supabase dashboard | Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase dashboard | Same page, "anon public" key |
| `SUPABASE_SERVICE_ROLE_KEY` | from Supabase dashboard | **Server-only**, never expose. Same page, "service_role" key |
| `RESEND_API_KEY` | from Resend dashboard | re_… token |
| `RESEND_FROM_EMAIL` | e.g. `WR Doors <noreply@wrdoors.com>` | Must match a verified Resend domain. Use `WR Doors <onboarding@resend.dev>` for Phase-1 test deploys |
| `ADMIN_NOTIFICATION_EMAIL` | `wahatalruman36@gmail.com` | Where new-lead + new-booking notifications go |

Optional, but recommended for Phase 1:
| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SPLINE_SCENE_URL` | from your Spline account | Homepage 3D hero scene URL. Falls back to a placeholder if unset. |

Optional but recommended:
| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | from Google Cloud Console | If/when you wire a real map embed on the contact page |

### 3. Deploy
Click **Deploy**. First build runs `pnpm build` (~2 min). When green, the prod URL appears at the top of the project.

### 4. Verify production
After deploy:

| Check | URL | Expected |
|-------|-----|----------|
| Homepage EN | `/en` | Loads, hero animates, no console errors |
| Homepage AR | `/ar` | Renders RTL, Arabic text correct |
| Sitemap | `/sitemap.xml` | XML with hreflang en/ar pairs on every URL |
| Robots | `/robots.txt` | Allow `/`, disallow `/admin/` + `/api/`, sitemap link |
| OG image | `/en/opengraph-image` | 1200×630 PNG, navy background, gold accent |
| Admin login | `/admin/login` | Renders; sign in works with your Supabase admin user |
| CSP header | DevTools → Network → any request → Response Headers | `Content-Security-Policy` present, includes Spline + Supabase + Resend allowlists |
| Lighthouse | DevTools → Lighthouse → Mobile | Target 90+ Performance, 100 SEO, 100 Best Practices |

### 5. Analytics
- **Vercel Analytics** is auto-enabled (free tier: ~2.5k events/mo). View at `https://vercel.com/<your-account>/wr-doors/analytics`. Tracks page views, top routes, locale split, referrers — no cookies, no PII.
- **Speed Insights** also auto-enabled. View at the Speed Insights tab. Tracks real-user LCP / FID / CLS by route.

### 6. Custom domain (Phase 2)
When `wrdoors.com` is ready:
1. Vercel → Project → **Settings → Domains → Add `wrdoors.com`**
2. Add the displayed A/CNAME records at your registrar
3. Once verified, update Vercel env `NEXT_PUBLIC_SITE_URL` to `https://wrdoors.com`
4. Redeploy
5. (Optional) Add `doda.com` as a redirect-only domain pointing to `wrdoors.com`

> The base URL is read from `NEXT_PUBLIC_SITE_URL` everywhere (sitemap, robots, JSON-LD, OG tags). Updating that one env var + redeploying is all you need for a domain swap.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Invalid email or password" | Wrong credentials | Reset password in Supabase Dashboard → Authentication → Users → pick user → reset |
| Empty dashboard | No leads/bookings yet | Submit a test form via `/en/contact` etc. |
| Calendar shows blank month | All events on a different month | Use the Back/Forward buttons in the calendar toolbar |
| Drawer doesn't save | Session expired (long idle) | Refresh — middleware will bounce you to login and back |
| Sign-out doesn't redirect | Cookie deletion race | Refresh manually; you should see /admin/login |

---

## Reference

- Auth + layout: `app/admin/layout.tsx`, `app/admin/(authed)/layout.tsx`, `app/admin/login/`
- Pages: `app/admin/(authed)/{dashboard,leads,bookings}/page.tsx`
- Server actions: `app/admin/actions.ts` (updateLeadStatus, updateBooking, signOut)
- Queries: `lib/supabase/admin-queries.ts`
- Auth gate: `middleware.ts` (composes locale + admin auth)
