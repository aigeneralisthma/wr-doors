"use client";

import { useState, useTransition } from "react";
import { AlertCircle, CheckCircle, MessageCircle, Phone } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { LeadRow, LeadStatus } from "@/lib/supabase/database.types";
import { updateLeadStatus } from "@/app/admin/actions";

interface LeadDetailDrawerProps {
  lead: LeadRow | null;
  onClose: () => void;
}

const STATUS_OPTIONS: LeadStatus[] = ["new", "contacted", "converted", "lost"];

/**
 * Outer wrapper handles open/close state. The inner `LeadDrawerBody`
 * is keyed by lead.id so React unmounts/remounts it when the selected
 * lead changes — avoiding setState-in-effect anti-pattern for syncing
 * form state from props.
 */
export function LeadDetailDrawer({ lead, onClose }: LeadDetailDrawerProps) {
  return (
    <Sheet open={lead !== null} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        {lead && <LeadDrawerBody key={lead.id} lead={lead} />}
      </SheetContent>
    </Sheet>
  );
}

function LeadDrawerBody({ lead }: { lead: LeadRow }) {
  // State initialized from props at mount — re-mounts when key (lead.id) changes
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [adminNotes, setAdminNotes] = useState(lead.admin_notes ?? "");
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    setSaveMsg(null);
    setErrMsg(null);
    startTransition(async () => {
      const result = await updateLeadStatus({
        leadId: lead.id,
        status,
        adminNotes: adminNotes.trim() === "" ? undefined : adminNotes,
      });
      if (result.ok) {
        setSaveMsg("Saved.");
      } else {
        setErrMsg(result.error ?? "Save failed.");
      }
    });
  }

  const waUrl = `https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`;

  return (
    <>
      <SheetHeader>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {lead.name}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lead.source} lead · received{" "}
          {new Date(lead.created_at).toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </SheetHeader>

      <div className="mt-6 space-y-6">
          {/* Quick contact actions */}
          <div className="flex flex-wrap gap-2">
            <a
              href={`tel:${lead.phone}`}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand-navy)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--color-brand-navy)]/90 transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              <span dir="ltr">{lead.phone}</span>
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
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted/70 transition-colors"
              >
                {lead.email}
              </a>
            )}
          </div>

          {/* Lead details */}
          <DetailGrid lead={lead} />

          {/* Customer message */}
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              Customer message
            </p>
            <div
              dir={lead.locale === "ar" ? "rtl" : "ltr"}
              className="rounded-lg border-s-4 border-[var(--color-brand-gold)] bg-muted/30 p-4 text-sm leading-relaxed whitespace-pre-wrap"
            >
              {lead.message}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Reply in {lead.locale === "ar" ? "Arabic 🇸🇦" : "English 🇬🇧"}.
            </p>
          </div>

          <hr className="border-border" />

          {/* Status update */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="status-select">Status</Label>
              <select
                id="status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="admin-notes">Internal notes</Label>
              <Textarea
                id="admin-notes"
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

/* ── Subcomponent ────────────────────────────────────────────────────────── */

function DetailGrid({ lead }: { lead: LeadRow }) {
  const items: Array<{ label: string; value: string | null }> = [
    { label: "Product interest", value: lead.product },
    { label: "Quantity", value: lead.quantity },
    { label: "Location", value: lead.location },
    { label: "Budget", value: lead.budget },
    { label: "Subject", value: lead.subject },
  ].filter((item) => item.value && item.value.length > 0);

  if (items.length === 0) return null;

  return (
    <dl className="grid grid-cols-2 gap-3 rounded-lg bg-muted/30 p-3 text-xs">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {item.label}
          </dt>
          <dd className="mt-0.5 text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
