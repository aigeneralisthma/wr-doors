import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware navigation primitives. Use these instead of next/link and
 * next/navigation throughout the app — they automatically prepend the
 * current locale to URLs.
 *
 * @example
 * import { Link, useRouter } from "@/i18n/navigation";
 * <Link href="/products">Products</Link>  // -> /en/products or /ar/products
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
