"use client";

import { useState, useTransition } from "react";
import {
  AlertCircle,
  CheckCircle,
  MessageCircle,
  Phone,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  BookingRow,
  BookingStatus,
  TechnicianRow,
} from "@/lib/supabase/database.types";
import { updateBooking } from "@/app/admin/actions";

interface BookingDetailDrawerProps {
  booking: BookingRow | null;
  technicians: TechnicianRow[];
  onClose: () => void;
}

const STATUS_OPTIONS: BookingStatus[] = [
  "new",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
];

/**
 * Outer wrapper handles open/close. Inner body is keyed by booking.id
 * so React unmounts/remounts it when the selection changes — clean state
 * sync without setState-in-effect.
 */
export function BookingDetailDrawer({
  booking,
  technicians,
  onClose,
}: BookingDetailDrawerProps) {
  return (
    <Sheet open={booking !== null} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        {booking && (
          <BookingDrawerBody
            key={booking.id}
            booking={booking}
            technicians={technicians}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function BookingDrawerBody({
  booking,
  technicians,
}: {
  booking: BookingRow;
  technicians: TechnicianRow[];
}) {
  const [status, setStatus] = useState<BookingStatus>(booking.status);
  const [technicianId, setTechnicianId] = useState<string>(
    booking.assigned_technician ?? "",
  );
  const [adminNotes, setAdminNotes] = useState(booking.admin_notes ?? "");
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    setSaveMsg(null);
    setErrMsg(null);
    startTransition(async () => {
      const result = await updateBooking({
        bookingId: booking.id,
        status,
        assignedTechnician: technicianId === "" ? null : technicianId,
        adminNotes: adminNotes.trim() === "" ? undefined : adminNotes,
      });
      if (result.ok) {
        setSaveMsg("Saved.");
      } else {
        setErrMsg(result.error ?? "Save failed.");
      }
    });
  }

  const waUrl = `https://wa.me/${booking.phone.replace(/[^0-9]/g, "")}`;
  const formattedDate = new Date(booking.preferred_date).toLocaleDateString(
    "en-GB",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <>
      <SheetHeader>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {booking.customer_name}
        </h2>
        <p className="text-sm text-muted-foreground capitalize">
          {booking.service} · {formattedDate}
        </p>
      </SheetHeader>

      <div className="mt-6 space-y-6">
          {/* Quick contact */}
          <div className="flex flex-wrap gap-2">
            <a
              href={`tel:${booking.phone}`}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand-navy)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--color-brand-navy)]/90 transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              <span dir="ltr">{booking.phone}</span>
            </a>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </a>
            {booking.email && (
              <a
                href={`mailto:${booking.email}`}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted/70 transition-colors"
              >
                {booking.email}
              </a>
            )}
          </div>

          {/* Booking details */}
          <dl className="grid grid-cols-2 gap-3 rounded-lg bg-muted/30 p-3 text-xs">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Service
              </dt>
              <dd className="mt-0.5 capitalize text-foreground">
                {booking.service}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Area
              </dt>
              <dd className="mt-0.5 text-foreground">{booking.area}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Preferred date
              </dt>
              <dd className="mt-0.5 text-foreground">{formattedDate}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Customer locale
              </dt>
              <dd className="mt-0.5 text-foreground">
                {booking.locale === "ar" ? "🇸🇦 Arabic" : "🇬🇧 English"}
              </dd>
            </div>
          </dl>

          {/* Customer notes */}
          {booking.notes && (
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                Customer notes
              </p>
              <div
                dir={booking.locale === "ar" ? "rtl" : "ltr"}
                className="rounded-lg border-s-4 border-[var(--color-brand-gold)] bg-muted/30 p-4 text-sm leading-relaxed whitespace-pre-wrap"
              >
                {booking.notes}
              </div>
            </div>
          )}

          <hr className="border-border" />

          {/* Edit controls */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="bk-status">Status</Label>
              <select
                id="bk-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as BookingStatus)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s
                      .replace("_", " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="bk-tech">Assigned technician</Label>
              <select
                id="bk-tech"
                value={technicianId}
                onChange={(e) => setTechnicianId(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">— Unassigned —</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="bk-notes">Internal notes</Label>
              <Textarea
                id="bk-notes"
                rows={4}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Private to the team — customer never sees this."
                className="mt-1"
              />
            </div>

            {saveMsg && (
              <div className="flex items-start gap-2 rounded-lg border border-emerald-300/40 bg-emerald-50 p-2.5 text-sm text-emerald-900">
                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{saveMsg}</span>
              </div>
            )}
            {errMsg && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errMsg}</span>
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={pending}
              className="w-full bg-[var(--color-brand-gold)] text-[var(--color-brand-navy)] hover:bg-[var(--color-brand-gold)]/90 disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
    </>
  );
}
