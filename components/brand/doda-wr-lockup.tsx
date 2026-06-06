import * as React from "react";
import { cn } from "@/lib/utils";
import { DodaLogo } from "./doda-logo";
import { WrDoorsLogo } from "./wr-doors-logo";

/**
 * DODA × WR Doors co-brand lockup.
 *
 * The visual contract (set by the brand decision in the requirements doc):
 *   - DODA reads at ~70% the visual weight of WR Doors (platform supports product)
 *   - Thin vertical divider sets them as a related pair, not a single unit
 *   - In header context, neither logo dominates color — both inherit theme text
 *
 * Variants tune the relationship to the surrounding chrome:
 *
 *   - `header`  → small, side-by-side, currentColor (lives in the sticky nav)
 *   - `footer`  → small, vertically stacked microline, muted color
 *   - `splash`  → large, centered, used on loading screens & 404
 *
 * RTL note: the lockup *reads* left-to-right by brand decision (DODA first,
 * then divider, then WR Doors) — this is intentional because both are stable
 * marks. Swapping order in RTL would weaken brand recognition. Spacing uses
 * logical properties so padding still mirrors correctly.
 */
export type DodaWrLockupVariant = "header" | "footer" | "splash";

export interface DodaWrLockupProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: DodaWrLockupVariant;
  /** Optional aria label override; defaults to "DODA × WR Doors". */
  label?: string;
}

export function DodaWrLockup({
  variant = "header",
  label = "DODA × WR Doors",
  className,
  ...props
}: DodaWrLockupProps) {
  if (variant === "splash") {
    return (
      <div
        role="img"
        aria-label={label}
        className={cn(
          "flex flex-col items-center gap-4 text-foreground",
          className,
        )}
        {...props}
      >
        <DodaLogo className="h-10 text-secondary" />
        <div className="h-px w-16 bg-border" aria-hidden />
        <WrDoorsLogo className="h-16" showSubtitle />
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <div
        role="img"
        aria-label={label}
        className={cn(
          "flex items-center gap-3 text-current",
          className,
        )}
        {...props}
      >
        <DodaLogo className="h-5 opacity-80" />
        <span
          className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60"
          aria-hidden
        >
          ×
        </span>
        <WrDoorsLogo className="h-7" showSubtitle={false} />
      </div>
    );
  }

  // header (default)
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "flex items-center gap-3 text-current sm:gap-4",
        className,
      )}
      {...props}
    >
      {/* DODA at 70% visual weight */}
      <DodaLogo className="h-5 opacity-90 sm:h-6" />

      {/* Thin vertical divider (decorative) */}
      <span
        aria-hidden
        className="block h-7 w-px bg-current opacity-30 sm:h-8"
      />

      {/* WR Doors — primary brand, full weight */}
      <WrDoorsLogo
        className="h-8 sm:h-10"
        showSubtitle={false}
      />
    </div>
  );
}
