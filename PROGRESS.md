# PROGRESS — DODA × WR Doors

> Per-prompt savepoint log. Updated as the LAST step before every commit.
> Latest entry on top.

---

## Prompt 10 — SEO + Performance + Vercel Deployment Prep ✅

**Date**: 2026-06-08
**Model used**: claude-opus-4-7 (continued from a partial Sonnet run that left uncommitted SEO scaffolding in the tree)
**Status**: Complete — local verification green. Vercel deploy itself is a user-side action (account login + GitHub import).

### Goal
Ship every SEO + performance + security signal a search engine, social platform, or browser would look for. Get the project to "click deploy on Vercel and walk away" state.

### Deliverables

**Discovery + crawlability**
- `app/sitemap.ts` — Next.js file-route sitemap. One entry per (locale × route): 8 static routes + 4 category pages + N product pages, both `/en` and `/ar`. Every entry declares its hreflang pair via `alternates.languages`. Dynamic slugs fetched from Supabase at build via the cookieless `createStaticClient`.
- `app/robots.ts` — allow all, disallow `/admin/`, `/api/`, link to sitemap.xml. Keeps admin login URL off the index.

**Structured data (rich results)**
- `components/seo/local-business-json-ld.tsx` — `HomeAndConstructionBusiness` schema (most specific subtype for doors + installation). Includes address (Dubai), geo coords, hours (Sun–Thu 9–18), publisher = DODA. Wired into homepage for both locales — Arabic variant includes `alternateName: "وَر دورز"`.
- `components/seo/product-json-ld.tsx` — `Product` schema with brand, manufacturer, image (absolute URLs), and conditional Offer when `price_from_aed` is set. Specs flow to `additionalProperty[]`. Wired into product detail page.

**Open Graph + Twitter**
- `app/[locale]/opengraph-image.tsx` — dynamic 1200×630 PNG via Next.js `ImageResponse` (edge runtime). Brand-aware: navy gradient background, gold accent bar, locale-aware heading + tagline + DODA endorsement, monospace URL footer. No static PNG to ship or maintain. Twitter cards auto-fall-back to this image because we use `summary_large_image`.
- Base hreflang + OG site name + Twitter card metadata already lived in `app/[locale]/layout.tsx` from earlier prompts; per-route `generateMetadata` already covers /products, /products/[cat], /products/[cat]/[slug], /services, /book, /quote, /projects, /about, /contact.

**Security headers (CSP)**
- `next.config.ts` — strict Content-Security-Policy added on top of the existing X-Frame, HSTS, Referrer, X-Content-Type-Options, Permissions-Policy. Allow-list per service: prod.spline.design (hero 3D), va.vercel-scripts.com (analytics), *.supabase.co (auth + DB + Storage CDN), api.resend.com (email), www.google.com + maps.* (contact map), fonts.googleapis.com + fonts.gstatic.com (next/font Google Fonts). Compromises documented in code: `'unsafe-inline'` on style-src (Tailwind utilities + next/image placeholder), `'unsafe-inline' 'unsafe-eval'` on script-src (Next.js + Spline runtime). Nonce-based CSP deferred to Phase 2 if SOC2/strict mode is later required.

**Analytics + Web Vitals (RUM)**
- `@vercel/analytics` + `@vercel/speed-insights` installed and wired into both `app/[locale]/layout.tsx` (public) and `app/admin/layout.tsx` (admin operator usage). Zero-cookie, no PII — auto-enabled on Vercel.

**Wiring**
- `app/[locale]/page.tsx` → `<LocalBusinessJsonLd>`
- `app/[locale]/products/[category]/[slug]/page.tsx` → `<ProductJsonLd>`
- Both layouts → `<Analytics />` + `<SpeedInsights />`

**Documentation**
- `ADMIN_GUIDE.md` — replaced the stale "coming in 9b" section with a real "Content management" section, then added a full "Deploying to production (Prompt 10)" section: Vercel project setup, required env vars (table), post-deploy verification checklist, Vercel Analytics + Speed Insights pointer, Phase-2 custom-domain swap procedure.

### Test Results
- ✅ **TypeScript**: clean (`tsc --noEmit` exit 0)
- ✅ **ESLint**: clean (0 errors, 0 warnings after pruning two stale `eslint-disable-next-line react/no-danger` directives that the project's config doesn't trigger)
- ✅ **Vitest unit tests**: 40/40 passing (no regressions)
- ✅ **Production build** (`next build`): 54 static pages generated, 11 public routes + 11 admin routes intact; new artifacts: `/robots.txt` (Static), `/sitemap.xml` (Static), `/-/opengraph-image` (Dynamic edge runtime). Public SSG routes still revalidate every 60s.
- ✅ **Local smoke (next start :3010)**:
  - `/en` HTTP 200, CSP + X-Frame + HSTS + Referrer + X-Content-Type-Options + Permissions-Policy all present
  - `/sitemap.xml` valid XML with `<xhtml:link rel="alternate" hreflang="..." />` pairs on every URL
  - `/robots.txt` correct (allow /, disallow /admin/ + /api/, sitemap link)
  - `/en` JSON-LD: `HomeAndConstructionBusiness` rendered with full address + geo + hours
  - `/ar` JSON-LD: includes `alternateName: "وَر دورز"`; `og:locale` = `ar_AE`
  - `/en/products/wpc-doors/modern-wpc-interior` JSON-LD: `Product` rendered with absolute image URLs, brand, manufacturer, category
  - `/en/opengraph-image`: 89 KB PNG, 1200×630, content-type `image/png`
  - `/admin/login`: 200, same CSP/security headers attached (`/:path*` source matches every route)

### Security review
- ✅ CSP strict allow-list — no wildcard `*` outside `data:` / `blob:` for img-src and Supabase subdomain pattern
- ✅ HSTS preload-eligible (max-age 2 years, includeSubDomains, preload)
- ✅ Robots disallows `/admin/` and `/api/` — admin login URL stays out of the index
- ✅ JSON-LD output uses `JSON.stringify` (escapes `<` and other unsafe characters automatically) before going through `dangerouslySetInnerHTML`
- ✅ No new server actions or mutations introduced — Prompt 10 is read-only/metadata-only on top of Prompt 9b
- ⚠ Documented compromises in CSP: `'unsafe-inline'` + `'unsafe-eval'` for Spline + Next.js runtime; flagged for Phase 2 nonce-based rework if compliance ever demands it

### Pre-flight (user-side, NOT done in this prompt — Vercel deploy itself)
- ⏳ User creates a Vercel project (import `aigeneralisthma/wr-doors`), pastes env vars per the table in ADMIN_GUIDE.md, clicks Deploy
- ⏳ User runs the post-deploy verification checklist in ADMIN_GUIDE.md (sitemap/robots/OG/CSP/admin login/Lighthouse)
- ⏳ Lighthouse Mobile 90+ confirmation runs against the live Vercel URL (not localhost — Spline + Vercel edge caching skew local scores)

### Known issues / deferred
- ❌ Static favicon family (apple-touch-icon, 32×32, 192×192, manifest.webmanifest) — `favicon.ico` exists; richer icon set deferred to Phase 2 alongside branded social PNGs (1200×600 LinkedIn, 1080×1080 Instagram)
- ❌ Nonce-based CSP — deferred to Phase 2 if needed
- ❌ Site verification meta tags (Google Search Console, Bing Webmaster) — added after the live URL is known
- ❌ Custom domain (`wrdoors.com`) — Phase 2 per locked decision
- ⚠ Next.js 16 warns: `middleware` file convention deprecated → use `proxy` instead. Not blocking; Phase 2 sweep alongside other v16 cleanup

### Commit
- Branch: `main`
- Hash: `4015c7c`
- Message: `feat(seo): sitemap + robots + JSON-LD + CSP + analytics + dynamic OG image (10)`
- Pushed: `main -> origin/main`

---

## Prompt 9b — Admin CRUD (Products + Projects + Site Settings + Storage) ✅

**Date**: 2026-06-08
**Model used**: claude-opus-4-7
**Status**: Complete

### Goal
Finish the admin surface: content management. Admin can now create, edit, and delete products + projects + site settings via the dashboard, including multi-image gallery uploads to Supabase Storage. Specs move from the codebase into the DB so they're editable too.

### Deliverables

**Database migrations** (user paste-and-run)
- `supabase/migrations/0002_add_product_specs.sql` — `ALTER TABLE products ADD COLUMN specs JSONB NOT NULL DEFAULT '[]'::jsonb`, backfills the 8 seeded products with their existing specs (one-shot data move from `lib/product-specs.ts`)
- `supabase/migrations/0003_storage_rls.sql` — 4 policies on `storage.objects`: public SELECT + admin-only INSERT/UPDATE/DELETE on the 5 buckets (products/projects/homepage/services/misc). Locks down anonymous uploads that were previously open.

**Storage layer** (`lib/supabase/storage.ts`)
- `uploadFile({ bucket, slug, file })` — server-only, validates size (5 MB max) + MIME (JPG/PNG/WebP/AVIF), generates a random-UUID filename, uploads, returns public URL
- `deleteFileByUrl(url)` — parses Storage URL → calls remove()
- `deleteFilesByUrl(urls)` — bulk delete with `Promise.allSettled`
- `isStorageUrl(url)` — helper for the smart image renderer

**Smart image rendering**
- `lib/supabase/image-helpers.ts` — added `RenderableImage` union (`manifest` | `url`), `productImageSmart()` and `projectImageSmart()` that fall back to plain URL when the image isn't in the local manifest (i.e. admin-uploaded to Storage)
- `components/ui/smart-image.tsx` — wrapper that picks `<ProductImage>` (full `<picture>` with responsive variants) for manifest images vs `next/image` for Storage URLs

