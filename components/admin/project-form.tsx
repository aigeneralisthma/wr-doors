"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GalleryEditor } from "./gallery-editor";
import { DeleteButton } from "./delete-button";
import {
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
  uploadImageAction,
  deleteImageAction,
} from "@/app/admin/actions";
import type { ProjectCategory } from "@/lib/supabase/database.types";
import type { ProjectInput } from "@/lib/supabase/admin-mutations";

interface ProjectFormProps {
  mode: "new" | "edit";
  initial?: {
    slug: string;
    category: ProjectCategory;
    title_en: string;
    title_ar: string;
    location_en: string;
    location_ar: string;
    description_en: string;
    description_ar: string;
    images: string[];
    is_published: boolean;
    display_order: number;
  };
}

const CATEGORIES: { value: ProjectCategory; label: string }[] = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "luxury", label: "Luxury" },
];

export function ProjectForm({ mode, initial }: ProjectFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [category, setCategory] = useState<ProjectCategory>(initial?.category ?? "residential");
  const [titleEn, setTitleEn] = useState(initial?.title_en ?? "");
  const [titleAr, setTitleAr] = useState(initial?.title_ar ?? "");
  const [locationEn, setLocationEn] = useState(initial?.location_en ?? "");
  const [locationAr, setLocationAr] = useState(initial?.location_ar ?? "");
  const [descEn, setDescEn] = useState(initial?.description_en ?? "");
  const [descAr, setDescAr] = useState(initial?.description_ar ?? "");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? true);
  const [displayOrder, setDisplayOrder] = useState(initial?.display_order ?? 0);

  function handleSave() {
    setSaveMsg(null);
    setErrMsg(null);

    const payload: ProjectInput = {
      slug: slug.trim(),
      category,
      title_en: titleEn.trim(),
      title_ar: titleAr.trim(),
      location_en: locationEn.trim(),
      location_ar: locationAr.trim(),
      description_en: descEn.trim(),
      description_ar: descAr.trim(),
      is_published: isPublished,
      display_order: displayOrder,
    };

    startTransition(async () => {
      if (mode === "new") {
        const result = await createProjectAction(payload);
        if (result.ok && result.slug) {
          setSaveMsg("Created.");
          router.push(`/admin/projects/${result.slug}`);
        } else {
          setErrMsg(result.error ?? "Save failed.");
        }
      } else {
        const result = await updateProjectAction(initial!.slug, { ...payload, images });
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
    if (mode !== "edit") return { ok: false, error: "Cannot delete unsaved project." };
    const result = await deleteProjectAction(initial!.slug);
    if (result.ok) router.push("/admin/projects");
    return result;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            {mode === "new" ? "New project" : titleEn || initial?.slug}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "new"
              ? "Fill in the details — the gallery becomes available after you save."
              : `Editing /projects (filtered by category: ${initial?.category})`}
          </p>
        </div>
        {mode === "edit" && (
          <DeleteButton
            onDelete={handleDelete}
            itemLabel={initial?.title_en ?? "project"}
            extraWarning="All images for this project will also be deleted from Storage."
          />
        )}
      </div>

      {/* Basic info */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 font-serif text-lg font-bold text-foreground">Basic info</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="proj-slug">Slug</Label>
              <Input
                id="proj-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="dubai-hills-villa"
                disabled={mode === "edit"}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="proj-cat">Category</Label>
              <select
                id="proj-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="proj-order">Display order</Label>
              <Input
                id="proj-order"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                className="mt-1"
              />
              <p className="mt-1 text-xs text-muted-foreground">Lower = shown first</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="proj-title-en">Title (EN)</Label>
              <Input
                id="proj-title-en"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="Villa Renovation — Dubai Hills"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="proj-title-ar">Title (AR)</Label>
              <Input
                id="proj-title-ar"
                dir="rtl"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="proj-loc-en">Location (EN)</Label>
              <Input
                id="proj-loc-en"
                value={locationEn}
                onChange={(e) => setLocationEn(e.target.value)}
                placeholder="Dubai Hills · Residential"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="proj-loc-ar">Location (AR)</Label>
              <Input
                id="proj-loc-ar"
                dir="rtl"
                value={locationAr}
                onChange={(e) => setLocationAr(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="proj-desc-en">Description (EN)</Label>
              <Textarea
                id="proj-desc-en"
                rows={4}
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="proj-desc-ar">Description (AR)</Label>
              <Textarea
                id="proj-desc-ar"
                rows={4}
                dir="rtl"
                value={descAr}
                onChange={(e) => setDescAr(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="proj-published"
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="proj-published" className="cursor-pointer">
              Published (visible on /projects)
            </Label>
          </div>
        </div>
      </section>

      {/* Gallery */}
      {mode === "edit" && initial && (
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-serif text-lg font-bold text-foreground">Gallery</h2>
          <GalleryEditor
            value={images}
            onChange={async (urls) => {
              setImages(urls);
              await updateProjectAction(initial.slug, { images: urls });
            }}
            onUpload={async (file) => {
              const fd = new FormData();
              fd.set("bucket", "projects");
              fd.set("slug", initial.slug);
              fd.set("file", file);
              return await uploadImageAction(fd);
            }}
            onDelete={async (url) => await deleteImageAction(url)}
            disabled={pending}
          />
        </section>
      )}

      {/* Save row */}
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
          <Button type="button" variant="outline" onClick={() => router.push("/admin/projects")} disabled={pending}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="bg-[var(--color-brand-gold)] text-[var(--color-brand-navy)] hover:bg-[var(--color-brand-gold)]/90 disabled:opacity-60"
          >
            {pending ? "Saving…" : mode === "new" ? "Create project" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
