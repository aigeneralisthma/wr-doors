import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { BRAND, CONTACT } from "@/lib/constants";

/**
 * Homepage placeholder (Prompt 1).
 *
 * Real hero, sections, and Spline 3D scene arrive in Prompt 3. This stub
 * exists to verify:
 * - i18n translation pipeline works (Server Component → next-intl)
 * - Brand fonts load correctly for both Latin (EN) and Arabic
 * - RTL layout works on /ar
 * - Color tokens render (gold/navy/cream)
 *
 * Everything below uses CSS logical properties (`ms-`/`me-`/`ps-`/`pe-`)
 * so the same code renders correctly in both LTR and RTL.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();

  return (
    <main className="flex-1">
      {/* Hero placeholder — Spline 3D scene arrives in Prompt 3 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-accent to-background">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
          {/* Co-brand badge — DODA × WR Doors */}
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-border bg-card/80 px-4 py-2 text-sm backdrop-blur">
            <span className="font-mono text-xs uppercase tracking-widest text-secondary">
              {t("brand.platform")}
            </span>
            <span className="text-muted-foreground">×</span>
            <span className="font-semibold tracking-tight">
              {t("brand.name")}
            </span>
          </div>

          {/* Editorial headline (serif) */}
          <h1 className="max-w-3xl text-balance text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            {t("home.heroTagline")}
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {t("home.heroSubtitle")}
          </p>

          {/* CTA pair */}
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href={`/${locale}/products`}
              className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {t("home.heroCtaPrimary")}
            </a>
            <a
              href={`/${locale}/quote`}
              className="inline-flex items-center justify-center rounded-md border-2 border-secondary bg-transparent px-8 py-3.5 text-base font-semibold text-secondary transition-colors hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {t("home.heroCtaSecondary")}
            </a>
          </div>

          {/* Brand tokens preview — for visual verification during Prompt 1.
              Removed in Prompt 3 once the real hero ships. */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-[var(--color-brand-gold)] p-6 text-center">
              <div className="font-mono text-xs uppercase tracking-widest text-[var(--color-brand-navy)]">
                Gold
              </div>
              <div className="font-mono text-sm font-bold text-[var(--color-brand-navy)]">
                #F5B800
              </div>
            </div>
            <div className="rounded-lg bg-[var(--color-brand-navy)] p-6 text-center">
              <div className="font-mono text-xs uppercase tracking-widest text-[var(--color-brand-gold)]">
                Navy
              </div>
              <div className="font-mono text-sm font-bold text-white">
                #0A1F44
              </div>
            </div>
            <div className="rounded-lg bg-[var(--color-brand-ink)] p-6 text-center">
              <div className="font-mono text-xs uppercase tracking-widest text-[var(--color-brand-gold)]">
                Ink
              </div>
              <div className="font-mono text-sm font-bold text-white">
                #000000
              </div>
            </div>
            <div className="rounded-lg bg-[var(--color-brand-cream)] p-6 text-center">
              <div className="font-mono text-xs uppercase tracking-widest text-[var(--color-brand-navy)]">
                Cream
              </div>
              <div className="font-mono text-sm font-bold text-[var(--color-brand-navy)]">
                #F8F5EE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Foundation OK indicator — removed in Prompt 2 */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Locale
              </div>
              <div className="mt-1 text-2xl font-bold tracking-tight">
                {locale.toUpperCase()}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                i18n via next-intl
              </div>
            </div>
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Phone
              </div>
              <div className="mt-1 text-2xl font-bold tracking-tight">
                {CONTACT.phone}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Click-to-call enabled
              </div>
            </div>
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Legal entity
              </div>
              <div className="mt-1 text-base font-semibold leading-tight">
                {BRAND.legalName}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Footer disclosure ready
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
