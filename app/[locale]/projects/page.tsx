import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { BRAND, whatsappUrl } from "@/lib/constants";
import { PROJECTS } from "@/lib/projects";
import { Container } from "@/components/layout/container";
import { GoldAccent } from "@/components/brand/gold-accent";
import { Button } from "@/components/ui/button";
import { ProjectFilter } from "@/components/projects/project-filter";

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
  const t = await getTranslations({ locale, namespace: "projects" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `/${locale}/projects`,
      languages: { en: "/en/projects", ar: "/ar/projects" },
    },
    openGraph: { url: `${BRAND.url}/${locale}/projects`, type: "website" },
  };
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "projects" });

  /** Resolve per-project bilingual strings server-side and pass them to
   *  the Client filter component as a plain serializable object. The
   *  filter component itself uses `useTranslations` for the short UI
   *  labels (filter pills, count, empty state). */
  const items = Object.fromEntries(
    PROJECTS.map((p) => [
      p.key,
      {
        title: t(`items.${p.key}.title`),
        location: t(`items.${p.key}.location`),
        summary: t(`items.${p.key}.summary`),
      },
    ]),
  );

  const waText =
    locale === "ar"
      ? "مرحباً، أودّ مناقشة مشروع مع WR Doors"
      : "Hi, I'd like to discuss a project with WR Doors";

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

      {/* ── Filter + grid ── */}
      <section className="py-14 md:py-20">
        <Container>
          <ProjectFilter items={items} />
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
              <p className="max-w-lg text-sm text-white/70">
                {t("ctaSubtitle")}
              </p>
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
              <Link href={`/${locale}/quote`}>
                <Button className="bg-[var(--color-brand-gold)] text-[var(--color-brand-navy)] hover:bg-[var(--color-brand-gold)]/90">
                  {t("ctaQuote")}
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
