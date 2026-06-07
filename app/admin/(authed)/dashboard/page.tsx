import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Inbox,
  Languages,
  Mail,
  TrendingUp,
} from "lucide-react";

import { getDashboardStats } from "@/lib/supabase/admin-queries";
import { StatCard } from "@/components/admin/stat-card";

/**
 * Admin dashboard — single screen overview of the operations queue.
 *
 * No interactivity — pure read. Auto-revalidates on demand via
 * revalidatePath() calls from the leads/bookings update actions.
 */
export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const convRate =
    stats.leads.total > 0
      ? Math.round((stats.leads.byStatus.converted / stats.leads.total) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          What&apos;s happening across leads and bookings right now.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="New leads"
          value={stats.leads.byStatus.new}
          subtext={`${stats.leads.last7days} in last 7 days`}
          icon={<Inbox className="h-4 w-4" />}
        />
        <StatCard
          label="Upcoming bookings"
          value={stats.bookings.upcoming}
          subtext={`${stats.bookings.last7days} new in last 7 days`}
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatCard
          label="Conversion rate"
          value={`${convRate}%`}
          subtext={`${stats.leads.byStatus.converted} of ${stats.leads.total} leads`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          label="Locale split (leads)"
          value={`${stats.leads.byLocale.en} EN / ${stats.leads.byLocale.ar} AR`}
          subtext="reply in customer's language"
          icon={<Languages className="h-4 w-4" />}
        />
      </div>

      {/* Two-column: lead breakdown + booking breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Leads breakdown */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-foreground">
              Leads
            </h2>
            <Link
              href="/admin/leads"
              className="text-xs font-medium text-primary hover:underline"
            >
              Manage all →
            </Link>
          </div>
          <dl className="space-y-2 text-sm">
            <StatusRow label="New" count={stats.leads.byStatus.new} highlight />
            <StatusRow label="Contacted" count={stats.leads.byStatus.contacted} />
            <StatusRow label="Converted" count={stats.leads.byStatus.converted} />
            <StatusRow label="Lost" count={stats.leads.byStatus.lost} dimmed />
          </dl>
          <div className="mt-4 border-t border-border pt-4">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              By source
            </p>
            <dl className="space-y-1.5 text-sm">
              <StatusRow label="Quote requests" count={stats.leads.bySource.quote} />
              <StatusRow label="Contact form" count={stats.leads.bySource.contact} />
              <StatusRow
                label="Product page inquiries"
                count={stats.leads.bySource["product-page"]}
              />
            </dl>
          </div>
        </section>

        {/* Bookings breakdown */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-foreground">
              Bookings
            </h2>
            <Link
              href="/admin/bookings"
              className="text-xs font-medium text-primary hover:underline"
            >
              Manage all →
            </Link>
          </div>
          <dl className="space-y-2 text-sm">
            <StatusRow label="New" count={stats.bookings.byStatus.new} highlight />
            <StatusRow label="Confirmed" count={stats.bookings.byStatus.confirmed} />
            <StatusRow label="In progress" count={stats.bookings.byStatus.in_progress} />
            <StatusRow label="Completed" count={stats.bookings.byStatus.completed} dimmed />
            <StatusRow label="Cancelled" count={stats.bookings.byStatus.cancelled} dimmed />
          </dl>
        </section>
      </div>

      {/* Recent activity */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 font-serif text-lg font-bold text-foreground">
          Recent activity
        </h2>
        {stats.recent.leads.length === 0 && stats.recent.bookings.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {mergeAndSortRecent(stats.recent).map((item) => (
              <li key={`${item.type}-${item.id}`} className="flex items-start gap-3 py-3">
                <div className="mt-0.5">
                  {item.type === "lead" ? (
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.subtitle} ·{" "}
                    {new Date(item.createdAt).toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function StatusRow({
  label,
  count,
  highlight,
  dimmed,
}: {
  label: string;
  count: number;
  highlight?: boolean;
  dimmed?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt
        className={
          dimmed
            ? "text-muted-foreground"
            : highlight
              ? "font-semibold text-foreground"
              : "text-foreground"
        }
      >
        {label}
      </dt>
      <dd
        className={
          dimmed
            ? "font-mono text-sm text-muted-foreground"
            : highlight
              ? "font-mono text-sm font-bold text-[var(--color-brand-navy)]"
              : "font-mono text-sm font-medium text-foreground"
        }
      >
        {count}
      </dd>
    </div>
  );
}

interface RecentItem {
  type: "lead" | "booking";
  id: string;
  title: string;
  subtitle: string;
  createdAt: string;
}

function mergeAndSortRecent(recent: {
  leads: { id: string; name: string; source: string; created_at: string }[];
  bookings: { id: string; customer_name: string; service: string; created_at: string }[];
}): RecentItem[] {
  const items: RecentItem[] = [
    ...recent.leads.map((l) => ({
      type: "lead" as const,
      id: l.id,
      title: l.name,
      subtitle: `${l.source} lead`,
      createdAt: l.created_at,
    })),
    ...recent.bookings.map((b) => ({
      type: "booking" as const,
      id: b.id,
      title: b.customer_name,
      subtitle: `${b.service} booking`,
      createdAt: b.created_at,
    })),
  ];
  return items
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
    .slice(0, 8);
}
