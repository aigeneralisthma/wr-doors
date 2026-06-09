"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { WrDoorsLogo } from "@/components/brand/wr-doors-logo";
import { BrandButton } from "@/components/brand/brand-button";
import { LanguageToggle } from "./language-toggle";

interface MobileNavProps {
  navItems: Array<{ href: string; labelKey: string }>;
}

/**
 * MobileNav — Sheet-based drawer for mobile + tablet.
 *
 * Open: hamburger → slides in from the end side (right in LTR, left in RTL,
 * handled by tw-animate-css's logical-direction variants on Sheet's `side`).
 *
 * Contains:
 *   - WR Doors logo at the top
 *   - Vertical link stack
 *   - Language toggle (full pill version)
 *   - Get Quote CTA at the bottom
 */
export function MobileNav({ navItems }: MobileNavProps) {
  const t = useTranslations();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("nav.menu")}
          className="md:hidden"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex flex-col gap-6 rtl:!start-0 rtl:!end-auto rtl:border-e rtl:border-s-0"
      >
        {/* WR Doors logo at the top of the drawer */}
        <div className="mt-2 text-foreground">
          <WrDoorsLogo className="h-8 rounded-sm sm:h-10" />
        </div>

        {/* Nav links */}
        <nav className="-mx-2 mt-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <SheetClose asChild key={item.href}>
              <Link
                href={item.href}
                className="rounded-md px-3 py-3 text-lg font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {t(item.labelKey)}
              </Link>
            </SheetClose>
          ))}
        </nav>

        {/* Spacer + bottom controls */}
        <div className="mt-auto flex flex-col gap-4">
          <LanguageToggle variant="full" />
          <SheetClose asChild>
            <BrandButton brand="gold" size="lg" asChild>
              <Link href="/quote">{t("nav.getQuote")}</Link>
            </BrandButton>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
