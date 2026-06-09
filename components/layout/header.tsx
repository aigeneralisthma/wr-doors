import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Container } from "./container";
import { WrDoorsLogo } from "@/components/brand/wr-doors-logo";
import { BrandButton } from "@/components/brand/brand-button";
import { LanguageToggle } from "./language-toggle";
import { MobileNav } from "./mobile-nav";

const NAV_ITEMS = [
  { href: "/products", labelKey: "nav.products" },
  { href: "/services", labelKey: "nav.services" },
  { href: "/projects", labelKey: "nav.projects" },
  { href: "/about", labelKey: "nav.about" },
  { href: "/contact", labelKey: "nav.contact" },
] as const;

/**
 * Header — sticky site navigation.
 *
 * Layout (desktop):
 *   [WR Doors logo] ........... [nav]  [LangToggle]  [Get Quote]
 *
 * Layout (mobile):
 *   [WR Doors logo] .................................. [☰]
 *
 * Server Component — translations resolved server-side so the SSR HTML
 * ships with the right text and no flash of untranslated content.
 */
export async function Header() {
  const t = await getTranslations();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <Container as="div" className="flex h-16 items-center gap-4 sm:h-20">
        {/* WR Doors logo — links to homepage */}
        <Link
          href="/"
          aria-label="WR Doors home"
          className="me-auto inline-flex shrink-0 items-center text-foreground transition-opacity hover:opacity-80"
        >
          <WrDoorsLogo className="h-8 rounded-sm sm:h-10" priority />
        </Link>

        {/* Desktop nav — hidden on mobile/tablet */}
        <nav
          aria-label="Primary"
          className="hidden md:flex md:items-center md:gap-6 lg:gap-8"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        {/* Desktop right cluster — toggle + CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <LanguageToggle />
          <BrandButton brand="gold" size="default" asChild>
            <Link href="/quote">{t("nav.getQuote")}</Link>
          </BrandButton>
        </div>

        {/* Mobile drawer */}
        <MobileNav navItems={NAV_ITEMS.map((i) => ({ href: i.href, labelKey: i.labelKey }))} />
      </Container>
    </header>
  );
}
