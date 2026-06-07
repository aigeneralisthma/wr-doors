import {
  getBookingsAdmin,
  getTechniciansAdmin,
} from "@/lib/supabase/admin-queries";
import { BookingsView } from "./bookings-view";

/**
 * Admin Bookings page — fetches bookings + technicians and hands them
 * to the client view (toggle between calendar + table).
 */
export default async function AdminBookingsPage() {
  const [bookings, technicians] = await Promise.all([
    getBookingsAdmin(),
    getTechniciansAdmin(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Bookings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {bookings.length === 0
            ? "No bookings yet."
            : `${bookings.length} total · ${technicians.length} active technicians`}
        </p>
      </div>

      <BookingsView bookings={bookings} technicians={technicians} />
    </div>
  );
}
