import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * DODA wordmark — designed from scratch as the platform co-brand.
 *
 * Visual language (intentionally distinct from WR Doors):
 *   - Clean, geometric sans-serif (tech / platform identity)
 *   - Gold accent dot replaces the second "O" → signals the brand's color
 *     pair (navy text + gold spark) at small sizes
 *   - Optical balance: tight tracking, slab terminals on D's for stability
 *
 * The relationship with WR Doors:
 *   - WR Doors uses a serif + square frame  (premium, hand-crafted)
 *   - DODA uses geometric sans + dot accent (modern, platform, scalable)
 *   Together they create the "platform powering luxury" co-brand contrast.
 *
 * Color via `currentColor` for text; the accent dot is forced gold.
 */
export interface DodaLogoProps extends React.SVGAttributes<SVGSVGElement> {
  /** Force the accent dot color (defaults to brand gold). */
  accentColor?: string;
  title?: string;
}

export function DodaLogo({
  accentColor = "#F5B800",
  title = "DODA — Digital Platform",
  className,
  ...props
}: DodaLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 140 40"
      role="img"
      aria-label={title}
      className={cn("h-8 w-auto", className)}
      {...props}
    >
      <title>{title}</title>

      {/* D — left */}
      <path
        d="M 4 6 L 4 34 L 14 34 C 22 34 28 28 28 20 C 28 12 22 6 14 6 L 4 6 Z M 10 11 L 14 11 C 18 11 22 14.5 22 20 C 22 25.5 18 29 14 29 L 10 29 L 10 11 Z"
        fill="currentColor"
      />

      {/* O — second letter (full O, paired with the gold-dot O on the right) */}
      <path
        d="M 46 5 C 38 5 32 11.5 32 20 C 32 28.5 38 35 46 35 C 54 35 60 28.5 60 20 C 60 11.5 54 5 46 5 Z M 46 11 C 51 11 54 15 54 20 C 54 25 51 29 46 29 C 41 29 38 25 38 20 C 38 15 41 11 46 11 Z"
        fill="currentColor"
      />

      {/* D — middle (mirrored to read as second D in DODA) */}
      <path
        d="M 64 6 L 64 34 L 74 34 C 82 34 88 28 88 20 C 88 12 82 6 74 6 L 64 6 Z M 70 11 L 74 11 C 78 11 82 14.5 82 20 C 82 25.5 78 29 74 29 L 70 29 L 70 11 Z"
        fill="currentColor"
      />

      {/* A — right (as a stylized triangle to keep the geometry tight) */}
      <path
        d="M 92 34 L 102 6 L 108 6 L 118 34 L 112 34 L 110 28 L 100 28 L 98 34 Z M 102 23 L 108 23 L 105 14 Z"
        fill="currentColor"
      />

      {/* Gold accent dot — signature mark, sits as a counter-point to the A */}
      <circle cx="128" cy="30" r="4" fill={accentColor} />
    </svg>
  );
}
