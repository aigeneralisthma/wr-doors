import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Source_Serif_4, IBM_Plex_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { routing, localeDirection, type Locale } from "@/i18n/routing";
import { BRAND } from "@/lib/constants";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import "../globals.css";

/* ============================================================================
   Fonts — loaded via next/font for automatic preloading + zero CLS
   ============================================================================ */

/** Editorial serif for headings (premium, distinctive — not generic) */
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
  weight: ["400", "600", "700"],
});

/** Monospace accent for stats, code, technical specs */
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

/** Arabic typeface — pairs sympathetically with Mona Sans */
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-plex-arabic",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

/**
 * Mona Sans is GitHub's variable sans, served from Google Fonts under a
 * stable name. We load it via Google Fonts CSS import for now to avoid
 * shipping the font file; if we want stronger control we can switch to
 * a localFont() call once the font is downloaded.
 *
 * For Phase 1 we use the CSS @import in globals.css alongside next/font
 * primary loads so it works without a local font binary.
 *
 * Variable: --font-mona-sans (declared on body via className below).
 */

/* ============================================================================
   Static params — Next.js requires us to declare which locales exist
   ============================================================================ */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/* ============================================================================
   Metadata — applied per-locale
   ============================================================================ */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";

  return {
    metadataBase: new URL(BRAND.url),
    title: {
      default: isArabic
        ? "وَر دورز — أبواب فاخرة وخدمات منزلية في الإمارات"
        : "WR Doors — Premium Doors & Home Services in UAE",
      template: isArabic ? `%s | وَر دورز` : `%s | WR Doors`,
    },
    description: isArabic
      ? "أبواب WPC مخصصة، مداخل ألمنيوم محورية، أنظمة منزلقة، وكسوة جدران. صُنعت في الإمارات بضمان 10 سنوات."
      : "Custom WPC doors, pivot aluminium entries, sliding systems, and wall cladding. Crafted in UAE with a 10-year warranty.",
    applicationName: BRAND.name,
    /** SEO: alternate-language links for hreflang */
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        ar: "/ar",
        "x-default": "/en",
      },
    },
    openGraph: {
      siteName: BRAND.name,
      locale: isArabic ? "ar_AE" : "en_US",
      type: "website",
      url: `${BRAND.url}/${locale}`,
    },
    twitter: {
      card: "summary_large_image",
      title: isArabic ? "وَر دورز" : "WR Doors",
    },
    formatDetection: {
      telephone: true, // UAE mobile-heavy market — autodetect tel numbers
    },
  };
}

/* ============================================================================
   Locale layout — wraps every page in the right text direction + i18n provider
   ============================================================================ */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Guard against unknown locales (shouldn't happen because of generateStaticParams + middleware, but defensive)
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering with the right locale for this request
  setRequestLocale(locale);

  const dir = localeDirection[locale as Locale];

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${sourceSerif.variable} ${plexMono.variable} ${plexArabic.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider>
          <Header />
          <div className="flex flex-1 flex-col">{children}</div>
          <Footer />
          <WhatsAppButton />
        </NextIntlClientProvider>
        {/* Privacy-friendly analytics — no cookies, no PII. Auto-enabled on Vercel. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
