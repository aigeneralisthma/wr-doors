import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { ArrowRight, ChevronLeft, MapPin, Tag } from "lucide-react";

import { BRAND } from "@/lib/constants";
import {
  getProjectBySlug,
  getProjects,
  getProjectSlugsForStaticParams,
} from "@/lib/supabase/queries";
import { localized, projectImage } from "@/lib/supabase/image-helpers";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout/container";
import { ProductImage } from "@/components/ui/product-image";
import { Badge } from "@/components/ui/badge";
import { GoldAccent } from "@/components/brand/gold-accent";
import { BrandButton } from "@/components/brand/brand-button";

/* ── ISR: revalidate from Supabase every 60s ──────────────────────────── */
export const revalidate = 60;

/* ── Static params ─────────────────────────────────────────────────────── */
export async function generateStaticParams() {
  // Use the static (no-cookies) client — `generateStaticParams` runs at
  // build time without an HTTP request, so the cookie-based server client
  // throws here.
  return await getProjectSlugsForStaticParams();
}

/* ── Metadata ──────────────────────────────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  const project = await getProjectBySlug(slug);
  if (!project) {
    return { title: "Not Found" };
  }

  const title = localized(project.title_en, project.title_ar, locale);
  const description = localized(
    project.description_en,
    project.description_ar,
    locale,
  );

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/projects/${slug}`,
      languages: {
        en: `/en/projects/${slug}`,
        ar: `/ar/projects/${slug}`,
      },
    },
    openGraph: {
      url: `${BRAND.url}/${locale}/projects/${slug}`,
      type: "article",
      title: `${title} | ${BRAND.name}`,
      description,
    },
  };
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const heroImage = projectImage(project);
  if (!heroImage) notFound(); // can't render without resolvable hero image

  const t = await getTranslations({ locale, namespace: "projects" });

  const title = localized(project.title_en, project.title_ar, locale);
  const location = localized(
    project.location_en,
    project.location_ar,
    locale,
  );
  const description = localized(
    project.description_en,
    project.description_ar,
    locale,
  );

  // Related projects — same category, excluding self, capped at 3.
  const allProjects = await getProjects();
  const related = allProjects
    .filter((p) => p.category === project.category && p.slug !== project.slug)
    .slice(0, 3);

  return (
    <main>
      {/* ── Back link ── */}
      <Container as="div" className="pt-6 md:pt-8">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4 rtl:-scale-x-100" />
          {t("detail.backToProjects")}
        </Link>
      </Container>

      {/* ── Hero ── */}
      <section className="py-6 md:py-10">
        <Container>
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-center md:gap-14">
            {/* Hero image */}
            <div className="overflow-hidden rounded-2xl shadow-xl">
              <ProductImage
                image={heroImage}
                alt={title}
                sizes="(max-width: 768px) 100vw, 60vw"
                priority
                className="aspect-[4/3]"
              />
            </div>

            {/* Meta + title */}
            <div>
              <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
                {t(`filter${project.category.charAt(0).toUpperCase()}${project.category.slice(1)}` as
                  | "filterResidential"
                  | "filterCommercial"
                  | "filterLuxury")}
              </p>
              <h1 className="font-serif text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-5xl">
                {title}
              </h1>
              <GoldAccent width="medium" className="my-5" />
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="size-4 text-[var(--color-brand-gold)]" />
                  {location}
                </span>
                {project.tags && project.tags.length > 0 && (
                  <span className="inline-flex items-center gap-2">
                    <Tag className="size-4 text-[var(--color-brand-gold)]" />
                    {project.tags.slice(0, 3).join(" · ")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Description ── */}
      <section className="py-10 md:py-14">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="text-base leading-relaxed text-foreground md:text-lg">
              {description}
            </p>
          </div>
        </Container>
      </section>

      {/* ── Tags chips (if any beyond the first 3) ── */}
      {project.tags && project.tags.length > 0 && (
        <section className="pb-10 md:pb-14">
          <Container>
            <div className="mx-auto flex max-w-3xl flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="font-normal">
                  {tag}
                </Badge>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── Lead CTA ── */}
      <section className="bg-[var(--color-brand-navy)] py-14 md:py-20">
        <Container>
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-start">
            <div className="max-w-xl">
              <h2 className="mb-2 font-serif text-2xl font-bold text-white md:text-3xl">
                {t("detail.ctaTitle")}
              </h2>
              <p className="text-sm text-white/70">{t("detail.ctaBody")}</p>
            </div>
            <div className="shrink-0">
              <BrandButton brand="gold" size="lg" asChild>
                <Link href="/quote">{t("detail.ctaButton")}</Link>
              </BrandButton>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Related projects ── */}
      {related.length > 0 && (
        <section className="py-14 md:py-20">
          <Container>
            <h2 className="mb-2 font-serif text-2xl font-bold text-foreground md:text-3xl">
              {t("detail.relatedTitle")}
            </h2>
            <GoldAccent width="short" className="mb-8" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => {
                const img = projectImage(p);
                if (!img) return null;
                const rTitle = localized(p.title_en, p.title_ar, locale);
                const rLocation = localized(
                  p.location_en,
                  p.location_ar,
                  locale,
                );
                return (
                  <Link
                    key={p.slug}
                    href={`/projects/${p.slug}`}
                    className="group block overflow-hidden rounded-2xl bg-card shadow-sm transition-shadow hover:shadow-lg"
                  >
                    <ProductImage
                      image={img}
                      alt={rTitle}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="aspect-[4/3] transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="p-5">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-brand-gold)]">
                        {rLocation}
                      </p>
                      <h3 className="mt-2 font-serif text-base font-bold leading-tight text-foreground">
                        {rTitle}
                      </h3>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-foreground/70 transition-colors group-hover:text-primary">
                        {t("viewProject")}
                        <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Container>
        </section>
      )}
    </main>
  );
}
