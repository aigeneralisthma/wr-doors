import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { CheckCircle, MessageCircle, Phone } from "lucide-react";

import { BRAND, CONTACT, whatsappUrl } from "@/lib/constants";
import { Container } from "@/components/layout/container";
import { GoldAccent } from "@/components/brand/gold-accent";
import { QuoteForm } from "@/components/forms/quote-form";

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
  const t = await getTranslations({ locale, namespace: "quote" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `/${locale}/quote`,
      languages: { en: "/en/quote", ar: "/ar/quote" },
    },
    openGraph: { url: `${BRAND.url}/${locale}/quote`, type: "website" },
  };
}

/* ── Trust panel ─────────────────────────────────────────────────────── */
async function TrustPanel({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "quote" });
  const isAr = locale === "ar";
  const waText = isAr
    ? "مرحباً، أودّ الاستفسار عن عرض سعر من WR Doors"
    : "Hi, I'd like to request a quote from WR Doors";

  const trustItems = [
    t("trustResponse"),
    t("trustFree"),
    t("trustLocal"),
    t("trustWarranty"),
  ];

  return (
    <aside className="rounded-2xl bg-[var(--color-brand-navy)] p-7 text-white">
      <h2 className="mb-1 font-serif text-lg font-bold">WR Doors</h2>
      <p className="mb-6 text-xs text-white/60">Powered by DODA</p>

      <ul className="mb-8 space-y-3">
        {trustItems.map((item) => (
          <li key={item} className="flex items-center gap-3 text-sm">
            <CheckCircle className="h-4 w-4 shrink-0 text-[var(--color-brand-gold)]" />
            {item}
          </li>
        ))}
      </ul>

      <div className="space-y-3 border-t border-white/20 pt-6">
        <a
          href={`tel:${CONTACT.phone}`}
          className="flex items-center gap-3 text-sm text-white/80 hover:text-white transition-colors"
        >
          <Phone className="h-4 w-4 shrink-0 text-[var(--color-brand-gold)]" />
          {CONTACT.phone}
        </a>
        <a
          href={whatsappUrl(waText)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 text-sm text-white/80 hover:text-white transition-colors"
        >
          <MessageCircle className="h-4 w-4 shrink-0 text-emerald-400" />
          WhatsApp
        </a>
      </div>
    </aside>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default async function QuotePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "quote" });

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

      {/* ── Form + Trust panel ── */}
      <section className="py-12 md:py-16">
        <Container>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
            {/* Form */}
            <div className="rounded-2xl border border-border bg-card p-7 shadow-sm md:p-10">
              <QuoteForm locale={locale} />
            </div>

            {/* Trust panel — visible lg+ only on the side, below on mobile */}
            <TrustPanel locale={locale} />
          </div>
        </Container>
      </section>
    </main>
  );
}
