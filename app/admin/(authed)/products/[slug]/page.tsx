import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { getProductBySlugAdmin } from "@/lib/supabase/admin-queries";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlugAdmin(slug);
  if (!product) notFound();

  return (
    <ProductForm
      mode="edit"
      initial={{
        slug: product.slug,
        category: product.category,
        category_en: product.category_en,
        category_ar: product.category_ar,
        name_en: product.name_en,
        name_ar: product.name_ar,
        description_en: product.description_en,
        description_ar: product.description_ar,
        price_from_aed: product.price_from_aed,
        specs: product.specs ?? [],
        images: product.images ?? [],
        is_featured: product.is_featured,
        is_active: product.is_active,
      }}
    />
  );
}
