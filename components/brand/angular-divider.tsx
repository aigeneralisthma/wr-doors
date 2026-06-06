import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * AngularDivider — decorative section break with angular clipped edges.
 *
 * Picks up the geometric language from the flyer (notched corners, chevrons).
 * Sits between content sections to add rhythm without a heavy horizontal rule.
 *
 * Variants:
 *   - `chevron`       → V-cut on one side, pointing forward
 *   - `angular`       → corner notches on both ends (subtle)
 *   - `gradient-gold` → tone-on-tone gradient with gold accent line
 */
export type AngularDividerVariant = "chevron" | "angular" | "gradient-gold";

export interface AngularDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AngularDividerVariant;
  /** Total height of the divider band. */
  heightClass?: string;
}

export function AngularDivider({
  variant = "angular",
  heightClass = "h-24",
  className,
  ...props
}: AngularDividerProps) {
  if (variant === "gradient-gold") {
    return (
      <div
        aria-hidden
        className={cn(
          "relative w-full overflow-hidden",
          heightClass,
          className,
        )}
        {...props}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background via-[var(--color-brand-cream)] to-background" />
        <div className="absolute inset-x-0 top-1/2 h-px bg-[var(--color-brand-gold)] opacity-60" />
      </div>
    );
  }

  if (variant === "chevron") {
    return (
      <div
        aria-hidden
        className={cn(
          "clip-chevron-r w-full bg-[var(--color-brand-navy)]",
          heightClass,
          className,
        )}
        {...props}
      />
    );
  }

  // angular (default) — navy band with corner notches
  return (
    <div
      aria-hidden
      className={cn(
        "clip-angular-tl w-full bg-[var(--color-brand-navy)]",
        heightClass,
        className,
      )}
      {...props}
    />
  );
}
