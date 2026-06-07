"use client";

import { useMemo } from "react";
import { Calendar, momentLocalizer, type Event } from "react-big-calendar";
import moment from "moment";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";

import type {
  BookingRow,
  BookingStatus,
} from "@/lib/supabase/database.types";

interface BookingsCalendarProps {
  bookings: BookingRow[];
  onSelectEvent: (booking: BookingRow) => void;
}

const localizer = momentLocalizer(moment);

const STATUS_COLOR: Record<BookingStatus, string> = {
  new: "#F5B800", // gold — needs attention
  confirmed: "#0A1F44", // navy
  in_progress: "#3B82F6", // blue
  completed: "#22C55E", // green
  cancelled: "#9CA3AF", // gray
};

interface CalendarEvent extends Event {
  /** The full booking row — we attach it so onSelectEvent can hand it back */
  booking: BookingRow;
}

export function BookingsCalendar({
  bookings,
  onSelectEvent,
}: BookingsCalendarProps) {
  const events = useMemo<CalendarEvent[]>(
    () =>
      bookings.map((b) => ({
        title: `${b.customer_name} — ${serviceLabel(b.service)}`,
        start: new Date(b.preferred_date),
        end: new Date(b.preferred_date), // single-day events
        allDay: true,
        booking: b,
      })),
    [bookings],
  );

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div style={{ height: 600 }}>
        <Calendar<CalendarEvent>
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="month"
          views={["month", "week", "day", "agenda"]}
          popup
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: STATUS_COLOR[event.booking.status],
              borderColor: STATUS_COLOR[event.booking.status],
              color: "#fff",
              fontSize: "12px",
              fontWeight: 500,
            },
          })}
          onSelectEvent={(event) => onSelectEvent(event.booking)}
        />
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
        {(Object.keys(STATUS_COLOR) as BookingStatus[]).map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: STATUS_COLOR[s] }}
              aria-hidden
            />
            {s.replace("_", " ")}
          </span>
        ))}
      </div>
    </div>
  );
}

function serviceLabel(s: BookingRow["service"]): string {
  return {
    consultation: "Consultation",
    installation: "Installation",
    technician: "Technician",
    custom: "Custom",
  }[s];
}
