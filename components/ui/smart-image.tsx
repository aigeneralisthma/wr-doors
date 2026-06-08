import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { ProductImage } from "./product-image";
import type { RenderableImage } from "@/lib/supabase/image-helpers";

/**
 * SmartImage — renders either the full `<picture>` with responsive variants
 * (manifest-backed seeded images) OR a plain `<Image>` from next/image
 * (Supabase Storage-backed admin uploads).
 *
 * Callers don't need to know which kind they have — just pass the
 * `RenderableImage` from `productImageSmart()` / `projectImageSmart()`.
 *
 * For Storage URLs we use `next/image`. Vercel will re-optimize at request
 * time (counts against the per-month optimization quota — fine for low
 * traffic). To skip that, set `unoptimized` on the props passed through.
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

  // Storage URL — plain next/image
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
        // Storage hosts are added to next.config.ts to allow optimization
      />
    </div>
  );
}
