import * as React from "react";

import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  /** Optional sub-text (e.g. "+3 this week") */
  subtext?: string;
  /** Optional icon shown top-right */
  icon?: React.ReactNode;
  /** Optional click handler — if set, card becomes clickable */
  href?: string;
  className?: string;
}

/**
 * StatCard — dashboard tile showing a number + label.
 *
 * Tonal palette tuned to the admin area (subtle, business-y) rather than
 * the bold gold/navy of the public site — admin should feel calm.
 */
export function StatCard({
  label,
  value,
  subtext,
  icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          {label}
        </p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <p className="mt-2 font-serif text-3xl font-bold leading-tight text-foreground">
        {value}
      </p>
      {subtext && (
        <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
      )}
    </div>
  );
}
