import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { BRAND } from "@/lib/constants";
import { Container } from "@/components/layout/container";
import { GoldAccent } from "@/components/brand/gold-accent";
import { BookingForm } from "@/components/booking/booking-form";

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
  const t = await getTranslations({ locale, namespace: "booking" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `/${locale}/book`,
      languages: { en: "/en/book", ar: "/ar/book" },
    },
    openGraph: { url: `${BRAND.url}/${locale}/book`, type: "website" },
  };
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "booking" });

  return (
    <main>
      {/* ── Hero ── */}
      <section className="border-b border-border bg-background py-12 md:py-16">
        <Container>
          <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
            {t("heroEyebrow")}
          </p>
          <h1 className="font-serif text-3xl font-bold leading-tight text-foreground md:text-4xl">
            {t("heroTitle")}
          </h1>
          <GoldAccent width="short" className="my-4" />
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
            {t("heroSubtitle")}
          </p>
        </Container>
      </section>

      {/* ── Form ── */}
      <section className="py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-7 shadow-sm md:p-10">
            {/* Suspense required because BookingForm uses useSearchParams()
                to read the optional `?service=...` deep-link; without this,
                /book bails out of static generation. */}
            <Suspense fallback={<div className="min-h-[20rem]" />}>
              <BookingForm locale={locale} />
            </Suspense>
          </div>
        </Container>
      </section>
    </main>
  );
}
