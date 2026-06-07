"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import type { OptimizedImage } from "@/lib/image-manifest";
import type { ProjectCategory } from "@/lib/supabase/database.types";
import { ProjectCard } from "./project-card";

type FilterValue = "all" | ProjectCategory;

/**
 * Per-project enriched data: bilingual strings already resolved server-side
 * for the active locale, plus the OptimizedImage looked up via image-helpers.
 * Plain serializable shape so Server → Client boundary is clean.
 */
export interface EnrichedProject {
  slug: string;
  category: ProjectCategory;
  title: string;
  location: string;
  summary: string;
  image: OptimizedImage;
}

interface ProjectFilterProps {
  projects: EnrichedProject[];
}

/**
 * ProjectFilter — Client Component with category pills + project grid.
 *
 * State lives entirely in this component (no URL params), so navigation
 * is instant and the page stays SSG. When the user picks a category,
 * we just filter the projects array in-memory.
 *
 * Translation strategy: filter labels + count + empty state use
 * `useTranslations("projects")` directly here — next-intl supports
 * Client Components and these keys are short, so the bundle impact
 * is negligible. Per-project bilingual content is heavier, so it stays
 * server-resolved (via `localized()` in the page) and is passed in
 * already-translated via `projects`.
 */
export function ProjectFilter({ projects }: ProjectFilterProps) {
  const t = useTranslations("projects");
  const [active, setActive] = useState<FilterValue>("all");

  const filtered = useMemo(() => {
    if (active === "all") return projects;
    return projects.filter((p) => p.category === active);
  }, [active, projects]);

  const FILTER_OPTIONS: Array<{ key: FilterValue; labelKey: string }> = [
    { key: "all", labelKey: "filterAll" },
    { key: "residential", labelKey: "filterResidential" },
    { key: "commercial", labelKey: "filterCommercial" },
    { key: "luxury", labelKey: "filterLuxury" },
  ];

  return (
    <div data-testid="project-filter">
      {/* ── Filter pills ── */}
      <div
        role="tablist"
        aria-label="Filter projects by category"
        className="mb-4 flex flex-wrap gap-2"
      >
        {FILTER_OPTIONS.map((opt) => {
          const isActive = active === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(opt.key)}
              className={
                "rounded-full px-4 py-2 text-sm font-medium transition-colors " +
                (isActive
                  ? "bg-[var(--color-brand-navy)] text-white"
                  : "bg-muted text-foreground hover:bg-muted/70")
              }
            >
              {t(opt.labelKey)}
            </button>
          );
        })}
      </div>

      {/* ── Result count ── */}
      <p
        className="mb-8 text-xs text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        {t("filterCount", { count: filtered.length })}
      </p>

      {/* ── Grid or empty state ── */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center text-sm text-muted-foreground">
          {t("emptyState")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard
              key={project.slug}
              category={project.category}
              image={project.image}
              title={project.title}
              location={project.location}
              summary={project.summary}
              viewLabel={t("viewProject")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
