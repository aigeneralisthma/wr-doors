import type { MetadataRoute } from "next";

import { BRAND } from "@/lib/constants";

/**
 * Robots config — exposed at /robots.txt.
 *
 * Rules:
 *   - All crawlers can index everything except /admin and /api
 *   - /admin is admin-only UI — keeping it out of the index also keeps
 *     the login URL from being discoverable by random scanners
 *   - /api covers any future API routes we add
 *   - Sitemap pointer helps Google/Bing find all our public URLs faster
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${BRAND.url}/sitemap.xml`,
    host: BRAND.url,
  };
}
