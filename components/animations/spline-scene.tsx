"use client";

import { Suspense, lazy } from "react";
import { cn } from "@/lib/utils";

/**
 * SplineScene — lazy-loaded wrapper around the Spline 3D viewer.
 *
 * Spline ships a runtime around 1MB+ (Three.js + WebGL bootstrap), so we
 * load it lazily and behind Suspense to keep the initial bundle small.
 * Falls back to a subtle skeleton + the brand cream tone while loading.
 *
 * Set NEXT_PUBLIC_SPLINE_SCENE_URL in your env, or pass `scene` as a prop
 * to override per usage (handy for component playground / story pages).
 */
const Spline = lazy(() => import("@splinetool/react-spline"));

export interface SplineSceneProps {
  /** Spline scene URL (e.g. https://prod.spline.design/.../scene.splinecode). */
  scene?: string;
  /** Optional accessible label so screen readers describe the canvas. */
  label?: string;
  className?: string;
}

export function SplineScene({
  scene = process.env.NEXT_PUBLIC_SPLINE_SCENE_URL,
  label = "3D product showcase",
  className,
}: SplineSceneProps) {
  if (!scene) {
    return (
      <div
        role="img"
        aria-label="3D scene placeholder"
        className={cn(
          "flex h-full w-full items-center justify-center bg-[var(--color-brand-cream)]",
          className,
        )}
      >
        <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          3D scene — set NEXT_PUBLIC_SPLINE_SCENE_URL
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div
          aria-busy
          aria-label="Loading 3D scene"
          className={cn(
            "flex h-full w-full items-center justify-center bg-[var(--color-brand-cream)]",
            className,
          )}
        >
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-[var(--color-brand-navy)] border-t-transparent" />
        </div>
      }
    >
      <Spline scene={scene} className={cn("h-full w-full", className)} aria-label={label} />
    </Suspense>
  );
}
