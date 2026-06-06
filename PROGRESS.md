# PROGRESS — DODA × WR Doors

> Per-prompt savepoint log. Updated as the LAST step before every commit.
> Latest entry on top.

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
