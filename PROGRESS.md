# PROGRESS — DODA × WR Doors

> Per-prompt savepoint log. Updated as the LAST step before every commit.
> Latest entry on top.

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
