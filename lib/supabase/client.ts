/**
 * Supabase browser client — for Client Components.
 *
 * Uses the public anon key, which is safe to expose because RLS policies
 * enforce data access rules at the database level. Do NOT use the service
 * role key here.
 *
 * Filled in for real during Prompt 7 (Supabase setup).
 */
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  );
}
