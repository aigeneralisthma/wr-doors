"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  LayoutDashboard,
  LogOut,
  Mail,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { signOut } from "@/app/admin/actions";

interface SidebarNavProps {
  /** The authenticated admin's email — shown at the bottom for identity confirmation */
  adminEmail: string;
}

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", Icon: Mail },
  { href: "/admin/bookings", label: "Bookings", Icon: Calendar },
] as const;

/**
 * SidebarNav — fixed left sidebar for the admin area.
 *
 * Client Component so we can highlight the active route via `usePathname`
 * and bind the sign-out button to its server action.
 */
export function SidebarNav({ adminEmail }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-card">
      {/* Brand header */}
      <div className="border-b border-border px-5 py-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          WR Doors
        </p>
        <p className="mt-1 font-serif text-lg font-bold text-foreground">
          Admin
        </p>
      </div>

      {/* Nav links */}
      <nav aria-label="Admin navigation" className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[var(--color-brand-navy)] text-white"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Admin identity + sign-out */}
      <div className="border-t border-border p-3">
        <p className="mb-2 px-2 text-xs text-muted-foreground" title={adminEmail}>
          Signed in as
          <br />
          <span className="font-medium text-foreground break-all">
            {adminEmail}
          </span>
        </p>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
