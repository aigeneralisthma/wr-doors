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
    // Content Security Policy — strict allow-list per Prompt 10 plan.
    //
    // Compromises (documented):
    //   - 'unsafe-inline' on script-src: Next.js + Spline runtime inject
    //     inline scripts. Nonce-based CSP is more secure but adds boilerplate
    //     to every Server Component; defer to Phase 2 if SOC2 demands it.
    //   - 'unsafe-eval' on script-src: Spline runtime uses eval-like patterns;
    //     Next.js HMR needs it in dev.
    //   - 'unsafe-inline' on style-src: Tailwind utility classes generate
    //     inline styles; next/image placeholder uses inline style attr.
    //
    // Each external host below is whitelisted intentionally:
    //   - prod.spline.design / my.spline.design — homepage 3D hero
    //   - va.vercel-scripts.com — Vercel Analytics
    //   - *.supabase.co — auth, queries, Storage CDN
    //   - api.resend.com — server-side email send (from server actions)
    //   - www.google.com / maps.gstatic.com / maps.googleapis.com — contact page map
    //   - fonts.googleapis.com / fonts.gstatic.com — next/font Google Fonts loader
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://prod.spline.design https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co https://maps.gstatic.com https://maps.googleapis.com https://prod.spline.design",
      "frame-src https://www.google.com https://my.spline.design",
      "connect-src 'self' https://*.supabase.co https://api.resend.com https://prod.spline.design https://vitals.vercel-insights.com",
      "worker-src 'self' blob:",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: csp,
          },
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
