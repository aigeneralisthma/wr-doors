"use client";

import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductSpec } from "@/lib/supabase/database.types";

interface SpecsEditorProps {
  value: ProductSpec[];
  onChange: (specs: ProductSpec[]) => void;
}

/**
 * SpecsEditor — repeating-row form for product specifications.
 *
 * Each row has 4 inputs (label EN/AR, value EN/AR) and a remove button.
 * Below the rows: an "Add spec" button appends an empty row.
 *
 * Empty rows (all fields blank) are filtered out on parent save so the
 * user can add a row, decide not to fill it, and not pollute the data.
 *
 * Pure controlled component — parent owns the state.
 */
export function SpecsEditor({ value, onChange }: SpecsEditorProps) {
  function update(index: number, patch: Partial<ProductSpec>) {
    const next = [...value];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function add() {
    onChange([
      ...value,
      { label_en: "", label_ar: "", value_en: "", value_ar: "" },
    ]);
  }

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center text-xs text-muted-foreground">
          No specs yet. Click <strong>Add spec</strong> to add a row.
        </p>
      )}

      {value.map((spec, i) => (
        <div
          key={i}
          className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-card p-3 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]"
        >
          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Label (EN)
            </label>
            <Input
              value={spec.label_en}
              onChange={(e) => update(i, { label_en: e.target.value })}
              placeholder="e.g. Material"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Label (AR)
            </label>
            <Input
              dir="rtl"
              value={spec.label_ar}
              onChange={(e) => update(i, { label_ar: e.target.value })}
              placeholder="مثلاً: المادة"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Value (EN)
            </label>
            <Input
              value={spec.value_en}
              onChange={(e) => update(i, { value_en: e.target.value })}
              placeholder="e.g. WPC Composite"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Value (AR)
            </label>
            <Input
              dir="rtl"
              value={spec.value_ar}
              onChange={(e) => update(i, { value_ar: e.target.value })}
              placeholder="مثلاً: مركب WPC"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="Remove spec row"
              className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={add}
        className="w-full gap-2 border-dashed"
      >
        <Plus className="h-4 w-4" />
        Add spec
      </Button>
    </div>
  );
}

/** Remove rows where every field is empty — used by callers before save. */
export function pruneEmptySpecs(specs: ProductSpec[]): ProductSpec[] {
  return specs.filter(
    (s) =>
      s.label_en.trim().length > 0 ||
      s.label_ar.trim().length > 0 ||
      s.value_en.trim().length > 0 ||
      s.value_ar.trim().length > 0,
  );
}
