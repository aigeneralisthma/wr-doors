"use client";

import { useState, useTransition } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateSiteSettingsAction } from "@/app/admin/actions";
import type { SiteSettingRow } from "@/lib/supabase/database.types";

interface SiteSettingsFormProps {
  settings: SiteSettingRow[];
}

/**
 * One big editable form covering every site_settings row. Edit any field,
 * click Save once at the bottom — all changes go through in one bulk
 * upsert. Optimistic-friendly because each setting is keyed.
 *
 * Long descriptive copy (hero subtitle, address) uses Textarea; short
 * scalar values (phone, email) use Input.
 */
export function SiteSettingsForm({ settings }: SiteSettingsFormProps) {
  const [pending, startTransition] = useTransition();
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // Local working copy — keyed by setting.key
  const [values, setValues] = useState<Record<string, { en: string; ar: string }>>(
    () =>
      Object.fromEntries(
        settings.map((s) => [
          s.key,
          { en: s.value_en ?? "", ar: s.value_ar ?? "" },
        ]),
      ),
  );

  function handleSave() {
    setSaveMsg(null);
    setErrMsg(null);

    const updates = settings.map((s) => ({
      key: s.key,
      value_en: values[s.key]?.en ?? null,
      value_ar: values[s.key]?.ar ?? null,
    }));

    startTransition(async () => {
      const result = await updateSiteSettingsAction(updates);
      if (result.ok) {
        setSaveMsg("All settings saved. Public pages will reflect within ~60s.");
      } else {
        setErrMsg(result.error ?? "Save failed.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {settings.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">
            No settings rows exist yet. Re-run <code>0001_seed.sql</code> to seed them.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {settings.map((s) => {
              const isLong = isLongFieldKey(s.key);
              const InputComp = isLong ? Textarea : Input;
              return (
                <div key={s.key} className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-[200px_1fr_1fr]">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Key
                    </p>
                    <p className="mt-1 font-mono text-xs text-foreground break-all">{s.key}</p>
                    {s.description && (
                      <p className="mt-2 text-xs text-muted-foreground">{s.description}</p>
                    )}
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      English
                    </p>
                    <InputComp
                      rows={isLong ? 3 : undefined}
                      value={values[s.key]?.en ?? ""}
                      onChange={(e) =>
                        setValues((v) => ({
                          ...v,
                          [s.key]: { en: e.target.value, ar: v[s.key]?.ar ?? "" },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      Arabic
                    </p>
                    <InputComp
                      rows={isLong ? 3 : undefined}
                      dir="rtl"
                      value={values[s.key]?.ar ?? ""}
                      onChange={(e) =>
                        setValues((v) => ({
                          ...v,
                          [s.key]: { en: v[s.key]?.en ?? "", ar: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 -mx-10 border-t border-border bg-card px-10 py-4 shadow-lg">
        <div className="flex items-center justify-end gap-3">
          {saveMsg && (
            <div className="flex items-center gap-2 text-sm text-emerald-700">
              <CheckCircle className="h-4 w-4" />
              {saveMsg}
            </div>
          )}
          {errMsg && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {errMsg}
            </div>
          )}
          <Button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="bg-[var(--color-brand-gold)] text-[var(--color-brand-navy)] hover:bg-[var(--color-brand-gold)]/90 disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save all changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Best-effort: settings with hero or address-like keys deserve a textarea */
function isLongFieldKey(key: string): boolean {
  return /tagline|subtitle|address|hours|heroTitle|body/i.test(key);
}