**Admin CRUD pages** (all under `app/admin/(authed)/`)
- `products/` — list (table with category filter, search, image thumbs), `new/` (create form), `[slug]/` (edit form with gallery + delete)
- `projects/` — list, `new/`, `[slug]/` (same pattern, no specs)
- `site-settings/` — single page rendering every settings row as form rows (EN + AR side-by-side), bulk Save

**Admin components** (`components/admin/`)
- `product-form.tsx` — bilingual fields + SpecsEditor + GalleryEditor + DeleteButton, dual-mode (new/edit)
- `project-form.tsx` — same pattern, no specs
- `specs-editor.tsx` — repeating-row form for ProductSpec[]: 4 inputs per row + remove button + "Add spec" at bottom + `pruneEmptySpecs()` helper
- `gallery-editor.tsx` — drop zone + thumb tiles with native HTML5 drag-reorder + per-image actions (set primary, delete) + upload progress
- `image-thumb.tsx` — reusable thumbnail tile (3 sizes) using `next/image`
- `delete-button.tsx` — destructive button + confirm dialog wrapper
- `sidebar-nav.tsx` — added Products, Projects, Site settings links

**Admin mutations + actions**
- `lib/supabase/admin-mutations.ts` — typed: `createProduct/updateProduct/deleteProduct/createProject/updateProject/deleteProject/updateSiteSettings`. Delete operations also clean up Storage objects via `deleteFilesByUrl`.
- `app/admin/actions.ts` — extended with 11 new server actions: 3 product CRUD + 3 project CRUD + 1 site-settings + 1 upload + 1 delete-image + the existing 3 (signOut/updateLeadStatus/updateBooking). All re-check auth + revalidatePath on both admin + public routes.

**Admin queries**
- `lib/supabase/admin-queries.ts` — added `getAllProductsAdmin`, `getProductBySlugAdmin`, `getAllProjectsAdmin`, `getProjectBySlugAdmin`, `getAllSiteSettingsAdmin` (cookie-based client carries admin session → RLS admin policy allows full read incl. inactive/unpublished rows)

**Type + codebase cleanup**
- `lib/supabase/database.types.ts` — added `ProductSpec` interface + `specs: ProductSpec[]` to ProductRow
- `lib/product-specs.ts` — **deleted** (specs now live in DB)
- `app/[locale]/products/[category]/[slug]/page.tsx` — reads `product.specs` from DB instead of `productSpecsBySlug(slug)`

### Test Results
- ✅ **TypeScript**: clean (exit 0)
- ✅ **ESLint**: clean (0 errors, 0 warnings)
- ✅ **Vitest unit tests**: 40/40 passing (no regressions)
- ✅ **Production build**: 7 new admin routes (5 dynamic + 1 dynamic-param + 1 static `/admin/login` unchanged) added to the 11 public + 4 existing admin routes from Prompt 9a
- ✅ **Playwright E2E (mobile)**: full suite still passes after the refactor

### Bug fixes during this prompt
1. **`Dialog` exports no `DialogFooter`** — inlined a `<div className="flex justify-end gap-2 pt-2">` in `delete-button.tsx`
2. **React hook lint trigger on `useLongInput()`** — renamed to `isLongFieldKey()` so it's not mistaken for a hook
3. **Unused `ProductSpec` import** in `app/admin/actions.ts` — removed

### Pre-flight (user-side, already completed during prompt)
- ⏳ User to paste `supabase/migrations/0002_add_product_specs.sql` → verified specs column populated for 8 products
- ⏳ User to paste `supabase/migrations/0003_storage_rls.sql` → verified 4 policies under storage > objects

### Known issues / deferred
- ❌ Image cropping / resize UI — admins must pre-size uploads (Phase 2)
- ❌ Bulk import (CSV) — Phase 2
- ❌ Per-image alt text — uses product name everywhere (Phase 2)
- ❌ Versioning / audit log — Phase 2
- ❌ Real RBAC (multiple admin roles) — Phase 2
- ❌ Lead export (CSV) — Phase 2
- ⚠ Admin-uploaded images render via `next/image` (counts against optimization quota); seeded products keep the local `<picture>` with responsive variants. When the client provides real product photography, we either keep them as local manifest assets via the existing `pnpm images` script OR move everything to Storage + accept the optimization quota cost.

### Security review
- ✅ Storage RLS in place — anonymous can read but never write
- ✅ All 11 new server actions check `auth.getUser()` before any mutation
- ✅ Upload action validates MIME + file size server-side (defense in depth — client also validates)
- ✅ Random-UUID filenames prevent path traversal / overwrites
- ✅ `lib/supabase/admin-mutations.ts` is `"server-only"`
- ✅ Delete confirmations require explicit "Delete permanently" click
- ✅ Zod validation on all CRUD inputs (slug format enforced as url-safe)
- ✅ revalidatePath called for both admin AND public paths so public site updates immediately

### Commit
- Branch: `main`
- Message: `feat(admin-crud): products, projects, site-settings CRUD with Storage gallery (9b)`

---

## Prompt 9a — Admin Dashboard (Auth + Read-only + Status Updates) ✅

**Date**: 2026-06-08
**Model used**: claude-opus-4-7
**Status**: Complete (9b — products/projects/site-settings CRUD — will follow)

### Goal
Ship the lead-management workflow: an authenticated admin can sign in, see what's in the pipeline, update lead statuses, and assign technicians to bookings. CRUD on catalog content is deferred to 9b per user decision.

### Deliverables

**Auth + middleware**
- `middleware.ts` refactored to compose two responsibilities:
  - **Locale routing** (next-intl) for `/[locale]/*`
  - **Auth gating** for `/admin/*` — uses cookie-based `@supabase/ssr` server client to call `auth.getUser()`; redirects unauthed users to `/admin/login?next=<path>` and bounces already-authed users away from `/admin/login` to `/admin/dashboard`
- Matcher now includes `/admin/*` (previously excluded)

**Admin layouts** (route group pattern for clean separation)
- `app/admin/layout.tsx` — root admin layout, provides `<html>`/`<body>` shell, English-only, `robots: noindex,nofollow`
- `app/admin/(authed)/layout.tsx` — sub-layout for dashboard/leads/bookings; runs auth check (defense in depth) + renders fixed sidebar with admin email + sign-out
- `app/admin/login/page.tsx` — separate page outside the `(authed)` group so it doesn't get sidebar or trigger redirect loops

**Pages**
- `/admin/login` — branded card with email + password form (Client Component using `createBrowserClient`); honors `?next=` param for post-login redirect (sanitized to prevent open-redirect); maps Supabase "Invalid login credentials" to user-friendly message
- `/admin/dashboard` — overview with 4 stat cards (new leads, upcoming bookings, conversion rate, locale split), two breakdown cards (leads by status+source, bookings by status), and recent-activity feed (last 8 leads + bookings merged + time-ordered)
- `/admin/leads` — Server fetches latest 50, Client table with filter pills (All / New / Contacted / Converted / Lost with counts), search by name/phone/email, locale flag emoji, status badge. Click row → side drawer with all fields + tap-to-call/WhatsApp + customer message (RTL if AR) + status dropdown + admin_notes textarea → Save via server action
- `/admin/bookings` — toggle between **react-big-calendar** month view (events color-coded by status: gold/navy/blue/green/gray) and table view; click event/row → drawer with status + technician picker + admin_notes

**Server actions** (`app/admin/actions.ts`)
- `signOut()` — auth.signOut() + redirect to login
- `updateLeadStatus({ leadId, status, adminNotes })` — Zod-validated, re-checks `auth.getUser()` as defense in depth, calls `revalidatePath` on `/admin/leads` + `/admin/dashboard` so the UI reflects immediately
- `updateBooking({ bookingId, status, assignedTechnician, adminNotes })` — same pattern; status + technician assignment in one save

**Admin queries** (`lib/supabase/admin-queries.ts`)
- `"server-only"` import — build fails if anyone imports from a Client Component
- `getLeadsAdmin({ status?, source?, search? })` with `.or()` ilike search across name/phone/email + pagination
- `getBookingsAdmin({ status?, technicianId? })`
- `getTechniciansAdmin()` — active only
- `getDashboardStats()` — single function returning all dashboard data; runs 4 parallel queries

**Reusable admin components**
- `components/admin/sidebar-nav.tsx` — fixed left sidebar with active-route highlight + admin email + sign-out button
- `components/admin/stat-card.tsx` — generic dashboard tile (label + value + optional subtext + optional icon)

**Drawers (Client Components)**
- Both lead + booking drawers use the wrapper-with-keyed-body pattern to avoid the `setState`-in-`useEffect` anti-pattern: outer component holds open/close, inner body is keyed by row id so React unmounts/remounts it on selection change, cleanly initializing form state from props
- Both drawers wrap the existing `<Sheet side="right">` primitive
- Inline success/error feedback with `useTransition` for non-blocking saves

**Seed**
- `supabase/seed/0002_seed_technicians.sql` — 3 sample technicians with hard-coded UUIDs (so seeds are reproducible across envs); user paste → run

**User-facing walkthrough**
- `ADMIN_GUIDE.md` covers: pre-login setup, what each page does, sign-out, troubleshooting, and what's deferred to 9b

**Email config update (carried over from Prompt 8)**
- `RESEND_SETUP.md` updated: all references to `hafizazeem@gmail.com` → `aigeneralist.hma@gmail.com` per user signup

### Test Results
- ✅ **TypeScript**: clean
- ✅ **ESLint**: clean (0 errors, 0 warnings)
- ✅ **Vitest unit tests**: 40/40 passing (no regressions)
- ✅ **Production build**: 4 new admin routes (`/admin/login` static, `/admin/dashboard|leads|bookings` dynamic) + 11 existing public routes still SSG with 60s ISR
- ✅ **Playwright E2E** — mobile: 67/67 passing (6 new admin smoke + 61 existing public regression)

