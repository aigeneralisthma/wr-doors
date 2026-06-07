import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  Building2,
  CheckCircle,
  Globe2,
  Languages,
  Layers,
  Shield,
  Wrench,
} from "lucide-react";

import { BRAND } from "@/lib/constants";
import { Container } from "@/components/layout/container";
import { GoldAccent } from "@/components/brand/gold-accent";
import { Button } from "@/components/ui/button";

/* ── Static params ─────────────────────────────────────────────────────── */
export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }];
}

/* ── Metadata ──────────────────────────────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `/${locale}/about`,
      languages: { en: "/en/about", ar: "/ar/about" },
    },
    openGraph: { url: `${BRAND.url}/${locale}/about`, type: "website" },
  };
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "about" });

  const factoryStats = [
    t("factoryS1"),
    t("factoryS2"),
    t("factoryS3"),
    t("factoryS4"),
  ];

  const values: Array<{ icon: React.ElementType; titleKey: string; bodyKey: string }> = [
    { icon: Building2, titleKey: "value1Title", bodyKey: "value1Body" },
    { icon: Shield, titleKey: "value2Title", bodyKey: "value2Body" },
    { icon: Award, titleKey: "value3Title", bodyKey: "value3Body" },
    { icon: Languages, titleKey: "value4Title", bodyKey: "value4Body" },
  ];

  const dodaBenefits: Array<{ icon: React.ElementType; titleKey: string; bodyKey: string }> = [
    { icon: Globe2, titleKey: "dodaB1Title", bodyKey: "dodaB1Body" },
    { icon: Layers, titleKey: "dodaB2Title", bodyKey: "dodaB2Body" },
    { icon: Wrench, titleKey: "dodaB3Title", bodyKey: "dodaB3Body" },
  ];

  return (
    <main>
      {/* ── Hero ── */}
      <section className="border-b border-border bg-background py-14 md:py-20">
        <Container>
          <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
            {t("heroEyebrow")}
          </p>
          <h1 className="font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl">
            {t("heroTitle")}
          </h1>
          <GoldAccent width="medium" className="my-5" />
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            {t("heroSubtitle")}
          </p>
        </Container>
      </section>

      {/* ── Company story ── */}
      <section className="py-14 md:py-20">
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
            <div>
              <h2 className="mb-5 font-serif text-3xl font-bold text-foreground md:text-4xl">
                {t("storyTitle")}
              </h2>
              <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
                <p>{t("storyP1")}</p>
                <p>{t("storyP2")}</p>
                <p>{t("storyP3")}</p>
              </div>
            </div>
            {/* Aside: legal entity */}
            <aside className="rounded-2xl border border-border bg-muted/40 p-7 lg:mt-2">
              <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("legalTitle")}
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-foreground">
                {t("legalBody")}
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li dir="ltr" className="font-medium text-foreground">
                  {t("legalNameEn")}
                </li>
                <li dir="rtl" className="font-medium text-foreground">
                  {t("legalNameAr")}
                </li>
              </ul>
            </aside>
          </div>
        </Container>
      </section>

      {/* ── DODA Platform section (navy bg, branded) ── */}
      <section
        id="doda-platform"
        className="bg-[var(--color-brand-navy)] py-14 text-white md:py-20"
      >
        <Container>
          <div className="max-w-2xl">
            <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-gold)]">
              {t("dodaEyebrow")}
            </p>
            <h2 className="font-serif text-3xl font-bold leading-tight md:text-4xl">
              {t("dodaTitle")}
            </h2>
            <GoldAccent width="short" className="my-5" />
            <p className="text-base leading-relaxed text-white/75">
              {t("dodaIntro")}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {dodaBenefits.map(({ icon: Icon, titleKey, bodyKey }) => (
              <div
                key={titleKey}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-brand-gold)]/20">
                  <Icon className="h-5 w-5 text-[var(--color-brand-gold)]" />
                </div>
                <h3 className="mb-2 font-serif text-lg font-bold">
                  {t(titleKey)}
                </h3>
                <p className="text-sm leading-relaxed text-white/70">
                  {t(bodyKey)}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Factory & QA ── */}
      <section className="py-14 md:py-20">
        <Container>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
                {t("factoryEyebrow")}
              </p>
              <h2 className="mb-5 font-serif text-3xl font-bold text-foreground md:text-4xl">
                {t("factoryTitle")}
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                {t("factoryBody")}
              </p>
            </div>

            <ul className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-card p-7 sm:grid-cols-2">
              {factoryStats.map((stat) => (
                <li
                  key={stat}
                  className="flex items-start gap-3 text-sm text-foreground"
                >
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-gold)]" />
                  <span>{stat}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* ── Values / Why us ── */}
      <section className="bg-muted/40 py-14 md:py-20">
        <Container>
          <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
            {t("valuesEyebrow")}
          </p>
          <h2 className="mb-10 font-serif text-3xl font-bold text-foreground md:text-4xl">
            {t("valuesTitle")}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, titleKey, bodyKey }) => (
              <div
                key={titleKey}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-brand-gold)]/15">
                  <Icon className="h-5 w-5 text-[var(--color-brand-gold)]" />
                </div>
                <h3 className="mb-2 font-serif text-base font-bold text-foreground">
                  {t(titleKey)}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(bodyKey)}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-14 md:py-20">
        <Container>
          <div className="rounded-2xl bg-[var(--color-brand-navy)] p-10 md:p-12">
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-start">
              <div>
                <h2 className="mb-2 font-serif text-2xl font-bold text-white md:text-3xl">
                  {t("ctaTitle")}
                </h2>
                <p className="max-w-lg text-sm text-white/70">
                  {t("ctaSubtitle")}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Link href={`/${locale}/book`}>
                  <Button className="bg-[var(--color-brand-gold)] text-[var(--color-brand-navy)] hover:bg-[var(--color-brand-gold)]/90">
                    {t("ctaBook")}
                  </Button>
                </Link>
                <Link href={`/${locale}/quote`}>
                  <Button
                    variant="outline"
                    className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  >
                    {t("ctaQuote")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
