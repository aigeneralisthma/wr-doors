import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ImageThumb } from "@/components/admin/image-thumb";
import { getAllProjectsAdmin } from "@/lib/supabase/admin-queries";

export default async function AdminProjectsPage() {
  const projects = await getAllProjectsAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {projects.length === 0
              ? "No projects yet."
              : `${projects.length} total · ${projects.filter((p) => p.is_published).length} published`}
          </p>
        </div>
        <Link href="/admin/projects/new">
          <Button className="gap-2 bg-[var(--color-brand-gold)] text-[var(--color-brand-navy)] hover:bg-[var(--color-brand-gold)]/90">
            <Plus className="h-4 w-4" />
            New project
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {projects.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">
            No projects yet. Click <strong>New project</strong> to add one.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-semibold w-16">Image</th>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <ImageThumb src={p.images[0] ?? ""} alt={p.title_en} size="md" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{p.title_en}</div>
                    <div className="text-xs text-muted-foreground font-mono">{p.slug}</div>
                  </td>
                  <td className="px-4 py-3 capitalize text-foreground">{p.category}</td>
                  <td className="px-4 py-3 text-foreground">{p.location_en}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.display_order}</td>
                  <td className="px-4 py-3 text-xs">
                    {p.is_published ? (
                      <span className="text-emerald-700">Published</span>
                    ) : (
                      <span className="text-muted-foreground">Draft</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/projects/${p.slug}`}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
