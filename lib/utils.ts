import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes intelligently, resolving conflicts.
 * Used by shadcn/ui components and throughout the WR Doors app.
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-gold", className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
