import { getTranslations } from "next-intl/server";
import { Award, Factory, Sparkles } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { findImage } from "@/lib/image-manifest";
import { Container } from "@/components/layout/container";
import { BrandButton } from "@/components/brand/brand-button";
import { GoldAccent } from "@/components/brand/gold-accent";
import { ProductImage } from "@/components/ui/product-image";
import { FadeIn } from "@/components/animations/fade-in";

/**
 * Hero section — the moneyshot of the homepage.
 *
 * Layout strategy:
 *   - Two-column split on lg+: copy on the lede, image on the trailing side
 *     (RTL flips automatically because we use logical `lg:grid-cols-2` plus
 *      DOM-order which mirrors under `dir="rtl"`)
 *   - Single-column stack on mobile and tablet, with the image moved above
 *     the copy so the visual hook lands first on small screens
 *
 * The 3D Spline scene is the long-term plan, but ships only when the client
 * provides a real scene URL. Until then we use the highest-impact image
 * available (Grand Exterior Pivot Door from the assets) at the largest
 * responsive variant, with `priority` for fastest LCP.
 *
 * Trust badges sit between the CTAs and the bottom — short, scannable, on
 * three core selling points (warranty, factory, designs).
 */
export async function HeroSection({ locale }: { locale: string }) {
  const t = await getTranslations();

  const heroImage = findImage(
    "pivot-aluminium-doors",
    "grand-exterior-aluminium-pivot-door",
  );

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-[var(--color-brand-cream)] via-background to-background"
      aria-labelledby="hero-heading"
    >
      {/* Faint decorative gold sliver behind the headline (only visible lg+) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -end-32 top-1/3 hidden h-96 w-96 rounded-full bg-[var(--color-brand-gold)] opacity-10 blur-3xl lg:block"
      />

      <Container className="relative grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:gap-16 lg:py-32">
        {/* Copy column */}
        <div className="order-2 lg:order-1">
          <FadeIn immediate>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-secondary">
              {t("home.heroEyebrow")}
            </p>
          </FadeIn>

          <FadeIn immediate delay={0.1}>
            <h1
              id="hero-heading"
              className="mt-4 text-balance font-serif text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
            >
              {t("home.heroTagline")}
            </h1>
            <GoldAccent className="mt-6" width="medium" />
          </FadeIn>

          <FadeIn immediate delay={0.2}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {t("home.heroSubtitle")}
            </p>
          </FadeIn>

          <FadeIn immediate delay={0.3}>
            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              <BrandButton brand="gold" size="xl" asChild>
                <Link href="/products">{t("home.heroCtaPrimary")}</Link>
              </BrandButton>
              <BrandButton brand="navy" size="xl" asChild>
                <Link href="/quote">{t("home.heroCtaSecondary")}</Link>
              </BrandButton>
            </div>
          </FadeIn>

          {/* Trust badges */}
          <FadeIn immediate delay={0.4}>
            <ul className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              <li className="inline-flex items-center gap-2 text-muted-foreground">
                <Award className="size-4 text-[var(--color-brand-gold)]" aria-hidden />
                <span className="font-medium">
                  {t("home.heroTrustBadges.warranty")}
                </span>
              </li>
              <li className="inline-flex items-center gap-2 text-muted-foreground">
                <Factory className="size-4 text-[var(--color-brand-gold)]" aria-hidden />
                <span className="font-medium">
                  {t("home.heroTrustBadges.factory")}
                </span>
              </li>
              <li className="inline-flex items-center gap-2 text-muted-foreground">
                <Sparkles className="size-4 text-[var(--color-brand-gold)]" aria-hidden />
                <span className="font-medium">
                  {t("home.heroTrustBadges.designs")}
                </span>
              </li>
            </ul>
          </FadeIn>
        </div>

        {/* Visual column — large product hero shot with floating spec card */}
        <div className="relative order-1 lg:order-2">
          <FadeIn immediate delay={0.1}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl lg:aspect-[5/6]">
              {heroImage ? (
                <ProductImage
                  image={heroImage}
                  alt={
                    locale === "ar"
                      ? "باب محوري ألمنيوم خارجي فخم — وَر دورز"
                      : "Grand Exterior Aluminium Pivot Door — WR Doors"
                  }
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[var(--color-brand-cream)] font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Hero visual
                </div>
              )}

              {/* Subtle navy overlay at the bottom for legibility of the floating card */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[var(--color-brand-navy)]/40 to-transparent"
              />
            </div>
          </FadeIn>

          {/* Floating spec card — a touch of editorial flair */}
          <FadeIn immediate delay={0.3}>
            <div className="absolute bottom-6 start-6 max-w-[16rem] rounded-xl border border-border bg-background/95 p-5 shadow-lg backdrop-blur sm:bottom-8 sm:start-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-secondary">
                {t("brand.platform")} × {t("brand.name")}
              </p>
              <p className="mt-2 font-serif text-lg font-semibold leading-tight">
                {locale === "ar"
                  ? "صُنع لمعمار الإمارات"
                  : "Built for UAE architecture"}
              </p>
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
