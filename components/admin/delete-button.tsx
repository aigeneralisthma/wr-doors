"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteButtonProps {
  /** Async function that performs the deletion. Throws on failure. */
  onDelete: () => Promise<{ ok: boolean; error?: string }>;
  /** Plain-text label for the item being deleted (e.g. "Modern WPC Interior Door") */
  itemLabel: string;
  /** Extra warning shown in the confirm dialog (e.g. "All images will also be deleted.") */
  extraWarning?: string;
  /** Optional button label override (default: "Delete") */
  label?: string;
}

/**
 * DeleteButton — danger button + confirm dialog + server-action call.
 *
 * Two-step pattern: clicking the button opens a confirmation dialog with
 * the item label spelled out, then the actual destructive call runs only
 * after the user clicks "Delete permanently".
 *
 * The parent provides the `onDelete` callback (typically wraps a server
 * action call). Returns `{ ok, error? }` like our other actions.
 */
export function DeleteButton({
  onDelete,
  itemLabel,
  extraWarning,
  label = "Delete",
}: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirm() {
    setErrMsg(null);
    startTransition(async () => {
      const result = await onDelete();
      if (result.ok) {
        // Parent is expected to redirect/refresh — we just close the dialog
        setOpen(false);
      } else {
        setErrMsg(result.error ?? "Delete failed.");
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
        {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-serif">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete this {itemLabel.toLowerCase()}?
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              You&apos;re about to permanently delete{" "}
              <strong className="text-foreground">{itemLabel}</strong>. This
              can&apos;t be undone.
            </p>
            {extraWarning && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                {extraWarning}
              </p>
            )}
            {errMsg && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                {errMsg}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirm}
              disabled={pending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {pending ? "Deleting…" : "Delete permanently"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
