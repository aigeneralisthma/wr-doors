/**
 * Supabase browser client — for Client Components.
 *
 * Uses the public anon key, which is safe to expose because RLS policies
 * enforce data access rules at the database level. Do NOT use the service
 * role key here — that would bypass RLS and expose admin-only data.
 *
 * Typed with `<Database>` so all `.from('products')` calls etc. are
 * autocompleted and type-checked against `database.types.ts`.
 */
import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "./database.types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  );
}
