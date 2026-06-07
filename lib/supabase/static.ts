/**
 * Build-time Supabase client (no cookies / no auth).
 *
 * Used by `generateStaticParams` and any other build-time data fetch
 * where there's no HTTP request — so `cookies()` from `next/headers`
 * isn't available and would throw.
 *
 * Reads via this client honor RLS (since they use the anon key), so
 * they only return data that's marked publicly readable. Perfect for
 * SSG: catalog product slugs, project slugs, etc.
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

let cached: ReturnType<typeof createSupabaseClient<Database>> | null = null;

export function createStaticClient() {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase env vars missing — set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
    );
  }

  cached = createSupabaseClient<Database>(url, anonKey, {
    // No session persistence — this client never sees a user
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
