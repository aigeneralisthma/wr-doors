import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/container";
import { GoldAccent } from "@/components/brand/gold-accent";
import { FadeIn } from "@/components/animations/fade-in";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/animations/stagger-children";

/**
 * WhyUsSection — big editorial stats block, navy background.
 *
 * Tone: confident, factual, factory-direct. The numbers are baked in
 * (no animated counters yet — they belong in Prompt 8 once the data is
 * coming from Supabase). Static numerals read fine in both LTR and RTL
 * because Arabic uses the same Hindu-Arabic digits in modern editorial.
 *
 * Layout: 4 stat cards in a row on lg+, 2 columns on tablet, vertical
 * stack on mobile. Each stat: huge serif number, gold underline, label.
 */
const STATS = [
  { value: "1,000+", labelKey: "home.whyUsStats.designs" },
  { value: "10", labelKey: "home.whyUsStats.warranty" },
  { value: "30", labelKey: "home.whyUsStats.delivery" },
  { value: "98%", labelKey: "home.whyUsStats.satisfaction" },
] as const;

export async function WhyUsSection() {
  const t = await getTranslations();

  return (
    <section
      className="relative bg-[var(--color-brand-navy)] py-20 text-[var(--color-brand-cream)] sm:py-28"
      aria-labelledby="why-us-heading"
    >
      {/* Decorative gold bar at the top edge */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 bg-[var(--color-brand-gold)]"
      />

      <Container>
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-brand-gold)]">
              {t("home.whyUsEyebrow")}
            </p>
            <h2
              id="why-us-heading"
              className="mt-3 font-serif text-3xl font-bold tracking-tight text-[var(--color-brand-cream)] sm:text-4xl"
            >
              {t("home.whyUsTitle")}
            </h2>
            <div className="mt-4 flex justify-center">
              <GoldAccent width="medium" />
            </div>
          </div>
        </FadeIn>

        <StaggerChildren className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <StaggerItem key={stat.labelKey} className="text-center">
              <p className="font-serif text-5xl font-bold leading-none tracking-tight text-[var(--color-brand-gold)] sm:text-6xl">
                {stat.value}
              </p>
              <div className="mx-auto mt-4 h-px w-10 bg-[var(--color-brand-gold)] opacity-50" />
              <p className="mt-4 text-sm font-medium uppercase tracking-widest opacity-80">
                {t(stat.labelKey)}
              </p>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </Container>
    </section>
  );
}
