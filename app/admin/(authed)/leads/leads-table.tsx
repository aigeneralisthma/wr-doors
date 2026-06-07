"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { LeadRow, LeadStatus } from "@/lib/supabase/database.types";

import { LeadDetailDrawer } from "./lead-detail-drawer";

interface LeadsTableProps {
  leads: LeadRow[];
}

type FilterValue = "all" | LeadStatus;

const STATUS_FILTERS: Array<{ key: FilterValue; label: string }> = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "converted", label: "Converted" },
  { key: "lost", label: "Lost" },
];

const STATUS_BADGE: Record<LeadStatus, string> = {
  new: "bg-amber-100 text-amber-900 border-amber-300",
  contacted: "bg-blue-100 text-blue-900 border-blue-300",
  converted: "bg-emerald-100 text-emerald-900 border-emerald-300",
  lost: "bg-zinc-100 text-zinc-600 border-zinc-300",
};

const SOURCE_LABEL: Record<string, string> = {
  quote: "Quote",
  contact: "Contact",
  "product-page": "Product",
};

export function LeadsTable({ leads }: LeadsTableProps) {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<LeadRow | null>(null);

  const filtered = useMemo(() => {
    let result = leads;
    if (filter !== "all") {
      result = result.filter((l) => l.status === filter);
    }
    if (search.trim().length > 0) {
      const term = search.trim().toLowerCase();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(term) ||
          l.phone.toLowerCase().includes(term) ||
          (l.email ?? "").toLowerCase().includes(term),
      );
    }
    return result;
  }, [leads, filter, search]);

  return (
    <>
      {/* Filter pills + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="Filter by status" className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((opt) => {
            const isActive = filter === opt.key;
            const count =
              opt.key === "all"
                ? leads.length
                : leads.filter((l) => l.status === opt.key).length;
            return (
              <button
                key={opt.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setFilter(opt.key)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-[var(--color-brand-navy)] text-white"
                    : "bg-muted text-foreground hover:bg-muted/70",
                )}
              >
                {opt.label}{" "}
                <span className={isActive ? "text-white/70" : "text-muted-foreground"}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search name, phone, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {filtered.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">
            No leads match the current filter.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Source</th>
                <th className="px-4 py-3 font-semibold">Lang</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((lead) => (
                <tr
                  key={lead.id}
                  className="cursor-pointer transition-colors hover:bg-muted/30"
                  onClick={() => setSelected(lead)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(lead);
                    }
                  }}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{lead.name}</div>
                    <div className="text-xs text-muted-foreground">
                      <span dir="ltr">{lead.phone}</span>
                      {lead.email && (
                        <>
                          {" · "}
                          {lead.email}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {SOURCE_LABEL[lead.source] ?? lead.source}
                  </td>
                  <td className="px-4 py-3">
                    <span title={lead.locale === "ar" ? "Arabic" : "English"}>
                      {lead.locale === "ar" ? "🇸🇦 AR" : "🇬🇧 EN"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        STATUS_BADGE[lead.status],
                      )}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(lead.created_at).toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Drawer */}
      <LeadDetailDrawer
        lead={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
