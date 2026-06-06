import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * GoldAccent — animated gold underline used beneath section headings.
 *
 * Visual: a short gold bar with a subtle shimmer animation, picking up
 * the brand color and adding a tactile premium feel.
 *
 * Usage example:
 *   <h2>Our Services</h2>
 *   <GoldAccent />
 *
 * The shimmer animation is purely decorative and respects `prefers-reduced-motion`.
 */
export interface GoldAccentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Width preset — short by default, full for hero-level emphasis. */
  width?: "short" | "medium" | "wide";
}

const widthClasses: Record<NonNullable<GoldAccentProps["width"]>, string> = {
  short: "w-12",
  medium: "w-24",
  wide: "w-40",
};

export function GoldAccent({
  width = "short",
  className,
  ...props
}: GoldAccentProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "h-1 rounded-full gold-accent motion-reduce:animate-none",
        widthClasses[width],
        className,
      )}
      {...props}
    />
  );
}