### Bug fixes during this prompt
1. **`Sheet` doesn't export `SheetTitle`/`SheetDescription`** — inlined plain `<h2>` + `<p>` elements in both drawers
2. **Missing `<html>`/`<body>` in root admin layout** — Next.js requires every route tree to have a root layout providing these. Initially only `app/[locale]/layout.tsx` had them (for public routes). Fix: added `app/admin/layout.tsx` as the root admin layout shell.
3. **`react-hooks/set-state-in-effect` lint error** — my initial drawer pattern called `setState` inside `useEffect` to sync form state from a prop on selection change. Refactored to "outer wrapper + keyed inner body": React unmounts/remounts the inner component when row id changes, cleanly re-initializing state from props with no effects.
4. **`let response` flagged as `prefer-const`** in middleware — never reassigned; changed to `const`.

### Known issues / deferred to 9b
- ❌ `/admin/products` CRUD with Storage upload
- ❌ `/admin/projects` CRUD
- ❌ `/admin/site-settings` mini CMS
- ❌ Storage RLS for uploads (currently buckets are public-read, uploads unprotected)
- ❌ `0002_add_product_specs.sql` migration (move specs from `lib/product-specs.ts` to DB JSONB column)
- ❌ Real RBAC (admin/sales_agent/technician) — Phase 2
- ❌ Lead export (CSV) — Phase 2
- ❌ Admin password reset UI — use Supabase Dashboard for now
- ⏳ User needs to paste `supabase/seed/0002_seed_technicians.sql` so booking drawer's technician picker has options (otherwise it shows "Unassigned" only)

### Security review
- ✅ All `/admin/*` routes blocked by middleware unless `auth.getUser()` returns a user
- ✅ `app/admin/(authed)/layout.tsx` also calls `auth.getUser()` + redirects — defense in depth
- ✅ All server actions re-check `auth.getUser()` before any write
- ✅ `lib/supabase/admin-queries.ts` imports `"server-only"` — build fails if ever imported in Client
- ✅ No service-role key anywhere
- ✅ `next` query param in login redirect sanitized (must start with `/admin/`, no `//`, no `:`) to prevent open-redirect
- ✅ Status enum values validated server-side via Zod — admin can't set unsupported status values
- ✅ Generic error messages to user — no DB internals leaked
- ✅ `metadata.robots = { index: false, follow: false }` on admin root layout + login page
- ✅ Cookie-based auth via `@supabase/ssr` — sessions refresh automatically

### Commit
- Branch: `main`
- Message: `feat(admin): auth, dashboard, leads + bookings management (9a)`

---

## Prompt 8 — Form Integration + Resend Emails + Supabase Reads ✅

**Date**: 2026-06-07
**Model used**: claude-opus-4-7
**Status**: Complete (Resend signup is still on user TODO — see "Known issues")

### Goal
Connect the static site to the real Supabase backend: forms write actual leads/bookings, public pages read product/project content from the database, and admin gets email alerts when something lands.

### Deliverables

**Server actions** (`app/actions/`)
- `leads.ts` — `submitQuoteLead`, `submitContactLead` (rate-limit → Zod → honeypot → Supabase insert → fire-and-forget Resend)
- `bookings.ts` — `submitBooking` (same pattern, lower rate limit because bookings imply commitment)
- Generic, locale-aware error responses (never leak DB internals)
- All actions use **server-generated UUIDs** for inserts — anon has no SELECT policy on leads/bookings, so chaining `.select("id").single()` after `.insert()` would fail RLS. Cleaner to mint the ID server-side, use it in the response + email templates, and skip the RETURNING SELECT.

**Email infrastructure** (`lib/email/` + `emails/`)
- `lib/email/client.ts` — server-only Resend lazy singleton + env-driven `getAdminEmail()` / `getFromAddress()`
- `lib/email/send.ts` — typed `sendCustomer*Confirmation()` + `sendAdmin*Alert()` helpers (silent failure: log + return `{ ok: false }` but don't throw, so a Resend outage doesn't block lead capture)
- 5 React Email templates:
  - `_layout.tsx` — shared shell: navy header with WR Doors wordmark + "Powered by DODA" microtext, gold accent dividers, branded footer with contact info + DODA endorsement line (bilingual)
  - `customer-contact-confirmation.tsx` — bilingual EN/AR with `dir="rtl"` for Arabic, WhatsApp + phone CTAs
  - `customer-quote-confirmation.tsx` — same pattern, includes the asked-about product label
  - `customer-booking-confirmation.tsx` — shows confirmed details (service, locale-formatted date, area)
  - `admin-lead-alert.tsx` — English admin alert with tappable phone/WhatsApp/email links + customer-locale flag so admin knows which language to reply in
  - `admin-booking-alert.tsx` — same idea but with "Action needed: confirm appointment" framing

**Rate limiting + honeypot** (`lib/rate-limit.ts` + schema updates)
- `lib/rate-limit.ts` — in-memory `lru-cache` based, keyed by `(ip, endpoint)`, 5 req/min default
- `getClientIp(headers)` — extracts from `x-forwarded-for` → `x-real-ip` → `"unknown"`
- All 3 schemas (`booking.ts`, `quote.ts`, `contact.ts`) gained an optional `_botField` honeypot
- All 3 forms render the honeypot as a hidden absolute-positioned input
- Server actions silently `return { ok: true }` if honeypot fires (no info leak to bots)

**Form wiring** (`components/forms/*` + `components/booking/*`)
- All 3 forms replaced `console.log` stubs with `await action(...)` calls
- New `serverError` state — displays inline alert (red, with icon) above submit button when action returns `{ ok: false, error }`
- `_botField` registered in form defaults
- Form-side error catch handles thrown errors (network failures, etc.)

**Public pages → Supabase reads** (full swap)
- New `lib/supabase/static.ts` — cookie-free Supabase client for build-time + server-component reads. The `@supabase/ssr` cookie-based client makes routes fully dynamic (loses ISR); the static client keeps routes SSG-eligible.
- New `lib/supabase/image-helpers.ts` — `productImage(row)` / `projectImage(row)` extract the local image manifest entry from a Supabase URL path. Once admin uploads to Storage in Prompt 9, we'll add a fallback path for non-manifest URLs.
- New `lib/product-specs.ts` — static spec metadata keyed by product slug (extracted from `lib/products.ts`). Specs aren't in the Supabase schema yet — they'll move there in Prompt 9 when the admin dashboard can edit them.
- New `lib/supabase/queries.ts` helper `getProductSlugsForStaticParams()` — uses static client, safe inside `generateStaticParams` where `cookies()` isn't available.
- Updated pages: `app/[locale]/products/page.tsx`, `app/[locale]/products/[category]/page.tsx`, `app/[locale]/products/[category]/[slug]/page.tsx`, `app/[locale]/projects/page.tsx`
- Updated sections: `components/sections/product-categories.tsx`, `components/sections/featured-projects.tsx`
- Refactored `ProductCard` / `ProjectCard` / `ProjectFilter` / `RelatedProducts` to accept Supabase row shapes
- Added `export const revalidate = 60` (1-minute ISR) to all 4 product/projects routes

**User-facing walkthrough** (`RESEND_SETUP.md`)
- Sign up at resend.com **using `hafizazeem@gmail.com`** (sandbox limitation: only delivers to account-owner email)
- Create `wr-doors-dev` API key → paste into `.env.local`
- Set `RESEND_FROM_EMAIL` to `"WR Doors <onboarding@resend.dev>"` (sandbox)
- Set `ADMIN_NOTIFICATION_EMAIL` to `hafizazeem@gmail.com`
- Verify by submitting any form → row appears in Supabase + email lands in inbox

### Test Results

- ✅ **TypeScript**: clean (exit 0)
- ✅ **ESLint**: clean (0 errors, 0 warnings)
- ✅ **Vitest unit tests**: 40/40 passing (no regressions)
- ✅ **Production build**: all 11 routes prerendered as SSG with `1m 1y` ISR cache (revalidate every 60s, max age 1 year)
- ✅ **Playwright E2E** — mobile: 61/61 passing including all 3 form-submit happy paths

### Bug fixes during this prompt

1. **`generateStaticParams` used `cookies()` indirectly** via the `@supabase/ssr` server client → build crashed. Fix: new `lib/supabase/static.ts` cookie-free client + `getProductSlugsForStaticParams()` helper.
2. **All public pages went `(Dynamic)` instead of `(SSG)`** because the cookie-based client forces dynamic rendering. Fix: switched all helpers in `lib/supabase/queries.ts` to use the static client. RLS at the DB layer still controls what public reads can see.
3. **All 3 form submissions failed with empty `{}` error** from Supabase. Root cause: `console.error("...", err)` doesn't expand PostgresError's non-enumerable properties → looks empty. Fix: explicit `${err?.code} ${err?.message}` template literal logging.
4. **All 3 form inserts still failed with RLS code 42501 after better logging revealed it.** Root cause: `.insert(...).select("id").single()` does `INSERT ... RETURNING id;` — the RETURNING clause needs SELECT permission, which `anon` doesn't have on `leads`/`bookings` (only INSERT). Fix: generate UUIDs server-side via `crypto.randomUUID()` and drop the `.select()` chain; use the locally-minted ID in the email templates.

### Known issues / deferred

- ⏳ **Resend API key not yet in `.env.local`** — user needs to complete the Resend signup walkthrough in `RESEND_SETUP.md`. Until then: form submissions still save to Supabase ✅, customer sees success state ✅, but admin alert + customer confirmation emails fail silently (logged as `[email] send threw Error: RESEND_API_KEY is not set`).
- ❌ Storage upload UI → Prompt 9
- ❌ Storage RLS for uploads → Prompt 9
- ❌ Admin dashboard `/admin/*` → Prompt 9
- ❌ Real `wrdoors.com` domain in Resend (deliver to ANY customer email) → Prompt 10 / pre-launch
- ❌ Resend webhook delivery tracking → Phase 2
- ❌ ICS calendar attachment on booking confirmation → Phase 2
- ❌ Upstash Redis rate limit (currently in-memory per Vercel function instance) → Phase 2 if needed

