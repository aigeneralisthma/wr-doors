import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { auth } from "@/auth";
import { SidebarNav } from "@/components/admin/sidebar-nav";

export const metadata: Metadata = {
  title: "Admin — WR Doors",
  description: "WR Doors administration",
  robots: { index: false, follow: false }, // never index admin
};

/**
 * Authed admin layout — fixed sidebar + main content area.
 *
 * Wraps everything in `app/admin/(authed)/*`. `/admin/login` lives OUTSIDE
 * this group so it doesn't get the sidebar or trigger the redirect
 * (which would infinite-loop).
 *
 * Middleware already blocks unauthed access; the `auth()` check here is
 * defense in depth and gives us the session for the sidebar identity.
 */
export default async function AuthedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SidebarNav adminEmail={session.user.email ?? "(no email)"} />

      <main className="flex-1 overflow-x-hidden">
        <div className="px-8 py-8 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
