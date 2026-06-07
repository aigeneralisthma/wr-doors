import { getTranslations } from "next-intl/server";
import { Factory, Shield, Award, Sparkles } from "lucide-react";

import { Container } from "@/components/layout/container";
import { GoldAccent } from "@/components/brand/gold-accent";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/animations/stagger-children";

/**
 * USPSection — four selling points pulled verbatim from the client flyer:
 * Local Factory, Triple Guard, 10-Year Warranty, Exclusive WPC.
 *
 * Visual design choice: ditched the hexagon cards from the design-system
 * preview because at this point in the page we need scannability, not
 * decoration. The hexagons return on category cards lower down.
 *
 * Layout: 1 / 2 / 4 columns at mobile / tablet / desktop. Each USP is a
 * vertical block with a gold icon, a serif title, and a one-sentence body.
 */
const ITEMS = [
  { key: "localFactory", Icon: Factory },
  { key: "tripleGuard", Icon: Shield },
  { key: "warranty10y", Icon: Award },
  { key: "exclusiveWpc", Icon: Sparkles },
] as const;

export async function USPSection() {
  const t = await getTranslations();

  return (
    <section
      className="relative bg-background py-20 sm:py-28"
      aria-labelledby="usps-heading"
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-secondary">
            {t("home.uspsEyebrow")}
          </p>
          <h2
            id="usps-heading"
            className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl"
          >
            {t("home.uspsTitle")}
          </h2>
          <div className="mt-4 flex justify-center">
            <GoldAccent width="medium" />
          </div>
        </div>

        <StaggerChildren className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {ITEMS.map(({ key, Icon }) => (
            <StaggerItem key={key}>
              <article className="group relative h-full">
                {/* Icon plinth */}
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--color-brand-navy)] text-[var(--color-brand-gold)] shadow-sm transition-transform group-hover:scale-105">
                  <Icon className="size-7" aria-hidden />
                </div>
                <h3 className="mt-5 font-serif text-xl font-bold leading-tight">
                  {t(`home.usps.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`home.usps.${key}.body`)}
                </p>
              </article>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </Container>
    </section>
  );
}
