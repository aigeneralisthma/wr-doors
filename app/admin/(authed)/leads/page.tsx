import { getLeadsAdmin } from "@/lib/supabase/admin-queries";
import { LeadsTable } from "./leads-table";

/**
 * Admin Leads page — fetches the latest 50 leads and hands them to the
 * client table for filter/search/drawer interactions.
 *
 * The status update happens via a server action (see app/admin/actions.ts);
 * that action revalidates this path so the row reflects immediately.
 */
export default async function AdminLeadsPage() {
  const { rows, count } = await getLeadsAdmin({ limit: 50 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">Leads</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {count === 0
            ? "No leads yet."
            : `${count} ${count === 1 ? "lead" : "leads"} total · showing the ${
                rows.length === count ? "full list" : `most recent ${rows.length}`
              }.`}
        </p>
      </div>

      <LeadsTable leads={rows} />
    </div>
  );
}
