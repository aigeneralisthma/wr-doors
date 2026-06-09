import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * WR Doors official logo (PNG asset from the client).
 *
 * Source: `Requirments/Assets/WR_Doors_Logo.png`, copied to
 * `public/assets/brand/wr-doors-logo.png` so it can be served by next/image.
 *
 * Sizing: controlled by parent via `className`. The intrinsic 1310×800
 * (aspect ratio ~1.64:1) is passed to next/image for layout-shift-free
 * rendering, then Tailwind sizing utilities (e.g. `h-10 w-auto`) take over
 * at display time.
 *
 * Color: the PNG ships with its own background — `currentColor` no longer
 * applies. If a dark/light-mode variant is ever needed, swap the `src` per
 * theme via `useTheme()` rather than re-introducing the SVG.
 *
 * `priority` defaults to false. The header lockup overrides it to `true`
 * so the logo isn't deferred behind the LCP image.
 */
export interface WrDoorsLogoProps {
  /** Tailwind classes that control size + spacing. */
  className?: string;
  /** Accessibility label / alt text. */
  title?: string;
  /** Hint next/image to preload (use for header above-the-fold). */
  priority?: boolean;
  /**
   * Kept for API compatibility with the previous SVG component — has no
   * effect on the PNG (subtitle is baked into the asset). Will be removed
   * in a follow-up cleanup once all call sites stop passing it.
   *
   * @deprecated
   */
  showSubtitle?: boolean;
}

/** Intrinsic dimensions of the source PNG (1310 × 800). */
const INTRINSIC_WIDTH = 1310;
const INTRINSIC_HEIGHT = 800;

export function WrDoorsLogo({
  title = "WR Doors",
  className,
  priority = false,
  // showSubtitle is intentionally unused — see prop docs.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showSubtitle: _showSubtitle,
}: WrDoorsLogoProps) {
  return (
    <Image
      src="/assets/brand/wr-doors-logo.png"
      alt={title}
      width={INTRINSIC_WIDTH}
      height={INTRINSIC_HEIGHT}
      priority={priority}
      className={cn("h-10 w-auto", className)}
    />
  );
}
