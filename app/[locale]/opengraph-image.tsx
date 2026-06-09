import { ImageResponse } from "next/og";

import { BRAND } from "@/lib/constants";

/**
 * Default Open Graph image — applies to every page under /[locale] unless
 * a route segment provides its own opengraph-image.tsx override.
 *
 * Generated at request time (or cached at edge) via Next.js's ImageResponse
 * API — no static PNG to ship or keep in sync with brand updates. Renders
 * the WR Doors wordmark + AI DODO trademark on the brand navy background
 * with the gold accent bar.
 *
 * Twitter cards reuse this image automatically because we don't ship a
 * twitter-image override; Next.js falls back to opengraph-image when
 * twitter.card is summary_large_image.
 */

export const runtime = "edge";
export const alt = `${BRAND.name} — Premium Doors & Home Services in UAE`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface OgProps {
  params: Promise<{ locale: string }>;
}

export default async function OpengraphImage({ params }: OgProps) {
  const { locale } = await params;
  const isArabic = locale === "ar";

  // Brand palette — keep in sync with tailwind theme tokens
  const NAVY = "#0A1F44"; // brand navy
  const GOLD = "#F5B800"; // brand gold
  const CREAM = "#F5F0E8";

  const heading = isArabic ? "وَر دورز" : "WR Doors";
  const tagline = isArabic
    ? "أبواب فاخرة وخدمات منزلية في الإمارات"
    : "Premium Doors & Home Services in UAE";
  const endorsement = isArabic
    ? "الموقع يُدار بواسطة AI DODO™"
    : "Site managed by AI DODO™";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: `linear-gradient(135deg, ${NAVY} 0%, #050E22 100%)`,
          padding: "80px",
          fontFamily: "sans-serif",
          color: CREAM,
          direction: isArabic ? "rtl" : "ltr",
        }}
      >
        {/* Top — gold accent bar */}
        <div
          style={{
            width: "120px",
            height: "8px",
            background: GOLD,
            borderRadius: "4px",
          }}
        />

        {/* Center — wordmark + tagline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              fontSize: "140px",
              fontWeight: 700,
              letterSpacing: "-0.04em",
              color: CREAM,
              lineHeight: 1,
            }}
          >
            {heading}
          </div>
          <div
            style={{
              fontSize: "44px",
              fontWeight: 400,
              color: GOLD,
              maxWidth: "880px",
              lineHeight: 1.2,
            }}
          >
            {tagline}
          </div>
        </div>

        {/* Bottom — endorsement + URL */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "28px",
            color: `${CREAM}99`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {endorsement}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontFamily: "monospace",
            }}
          >
            {BRAND.url.replace(/^https?:\/\//, "")}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
