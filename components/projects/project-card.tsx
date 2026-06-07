import { ArrowRight } from "lucide-react";

import { ProductImage } from "@/components/ui/product-image";
import type { ProjectWithImage } from "@/lib/projects";

interface ProjectCardProps {
  project: ProjectWithImage;
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
 * Decorative-only card for Prompt 6 — there's no per-project detail page
 * yet, so the arrow CTA is visual not navigational. When Supabase-backed
 * project detail pages land (post-launch), wrap this in a Link.
 */
export function ProjectCard({
  project,
  title,
  location,
  summary,
  viewLabel,
}: ProjectCardProps) {
  return (
    <article
      className="group relative overflow-hidden rounded-2xl bg-card shadow-sm transition-shadow hover:shadow-lg"
      data-category={project.category}
      aria-label={`${title} — ${location}`}
    >
      <ProductImage
        image={project.image}
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
        <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium opacity-90">
          <span>{viewLabel}</span>
          <ArrowRight
            className="size-3 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
            aria-hidden
          />
        </div>
      </div>
    </article>
  );
}
