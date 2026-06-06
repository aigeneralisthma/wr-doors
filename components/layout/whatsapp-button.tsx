"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { MessageCircle } from "lucide-react";

import { whatsappUrl } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * WhatsAppButton — floating click-to-chat anchor pinned to the bottom-end
 * corner of every page.
 *
 * UAE-specific design choice: WhatsApp is the dominant B2C channel here,
 * so the floating button is always visible without dismissal. We don't
 * use the WhatsApp Business API in Phase 1 — this is a plain click-to-chat
 * link with optional pre-filled context.
 *
 * Accessibility:
 *   - Real anchor element (not div) for keyboard nav
 *   - `aria-label` reads the destination service name
 *   - Brand green color (#25D366) chosen for instant recognition even when
 *     site theme is dark
 */
export interface WhatsAppButtonProps {
  /** Pre-filled message text. Use this when on product pages or after errors. */
  prefill?: string;
  className?: string;
}

export function WhatsAppButton({ prefill, className }: WhatsAppButtonProps) {
  const t = useTranslations();

  return (
    <a
      href={whatsappUrl(prefill)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${t("footer.whatsapp")} — ${prefill ?? "WR Doors"}`}
      className={cn(
        "fixed bottom-5 end-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full shadow-lg",
        "bg-[#25D366] text-white",
        "transition-transform hover:scale-105 active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2",
        // Visually softer on small screens to avoid blocking primary CTAs
        "sm:bottom-6 sm:end-6 sm:h-16 sm:w-16",
        className,
      )}
    >
      <MessageCircle className="size-7" />
      <span className="sr-only">{t("footer.whatsapp")}</span>
    </a>
  );
}
