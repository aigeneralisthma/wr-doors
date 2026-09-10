import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { ProductImage } from "./product-image";
import type { RenderableImage } from "@/lib/media/image-helpers";

/**
 * SmartImage — renders either the full `<picture>` with responsive variants
 * (manifest-backed seeded images) OR a plain `<Image>` from next/image
 * (admin-uploaded files under `/uploads/...`).
 *
 * Callers don't need to know which kind they have — just pass the
 * `RenderableImage` from `productImageSmart()` / `projectImageSmart()`.
 *
 * Uploaded files are local paths, so `next/image` optimizes them at
 * request time with no `remotePatterns` entry needed.
 */
export interface SmartImageProps {
  image: RenderableImage;
  alt: string;
  sizes?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
  className?: string;
}

export function SmartImage({
  image,
  alt,
  sizes,
  priority,
  fit = "cover",
  className,
}: SmartImageProps) {
  if (image.kind === "manifest") {
    return (
      <ProductImage
        image={image.image}
        alt={alt}
        sizes={sizes}
        priority={priority}
        fit={fit}
        className={className}
      />
    );
  }

  // Uploaded file — plain next/image (local path, optimized at request time)
  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      <Image
        src={image.image.src}
        alt={alt}
        fill
        sizes={sizes ?? "(max-width: 768px) 100vw, (max-width: 1024px) 75vw, 50vw"}
        priority={priority}
        className={cn(
          "h-full w-full",
          fit === "cover" ? "object-cover" : "object-contain",
        )}
      />
    </div>
  );
}