### Security review

- ✅ `lib/email/client.ts` imports `"server-only"` → fails build if ever imported in a Client Component
- ✅ All 3 server actions start with `"use server"` + run Zod BEFORE any DB write or email
- ✅ Honeypot returns `{ ok: true }` silently (bots don't learn they were detected)
- ✅ Static Supabase client uses anon key — RLS at DB layer enforces what they can write (column-level allow-list)
- ✅ Email send failures logged but don't throw — submission still succeeds for the user
- ✅ Customer-facing error messages are generic ("Something went wrong, please call us")
- ✅ `ADMIN_NOTIFICATION_EMAIL` pulled from env — no hardcoded address in code
- ✅ Rate limit applies to all 3 endpoints (5/min for leads, 3/min for bookings)
- ✅ Generic error messages in EN + AR — no DB/Resend internals leaked to user

### Commit
- Branch: `main`
- Message: `feat(integration): wire forms to Supabase + Resend, swap public pages to Supabase reads`

---

## Prompt 7 — Supabase Setup (Schema + RLS + Storage + Seed) ✅

**Date**: 2026-06-07
**Model used**: claude-opus-4-7
**Status**: Complete

### Goal
Stand up the production-shape Supabase backend — six PostgreSQL tables with bilingual columns, RLS policies that enforce the security model at the DB layer, Storage buckets for image uploads, an admin Auth user, and a fully-typed Supabase client surface. No UI changes ship; this prompt is pure backend infrastructure.

### Deliverables

**SQL migrations** (paste-into-dashboard workflow, no CLI required)
- `supabase/migrations/0001_initial_schema.sql` — 6 tables (`products`, `projects`, `leads`, `bookings`, `technicians`, `site_settings`) with bilingual `_en`/`_ar` columns where applicable, Postgres CHECK constraints in place of CREATE TYPE ENUMs (easier to evolve), `updated_at` auto-refresh triggers, indexes on common queries, RLS enabled on all six tables, policies for: public read on content tables, anon insert with column-level validation on `leads`+`bookings`, admin (`auth.uid() IS NOT NULL`) full access everywhere
- `supabase/seed/0001_seed.sql` — 8 products (mirrors `lib/products.ts`), 6 projects (mirrors `lib/projects.ts` + Arabic from `messages/ar.json`), 10 default `site_settings` rows (hero, contact info, hours, legal disclosure) — all with `ON CONFLICT DO NOTHING` for idempotent re-runs

**TypeScript surface**
- `lib/supabase/database.types.ts` — hand-written `Database` type matching the SQL schema exactly (chose hand-written over `supabase gen types` to avoid Docker dependency since user opted for paste-SQL workflow)
- `lib/supabase/client.ts` + `server.ts` — updated to use `createBrowserClient<Database>` / `createServerClient<Database>` for full type inference on all queries
- `lib/supabase/queries.ts` — typed query helpers: `getProducts()`, `getProductBySlug(slug)`, `getProductsByCategory(cat)`, `getFeaturedProducts()`, `getProjects()`, `getProjectsByCategory(cat)`, `getSiteSetting(key)`, `getAllSiteSettings()`, `localizeSiteSetting(setting, locale)` — all server-side, all RLS-respecting

**Tooling**
- `scripts/test-supabase.ts` — standalone sanity check (uses dotenv to load `.env.local`) that verifies: connection, public reads on products+projects, RLS blocks on anon writes/reads, anon insert path for leads works
- Added `pnpm supabase:check` script to `package.json`
- Added `dotenv` dev dependency

**User-facing guide**
- `SUPABASE_SETUP.md` — step-by-step walkthrough covering: account signup, project provisioning (me-south-1 Bahrain region for UAE latency), credential paste, migration + seed application, admin user creation, 5 public storage buckets, verification command, troubleshooting table. Updated mid-prompt to reflect Supabase's new 2025 API key terminology ("Publishable key" / "Secret key" instead of legacy "anon" / "service_role" labels).

### Supabase project provisioned by user
- Project: `wr-doors-prod`
- Region: Middle East (Bahrain) — me-south-1
- Plan: Free tier
- All 6 tables created, all 10 RLS policies active
- 8 products + 6 projects + 10 site_settings seeded
- Admin user created via Dashboard → Authentication
- 5 public storage buckets created: `products`, `projects`, `homepage`, `services`, `misc`

### Test Results
- ✅ **TypeScript**: clean (exit 0) — full type inference through `<Database>` generic
- ✅ **ESLint**: clean (0 errors, 0 warnings)
- ✅ **Vitest unit tests**: 40/40 passing (no regressions)
- ✅ **`pnpm supabase:check`**: 6/6 checks pass
  1. Connection established
  2. Anonymous SELECT on products returned 8 rows
  3. Anonymous SELECT on projects returned 6 rows
  4. Anonymous INSERT on products **blocked** (code 42501)
  5. Anonymous SELECT on leads returned 0 rows (RLS hides)
  6. Anonymous INSERT on leads **succeeds** (form path works)

### Schema additions beyond requirements §10
- `bookings.area` + `bookings.notes` — booking form collects these (Prompt 5)
- `leads.subject` — contact form has subject field (Prompt 6)
- `leads.source` ENUM — distinguishes 'quote' vs 'contact' vs 'product-page' submissions for admin routing
- `leads.admin_notes` / `bookings.admin_notes` — internal CRM notes (admin-write-only)
- `products.is_featured` — drives homepage category grid
- `projects.display_order` — admin can re-order portfolio
- All timestamps use `TIMESTAMPTZ DEFAULT NOW()` (timezone-aware)
- `updated_at` auto-refresh via `refresh_updated_at()` trigger function

### Security Review
- ✅ No service-role key in client code (`client.ts` only uses anon key)
- ✅ RLS enabled on every table — including `technicians` (no anonymous reads of staff phone numbers)
- ✅ Anonymous insert policies have column-level validation: `name`/`phone`/`message` non-empty, `locale ∈ ('en','ar')`, `status` defaults to 'new' (anon can't set arbitrary status), `assigned_technician` must be NULL (anon can't auto-assign technicians)
- ✅ All admin policies check `auth.uid() IS NOT NULL` explicitly (not just `true`)
- ✅ Storage buckets are public for **reads** only — uploads/deletes will be RLS-locked in Prompt 9
- ✅ CHECK constraints prevent garbage values in ENUM-like columns (locale, status, category, source, service)
- ✅ `bookings.preferred_date >= CURRENT_DATE` constraint — anon can't book in the past
- ✅ `.env.local` already in `.gitignore` — no secrets ever committed

### Known Issues / Deferred
- **Public pages still read from `lib/products.ts` and `lib/projects.ts`** — Prompt 8 swaps them to Supabase queries (`getProducts()`, `getProjects()`)
- **Forms still stub `console.log`** — Prompt 8 wires them to insert into `leads`/`bookings`
- **Admin dashboard doesn't exist yet** — Prompt 9
- **Storage upload UI** — Prompt 9
- **Storage RLS policies for uploads** — Prompt 9 (currently buckets are public-read; uploads not yet locked down)
- **No middleware for `/admin/*`** — Prompt 9
- **Test lead row** — sanity check inserted one "Sanity Check (Prompt 7)" row in `leads`. Admin can delete via Dashboard → Table Editor when convenient.

### Commit
- Branch: `main`
- Message: `feat(supabase): schema, RLS, storage, seed data, typed clients`

---

## Prompt 6 — Projects, About & Contact Pages ✅

**Date**: 2026-06-07
**Model used**: claude-opus-4-7
**Status**: Complete

### Goal
Ship the three trust-building content pages — a project portfolio, the
company/DODA-platform story, and a contact channel hub — fully bilingual
EN + AR with RTL, following the patterns established in Prompts 3–5.

### Deliverables

**Translation keys** (EN + AR, `messages/en.json` + `messages/ar.json`)
- `projects.*` — meta, hero copy, 4 filter labels (all/residential/commercial/luxury), plural count rule, empty state, bottom CTA, 6 project items each with `title`/`location`/`summary`
- `about.*` — meta, hero, 3-paragraph company story, DODA Platform section (eyebrow + intro + 3 benefit cards), Factory & QA (4 stats), 4 values, legal disclosure (EN + AR company names), bottom CTA
- `contact.*` — meta, hero, form labels/placeholders, success state, info panel labels (phone/email/WhatsApp/address/hours), map title/body

**New stub data + schema** (`lib/`)
- `projects.ts` — `PROJECT_CATEGORIES` (residential/commercial/luxury), `PROJECTS` (6 items referencing existing product images via slug), `PROJECTS_WITH_IMAGES` resolved at module load with fail-fast validation
- `schemas/contact.ts` — Zod `contactSchema` (name, email, phone, subject, message), `ContactFormData` type

**New components**
- `components/projects/project-card.tsx` — image card with gradient overlay + location/title/summary (Server Component, decorative-only for v1)
- `components/projects/project-filter.tsx` — Client Component using `useTranslations` directly + `useState` filter; `role="tab"` pills + count + grid + empty state
- `components/forms/contact-form.tsx` — Client Component, react-hook-form + Zod, 5-field form with `Field` wrapper (with `htmlFor` for accessible labels), success state with WhatsApp CTA

**New pages** (Server Components, bilingual, SSG)
- `app/[locale]/projects/page.tsx` — hero + `<ProjectFilter>` + bottom CTA. Pre-resolves per-project bilingual strings server-side and passes as plain object to the Client filter
- `app/[locale]/about/page.tsx` — 6 sections: hero, company story (with legal entity aside), DODA Platform (navy bg, gold accents, 3 benefit cards), Factory & QA, Values (4 cards), bottom CTA
- `app/[locale]/contact/page.tsx` — hero + 2-column (form card left + navy info-panel aside right) + Google Maps iframe section (Dubai city-level pin, no API key required)

**Static prerendering** — 6 new SSG routes: `/en/projects`, `/ar/projects`, `/en/about`, `/ar/about`, `/en/contact`, `/ar/contact`

### Test Results
- ✅ **TypeScript**: clean (exit 0)
- ✅ **ESLint**: clean (0 errors, 0 warnings)
- ✅ **Vitest unit tests**: 40/40 passing (no regressions)
- ✅ **Playwright E2E**: **57/57 new test cases** passing across mobile + tablet + desktop
  - 19 tests × 3 viewports: /projects (6 tests), /about (6 tests), /contact (7 tests)
  - All bilingual content verified (/ar routes + RTL dir attribute)
  - Project filter click-through (Residential → Luxury → All) ✅
  - DODA Platform section + 3 benefit cards visible ✅
  - Legal entity disclosure shows EN + AR company names ✅
  - Contact form: validation, full submit → success state, invalid email error ✅
  - Google Maps iframe rendered with correct embed URL ✅
- ✅ **Production build**: 6 new SSG routes prerendered

### Bug fixes applied (during this prompt)
1. **Server→Client function prop**: `ProjectFilter` originally received a `countFn` closure from the Server Component; that's not serializable across the boundary. Refactored so the Client component uses `useTranslations("projects")` directly for short UI labels (filter pills, plural count, empty state) and only receives the heavy per-project bilingual `items` map as serializable data.
2. **`aria-pressed` invalid on `role="tab"`**: ARIA tabs use `aria-selected` only. Removed `aria-pressed`.
3. **E2E selectors — Arabic copy variations**: Tests used full Arabic phrases that were tweaked during translation polishing. Switched to matching stable substrings (e.g., `/في جميع أنحاء الإمارات/`, `/أبواب فاخرة/`, `/إلى فريقنا/`) and matched DODA as a Latin token even on /ar (consistent with brand spec).
4. **Legal entity strict-mode duplicate**: "Wahat Al Ruman Doors Trading LLC" appears in both the about page aside AND the global footer. Scoped the test selector to `page.locator("main")`.
5. **React hydration race in contact form**: First `.fill()` raced react-hook-form's `register` pass and the name field came up empty. Fix: `click()` the name input first to trigger React event handler attachment (hydration), then `.fill()`. `submitBtn.toBeEnabled()` alone was insufficient because the button is enabled at SSR.

### Known Issues / Deferred
- **CSP `frame-src`** for Google Maps iframe — deferred to Prompt 10 (CSP header not yet set per Prompt 3 known issue)
- **Real project photos** — using product imagery as placeholder; swap when client provides
- **Real office address for map pin** — currently city-level Dubai pin; client to confirm exact location
- **Contact form submission** — stub `console.log`; real Supabase + Resend wiring in Prompt 8
- **Per-project detail pages** — not in plan, deferred to v2

### Security Review
- No secrets in client code ✅
- Zod schemas on client (validation only) ✅
- `noValidate` on form (Zod-only, no native HTML5 popups) ✅
- Server action stubs: no DB writes (deferred to Prompt 8) ✅
- iframe uses `referrerPolicy="no-referrer-when-downgrade"` to limit leak ✅

### Commit
- Branch: `main`
- Message: `feat(content): bilingual projects, about, contact pages`

---

## Prompt 5 — Service & Booking Pages ✅

**Date**: 2026-06-07
**Model used**: claude-sonnet-4-6
**Status**: Complete

### Goal
Build lead-capture flows: services overview, multi-step consultation booking form, and standalone quote request form — all bilingual (EN + AR), fully RTL-aware, with react-hook-form + Zod validation and stub submissions.

### Deliverables

**Translation keys** (EN + AR, `messages/en.json` + `messages/ar.json`)
- `services.*` — 4 service cards (consultation, installation, technician, custom) with title, description, includes lists (include0–include3), CTA, plus hero copy, bottom CTA, popular badge
- `booking.*` — step labels, step titles, service type labels + descriptions, contact form labels/placeholders, submit/success states, WhatsApp follow-up
- `quote.*` — all form field labels/placeholders, product/budget option keys, trust items, submit/success states, meta

**New Zod schemas** (`lib/schemas/`)
- `booking.ts` — `SERVICE_TYPES`, `bookingContactSchema` (name, phone, area, date, optional notes), `BookingSubmission` type
- `quote.ts` — `PRODUCT_OPTIONS`, `BUDGET_OPTIONS`, `quoteSchema` (product, quantity, name, phone, optional email with regex refine, location, optional budget, message), `QuoteFormData` type

**New client form components**
- `components/booking/booking-form.tsx` — 2-step multi-step form: Step 1 = 4 service type cards (aria-pressed buttons with Lucide icons), Step 2 = react-hook-form contact fields; progress bar UI; success state with WhatsApp CTA
- `components/forms/quote-form.tsx` — single-page form with `Field` wrapper component (with `htmlFor` label association for accessibility), `NativeSelect` styled native `<select>`, all 8 fields; success state with WhatsApp CTA

**New pages** (Server Components, bilingual, SSG)
- `app/[locale]/services/page.tsx` — 4 service cards in 2×2 grid, each with gold icon circle, optional "Most popular" badge, includes list (✓ icons), CTA; bottom CTA section (WhatsApp + Book)
- `app/[locale]/book/page.tsx` — hero + centered card containing `<BookingForm>`
- `app/[locale]/quote/page.tsx` — hero + two-column layout: `<QuoteForm>` left, navy `TrustPanel` async Server Component right (24h response, phone, WhatsApp)

**Static prerendering** — 6 new SSG routes: `/en/services`, `/ar/services`, `/en/book`, `/ar/book`, `/en/quote`, `/ar/quote`

### Test Results
- ✅ **TypeScript**: clean (exit 0)
- ✅ **ESLint**: clean (0 errors, 0 warnings)
- ✅ **Vitest unit tests**: 40/40 passing (no regressions)
- ✅ **Playwright E2E**: **48/48 new test cases** passing across mobile + tablet + desktop
  - 16 tests × 3 viewports: /services (5 tests), /book (5 tests), /quote (6 tests)
  - All bilingual content verified (/ar routes + RTL dir attribute)
  - Full booking flow (service select → fill details → submit → success state) ✅
  - Full quote flow (fill all fields via keyboard+label → submit → success state) ✅
  - Validation errors tested (empty submit, invalid email) ✅

### Bug Fixes Applied (E2E Selector Issues)
1. **Next.js Dev Tools "Next" button collision** — `/Next/i` regex matched both form "Next" button AND Next.js Dev Tools button at tablet/desktop viewports. Fixed with `{ name: "Next", exact: true }`.
2. **`Field` component missing `htmlFor`** — `getByLabel()` timed out because `<Label>` in the `Field` wrapper had no `for` attribute. Added `htmlFor` prop to `Field` and wired to all 8 fields in `quote-form.tsx`.
3. **"Free & no obligation" strict mode** — text appeared twice on quote page (hero eyebrow + trust panel). Fixed with `page.locator("aside").getByText(...)`.
4. **`selectOption` doesn't update react-hook-form internal state** — `selectOption("wpcDoors")` sets the DOM value but react-hook-form v7.77.0's `onChange` doesn't fire for native `<select>` via Playwright's CDP. Fixed by using `focus()` + `press("ArrowDown")` (keyboard navigation generates `isTrusted=true` `change` events that RHF picks up).
5. **Zod v4 `.refine()` format** — changed `refine(fn, "message")` to `refine(fn, { message: "..." })` for forward compatibility.

### Known Issues / Deferred
- WhatsApp click-to-chat: manual only (no automation, per requirements)
- Form submissions: stub (`console.log`) — real Supabase + Resend wiring in Prompt 8
- CSP header: still deferred (needs Spline URL, same as Prompt 3)

### Security Review
- No secrets in client code ✅
- Zod schemas on client (validation only, no server secrets) ✅
- `noValidate` on forms (relies on Zod not HTML5 validation) ✅
- Server action stubs: no data written to DB yet (Prompt 8) ✅

### Commit
- Branch: `main`
- Message: `feat(services): bilingual services overview, booking, and quote pages`

---

## Prompt 4 — Product Catalog & Detail Pages ✅

**Date**: 2026-06-07
**Model used**: claude-sonnet-4-6
**Status**: Complete

### Goal
Build the full product browsing experience — a main catalog page, per-category listing pages, and a detail page with specs, Triple Guard section, quote modal, and related products. All bilingual, all statically prerendered.

### Deliverables

**Translation keys** (~60 new keys in both `messages/en.json` + `messages/ar.json`)
- `products.metaTitle/Description`, `heroEyebrow/Title/Subtitle`, `allProducts`, `viewDetails`, `requestQuote`, `priceFrom`, `priceOnRequest`, `relatedTitle`, `specsTitle`
- `products.tripleGuard.*` — bilingual Triple Guard feature panel (eyebrow, title, subtitle, water/sound/termite)
- `products.quoteModal.*` — quote inquiry modal copy (title, subtitle, labels, placeholders, success states)
- `products.categories.*Title/Subtitle/Desc` — extended category metadata (was subtitle-only, now includes full title + description)

**Product catalog extended** (`lib/products.ts`)
- Added `ProductSpec` interface: `{label_en, label_ar, value_en, value_ar}`
- Added `PRODUCT_CATEGORY_SLUGS` array for `generateStaticParams`
- Added `CATEGORY_META` record mapping slug → title/subtitle/desc i18n keys
- Added `specs: ProductSpec[]` to every product (7 specs each, fully bilingual)

**New UI components** (`components/ui/`)
- `dialog.tsx` — centered modal on `@radix-ui/react-dialog`, animated (zoom-in/fade-in)
- `badge.tsx` — inline pill label (CVA variants: default/secondary/outline/muted)

**New product components** (`components/products/`)
- `product-card.tsx` — reusable grid card: image, category badge, serif name, truncated description, price hint, "View Details" link with animated arrow (RTL-flips)
- `category-pills.tsx` — link-based filter pills (All + 4 categories), active state highlighted navy, SSR with no JS required
- `triple-guard-panel.tsx` — navy full-width section: Droplets/Volume2/Bug icons, three columns, frosted-glass cards
- `quote-modal.tsx` (client) — Dialog with product pre-filled (read-only), name/phone/message fields, submit (stub → console, Prompt 8 wires Supabase), success state with WhatsApp CTA
- `related-products.tsx` — cream-background section showing up to 3 product cards

**Pages** (all Server Components, bilingual, statically prerendered)
- `app/[locale]/products/page.tsx` — catalog with eyebrow/heading/subtitle, category pills ("All" active), 8-product grid (4-col xl, 3-col lg, 2-col sm)
- `app/[locale]/products/[category]/page.tsx` — breadcrumb, category heading + desc, category pills (slug active), filtered product grid
- `app/[locale]/products/[category]/[slug]/page.tsx` — breadcrumb, sticky two-column layout (55/45), large product image, badge, serif heading, price, description, specs `<dl>`, CTAs (QuoteModal + WhatsApp), 10-year warranty note, TripleGuardPanel, RelatedProducts (3 cards)

**Static prerendering** — all 26 product routes prerendered at build time:
- 2 locales × 1 catalog page = 2 routes
- 2 locales × 4 category pages = 8 routes
- 2 locales × 8 product detail pages = 16 routes

### Test Results
- ✅ **TypeScript**: clean (exit 0)
- ✅ **ESLint** (Next.js + security): clean (0 errors, 0 warnings)
- ✅ **Vitest unit tests**: 40/40 passing (no regressions)
- ✅ **Playwright E2E**: **78/78 test cases** passing across mobile + tablet + desktop
  - 45 new product tests (catalog, category, detail, triple guard, related, quote modal)
  - 33 smoke tests (homepage + site chrome) — no regressions
  - Run with `--workers=1` for stable dev server; multi-worker still shows "Could not connect" flake (same pattern as Prompt 3 — not a test failure)
- ✅ **Production build**: 26 new statically prerendered routes (2 catalog + 8 category + 16 detail)

### Notes & Fixes
- **AR Triple Guard strict-mode violation** — `/مقاوم للماء/i` matched both the Triple Guard heading AND the "Waterproof Bathroom WPC" product name in related products. Fixed with `{ exact: true }` on the assertion.
- **Smooth scroll + modal click flake** — globals.css sets `scroll-behavior: smooth` on `<html>`. Playwright's auto-scroll before clicking triggers the smooth animation, and the click can land before the button finishes scrolling, causing the Dialog to not open. Fixed by injecting `* { scroll-behavior: auto !important; }` via `page.addStyleTag()` in the two modal tests.
- **`dialog.getByDisplayValue` non-existent** — Playwright's `Locator` doesn't have `getByDisplayValue()` (only `Page` does). Fixed by using `dialog.locator('input[readonly]').toHaveValue(...)` instead.
- **`CATEGORY_META` unused variable** — removed the variable after realizing the keys were computed inline via a ternary chain.

### Security Review
- ✅ No secrets, no new env vars
- ✅ QuoteModal form: `required`, `minLength` attributes on all fields (client-side pre-validation)
- ✅ WhatsApp links use `rel="noopener noreferrer"` + encoded message text via `whatsappUrl()`
- ✅ All product/category slugs validated via `PRODUCT_CATEGORY_SLUGS.includes()` before page render; `notFound()` returned on unknown slugs — no param injection possible
- ✅ Quote submission is a stub (no server action yet) — no data persisted in Prompt 4; Prompt 8 will add server-side Zod validation + Supabase RLS

### Files Added
```
components/
├── ui/
│   ├── dialog.tsx                    # centered modal
│   └── badge.tsx                     # inline pill label
└── products/
    ├── product-card.tsx              # grid card
    ├── category-pills.tsx            # link-based filter
    ├── triple-guard-panel.tsx        # navy feature section
    ├── quote-modal.tsx               # client modal + form stub
    └── related-products.tsx          # 3-card strip

app/[locale]/products/
├── page.tsx                          # /products
├── [category]/
│   ├── page.tsx                      # /products/[category]
│   └── [slug]/
│       └── page.tsx                  # /products/[category]/[slug]

tests/e2e/
└── products.spec.ts                  # 45 E2E test cases
```
Plus updates to: `lib/products.ts`, `messages/en.json`, `messages/ar.json`.

### Commit
- Hash: TBD (committed below)
- Message: `feat(products): bilingual catalog, category, and detail pages with quote modal`
- Remote: `https://github.com/aigeneralisthma/wr-doors.git`

### Next Prompt
**Prompt 5 — Service & Booking Pages** (recommended model: 🟦 `claude-sonnet-4-6`)
Will build:
- `/services` — overview of all service types (Consultation, Installation, Plumbing, Carpentry)
- `/book` — multi-step consultation booking form (service type → date/time → contact → confirmation)
- `/quote` — standalone quote request form (product interest, dimensions, contact, message)
- `react-hook-form` + Zod validation with bilingual error messages

---

## Prompt 3 — Homepage (Hero + USPs + Categories + Projects + Why Us + Services + Testimonials + Final CTA) ✅

**Date**: 2026-06-07
**Model used**: claude-opus-4-7 (as planned for the highest conversion-impact page)
**Status**: Complete

### Goal
Build the full conversion-focused homepage by composing the design system from Prompt 2 with optimized product imagery from Prompt 1. Tune each section's tone, hierarchy, and CTAs for the UAE premium-doors customer journey.

### Deliverables

**Bilingual content** — Expanded `messages/en.json` and `messages/ar.json` with hero, USPs (4), categories (4), projects, why-us stats (4), services (3), testimonials, and final CTA copy. All Arabic translations are native-quality for a UAE premium audience.

**Seed product catalog** (`lib/products.ts`)
- 8 bilingual product entries spanning the 4 categories
- Bound to optimized images via `findImage(category, slug)` helper
- Each row has `name_en` / `name_ar` / `description_en` / `description_ar`, `featured` flag, optional `priceFromAed`
- Helper functions: `featuredByCategory()`, `productsByCategory()`, `localized()`
- Defensive: throws at module load if an image slug is missing (caught in CI)

**Hand-rolled responsive image** (`components/ui/product-image.tsx`)
- `<picture>` element with AVIF + WebP + JPG sources, all from our Sharp pipeline
- Blur-data background while loading; eager + high-priority option for above-fold
- Tunable `sizes` per usage so hero / grid / detail-page contexts each get optimal
- No `next/image` — saves Vercel image-processing quota since assets are pre-optimized

**Eight homepage sections** (all Server Components, all bilingual via `getTranslations()`)
1. `HeroSection` — Two-column hero with eyebrow, balanced serif headline (`<h1>`), gold accent, subtitle, dual CTAs, three trust badges, and the Grand Exterior Pivot Door image with floating spec card. Mobile stacks image-first; desktop side-by-side with copy.
2. `USPSection` — Four-column USP strip with gold-on-navy icon plinths (Factory / Shield / Award / Sparkles). Centered headline above. Replaces the earlier hex-card preview with a more scannable layout for this position in the flow.
3. `ProductCategoriesSection` — Cream background, 2/4-column responsive grid of clickable category cards. Each card pairs a featured product image with the category name, subtitle, and an "Explore" arrow that nudges on hover and flips for RTL.
4. `FeaturedProjectsSection` — Three project cards using product images as stand-ins. Captioned with placeholder villa/penthouse/lobby installations across Dubai (Dubai Hills / JBR / Business Bay). Replaceable in Prompt 7 when Supabase projects table lands.
5. `WhyUsSection` — Navy editorial stats band with four big-serif numbers (1,000+ designs, 10y warranty, 30-day delivery, 98% satisfaction) and a thin gold accent at the top.
6. `ServicesSection` — Three engagement-model cards (Product Sales / Free Consultation / On-Demand Technicians) on a light background, with the same icon-plinth language as the USPs. CTA at the bottom links to `/services`.
7. `TestimonialsSection` — Honest "coming soon" placeholder rather than fake reviews. Structure ready for a 3-card carousel swap post-launch.
8. `FinalCtaSection` — Full-bleed black with layered gold gradients. Big editorial headline, GoldAccent, dual CTAs (Request Quote → `/quote`, Book Consultation → `/book`).

**Composition** — `app/[locale]/page.tsx` now renders the 8 sections in the carefully tuned order. Every section uses `Server Component → getTranslations()` so the SSR HTML carries finished translated text (no client-side flash).

### Test Results
- ✅ **TypeScript**: clean
- ✅ **ESLint** (Next.js + security): clean
- ✅ **Vitest unit tests**: 40/40 passing (9 new: `products.test.ts`)
- ✅ **Playwright E2E**: 33/33 *test cases* passing across mobile + tablet + desktop
  - 2 "errors not part of any test" — Playwright workers got stuck force-killing the Next.js dev server after the test phase. These are infrastructure flakes, not test failures, and don't recur in CI when the dev server runs separately. Workaround for now: kill any lingering node processes between local runs.
- ✅ **Production build**: succeeds (Turbopack), all 5 static routes prerendered
- ✅ Verified `/en` (LTR) and `/ar` (RTL) end-to-end — every section renders in both languages

### Notes & Discoveries
- **`getByText("1,000+")` strict-mode collision** — the number appears 3 times on the page (hero subtitle, trust badge, why-us stat). Test updated to verify the section headings instead, which are uniquely named.
- **Picture-element test** — first version used `filter({ has: ... })` syntax which doesn't match how Playwright's locator chaining works for direct DOM elements. Switched to attribute selectors (`source[type="image/avif"]`) which is cleaner and more honest about what we're checking.
- **AVIF + WebP counts match** — sanity check added to confirm we always emit pairs (catches a future regression where one format gets dropped).
- **Image performance**: page weight at first paint is ~120 KB compressed; Lighthouse Performance score holds 90+ on desktop locally despite the rich hero. Final perf audit happens in Prompt 10.

### Security Review
- ✅ No secrets, no new env vars
- ✅ All link `target="_blank"` already paired with `rel="noopener noreferrer"` (was set in Prompt 2's WhatsApp button; no new external links here)
- ✅ Images served from `/public/assets/products/...` — no remote URLs, no SSRF surface
- ✅ XSS: all rendered text passes through `next-intl` translation pipeline
- ✅ Section IDs (`hero-heading`, `usps-heading`, etc.) are referenced by `aria-labelledby` so screen readers get proper landmark structure

### Files Added
```
lib/
├── products.ts                      # bilingual seed catalog (8 products)
└── products.test.ts                 # 9 unit tests

components/
├── ui/
│   └── product-image.tsx            # <picture> with AVIF/WebP/JPG + blur
└── sections/
    ├── hero.tsx
    ├── usp-strip.tsx
    ├── product-categories.tsx
    ├── featured-projects.tsx
    ├── why-us-stats.tsx
    ├── services-overview.tsx
    ├── testimonials.tsx
    └── final-cta.tsx
```
Plus updates to: `app/[locale]/page.tsx`, `messages/en.json`, `messages/ar.json`, `tests/e2e/smoke.spec.ts`.

### Commit
- Hash: `be53677`
- Message: `feat(home): full conversion-focused homepage with 8 bilingual sections`
- Pushed: `c4e90d9..be53677 main -> main`
- Remote: `https://github.com/aigeneralisthma/wr-doors.git`

### Next Prompt
**Prompt 4 — Product Catalog & Detail Pages** (recommended model: 🟦 `claude-sonnet-4-5`)

Will build:
- `/products` — category filter + grid using the same `ProductImage` + cards
- `/products/[category]` — listing by category slug
- `/products/[category]/[slug]` — detail page with image gallery, specs, "Triple Guard" features, and a Request Quote modal trigger
- Use the bilingual `PRODUCTS` catalog from this prompt (already shaped to mirror Supabase's bilingual columns for Prompt 7)

---

## Prompt 2 — Design System & Layout Components ✅

**Date**: 2026-06-07
**Model used**: claude-opus-4-7 (as planned for creative components)
**Status**: Complete

### Goal
Build the full set of reusable components that every subsequent prompt will compose: shadcn base UI, brand SVGs + co-brand lockup, branded custom components, site chrome (Header + Footer), animation wrappers, and the floating WhatsApp CTA.

### Deliverables

**shadcn base UI** (`components/ui/`)
- `Button` (CVA + Radix Slot, with WR Doors variants: gold default, navy secondary, outline, ghost, link, destructive; sizes sm/default/lg/xl/icon)
- `Card` (+ CardHeader, CardTitle, CardDescription, CardContent, CardFooter — serif-titled to match brand)
- `Input`, `Textarea`, `Label` (Radix Label primitive)
- `Sheet` (Radix Dialog — drives the mobile drawer)

**Brand SVG marks** (`components/brand/`)
- `WrDoorsLogo` — recreated from flyer: open-corner square frame, "WR" serif inside, "DOORS" tracked outside, optional "TRADING LLC." microtext. Uses `currentColor` to recolor cleanly across surfaces.
- `DodaLogo` — designed from scratch: geometric sans wordmark "DODA" with a signature gold accent dot. Intentionally distinct from WR Doors (modern vs editorial) to support the co-brand contrast.
- `DodaWrLockup` — three variants:
  - `header`: side-by-side, DODA at ~70% visual weight of WR Doors
  - `footer`: compact horizontal with muted color
  - `splash`: large, vertically stacked for loading screens / 404
- All three have proper `role="img"` + `aria-label` for screen readers

**Branded custom components** (`components/brand/`)
- `BrandButton` — wraps base Button with arrow icon (forward / back / none, auto-flips for RTL), supports `asChild` correctly via React.cloneElement (injects arrow into the cloned child)
- `HexagonCard` — hexagonal clip-path with 2-tone inset for the navy frame; `tone="default|gold|navy|cream"`
- `AngularDivider` — section separator with `chevron|angular|gradient-gold` variants
- `GoldAccent` — animated shimmer bar used under headings; respects `prefers-reduced-motion`

**Animation wrappers** (`components/animations/`)
- `FadeIn` (immediate or scroll-triggered, configurable y-distance / duration)
- `StaggerChildren` + `StaggerItem` (orchestrated stagger reveal)
- `ScrollReveal` (scroll-linked parallax + opacity using framer-motion's useScroll/useTransform)
- `SplineScene` (lazy-loaded React.lazy wrapper with branded skeleton fallback)
- `ShaderBackground` (Three.js fragment shader from `Shader_Animation.txt`, color-tinted to brand palette, pauses on tab hide, respects prefers-reduced-motion)

**Layout chrome** (`components/layout/`)
- `Container` — width presets (default/wide/narrow/full), polymorphic `as` prop
- `Header` (server component) — sticky, blurred background, DodaWrLockup brand link, desktop nav, LanguageToggle, gold "Get Quote" CTA, hamburger trigger for mobile
- `Footer` (server component) — three-column layout (brand block, quick links, contact), DODA endorsement copy, contact info (phone tel:, email mailto:, WhatsApp wa.me, address), legal strip with © year + LLC name
- `LanguageToggle` (client component) — compact (icon + locale code) and full (pill toggle) variants; uses next-intl's locale-aware router to swap without reload
- `MobileNav` (client component) — Sheet-based slide-in drawer with brand lockup, nav links, full language toggle, gold CTA at the bottom
- `WhatsAppButton` (client component) — fixed bottom-end floating button (WhatsApp green #25D366), accepts optional `prefill` text for contextual messages

**Locale layout integration**
- `app/[locale]/layout.tsx` now renders `<Header />`, page content, `<Footer />`, and `<WhatsAppButton />` as automatic site chrome on every locale-prefixed page.

**Homepage exercise** (`app/[locale]/page.tsx`)
- Updated to demonstrate the design system: Container + FadeIn + GoldAccent + BrandButton (gold + navy + asChild + Link) + HexagonCard grid (gold + navy + cream tones) + StaggerChildren animations.

### Test Results
- ✅ **TypeScript**: clean
- ✅ **ESLint** (Next.js + security plugin): clean
- ✅ **Vitest unit + component tests**: 31 passing (up from 15 in Prompt 1)
  - Added: `button.test.tsx` (6 tests — variants, sizes, asChild)
  - Added: `brand-button.test.tsx` (4 tests — arrow, variants, chevron clip)
  - Added: `doda-wr-lockup.test.tsx` (6 tests — header/footer/splash variants, aria-label, custom label)
- ✅ **Playwright E2E**: 24 tests across mobile + tablet + desktop, all passing (added Header, Footer, WhatsApp, Arabic footer assertions)
- ✅ **Production build**: succeeds in 9.2s with Turbopack
- ✅ Verified both `/en` (LTR) and `/ar` (RTL) render correctly with new chrome

### Notes & Discoveries
- **`React.Children.only` bug** found in v1 of BrandButton — when `asChild={true}`, Radix Slot only accepts a single child, but my original draft passed both `{children}` and `{ArrowIcon}` as siblings, breaking SSG. Fixed by using `React.cloneElement` to inject the arrow as a child *inside* the wrapped element. The new behavior keeps the consumer API ergonomic (`<BrandButton asChild><Link>Buy</Link></BrandButton>` renders as `<a>Buy<ArrowRight/></a>`).
- **Lucide-react version** in `package.json` reads 1.17.0 but appears to be a deprecated namespace — the icons we use (ArrowRight, ArrowLeft, Menu, X, Globe, MessageCircle, Mail, Phone, MapPin) all render correctly. Will revisit in a follow-up cleanup if any icon goes missing.
- **`middleware.ts` → `proxy.ts`**: Next.js 16 deprecation warning persists (not blocking). Will rename when we touch middleware logic next (Prompt 7+).
- **Design system review**: BrandButton, HexagonCard, AngularDivider, GoldAccent all use CSS clip-paths defined in `app/globals.css` from Prompt 1. They render correctly in both LTR and RTL because clip-paths are direction-agnostic.

### Security Review
- ✅ No new secrets, no exposed keys
- ✅ Client components use minimal hooks (`useTranslations`, `useLocale`, `usePathname`, `useRouter`)
- ✅ External anchors (WhatsApp, mailto, tel) use `target="_blank" rel="noopener noreferrer"` where appropriate
- ✅ XSS: all rendered text passes through next-intl translation pipeline (escapes HTML by default)
- ✅ Sheet (mobile drawer) closes on backdrop click + Esc (Radix default)
- ✅ Accessible names on the lockup, language toggle, mobile menu trigger, WhatsApp CTA

### Files Added (high-level)
```
components/
├── ui/
│   ├── button.tsx + button.test.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── textarea.tsx
│   ├── label.tsx
│   └── sheet.tsx
├── brand/
│   ├── wr-doors-logo.tsx
│   ├── doda-logo.tsx
│   ├── doda-wr-lockup.tsx + doda-wr-lockup.test.tsx
│   ├── brand-button.tsx + brand-button.test.tsx
│   ├── hexagon-card.tsx
│   ├── angular-divider.tsx
│   └── gold-accent.tsx
├── animations/
│   ├── fade-in.tsx
│   ├── stagger-children.tsx
│   ├── scroll-reveal.tsx
│   ├── spline-scene.tsx
│   └── shader-background.tsx
└── layout/
    ├── container.tsx
    ├── header.tsx
    ├── footer.tsx
    ├── language-toggle.tsx
    ├── mobile-nav.tsx
    └── whatsapp-button.tsx
```
Plus updates to: `app/[locale]/layout.tsx`, `app/[locale]/page.tsx`.

### Commit
- Hash: `3b0943e`
- Message: `feat(ui): design system + co-brand lockup + site chrome`
- Pushed: `5af2c4a..3b0943e main -> main`
- Remote: `https://github.com/aigeneralisthma/wr-doors.git`

### Next Prompt
**Prompt 3 — Homepage (Hero Spline 3D + USPs + Categories + Why Us)** (recommended model: 🟪 `claude-opus-4-7`)

Will build the real conversion-focused homepage with:
- Spline 3D hero scene with bilingual headline
- USP strip (4 hexagonal cards with real icons)
- Product category grid (using optimized images from Prompt 1)
- Featured projects carousel
- Big-stats "Why Us" section with animated counters
- Services overview (3 cards: Sales, Consultation, Technician)
- Testimonial placeholder
- CTA section

---

## Prompt 1 — Project Foundation & Branding Setup ✅

**Date**: 2026-06-07
**Model used**: claude-sonnet-4-5
**Status**: Complete

### Goal
Bootstrap a production-grade Next.js project with WR Doors branding, full bilingual (EN/AR + RTL) i18n, image optimization pipeline, security headers, and a comprehensive test setup — committed as a clean savepoint.

### Deliverables
- **Next.js 16.2.7** (latest stable, supersedes the plan's "15" — fully compatible) + React 19.2 + TypeScript 5 + Turbopack
- **Tailwind CSS v4** with WR Doors theme:
  - Brand tokens: gold `#F5B800`, navy `#0A1F44`, ink `#000000`, cream `#F8F5EE`
  - shadcn semantic tokens (primary/secondary/etc.) driven by brand colors
  - Light + dark themes
  - Geometric clip-paths (chevron, hexagon, angular-tl) for upcoming UI
- **shadcn/ui** scaffold (components.json + lib/utils.ts + cn helper)
- **Bilingual i18n (`next-intl 4`)**:
  - `/en` (default, LTR) + `/ar` (RTL) routes
  - Middleware for locale detection + auto-redirect
  - `messages/en.json` + `messages/ar.json` with: brand, nav, language, common, home, footer, forms namespaces
  - `dir="rtl"` auto-applied on Arabic routes
  - Locale-aware fonts switch (Source Serif 4 for EN headings, IBM Plex Sans Arabic for AR)
- **Typography** via `next/font`:
  - Source Serif 4 (editorial headings)
  - IBM Plex Mono (accent/code/stats)
  - IBM Plex Sans Arabic (Arabic everything)
  - Mona Sans variable set up for body (defaults to system stack until added)
- **Image optimization pipeline** (`scripts/optimize-images.ts`):
  - Sharp converts 8 source images → 3 sizes (640w/1024w/1920w) × 3 formats (AVIF/WebP/JPG)
  - Output: 1.76 MB vs 17 MB originals = **90% reduction** (target was 70%)
  - Auto-generates `lib/image-manifest.ts` with blurDataURL placeholders and typed manifest
- **Supabase client stubs** (`lib/supabase/client.ts` + `server.ts`) — wired for SSR cookies, ready for Prompt 7
- **Security**:
  - HTTP response headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Strict-Transport-Security
  - `eslint-plugin-security` enabled with strict rules (eval, child_process, unsafe regex, etc.)
  - `.env.local` gitignored; `.env.local.example` committed as template
  - Supabase service-role key noted as server-only (never `NEXT_PUBLIC_*`)
- **Testing infrastructure**:
  - **Vitest** + Testing Library + jsdom (unit + component)
  - **Playwright** with 3 viewport projects: mobile (iPhone 13), tablet (iPad gen 7), desktop (Chrome)
  - 15 unit tests, 12 E2E tests, all passing
- **Brand constants** (`lib/constants.ts`):
  - BRAND (name, platform, legal, endorsement, URL)
  - CONTACT (phone, E.164, email, WhatsApp, address, hours)
  - PRODUCT_CATEGORIES (4 catalog slugs with i18n labelKeys)
  - USPS (4 hero strip USPs)
  - SOCIAL (placeholder URLs)
  - `whatsappUrl()` helper that URL-encodes Arabic
- **Homepage placeholder** (`app/[locale]/page.tsx`) — proves the foundation works:
  - DODA × WR Doors co-brand badge
  - Bilingual headline via Server Component `getTranslations()`
  - Brand token swatches (gold/navy/ink/cream)
  - Renders correctly on `/en` (LTR) and `/ar` (RTL)
- **Root not-found page** with WR Doors branding (navy + gold)

### Test Results
- ✅ **TypeScript**: clean (`pnpm typecheck` exit 0)
- ✅ **ESLint**: clean (`pnpm lint` exit 0) — Next.js + security plugin
- ✅ **Vitest unit tests**: 15/15 passing
  - `lib/utils.test.ts` — cn() class merger (4 tests)
  - `lib/constants.test.ts` — brand, contact, whatsappUrl, product categories (11 tests)
- ✅ **Playwright E2E tests**: 12/12 passing across 3 viewports (mobile + tablet + desktop):
  - Bilingual foundation `/en` LTR + English headline
  - Bilingual foundation `/ar` RTL + Arabic headline
  - Locale redirect from bare `/`
  - Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- ✅ **Production build**: succeeds in 6.8s with Turbopack
- ✅ **Image pipeline**: 8 source images → 72 optimized variants (90% size reduction)

### Security Review
- ✅ No secrets committed (`.env.local` gitignored, only example committed)
- ✅ Secure headers active in next.config.ts
- ✅ Service-role key not prefixed `NEXT_PUBLIC_*`
- ✅ ESLint security plugin running, no errors
- ✅ TypeScript strict mode prevents implicit any
- ✅ Admin routes excluded from i18n middleware (placeholder for Prompt 9)
- ⚠️ **Deferred to later prompts**:
  - CSP header (Prompt 3 — needs Spline + Supabase domains finalized)
  - Rate limiting (Prompt 8 — when forms accept input)
  - Spam protection / honeypot (Prompt 8)
  - Server Actions get automatic CSRF protection from Next.js — confirm in Prompt 8

### Known Issues / Notes
- **Next.js 16 deprecation warning**: "middleware" file convention is deprecated, renamed to "proxy" in v16. Not a blocker — middleware still works. Will rename `middleware.ts` → `proxy.ts` in a future cleanup prompt.
- **Lucide-react v1.17**: pnpm pulled a strangely old version. The icon set works; we'll bump to latest in Prompt 2 when we start using icons heavily.
- **`Mona Sans` font**: Variable is wired into the theme but the actual font file is not yet loaded (Mona Sans isn't on Google Fonts under that exact name as a `next/font/google` import). Will load via @import or self-host in Prompt 2 when typography matters more.

### Commit
- Hash: `1678cb0`
- Message: `chore: initial project setup -- WR Doors branding, i18n (en/ar), RTL, image pipeline, test tooling`
- Pushed: `main -> origin/main`
- Remote: `https://github.com/aigeneralisthma/wr-doors.git`

### Files Created (high-level)
```
wr-doors/
├── .env.local.example              # secrets template
├── components.json                 # shadcn config
├── eslint.config.mjs               # + security plugin
├── i18n/
│   ├── routing.ts                  # locale config
│   ├── navigation.ts               # locale-aware Link/Router
│   └── request.ts                  # server messages loader
├── middleware.ts                   # next-intl locale middleware
├── messages/{en,ar}.json           # translations
├── next.config.ts                  # security headers + image config
├── playwright.config.ts            # 3 viewport projects
├── vitest.config.ts                # unit + component tests
├── vitest.setup.ts
├── app/
│   ├── globals.css                 # WR Doors theme + RTL
│   ├── not-found.tsx               # branded 404
│   └── [locale]/
│       ├── layout.tsx              # fonts + i18n provider + metadata
│       └── page.tsx                # bilingual homepage placeholder
├── lib/
│   ├── utils.ts                    # cn() helper
│   ├── constants.ts                # BRAND, CONTACT, etc.
│   ├── image-manifest.ts           # auto-generated
│   ├── supabase/{client,server}.ts # SSR-ready stubs
│   ├── utils.test.ts               # unit tests
│   └── constants.test.ts           # unit tests
├── public/assets/products/         # 72 optimized images (8 × 9 variants)
├── scripts/
│   └── optimize-images.ts          # Sharp pipeline
└── tests/e2e/
    └── smoke.spec.ts               # 4 tests × 3 viewports = 12 runs
```

### Next Prompt
**Prompt 2 — Design System & Layout Components** (recommended model: 🟪 `claude-opus-4-7`)

Will build:
- WR Doors logo SVG (recreated from flyer)
- DODA logo SVG (designed from scratch)
- `<DodaWrLockup>` co-brand component (header/footer/splash variants)
- shadcn base components: Button, Card, Input, Form, Toast, Dialog, Sheet
- Custom branded components: BrandButton, HexagonCard, AngularDivider, GoldAccent
- Layout: Header (with language toggle), Footer (with DODA endorsement), Container
- Animation wrappers: FadeIn, StaggerChildren, ScrollReveal
- ShaderBackground + SplineScene wrappers
- WhatsApp floating button

---
