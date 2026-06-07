import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { BRAND, CONTACT, whatsappUrl } from "@/lib/constants";
import { Container } from "@/components/layout/container";
import { GoldAccent } from "@/components/brand/gold-accent";
import { ContactForm } from "@/components/forms/contact-form";

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
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `/${locale}/contact`,
      languages: { en: "/en/contact", ar: "/ar/contact" },
    },
    openGraph: { url: `${BRAND.url}/${locale}/contact`, type: "website" },
  };
}

/**
 * Google Maps embed URL — Dubai, United Arab Emirates (city-level pin).
 * Generated via maps.google.com → Share → Embed a map. No API key required,
 * no billing. Swap to a real office pin when client confirms the address.
 *
 * CSP note (Prompt 10): when CSP lands, add `frame-src https://www.google.com`
 * and `img-src ... https://maps.gstatic.com`.
 */
const GOOGLE_MAPS_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d231337.45960873747!2d55.17286759726563!3d25.0763201!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43496ad9c645%3A0xbde66e5084295162!2sDubai%20-%20United%20Arab%20Emirates!5e0!3m2!1sen!2sae!4v1709568000000";

/* ── Info panel ────────────────────────────────────────────────────────── */
async function InfoPanel({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "contact" });
  const isAr = locale === "ar";
  const waText = isAr
    ? "مرحباً، أودّ التواصل مع فريق WR Doors"
    : "Hi, I'd like to get in touch with the WR Doors team";

  const items = [
    {
      Icon: Phone,
      label: t("phoneInfoLabel"),
      value: CONTACT.phone,
      href: `tel:${CONTACT.phoneE164}`,
      external: false,
    },
    {
      Icon: MessageCircle,
      label: t("whatsappInfoLabel"),
      value: CONTACT.phone,
      href: whatsappUrl(waText),
      external: true,
    },
    {
      Icon: Mail,
      label: t("emailInfoLabel"),
      value: CONTACT.email,
      href: `mailto:${CONTACT.email}`,
      external: false,
    },
  ];

  return (
    <aside className="rounded-2xl bg-[var(--color-brand-navy)] p-7 text-white">
      <h2 className="mb-1 font-serif text-lg font-bold">{t("infoTitle")}</h2>
      <p className="mb-6 text-xs text-white/60">{t("infoSubtitle")}</p>

      <ul className="space-y-4">
        {items.map(({ Icon, label, value, href, external }) => (
          <li key={label}>
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
              {label}
            </p>
            <a
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="flex items-center gap-3 text-sm text-white/90 hover:text-white transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0 text-[var(--color-brand-gold)]" />
              <span dir="ltr">{value}</span>
            </a>
          </li>
        ))}

        {/* Address (no link target — TBD) */}
        <li>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
            {t("addressInfoLabel")}
          </p>
          <div className="flex items-start gap-3 text-sm text-white/90">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-gold)]" />
            <span>{t("addressBody")}</span>
          </div>
        </li>

        {/* Hours */}
        <li>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
            {t("hoursInfoLabel")}
          </p>
          <div className="flex items-start gap-3 text-sm text-white/90">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-brand-gold)]" />
            <div className="space-y-0.5">
              <p>{t("hoursWeek")}</p>
              <p className="text-white/60">{t("hoursWeekend")}</p>
            </div>
          </div>
        </li>
      </ul>
    </aside>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "contact" });

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

      {/* ── Form + Info panel ── */}
      <section className="py-14 md:py-20">
        <Container>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
            {/* Form card */}
            <div className="rounded-2xl border border-border bg-card p-7 shadow-sm md:p-10">
              <p className="mb-1 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
                {t("formTitle")}
              </p>
              <h2 className="mb-2 font-serif text-2xl font-bold text-foreground">
                {t("formSubtitle")}
              </h2>
              <div className="mb-7 h-px w-full bg-border" />
              <ContactForm locale={locale} />
            </div>

            {/* Info panel */}
            <InfoPanel locale={locale} />
          </div>
        </Container>
      </section>

      {/* ── Map ── */}
      <section
        id="contact-map"
        aria-labelledby="contact-map-heading"
        className="bg-muted/40 py-14 md:py-20"
      >
        <Container>
          <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
            {t("mapTitle")}
          </p>
          <h2
            id="contact-map-heading"
            className="mb-2 font-serif text-2xl font-bold text-foreground md:text-3xl"
          >
            {t("addressBody")}
          </h2>
          <p className="mb-6 max-w-lg text-sm text-muted-foreground">
            {t("mapBody")}
          </p>
          <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
            <iframe
              data-testid="contact-map"
              title={`${t("mapTitle")} — ${t("addressBody")}`}
              src={GOOGLE_MAPS_EMBED_URL}
              width="100%"
              height="360"
              style={{ border: 0, display: "block" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Container>
      </section>
    </main>
  );
}
