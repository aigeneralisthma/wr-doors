import { notFound } from "next/navigation";

import { ProjectForm } from "@/components/admin/project-form";
import { getProjectBySlugAdmin } from "@/lib/supabase/admin-queries";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlugAdmin(slug);
  if (!project) notFound();

  return (
    <ProjectForm
      mode="edit"
      initial={{
        slug: project.slug,
        category: project.category,
        title_en: project.title_en,
        title_ar: project.title_ar,
        location_en: project.location_en,
        location_ar: project.location_ar,
        description_en: project.description_en,
        description_ar: project.description_ar,
        images: project.images ?? [],
        is_published: project.is_published,
        display_order: project.display_order,
      }}
    />
  );
}
