"use client";

import { cn } from "@/lib/utils";
import type {
  BookingRow,
  BookingStatus,
  TechnicianRow,
} from "@/lib/supabase/database.types";

interface BookingsTableProps {
  bookings: BookingRow[];
  technicians: TechnicianRow[];
  onSelectRow: (booking: BookingRow) => void;
}

const STATUS_BADGE: Record<BookingStatus, string> = {
  new: "bg-amber-100 text-amber-900 border-amber-300",
  confirmed: "bg-navy/10 text-navy border-navy/30",
  in_progress: "bg-blue-100 text-blue-900 border-blue-300",
  completed: "bg-emerald-100 text-emerald-900 border-emerald-300",
  cancelled: "bg-zinc-100 text-zinc-600 border-zinc-300",
};

export function BookingsTable({
  bookings,
  technicians,
  onSelectRow,
}: BookingsTableProps) {
  const techMap = new Map(technicians.map((t) => [t.id, t.name]));

  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground shadow-sm">
        No bookings yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3 font-semibold">Customer</th>
            <th className="px-4 py-3 font-semibold">Service</th>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Area</th>
            <th className="px-4 py-3 font-semibold">Technician</th>
            <th className="px-4 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {bookings.map((b) => (
            <tr
              key={b.id}
              className="cursor-pointer transition-colors hover:bg-muted/30"
              onClick={() => onSelectRow(b)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectRow(b);
                }
              }}
            >
              <td className="px-4 py-3">
                <div className="font-medium text-foreground">
                  {b.customer_name}
                </div>
                <div className="text-xs text-muted-foreground">
                  <span dir="ltr">{b.phone}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-foreground capitalize">
                {b.service}
              </td>
              <td className="px-4 py-3 text-foreground">
                {new Date(b.preferred_date).toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </td>
              <td className="px-4 py-3 text-foreground">{b.area}</td>
              <td className="px-4 py-3 text-foreground">
                {b.assigned_technician
                  ? techMap.get(b.assigned_technician) ?? "(unknown)"
                  : <span className="text-muted-foreground">—</span>}
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    STATUS_BADGE[b.status],
                  )}
                >
                  {b.status.replace("_", " ")}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
