import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * HexagonCard — content card with a hexagonal clip + bordered surround.
 *
 * Echoes the hexagonal product showcase in the client flyer. Used on the
 * homepage USP strip and product category grid.
 *
 * Structure: an outer wrapper holds the navy border ring, the inner panel
 * holds the content with the hexagon clip. We use a backing div with
 * `clip-hexagon` for the navy frame and an inset div for the content
 * background — the gap creates the visible 2-tone border without needing
 * `border` (which doesn't follow clip-path).
 */
export interface HexagonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Force a particular aspect ratio so flexible hex grids stay consistent. */
  aspectClass?: string;
  /** Background tone of the content panel. */
  tone?: "default" | "gold" | "navy" | "cream";
}

const toneClasses: Record<NonNullable<HexagonCardProps["tone"]>, string> = {
  default: "bg-background text-foreground",
  gold: "bg-[var(--color-brand-gold)] text-[var(--color-brand-navy)]",
  navy: "bg-[var(--color-brand-navy)] text-[var(--color-brand-cream)]",
  cream: "bg-[var(--color-brand-cream)] text-[var(--color-brand-navy)]",
};

export function HexagonCard({
  aspectClass = "aspect-[1.155/1]", // hexagon's natural ratio (sqrt(3)/2 base)
  tone = "default",
  className,
  children,
  ...props
}: HexagonCardProps) {
  return (
    <div
      className={cn(
        "relative",
        aspectClass,
        // Outer navy frame
        "clip-hexagon bg-[var(--color-brand-navy)]",
        className,
      )}
      {...props}
    >
      {/* Inner content panel — 3% inset creates the visible navy ring */}
      <div
        className={cn(
          "absolute inset-[3%] clip-hexagon flex items-center justify-center text-center p-6",
          toneClasses[tone],
        )}
      >
        {children}
      </div>
    </div>
  );
}
