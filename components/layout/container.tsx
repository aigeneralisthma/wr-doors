import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Container — consistent max-width wrapper used by every section on the site.
 *
 * Choosing widths:
 *   - `default` → 1280px max (standard editorial reading width)
 *   - `wide`    → 1536px (hero, big galleries, dashboard grids)
 *   - `narrow`  → 896px (long-form prose, legal pages)
 *   - `full`    → no max width (background-only layers)
 *
 * Always uses logical horizontal padding (`px-` is fine — Tailwind v4
 * treats `px-` as logical inset-inline by default in our config).
 */
export type ContainerWidth = "default" | "wide" | "narrow" | "full";

const widthClasses: Record<ContainerWidth, string> = {
  default: "max-w-7xl",
  wide: "max-w-screen-2xl",
  narrow: "max-w-3xl",
  full: "",
};

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: ContainerWidth;
  /** Render as a different element (e.g. <section>, <main>, <header>). */
  as?: React.ElementType;
}

export function Container({
  width = "default",
  as: Tag = "div",
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-6 lg:px-8",
        widthClasses[width],
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
