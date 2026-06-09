import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout/container";
import { BrandButton } from "@/components/brand/brand-button";
import { GoldAccent } from "@/components/brand/gold-accent";
import { FadeIn } from "@/components/animations/fade-in";
import { ShaderBackground } from "@/components/animations/shader-background";

/**
 * FinalCtaSection — the conversion close at the bottom of the homepage.
 *
 * Visual treatment: full-bleed black with a layered gold gradient. This
 * stands apart from every other section on the page (which use white or
 * cream backgrounds) so it reads as an explicit "act now" moment, not
 * just more content.
 *
 * Two CTAs because the customer might be ready for either path:
 *   - Request a Quote → /quote (lead form, no calendar)
 *   - Book a Consultation → /book (calendar flow)
 */
export async function FinalCtaSection() {
  const t = await getTranslations();

  return (
    <section
      className="relative isolate overflow-hidden bg-[var(--color-brand-ink)] py-24 text-white sm:py-32"
      aria-labelledby="final-cta-heading"
    >
      {/* GLSL ripple shader — sits at the back of the z-stack. Tinted gold
          (from the wrapper), 30% opacity, `mix-blend-screen` so it only
          lightens the ink-black background. Rollback: delete this line +
          the ShaderBackground import above. */}
      <ShaderBackground className="opacity-30 mix-blend-screen bg-transparent" />

      {/* Layered gold gradient on the trailing edge — pure decoration */}
      <div
        aria-hidden
        className="pointer-events-none absolute -end-32 -top-32 h-96 w-96 rounded-full bg-[var(--color-brand-gold)] opacity-20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -start-40 h-96 w-96 rounded-full bg-[var(--color-brand-gold-dark)] opacity-10 blur-3xl"
      />

      <Container className="relative">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--color-brand-gold)]">
              {t("home.finalCtaEyebrow")}
            </p>
            <h2
              id="final-cta-heading"
              className="mt-4 font-serif text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
            >
              {t("home.finalCtaTitle")}
            </h2>
            <div className="mt-6 flex justify-center">
              <GoldAccent width="medium" />
            </div>
            <p className="mt-8 text-lg leading-relaxed text-white/80 sm:text-xl">
              {t("home.finalCtaBody")}
            </p>

            {/* Both CTAs share the gold treatment — they're equal-weight
                conversion paths (lead form vs. calendar booking). The
                /book link carries `?service=consultation` so it skips the
                service-picker step on the booking form. */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <BrandButton brand="gold" size="xl" asChild>
                <Link href="/quote">{t("home.finalCtaPrimary")}</Link>
              </BrandButton>
              <BrandButton brand="gold" size="xl" asChild>
                <Link href="/book?service=consultation">
                  {t("home.finalCtaSecondary")}
                </Link>
              </BrandButton>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
