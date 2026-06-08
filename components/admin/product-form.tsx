"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SpecsEditor, pruneEmptySpecs } from "./specs-editor";
import { GalleryEditor } from "./gallery-editor";
import { DeleteButton } from "./delete-button";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  uploadImageAction,
  deleteImageAction,
} from "@/app/admin/actions";
import type {
  ProductCategory,
  ProductSpec,
} from "@/lib/supabase/database.types";
import type { ProductInput } from "@/lib/supabase/admin-mutations";

interface ProductFormProps {
  /** "new" for create; product slug for edit */
  mode: "new" | "edit";
  /** Existing product to edit (only set when mode='edit') */
  initial?: {
    slug: string;
    category: ProductCategory;
    category_en: string;
    category_ar: string;
    name_en: string;
    name_ar: string;
    description_en: string;
    description_ar: string;
    price_from_aed: number | null;
    specs: ProductSpec[];
    images: string[];
    is_featured: boolean;
    is_active: boolean;
  };
}

const CATEGORIES: { value: ProductCategory; labelEn: string; labelAr: string }[] = [
  { value: "wpc-doors", labelEn: "WPC Doors", labelAr: "أبواب WPC" },
  { value: "pivot-aluminium-doors", labelEn: "Pivot Aluminium Doors", labelAr: "أبواب ألمنيوم محورية" },
  { value: "sliding-systems", labelEn: "Sliding Systems", labelAr: "أنظمة منزلقة" },
  { value: "wall-cladding", labelEn: "Wall Cladding", labelAr: "كسوة الجدران" },
];

/**
 * ProductForm — bilingual fields + specs editor + gallery + delete.
 *
 * Modes:
 *   - `new`: empty form, gallery DISABLED until first save (we need a slug
 *     to namespace uploads under).
 *   - `edit`: pre-filled fields, gallery enabled, delete button shown.
 */
export function ProductForm({ mode, initial }: ProductFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // Form state
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [category, setCategory] = useState<ProductCategory>(initial?.category ?? "wpc-doors");
  const [nameEn, setNameEn] = useState(initial?.name_en ?? "");
  const [nameAr, setNameAr] = useState(initial?.name_ar ?? "");
  const [descEn, setDescEn] = useState(initial?.description_en ?? "");
  const [descAr, setDescAr] = useState(initial?.description_ar ?? "");
  const [price, setPrice] = useState<string>(
    initial?.price_from_aed != null ? String(initial.price_from_aed) : "",
  );
  const [specs, setSpecs] = useState<ProductSpec[]>(initial?.specs ?? []);
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [isFeatured, setIsFeatured] = useState(initial?.is_featured ?? false);
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  const categoryMeta = CATEGORIES.find((c) => c.value === category)!;

  function handleSave() {
    setSaveMsg(null);
    setErrMsg(null);

    const payload: ProductInput = {
      slug: slug.trim(),
      category,
      category_en: categoryMeta.labelEn,
      category_ar: categoryMeta.labelAr,
      name_en: nameEn.trim(),
      name_ar: nameAr.trim(),
      description_en: descEn.trim(),
      description_ar: descAr.trim(),
      price_from_aed: price.trim() === "" ? null : parseInt(price, 10),
      specs: pruneEmptySpecs(specs),
      is_featured: isFeatured,
      is_active: isActive,
    };

    startTransition(async () => {
      if (mode === "new") {
        const result = await createProductAction(payload);
        if (result.ok && result.slug) {
          setSaveMsg("Created.");
          // Redirect to edit page so the gallery becomes available
          router.push(`/admin/products/${result.slug}`);
        } else {
          setErrMsg(result.error ?? "Save failed.");
        }
      } else {
        const result = await updateProductAction(initial!.slug, {
          ...payload,
          images, // include current gallery state
        });
        if (result.ok) {
          setSaveMsg("Saved.");
          router.refresh();
        } else {
          setErrMsg(result.error ?? "Save failed.");
        }
      }
    });
  }

  async function handleDelete() {
    if (mode !== "edit") return { ok: false, error: "Cannot delete unsaved product." };
    const result = await deleteProductAction(initial!.slug);
    if (result.ok) {
      router.push("/admin/products");
    }
    return result;
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            {mode === "new" ? "New product" : nameEn || initial?.slug}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "new"
              ? "Fill in the basic details first — the image gallery becomes available after you save."
              : `Editing /products/${initial?.category}/${initial?.slug}`}
          </p>
        </div>
        {mode === "edit" && (
          <DeleteButton
            onDelete={handleDelete}
            itemLabel={initial?.name_en ?? "product"}
            extraWarning="All images for this product will also be deleted from Storage."
          />
        )}
      </div>

      {/* ── Basic info ────────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 font-serif text-lg font-bold text-foreground">
          Basic info
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="prod-slug">Slug (URL identifier)</Label>
              <Input
                id="prod-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. modern-wpc-interior"
                disabled={mode === "edit"}
                className="mt-1"
              />
              {mode === "edit" && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Slug can&apos;t be changed once created — it&apos;s in the public URL.
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="prod-category">Category</Label>
              <select
                id="prod-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="prod-name-en">Name (EN)</Label>
              <Input
                id="prod-name-en"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Modern WPC Interior Door"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="prod-name-ar">Name (AR)</Label>
              <Input
                id="prod-name-ar"
                dir="rtl"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="باب WPC داخلي حديث"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="prod-desc-en">Description (EN)</Label>
              <Textarea
                id="prod-desc-en"
                rows={4}
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="prod-desc-ar">Description (AR)</Label>
              <Textarea
                id="prod-desc-ar"
                rows={4}
                dir="rtl"
                value={descAr}
                onChange={(e) => setDescAr(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
            <div>
              <Label htmlFor="prod-price">Price from (AED)</Label>
              <Input
                id="prod-price"
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Leave blank for 'on request'"
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id="prod-featured"
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="prod-featured" className="cursor-pointer">
                Featured (shown on homepage)
              </Label>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id="prod-active"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="prod-active" className="cursor-pointer">
                Active (visible to customers)
              </Label>
            </div>
          </div>
        </div>
      </section>

      {/* ── Specs ─────────────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 font-serif text-lg font-bold text-foreground">
          Specifications
        </h2>
        <SpecsEditor value={specs} onChange={setSpecs} />
      </section>

      {/* ── Gallery (edit mode only) ─────────────────────────────────────── */}
      {mode === "edit" && initial && (
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-serif text-lg font-bold text-foreground">
            Gallery
          </h2>
          <GalleryEditor
            value={images}
            onChange={async (urls) => {
              setImages(urls);
              // Persist immediately so order changes survive page reload
              await updateProductAction(initial.slug, { images: urls });
            }}
            onUpload={async (file) => {
              const fd = new FormData();
              fd.set("bucket", "products");
              fd.set("slug", initial.slug);
              fd.set("file", file);
              return await uploadImageAction(fd);
            }}
            onDelete={async (url) => {
              return await deleteImageAction(url);
            }}
            disabled={pending}
          />
        </section>
      )}

      {/* ── Save row ─────────────────────────────────────────────────────── */}
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
            variant="outline"
            onClick={() => router.push("/admin/products")}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="bg-[var(--color-brand-gold)] text-[var(--color-brand-navy)] hover:bg-[var(--color-brand-gold)]/90 disabled:opacity-60"
          >
            {pending ? "Saving…" : mode === "new" ? "Create product" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
