import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAllProductsAdmin } from "@/lib/supabase/admin-queries";
import { ProductsList } from "./products-list";

/**
 * Admin Products list page.
 * Server fetches everything (RLS allows admin to see inactive rows too)
 * and hands it to the client table for filtering/searching.
 */
export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Products
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length === 0
              ? "No products yet."
              : `${products.length} total · ${products.filter((p) => p.is_active).length} active · ${products.filter((p) => p.is_featured).length} featured`}
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2 bg-[var(--color-brand-gold)] text-[var(--color-brand-navy)] hover:bg-[var(--color-brand-gold)]/90">
            <Plus className="h-4 w-4" />
            New product
          </Button>
        </Link>
      </div>

      <ProductsList products={products} />
    </div>
  );
}
