import { ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { ProductImage } from "@/components/ui/product-image";
import type { OptimizedImage } from "@/lib/image-manifest";
import type { ProjectCategory } from "@/lib/supabase/database.types";

interface ProjectCardProps {
  /** Project slug — used to build the detail-page URL */
  slug: string;
  /** Used for `data-category` attribute on the article (for tests) */
  category: ProjectCategory;
  /** Resolved OptimizedImage (caller looks up via `projectImage(row)`) */
  image: OptimizedImage;
  /** Translated title shown over the image gradient */
  title: string;
  /** Translated location string (e.g. "Dubai Hills · Residential") */
  location: string;
  /** Translated short summary used on hover and for screen readers */
  summary: string;
  /** Translated "View details" link label */
  viewLabel: string;
}

/**
 * ProjectCard — image-led portfolio card.
 *
 * Layout:
 *   ┌────────────────────────┐
 *   │ [4:3 image]            │
 *   │ ▓▓▓▓ gradient ▓▓▓▓     │
 *   │  location              │
 *   │  TITLE                 │
 *   │  → View details        │
 *   └────────────────────────┘
 *
 * The whole card is a Link to `/projects/[slug]` — clicking anywhere
 * (image, title, or the arrow CTA) navigates to the detail page.
 */
export function ProjectCard({
  slug,
  category,
  image,
  title,
  location,
  summary,
  viewLabel,
}: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${slug}`}
      className="group relative block overflow-hidden rounded-2xl bg-card shadow-sm transition-shadow hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-gold)] focus-visible:ring-offset-2"
      data-category={category}
      aria-label={`${title} — ${location}`}
    >
      <ProductImage
        image={image}
        alt={title}
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="aspect-[4/3] transition-transform duration-500 group-hover:scale-105"
      />

      {/* Caption overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-brand-navy)]/90 via-[var(--color-brand-navy)]/40 to-transparent"
      />

      <div className="absolute inset-x-0 bottom-0 p-6 text-[var(--color-brand-cream)]">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-brand-gold)]">
          {location}
        </p>
        <h3 className="mt-2 font-serif text-lg font-bold leading-tight sm:text-xl">
          {title}
        </h3>
        <p className="mt-2 text-xs text-white/70 line-clamp-2">{summary}</p>
        <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium opacity-90 group-hover:text-[var(--color-brand-gold)] transition-colors">
          <span>{viewLabel}</span>
          <ArrowRight
            className="size-3 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
            aria-hidden
          />
        </div>
      </div>
    </Link>
  );
}
