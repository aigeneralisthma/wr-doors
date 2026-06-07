import { getTranslations } from "next-intl/server";
import { Package, MessageSquareText, Wrench, ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout/container";
import { GoldAccent } from "@/components/brand/gold-accent";
import { BrandButton } from "@/components/brand/brand-button";
import { FadeIn } from "@/components/animations/fade-in";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/animations/stagger-children";

/**
 * ServicesSection — the three engagement models with WR Doors.
 *
 * Why three cards instead of an explainer paragraph: customers self-sort by
 * what they need (a product, a quote, a tradesperson). Each card has a
 * clear icon, a one-liner, and a deep link to the right CTA flow.
 *
 * Visual approach: light cream backdrop, icons sit in gold-trimmed navy
 * squares (mirrors the USP icon style above for visual continuity).
 */
const SERVICES = [
  {
    key: "products",
    Icon: Package,
    href: "/products",
    bg: "bg-background",
  },
  {
    key: "consultation",
    Icon: MessageSquareText,
    href: "/book",
    bg: "bg-[var(--color-brand-cream)]",
  },
  {
    key: "technicians",
    Icon: Wrench,
    href: "/services",
    bg: "bg-background",
  },
] as const;

export async function ServicesSection() {
  const t = await getTranslations();

  return (
    <section
      className="relative bg-background py-20 sm:py-28"
      aria-labelledby="services-heading"
    >
      <Container>
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-secondary">
              {t("home.servicesEyebrow")}
            </p>
            <h2
              id="services-heading"
              className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl"
            >
              {t("home.servicesTitle")}
            </h2>
            <div className="mt-4 flex justify-center">
              <GoldAccent width="medium" />
            </div>
          </div>
        </FadeIn>

        <StaggerChildren className="mt-14 grid gap-6 md:grid-cols-3">
          {SERVICES.map(({ key, Icon, href, bg }) => (
            <StaggerItem key={key}>
              <Link
                href={href}
                className={`group block h-full rounded-2xl border border-border ${bg} p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
              >
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--color-brand-navy)] text-[var(--color-brand-gold)]">
                  <Icon className="size-7" aria-hidden />
                </div>
                <h3 className="mt-6 font-serif text-2xl font-bold leading-tight">
                  {t(`home.services.${key}.title`)}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  {t(`home.services.${key}.body`)}
                </p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-secondary">
                  <span>{t("common.learnMore")}</span>
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
                    aria-hidden
                  />
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerChildren>

        <FadeIn>
          <div className="mt-12 flex justify-center">
            <BrandButton brand="navy" size="lg" asChild>
              <Link href="/services">{t("home.servicesCta")}</Link>
            </BrandButton>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
