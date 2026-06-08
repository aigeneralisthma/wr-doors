import type { MetadataRoute } from "next";

import { BRAND, PRODUCT_CATEGORIES } from "@/lib/constants";
import { createStaticClient } from "@/lib/supabase/static";

/**
 * Dynamic sitemap — generates one entry per public URL across both
 * locales (en + ar). Read by Google/Bing/etc. via /sitemap.xml.
 *
 * Per Google's bilingual SEO guidance, each URL also declares its
 * `alternates.languages` so the crawler knows en ⇄ ar pairs.
 *
 * Dynamic slugs (products + projects) are fetched at build time via
 * the static (no-cookies) Supabase client. The sitemap re-generates
 * on each deploy + ISR revalidation.
 */

const LOCALES = ["en", "ar"] as const;

interface StaticRoute {
  /** Path without locale prefix, e.g. "/products" or "" for homepage */
  path: string;
  /** When this page meaningfully changes — affects crawler scheduling */
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  /** Hint for which pages matter most (0..1) */
  priority: number;
}

const STATIC_ROUTES: StaticRoute[] = [
  { path: "", changeFrequency: "weekly", priority: 1.0 },
  { path: "/products", changeFrequency: "weekly", priority: 0.9 },
  { path: "/projects", changeFrequency: "monthly", priority: 0.7 },
  { path: "/services", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about", changeFrequency: "yearly", priority: 0.5 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
  { path: "/book", changeFrequency: "monthly", priority: 0.8 },
  { path: "/quote", changeFrequency: "monthly", priority: 0.8 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createStaticClient();

  // Fetch dynamic slugs in parallel
  const [{ data: products }, { data: projects }] = await Promise.all([
    supabase
      .from("products")
      .select("slug, category, updated_at")
      .eq("is_active", true),
    supabase
      .from("projects")
      .select("slug, updated_at")
      .eq("is_published", true),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  // Static routes — one entry per locale per route
  for (const route of STATIC_ROUTES) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BRAND.url}/${locale}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: {
            en: `${BRAND.url}/en${route.path}`,
            ar: `${BRAND.url}/ar${route.path}`,
          },
        },
      });
    }
  }

  // Category landing pages
  for (const cat of PRODUCT_CATEGORIES) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BRAND.url}/${locale}/products/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: {
          languages: {
            en: `${BRAND.url}/en/products/${cat.slug}`,
            ar: `${BRAND.url}/ar/products/${cat.slug}`,
          },
        },
      });
    }
  }

  // Product detail pages
  for (const p of products ?? []) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BRAND.url}/${locale}/products/${p.category}/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: {
          languages: {
            en: `${BRAND.url}/en/products/${p.category}/${p.slug}`,
            ar: `${BRAND.url}/ar/products/${p.category}/${p.slug}`,
          },
        },
      });
    }
  }

  // We don't have project detail pages yet (deferred to v2) — projects
  // are listed on /projects only, so they don't get individual sitemap
  // entries. The /projects route itself is in STATIC_ROUTES above.
  void projects;

  return entries;
}
