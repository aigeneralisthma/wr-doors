import { setRequestLocale, getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout/container";
import { BrandButton } from "@/components/brand/brand-button";
import { HexagonCard } from "@/components/brand/hexagon-card";
import { GoldAccent } from "@/components/brand/gold-accent";
import { FadeIn } from "@/components/animations/fade-in";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/animations/stagger-children";

/**
 * Homepage placeholder (Prompt 2).
 *
 * Demonstrates that the design system pieces compose correctly. The real
 * hero (with Spline 3D) and full section build-out come in Prompt 3.
 *
 * What's exercised here:
 *   - Container layout
 *   - BrandButton in both `gold` and `outline` variants
 *   - HexagonCard in `gold` and `navy` tones
 *   - FadeIn + StaggerChildren animations
 *   - All bilingual via getTranslations() (Server Component)
 *   - Header + Footer rendered automatically by the locale layout
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
      {/* Hero band */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-accent to-background">
        <Container className="py-20 lg:py-32">
          <FadeIn immediate>
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-border bg-card/80 px-4 py-2 text-sm backdrop-blur">
              <span className="font-mono text-xs uppercase tracking-widest text-secondary">
                {t("brand.platform")}
              </span>
              <span className="text-muted-foreground">×</span>
              <span className="font-semibold tracking-tight">
                {t("brand.name")}
              </span>
            </div>
          </FadeIn>

          <FadeIn immediate delay={0.1}>
            <h1 className="max-w-3xl text-balance text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              {t("home.heroTagline")}
            </h1>
            <GoldAccent className="mt-6" width="medium" />
          </FadeIn>

          <FadeIn immediate delay={0.2}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {t("home.heroSubtitle")}
            </p>
          </FadeIn>

          <FadeIn immediate delay={0.3}>
            <div className="mt-10 flex flex-wrap gap-4">
              <BrandButton brand="gold" size="xl" asChild>
                <Link href="/products">{t("home.heroCtaPrimary")}</Link>
              </BrandButton>
              <BrandButton brand="navy" size="xl" arrow="forward" asChild>
                <Link href="/quote">{t("home.heroCtaSecondary")}</Link>
              </BrandButton>
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* Hexagon USP strip — preview of Prompt 3's grid */}
      <section className="border-t border-border bg-card py-16 lg:py-24">
        <Container>
          <FadeIn>
            <p className="text-sm font-medium uppercase tracking-widest text-secondary">
              Design System Preview
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Hexagon Cards
            </h2>
            <GoldAccent className="mt-3" />
          </FadeIn>

          <StaggerChildren className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StaggerItem>
              <HexagonCard tone="gold">
                <div className="px-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest">
                    Local Factory
                  </p>
                  <p className="mt-2 font-serif text-xl font-bold leading-tight">
                    Fast UAE delivery
                  </p>
                </div>
              </HexagonCard>
            </StaggerItem>
            <StaggerItem>
              <HexagonCard tone="navy">
                <div className="px-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-brand-gold)]">
                    Triple Guard
                  </p>
                  <p className="mt-2 font-serif text-xl font-bold leading-tight">
                    Water · Sound · Termite
                  </p>
                </div>
              </HexagonCard>
            </StaggerItem>
            <StaggerItem>
              <HexagonCard tone="cream">
                <div className="px-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest">
                    10-Year Warranty
                  </p>
                  <p className="mt-2 font-serif text-xl font-bold leading-tight">
                    Peace of mind
                  </p>
                </div>
              </HexagonCard>
            </StaggerItem>
            <StaggerItem>
              <HexagonCard tone="gold">
                <div className="px-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest">
                    1,000+ Designs
                  </p>
                  <p className="mt-2 font-serif text-xl font-bold leading-tight">
                    Custom or stock
                  </p>
                </div>
              </HexagonCard>
            </StaggerItem>
          </StaggerChildren>
        </Container>
      </section>
    </main>
  );
}
