import * as React from "react";
import { cn } from "@/lib/utils";
import type { OptimizedImage } from "@/lib/image-manifest";

/**
 * ProductImage — renders an `<picture>` with full responsive variants
 * (AVIF → WebP → JPG fallback) and a blurred placeholder while loading.
 *
 * Why a hand-rolled <picture> instead of next/image?
 * - Our Sharp pipeline already produces optimized assets in 3 sizes × 3
 *   formats. Using next/image would re-optimize them at request time
 *   for no benefit, wasting Vercel image-processing quota.
 * - We get full control over the `sizes` attribute per usage so we can
 *   tune for hero, grid, and detail-page contexts independently.
 *
 * Accessibility:
 * - Always require an explicit `alt` — no default fallback that hides
 *   missing alt text from a11y audits.
 * - The placeholder uses `aria-hidden` so SR users hear only the image.
 */
export interface ProductImageProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  image: OptimizedImage;
  alt: string;
  /** Responsive sizes attribute. Default tuned for full-bleed product hero. */
  sizes?: string;
  /** Set to true for above-the-fold (hero) images — eagerly loads largest. */
  priority?: boolean;
  /** Object-fit on the image (default cover). */
  fit?: "cover" | "contain";
}

/** Returns the variants for a given format, sorted small → large. */
function variantsFor(image: OptimizedImage, format: "avif" | "webp" | "jpg") {
  return image.variants
    .filter((v) => v.format === format)
    .sort((a, b) => a.width - b.width);
}

/** Builds a srcset string for a given format. */
function srcSetFor(image: OptimizedImage, format: "avif" | "webp" | "jpg"): string {
  return variantsFor(image, format)
    .map((v) => `${v.path} ${v.width}w`)
    .join(", ");
}

/** Largest JPG path (used as <img src> fallback). */
function largestJpg(image: OptimizedImage): string | undefined {
  const jpgs = variantsFor(image, "jpg");
  return jpgs[jpgs.length - 1]?.path;
}

export function ProductImage({
  image,
  alt,
  sizes = "(max-width: 768px) 100vw, (max-width: 1024px) 75vw, 50vw",
  priority = false,
  fit = "cover",
  className,
  ...props
}: ProductImageProps) {
  return (
    <div
      className={cn("relative overflow-hidden bg-muted", className)}
      style={{
        backgroundImage: `url(${image.blurDataURL})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      {...props}
    >
      <picture>
        <source type="image/avif" srcSet={srcSetFor(image, "avif")} sizes={sizes} />
        <source type="image/webp" srcSet={srcSetFor(image, "webp")} sizes={sizes} />
        <img
          src={largestJpg(image)}
          srcSet={srcSetFor(image, "jpg")}
          sizes={sizes}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "auto"}
          className={cn(
            "h-full w-full",
            fit === "cover" ? "object-cover" : "object-contain",
          )}
        />
      </picture>
    </div>
  );
}
