"use client";

import { useRef, useState, useTransition } from "react";
import {
  AlertCircle,
  GripVertical,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ImageThumb } from "./image-thumb";

interface GalleryEditorProps {
  /** Current images (array of public URLs). First item is the "primary" by convention. */
  value: string[];
  onChange: (urls: string[]) => void;

  /**
   * Async upload handler — receives a single File, returns the new public URL.
   * Parent wires this to the appropriate server action (e.g. uploadProductImage).
   */
  onUpload: (file: File) => Promise<{ ok: boolean; url?: string; error?: string }>;

  /**
   * Async delete handler — receives a URL, removes the file from Storage.
   * Parent wires this; the local state update happens automatically after success.
   */
  onDelete: (url: string) => Promise<{ ok: boolean; error?: string }>;

  /** Disable interactions (e.g. while parent form is saving) */
  disabled?: boolean;
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * GalleryEditor — drop-zone + thumb list with drag-reorder + per-image actions.
 *
 * Layout:
 *   ┌─────────────────────────────────────────┐
 *   │ + Drop files here or click to upload    │  ← drop-zone
 *   └─────────────────────────────────────────┘
 *   ┌──┬──┬──┬──┐
 *   │  │  │  │  │  ← thumb tiles, each with:
 *   │* │  │  │  │       • grab handle (drag to reorder)
 *   │  │  │  │  │       • Set primary star
 *   └──┴──┴──┴──┘       • Delete trash
 *
 * The "primary" image is simply the first entry — there's no separate flag.
 * "Set primary" moves that image to index 0.
 *
 * Drag-and-drop reorder uses native HTML5 drag events (no extra dep).
 */
export function GalleryEditor({
  value,
  onChange,
  onUpload,
  onDelete,
  disabled,
}: GalleryEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [, startTransition] = useTransition();

  // Internal drag state for reorder
  const dragSrcIndex = useRef<number | null>(null);

  /* ── Uploads ──────────────────────────────────────────────────────────── */

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setErrMsg(null);

    // Client-side validation before any upload starts
    const valid: File[] = [];
    for (const f of Array.from(files)) {
      if (f.size > MAX_SIZE_BYTES) {
        setErrMsg(`"${f.name}" is too large (max 5 MB).`);
        return;
      }
      if (!ALLOWED_TYPES.includes(f.type)) {
        setErrMsg(`"${f.name}" type "${f.type}" not allowed. Use JPG/PNG/WebP/AVIF.`);
        return;
      }
      valid.push(f);
    }

    setUploadingCount(valid.length);
    const newUrls: string[] = [];

    // Sequential uploads — simpler than parallel for error handling
    for (const file of valid) {
      const result = await onUpload(file);
      if (result.ok && result.url) {
        newUrls.push(result.url);
      } else {
        setErrMsg(result.error ?? `Upload of "${file.name}" failed.`);
        setUploadingCount(0);
        if (newUrls.length > 0) onChange([...value, ...newUrls]);
        return;
      }
      setUploadingCount((c) => c - 1);
    }

    onChange([...value, ...newUrls]);
    setUploadingCount(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  /* ── Reorder (HTML5 drag) ─────────────────────────────────────────────── */

  function onDragStart(index: number) {
    return (e: React.DragEvent) => {
      dragSrcIndex.current = index;
      e.dataTransfer.effectAllowed = "move";
    };
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function onDrop(targetIndex: number) {
    return (e: React.DragEvent) => {
      e.preventDefault();
      const src = dragSrcIndex.current;
      if (src === null || src === targetIndex) return;
      const next = [...value];
      const [moved] = next.splice(src, 1);
      next.splice(targetIndex, 0, moved);
      onChange(next);
      dragSrcIndex.current = null;
    };
  }

  /* ── Per-image actions ────────────────────────────────────────────────── */

  function setPrimary(index: number) {
    if (index === 0) return;
    const next = [...value];
    const [target] = next.splice(index, 1);
    next.unshift(target);
    onChange(next);
  }

  function handleDelete(index: number) {
    const url = value[index];
    startTransition(async () => {
      const result = await onDelete(url);
      if (result.ok) {
        onChange(value.filter((_, i) => i !== index));
      } else {
        setErrMsg(result.error ?? "Delete failed.");
      }
    });
  }

  /* ── Render ──────────────────────────────────────────────────────────── */

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        disabled={disabled || uploadingCount > 0}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 px-4 text-sm transition-colors",
          dragOver
            ? "border-[var(--color-brand-gold)] bg-[var(--color-brand-gold)]/5"
            : "border-border bg-muted/30 hover:border-[var(--color-brand-gold)]/50 hover:bg-muted/50",
          disabled && "opacity-60 cursor-not-allowed",
        )}
      >
        {uploadingCount > 0 ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">
              Uploading {uploadingCount} file{uploadingCount > 1 ? "s" : ""}…
            </span>
          </>
        ) : (
          <>
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium text-foreground">
              Drop images or click to upload
            </span>
            <span className="text-xs text-muted-foreground">
              JPG, PNG, WebP, or AVIF · max 5 MB each
            </span>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </button>

      {/* Error */}
      {errMsg && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errMsg}</span>
        </div>
      )}

      {/* Thumbs */}
      {value.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground">
            {value.length} image{value.length > 1 ? "s" : ""} · drag to reorder
            · ⭐ marks the primary (shown on cards)
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {value.map((url, i) => (
              <div
                key={url}
                draggable={!disabled}
                onDragStart={onDragStart(i)}
                onDragOver={onDragOver}
                onDrop={onDrop(i)}
                className={cn(
                  "group relative rounded-lg border border-border bg-card p-2 transition-shadow",
                  !disabled && "cursor-grab active:cursor-grabbing hover:shadow-md",
                  i === 0 && "ring-2 ring-[var(--color-brand-gold)]",
                )}
              >
                <ImageThumb src={url} alt={`Image ${i + 1}`} size="lg" />

                {/* Primary star (top-left) */}
                {i === 0 ? (
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-gold)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-brand-navy)]">
                    <Star className="h-3 w-3 fill-current" />
                    Primary
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPrimary(i)}
                    disabled={disabled}
                    aria-label="Set as primary"
                    className="absolute top-3 left-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-card/90 text-muted-foreground transition-colors hover:bg-[var(--color-brand-gold)] hover:text-[var(--color-brand-navy)] opacity-0 group-hover:opacity-100"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}

                {/* Reorder grip (top-center) */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-card/90 text-muted-foreground opacity-0 group-hover:opacity-100">
                  <GripVertical className="h-3.5 w-3.5" />
                </div>

                {/* Delete (top-right) */}
                <button
                  type="button"
                  onClick={() => handleDelete(i)}
                  disabled={disabled}
                  aria-label="Delete image"
                  className="absolute top-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-card/90 text-muted-foreground transition-colors hover:bg-destructive hover:text-white opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
