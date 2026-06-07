"use client";

import { useState } from "react";
import { CalendarDays, List } from "lucide-react";

import { cn } from "@/lib/utils";
import type {
  BookingRow,
  TechnicianRow,
} from "@/lib/supabase/database.types";

import { BookingsCalendar } from "./bookings-calendar";
import { BookingsTable } from "./bookings-table";
import { BookingDetailDrawer } from "./booking-detail-drawer";

interface BookingsViewProps {
  bookings: BookingRow[];
  technicians: TechnicianRow[];
}

type ViewMode = "calendar" | "table";

export function BookingsView({ bookings, technicians }: BookingsViewProps) {
  const [mode, setMode] = useState<ViewMode>("calendar");
  const [selected, setSelected] = useState<BookingRow | null>(null);

  return (
    <>
      {/* Mode toggle */}
      <div
        role="tablist"
        aria-label="View mode"
        className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted p-1"
      >
        <ToggleButton
          active={mode === "calendar"}
          onClick={() => setMode("calendar")}
          icon={<CalendarDays className="h-3.5 w-3.5" />}
        >
          Calendar
        </ToggleButton>
        <ToggleButton
          active={mode === "table"}
          onClick={() => setMode("table")}
          icon={<List className="h-3.5 w-3.5" />}
        >
          Table
        </ToggleButton>
      </div>

      {/* View */}
      {mode === "calendar" ? (
        <BookingsCalendar bookings={bookings} onSelectEvent={setSelected} />
      ) : (
        <BookingsTable
          bookings={bookings}
          technicians={technicians}
          onSelectRow={setSelected}
        />
      )}

      {/* Drawer (shared by both views) */}
      <BookingDetailDrawer
        booking={selected}
        technicians={technicians}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

/* ── Subcomponent ────────────────────────────────────────────────────────── */

function ToggleButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {children}
    </button>
  );
}
