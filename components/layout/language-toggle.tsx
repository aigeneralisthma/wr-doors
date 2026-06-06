"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { localeNames, type Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * LanguageToggle — switches between English and Arabic without reloading.
 *
 * Uses next-intl's locale-aware router so the user stays on the same logical
 * page (`/en/products` ⇄ `/ar/products`). Updates the URL, swaps fonts, and
 * flips `dir="rtl"` automatically thanks to the locale layout.
 *
 * Compact (icon + active locale code) by default; full version shows both
 * locale names — for use in the mobile nav drawer where there's more room.
 */
export interface LanguageToggleProps {
  variant?: "compact" | "full";
  className?: string;
}

export function LanguageToggle({
  variant = "compact",
  className,
}: LanguageToggleProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const otherLocale: Locale = locale === "en" ? "ar" : "en";

  const switchTo = (next: Locale) => {
    // The locale-aware router prepends the new locale prefix for us.
    router.replace(pathname, { locale: next });
  };

  if (variant === "full") {
    return (
      <div
        className={cn("flex gap-1 rounded-md border border-border p-1", className)}
        role="group"
        aria-label="Language"
      >
        {(["en", "ar"] as Locale[]).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => switchTo(l)}
            aria-pressed={locale === l}
            className={cn(
              "rounded px-3 py-1.5 text-sm font-medium transition-colors",
              locale === l
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent",
            )}
          >
            {localeNames[l]}
          </button>
        ))}
      </div>
    );
  }

  // compact
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => switchTo(otherLocale)}
      aria-label={`Switch language to ${localeNames[otherLocale]}`}
      className={cn("gap-2 font-mono text-xs uppercase tracking-wider", className)}
    >
      <Globe className="size-4" />
      <span>{otherLocale.toUpperCase()}</span>
    </Button>
  );
}
