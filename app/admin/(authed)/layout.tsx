import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { SidebarNav } from "@/components/admin/sidebar-nav";

export const metadata: Metadata = {
  title: "Admin — WR Doors",
  description: "WR Doors administration",
  robots: { index: false, follow: false }, // never index admin
};

/**
 * Authed admin layout — fixed sidebar + main content area.
 *
 * Wraps EVERYTHING in `app/admin/(authed)/*` (dashboard, leads, bookings).
 * The `/admin/login` route lives OUTSIDE this group so it doesn't get the
 * sidebar and doesn't trigger the auth redirect (which would infinite-loop).
 *
 * Server Component — does the auth check + reads admin email for the
 * sidebar identity display. Middleware also blocks unauthed access, so
 * this is defense in depth.
 */
export default async function AuthedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Middleware should have redirected, but defensive in case it didn't.
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SidebarNav adminEmail={user.email ?? "(no email)"} />

      <main className="flex-1 overflow-x-hidden">
        <div className="px-8 py-8 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
