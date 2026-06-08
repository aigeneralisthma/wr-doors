import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

interface ImageThumbProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * ImageThumb — small image tile used in admin list pages and as the
 * gallery thumbnail in the gallery editor.
 *
 * Works with both local manifest paths (`/assets/...`) and Supabase
 * Storage URLs (`https://*.supabase.co/storage/...`). The Storage host
 * is whitelisted in next.config.ts so `next/image` can optimize it.
 *
 * If the URL is missing or empty, renders a muted placeholder so the
 * tile keeps its shape (no layout shift).
 */
const SIZE_MAP = {
  sm: { w: 48, h: 36, class: "h-9 w-12" },
  md: { w: 96, h: 72, class: "h-18 w-24" },
  lg: { w: 192, h: 144, class: "h-36 w-48" },
} as const;

export function ImageThumb({
  src,
  alt,
  size = "md",
  className,
}: ImageThumbProps) {
  const dims = SIZE_MAP[size];

  if (!src) {
    return (
      <div
        className={cn(
          "rounded-md border border-border bg-muted/60",
          dims.class,
          className,
        )}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border border-border bg-muted",
        dims.class,
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={dims.w}
        height={dims.h}
        className="h-full w-full object-cover"
        sizes={`${dims.w}px`}
      />
    </div>
  );
}
