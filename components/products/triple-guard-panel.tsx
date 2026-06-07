import * as React from "react";
import { Droplets, Volume2, Bug } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/container";

/**
 * TripleGuardPanel — WR Doors' core product promise.
 *
 * Navy background band that explains the three engineering guarantees:
 *   1. Water Resistant  (Droplets icon)
 *   2. Sound Insulated  (Volume2 icon)
 *   3. Termite Proof    (Bug icon)
 *
 * Used on every product detail page — it's a brand-level promise, not
 * product-specific, so it's a standalone Server Component with its own
 * translation calls.
 */
export async function TripleGuardPanel({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "products.tripleGuard" });

  const guards = [
    {
      icon: Droplets,
      title: t("water.title"),
      body: t("water.body"),
      iconClass: "text-sky-300",
    },
    {
      icon: Volume2,
      title: t("sound.title"),
      body: t("sound.body"),
      iconClass: "text-violet-300",
    },
    {
      icon: Bug,
      title: t("termite.title"),
      body: t("termite.body"),
      iconClass: "text-emerald-300",
    },
  ];

  return (
    <section
      aria-label={t("title")}
      className="bg-[var(--color-brand-navy)] py-16 md:py-24"
    >
      <Container>
        {/* Section header */}
        <div className="mb-12 text-center">
          <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-[var(--color-brand-gold)]">
            {t("eyebrow")}
          </p>
          <h2 className="font-serif text-3xl font-bold text-white md:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/70">
            {t("subtitle")}
          </p>
        </div>

        {/* Three columns */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {guards.map(({ icon: Icon, title, body, iconClass }) => (
            <div
              key={title}
              className="flex flex-col items-center text-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-8 backdrop-blur-sm"
            >
              {/* Icon plinth */}
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                <Icon className={`h-7 w-7 ${iconClass}`} />
              </div>
              <h3 className="font-serif text-xl font-semibold text-white">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-white/70">{body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
