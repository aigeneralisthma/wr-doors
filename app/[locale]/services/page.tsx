import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Calendar,
  Check,
  MessageCircle,
  Package,
  Palette,
  Wrench,
} from "lucide-react";

import { BRAND, whatsappUrl } from "@/lib/constants";
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
  const t = await getTranslations({ locale, namespace: "services" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `/${locale}/services`,
      languages: { en: "/en/services", ar: "/ar/services" },
    },
    openGraph: { url: `${BRAND.url}/${locale}/services`, type: "website" },
  };
}

/* ── Service definitions ────────────────────────────────────────────────── */
type ServiceKey = "consultation" | "installation" | "technician" | "custom";

const SERVICE_META: {
  key: ServiceKey;
  Icon: React.ElementType;
  popular?: boolean;
  ctaHref: string;
  ctaVariant: "gold" | "outline";
}[] = [
  {
    key: "consultation",
    Icon: Calendar,
    popular: true,
    ctaHref: "/book",
    ctaVariant: "gold",
  },
  {
    key: "installation",
    Icon: Package,
    ctaHref: "/quote",
    ctaVariant: "outline",
  },
  {
    key: "technician",
    Icon: Wrench,
    ctaHref: "/book",
    ctaVariant: "outline",
  },
  {
    key: "custom",
    Icon: Palette,
    ctaHref: "/quote",
    ctaVariant: "outline",
  },
];

/* ── Page ──────────────────────────────────────────────────────────────── */
export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "services" });

  const waText =
    locale === "ar"
      ? "مرحباً، أحتاج مساعدة في اختيار خدمة مناسبة من WR Doors"
      : "Hi, I need help choosing the right service from WR Doors";

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

      {/* ── Service cards ── */}
      <section className="py-14 md:py-20">
        <Container>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {SERVICE_META.map(({ key, Icon, popular, ctaHref, ctaVariant }) => {
              const includes = [
                t(`${key}.include0`),
                t(`${key}.include1`),
                t(`${key}.include2`),
                t(`${key}.include3`),
              ];
              return (
                <article
                  key={key}
                  className="relative flex flex-col rounded-2xl border border-border bg-card p-7 shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Popular badge */}
                  {popular && (
                    <span className="absolute end-5 top-5 rounded-full bg-[var(--color-brand-navy)] px-3 py-1 text-xs font-semibold text-white">
                      {t("popular")}
                    </span>
                  )}

                  {/* Icon */}
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-brand-gold)]/15">
                    <Icon className="h-6 w-6 text-[var(--color-brand-gold)]" />
                  </div>

                  {/* Title + description */}
                  <h2 className="mb-2 font-serif text-xl font-bold text-foreground">
                    {t(`${key}.title`)}
                  </h2>
                  <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                    {t(`${key}.description`)}
                  </p>

                  {/* Includes list */}
                  <div className="mb-6">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("includes")}
                    </p>
                    <ul className="space-y-2">
                      {includes.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-sm text-foreground"
                        >
                          <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="mt-auto">
                    <Link href={`/${locale}${ctaHref}`}>
                      <Button
                        className={
                          ctaVariant === "gold"
                            ? "w-full bg-[var(--color-brand-gold)] text-[var(--color-brand-navy)] hover:bg-[var(--color-brand-gold)]/90"
                            : "w-full"
                        }
                        variant={ctaVariant === "gold" ? "default" : "outline"}
                      >
                        {t(`${key}.cta`)}
                      </Button>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="bg-[var(--color-brand-navy)] py-14 md:py-20">
        <Container>
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-start">
            <div>
              <h2 className="mb-2 font-serif text-2xl font-bold text-white md:text-3xl">
                {t("ctaTitle")}
              </h2>
              <p className="max-w-lg text-sm text-white/70">{t("ctaBody")}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <a
                href={whatsappUrl(waText)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                {t("ctaWhatsapp")}
              </a>
              <Link href={`/${locale}/book`}>
                <Button
                  variant="outline"
                  className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  {t("ctaBook")}
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
