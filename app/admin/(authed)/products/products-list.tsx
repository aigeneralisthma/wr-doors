"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, MinusCircle, Search, Star } from "lucide-react";

import { Input } from "@/components/ui/input";
import { ImageThumb } from "@/components/admin/image-thumb";
import { cn } from "@/lib/utils";
import type {
  ProductCategory,
  ProductRow,
} from "@/lib/supabase/database.types";

interface ProductsListProps {
  products: ProductRow[];
}

const CATEGORY_FILTERS: Array<{ key: "all" | ProductCategory; label: string }> = [
  { key: "all", label: "All categories" },
  { key: "wpc-doors", label: "WPC Doors" },
  { key: "pivot-aluminium-doors", label: "Pivot Aluminium" },
  { key: "sliding-systems", label: "Sliding Systems" },
  { key: "wall-cladding", label: "Wall Cladding" },
];

export function ProductsList({ products }: ProductsListProps) {
  const [filter, setFilter] = useState<"all" | ProductCategory>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let r = products;
    if (filter !== "all") r = r.filter((p) => p.category === filter);
    if (search.trim()) {
      const t = search.toLowerCase();
      r = r.filter(
        (p) =>
          p.name_en.toLowerCase().includes(t) ||
          p.name_ar.includes(search) ||
          p.slug.includes(t),
      );
    }
    return r;
  }, [products, filter, search]);

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" className="flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((opt) => {
            const active = filter === opt.key;
            const count = opt.key === "all" ? products.length : products.filter((p) => p.category === opt.key).length;
            return (
              <button
                key={opt.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(opt.key)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-[var(--color-brand-navy)] text-white"
                    : "bg-muted text-foreground hover:bg-muted/70",
                )}
              >
                {opt.label} <span className={active ? "text-white/70" : "text-muted-foreground"}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            placeholder="Search name or slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {filtered.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">
            No products match the current filter.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-semibold w-16">Image</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Flags</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <ImageThumb src={p.images[0] ?? ""} alt={p.name_en} size="md" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{p.name_en}</div>
                    <div className="text-xs text-muted-foreground" dir="rtl">{p.name_ar}</div>
                    <div className="text-xs text-muted-foreground font-mono">{p.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-foreground capitalize">
                    {p.category.replace(/-/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-foreground font-mono text-xs">
                    {p.price_from_aed != null
                      ? `From AED ${p.price_from_aed}`
                      : <span className="text-muted-foreground">On request</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 text-xs">
                      {p.is_featured && (
                        <span className="inline-flex items-center gap-1 text-amber-700">
                          <Star className="h-3 w-3 fill-current" /> Featured
                        </span>
                      )}
                      {p.is_active ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <MinusCircle className="h-3 w-3" /> Inactive
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${p.slug}`}
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
    </>
  );
}
