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

## What's NOT yet here (coming in 9b)

- `/admin/products` — CRUD for the catalog (currently you'd edit via Supabase Dashboard → Table Editor → products)
- `/admin/projects` — CRUD for the portfolio
- `/admin/site-settings` — mini CMS for hero text, contact info, hours (`site_settings` table)
- Image upload UI to Supabase Storage (you'd upload via Dashboard → Storage for now)
- `0002_add_product_specs.sql` migration to move specs from `lib/product-specs.ts` into the DB

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
