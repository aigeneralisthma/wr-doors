import { getTranslations } from "next-intl/server";
import { Quote } from "lucide-react";

import { Container } from "@/components/layout/container";
import { GoldAccent } from "@/components/brand/gold-accent";
import { FadeIn } from "@/components/animations/fade-in";

/**
 * TestimonialsSection — placeholder until real verified reviews exist.
 *
 * Design choice: rather than fake testimonials (which erode trust if a
 * visitor recognizes stock photos or generic quotes), we show an honest
 * "coming soon" panel with a direct invitation to request references.
 *
 * When real reviews arrive (post-launch), this same component will hold
 * a 3-card carousel — the surrounding structure (eyebrow / title /
 * GoldAccent) is built so the swap is a single block change.
 */
export async function TestimonialsSection() {
  const t = await getTranslations();

  return (
    <section
      className="relative bg-[var(--color-brand-cream)] py-20 sm:py-28"
      aria-labelledby="testimonials-heading"
    >
      <Container>
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-secondary">
              {t("home.testimonialsEyebrow")}
            </p>
            <h2
              id="testimonials-heading"
              className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl"
            >
              {t("home.testimonialsTitle")}
            </h2>
            <div className="mt-4 flex justify-center">
              <GoldAccent width="medium" />
            </div>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-border bg-background p-10 text-center shadow-sm">
            <Quote
              className="mx-auto size-10 text-[var(--color-brand-gold)] rtl:-scale-x-100"
              aria-hidden
            />
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {t("home.testimonialsPlaceholder")}
            </p>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
