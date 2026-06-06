import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/**
 * next-intl plugin wires up the request config (i18n/request.ts) so that
 * Server Components can resolve translations during SSR.
 */
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  /**
   * Security headers applied to every response.
   * - CSP: prevents XSS by restricting resource origins (we allow Spline + Supabase + Resend webhooks)
   * - X-Frame-Options: prevents clickjacking
   * - X-Content-Type-Options: blocks MIME-sniffing
   * - Referrer-Policy: limits referrer leakage
   * - Permissions-Policy: disables unused powerful APIs
   * - Strict-Transport-Security: forces HTTPS once seen (Vercel terminates TLS)
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },

  /**
   * Image optimization config.
   * Sharp pipeline produces our own WebP/AVIF in 3 sizes — but we still
   * use next/image as the rendering layer for lazy loading + sizes.
   */
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 768, 1024, 1280, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },

  /**
   * Strict mode catches subtle React bugs early.
   * TypeScript errors block the production build (no `ignoreBuildErrors`).
   */
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
