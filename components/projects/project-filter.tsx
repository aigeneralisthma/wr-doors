"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import {
  PROJECT_CATEGORIES,
  PROJECTS_WITH_IMAGES,
  type ProjectCategory,
} from "@/lib/projects";
import { ProjectCard } from "./project-card";

type FilterValue = "all" | ProjectCategory;

interface ProjectFilterProps {
  /**
   * Per-project translated strings keyed by `Project.key`.
   * Shape: `{ dubaiHillsVilla: { title, location, summary }, ... }`
   *
   * Resolved by the Server Component page and passed in as a plain
   * serializable object so we don't have to ship all item translations
   * to the client.
   */
  items: Record<string, { title: string; location: string; summary: string }>;
}

/**
 * ProjectFilter — Client Component with category pills + project grid.
 *
 * State lives entirely in this component (no URL params), so navigation
 * is instant and the page stays SSG. When the user picks a category,
 * we just filter the in-memory `PROJECTS_WITH_IMAGES` list.
 *
 * Translation strategy: filter labels + count + empty state use
 * `useTranslations("projects")` directly here — next-intl supports
 * Client Components and these keys are short, so the bundle impact
 * is negligible. Per-project bilingual content is heavier, so it stays
 * server-resolved and is passed in via `items`.
 */
export function ProjectFilter({ items }: ProjectFilterProps) {
  const t = useTranslations("projects");
  const [active, setActive] = useState<FilterValue>("all");

  const filtered = useMemo(() => {
    if (active === "all") return PROJECTS_WITH_IMAGES;
    return PROJECTS_WITH_IMAGES.filter((p) => p.category === active);
  }, [active]);

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
          {filtered.map((project) => {
            const item = items[project.key];
            if (!item) return null;
            return (
              <ProjectCard
                key={project.key}
                project={project}
                title={item.title}
                location={item.location}
                summary={item.summary}
                viewLabel={t("viewProject")}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Re-exported for use in tests / pages */
export { PROJECT_CATEGORIES };
