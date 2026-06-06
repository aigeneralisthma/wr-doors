import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * WR Doors wordmark recreated from the client flyer.
 *
 * Visual structure (matches flyer):
 *   - Outer square frame (open at top-right corner)
 *   - Solid filled corner accent (the "shield" feel of the flyer)
 *   - Stacked text: "WR DOORS" (display) / "TRADING LLC." (subtitle)
 *
 * The frame uses `currentColor` so we can recolor the logo via parent text
 * color — gold on navy, navy on cream, white on dark, etc.
 *
 * Sizing: controlled by parent. Use Tailwind utilities like `h-10 w-auto`.
 */
export interface WrDoorsLogoProps extends React.SVGAttributes<SVGSVGElement> {
  /** Show the "Trading LLC." line under the wordmark. Hidden in compact contexts. */
  showSubtitle?: boolean;
  /** Accessibility label */
  title?: string;
}

export function WrDoorsLogo({
  showSubtitle = true,
  title = "WR Doors — Wahat Al Ruman Doors Trading LLC",
  className,
  ...props
}: WrDoorsLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 280 100"
      role="img"
      aria-label={title}
      className={cn("h-10 w-auto", className)}
      {...props}
    >
      <title>{title}</title>

      {/* Open-corner square frame (navy / currentColor) */}
      <g stroke="currentColor" strokeWidth="3" fill="none">
        {/* Bottom + left + bottom-right corner */}
        <path d="M 10 10 L 10 90 L 78 90 L 78 70" strokeLinecap="square" />
        {/* Top + right partial (open at top-right corner) */}
        <path d="M 10 10 L 60 10 M 78 10 L 78 30" strokeLinecap="square" />
      </g>

      {/* Solid filled corner block (the "shield" accent from the flyer) */}
      <rect x="50" y="34" width="22" height="32" fill="currentColor" />

      {/* Wordmark — "WR" inside the frame */}
      <text
        x="22"
        y="64"
        fontFamily="var(--font-serif), Georgia, serif"
        fontSize="36"
        fontWeight="700"
        fill="currentColor"
        letterSpacing="-1"
      >
        WR
      </text>

      {/* "DOORS" text block (to the right of the frame) */}
      <text
        x="100"
        y="48"
        fontFamily="var(--font-sans), system-ui, sans-serif"
        fontSize="22"
        fontWeight="700"
        fill="currentColor"
        letterSpacing="4"
      >
        DOORS
      </text>

      {showSubtitle && (
        <text
          x="100"
          y="72"
          fontFamily="var(--font-sans), system-ui, sans-serif"
          fontSize="12"
          fontWeight="500"
          fill="currentColor"
          letterSpacing="3"
          opacity="0.75"
        >
          TRADING LLC.
        </text>
      )}
    </svg>
  );
}
