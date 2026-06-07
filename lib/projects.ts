/**
 * Stub project portfolio data — used by `/projects` page in Prompt 6.
 * Moves to Supabase `projects` table in Prompt 7 with the same shape
 * (bilingual fields via i18n keys, image referenced by product slug).
 *
 * Real project photography is deferred until the client provides assets
 * (post-launch). For now we reuse the optimized product images from the
 * existing `PRODUCTS` catalogue so the gallery has visual weight.
 */

import { PRODUCTS, type Product } from "./products";

export const PROJECT_CATEGORIES = [
  "residential",
  "commercial",
  "luxury",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export interface Project {
  /** Stable kebab-case id, also used as the i18n key under `projects.items.{key}` */
  key: string;
  category: ProjectCategory;
  /** Source product whose optimized image we borrow for the project card */
  productSlug: string;
}

/** Resolve a project's image at module load — throw early if slug is wrong. */
function resolveProduct(slug: string): Product {
  const p = PRODUCTS.find((x) => x.slug === slug);
  if (!p) {
    throw new Error(
      `Project references unknown product slug "${slug}". ` +
        `Available slugs: ${PRODUCTS.map((x) => x.slug).join(", ")}`,
    );
  }
  return p;
}

/** Stable ordering — used for default grid display. */
export const PROJECTS: Project[] = [
  {
    key: "dubaiHillsVilla",
    category: "residential",
    productSlug: "grand-exterior-pivot",
  },
  {
    key: "jbrPenthouse",
    category: "luxury",
    productSlug: "glass-aluminium-sliding",
  },
  {
    key: "businessBayLobby",
    category: "commercial",
    productSlug: "modern-fluted-cladding",
  },
  {
    key: "palmJumeirahVilla",
    category: "luxury",
    productSlug: "custom-engineered-wpc",
  },
  {
    key: "alBarshaBoutique",
    category: "commercial",
    productSlug: "minimalist-pocket-sliding",
  },
  {
    key: "arabianRanchesHome",
    category: "residential",
    productSlug: "modern-wpc-interior",
  },
];

/**
 * Resolved view: project + its image — convenient for the page component.
 * Fails fast at module load if any product slug is bad.
 */
export const PROJECTS_WITH_IMAGES = PROJECTS.map((project) => ({
  ...project,
  image: resolveProduct(project.productSlug).image,
}));

export type ProjectWithImage = (typeof PROJECTS_WITH_IMAGES)[number];
