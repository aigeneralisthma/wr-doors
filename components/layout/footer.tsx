import { getTranslations, getLocale } from "next-intl/server";
import { Mail, Phone, MessageCircle, MapPin } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Container } from "./container";
import { WrDoorsLogo } from "@/components/brand/wr-doors-logo";
import { GoldAccent } from "@/components/brand/gold-accent";
import { BRAND } from "@/lib/constants";
import { getContactInfo, whatsappUrlFor } from "@/lib/site-config";

/**
 * Footer — site-wide footer with three feature areas:
 *   1. Brand block — WR Doors logo + tagline + "Site managed by AI DODO™"
 *   2. Quick links — mirror of header nav (good for SEO link equity)
 *   3. Contact block — phone, email, WhatsApp, address
 *
 * Below those, a thin legal strip with the LLC name + © year.
 *
 * Server Component (translations on the server, zero client JS).
 */
export async function Footer() {
  const t = await getTranslations();
  const locale = await getLocale();
  // Resolved from site_settings → falls back to CONTACT constants if a
  // row is missing/empty. Admin edits in /admin/site-settings reflect
  // here on the next ISR revalidate.
  const contact = await getContactInfo(locale);
  const year = new Date().getFullYear();

  const navLinks = [
    { href: "/products", label: t("nav.products") },
    { href: "/services", label: t("nav.services") },
    { href: "/projects", label: t("nav.projects") },
    { href: "/about", label: t("nav.about") },
    { href: "/contact", label: t("nav.contact") },
  ];

  return (
    <footer className="border-t border-border bg-[var(--color-brand-navy)] text-[var(--color-brand-cream)]">
      <Container as="div" className="py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Brand block */}
          <div className="space-y-4">
            <WrDoorsLogo className="h-10 rounded-sm" />
            <p className="max-w-sm text-sm leading-relaxed opacity-80">
              {t("footer.tagline")}
            </p>
            <p className="text-xs font-medium uppercase tracking-widest opacity-60">
              {t("brand.endorsement")}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-brand-gold)]">
              {t("footer.quickLinks")}
            </h3>
            <GoldAccent className="mt-3" />
            <ul className="mt-5 space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm opacity-80 transition-opacity hover:opacity-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact block */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-brand-gold)]">
              {t("footer.contact")}
            </h3>
            <GoldAccent className="mt-3" />
            <ul className="mt-5 space-y-4 text-sm">
              <li>
                <a
                  href={`tel:${contact.phoneE164}`}
                  className="inline-flex items-center gap-3 opacity-80 transition-opacity hover:opacity-100"
                >
                  <Phone className="size-4 text-[var(--color-brand-gold)]" />
                  <span dir="ltr">{contact.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center gap-3 break-all opacity-80 transition-opacity hover:opacity-100"
                >
                  <Mail className="size-4 text-[var(--color-brand-gold)]" />
                  <span>{contact.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={whatsappUrlFor(contact)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 opacity-80 transition-opacity hover:opacity-100"
                >
                  <MessageCircle className="size-4 text-[var(--color-brand-gold)]" />
                  <span>{t("footer.whatsapp")}</span>
                </a>
              </li>
              <li className="inline-flex items-start gap-3 opacity-80">
                <MapPin className="mt-0.5 size-4 shrink-0 text-[var(--color-brand-gold)]" />
                <span>{contact.address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal strip */}
        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs opacity-60 sm:flex-row sm:items-center">
          <p>
            © {year} {BRAND.name}. {t("footer.rights")}
          </p>
          <p className="font-mono">{t("footer.legalName")}</p>
        </div>
      </Container>
    </footer>
  );
}
