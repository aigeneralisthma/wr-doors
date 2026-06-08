import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

import "../globals.css";

export const metadata: Metadata = {
  title: "Admin — WR Doors",
  description: "WR Doors administration",
  robots: { index: false, follow: false },
};

/**
 * Root admin layout — provides the `<html>` and `<body>` tags required by
 * Next.js for every route. The public site has its own root layout at
 * `app/[locale]/layout.tsx`; admin lives in a separate top-level segment
 * so its routes don't get the next-intl provider, fonts, header, footer,
 * or RTL handling (all English-only, sidebar-driven).
 *
 * Nested layouts:
 *   - `(authed)/layout.tsx` — wraps dashboard/leads/bookings with the
 *     sidebar and runs an auth check
 *   - `login/page.tsx` — uses this root layout directly (no sidebar)
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground font-sans">
        {children}
        {/* Track admin pageviews too — helps measure operator usage patterns */}
        <Analytics />
      </body>
    </html>
  );
}
