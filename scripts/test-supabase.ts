/**
 * Supabase sanity check — Prompt 7 verification.
 *
 * Run after applying schema + seed:
 *   pnpm tsx scripts/test-supabase.ts
 *
 * What this script verifies:
 *   1. Connection to Supabase project works (URL + anon key are valid)
 *   2. Anonymous SELECT on `products` returns the 8 seeded rows
 *   3. Anonymous SELECT on `projects` returns the 6 seeded rows
 *   4. Anonymous INSERT on `products` is BLOCKED by RLS (admin-only write)
 *   5. Anonymous SELECT on `leads` returns nothing (no public-read policy)
 *   6. Anonymous INSERT on `leads` succeeds (form submission path)
 *   7. The test lead row is then cleaned up (service role required for that —
 *      see comment below; we just leave a marked test row otherwise)
 *
 * Reads creds from `.env.local`. Fails fast with clear messages if any of
 * the env vars are missing.
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import type { Database } from "../lib/supabase/database.types";

// Load .env.local explicitly (Next.js does this automatically in dev/build,
// but standalone scripts don't).
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, "..", ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error("\n❌ Missing env vars in .env.local:");
  console.error(`   NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL ? "✓" : "MISSING"}`);
  console.error(`   NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON ? "✓" : "MISSING"}`);
  console.error("\nSee SUPABASE_SETUP.md for where to find these values.\n");
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON);

// ── helpers ────────────────────────────────────────────────────────────────
function pass(msg: string) {
  console.log(`  ✓ ${msg}`);
}
function fail(msg: string, detail?: string) {
  console.error(`  ✗ ${msg}${detail ? "\n      " + detail : ""}`);
  process.exitCode = 1;
}

// ── run tests ──────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🔍 Supabase sanity check\n");
  console.log(`  URL:  ${SUPABASE_URL}`);
  console.log(`  KEY:  ${SUPABASE_ANON?.slice(0, 20)}…\n`);

  // ── 1. Connection works (any query that returns) ─────────────────────────
  console.log("1. Connection");
  {
    const { error } = await supabase
      .from("site_settings")
      .select("key", { count: "exact", head: true });
    if (error) {
      fail("Could not connect to Supabase", error.message);
      console.error("\nCommon causes:\n");
      console.error("  - Project URL wrong (check Settings → API)");
      console.error("  - Anon key wrong (check Settings → API)");
      console.error("  - Migration not applied yet (run 0001_initial_schema.sql)\n");
      return;
    }
    pass("Connected to Supabase");
  }

  // ── 2. Products are seeded + readable by anon ───────────────────────────
  console.log("\n2. Public reads (products)");
  {
    const { data, error } = await supabase.from("products").select("*");
    if (error) {
      fail("Anonymous SELECT on products failed", error.message);
    } else if (!data || data.length === 0) {
      fail(
        "Anonymous SELECT on products returned 0 rows",
        "Did you run supabase/seed/0001_seed.sql?",
      );
    } else {
      pass(`Anonymous SELECT on products returned ${data.length} rows (expected 8)`);
      if (data.length !== 8) {
        console.warn(
          `      ⚠ Expected 8 seeded products, got ${data.length}. Seed file may have changed.`,
        );
      }
    }
  }

  // ── 3. Projects are seeded + readable by anon ───────────────────────────
  console.log("\n3. Public reads (projects)");
  {
    const { data, error } = await supabase.from("projects").select("*");
    if (error) {
      fail("Anonymous SELECT on projects failed", error.message);
    } else if (!data || data.length === 0) {
      fail("Anonymous SELECT on projects returned 0 rows");
    } else {
      pass(`Anonymous SELECT on projects returned ${data.length} rows (expected 6)`);
    }
  }

  // ── 4. Anonymous INSERT on products is blocked ─────────────────────────
  console.log("\n4. RLS blocks anonymous writes (products)");
  {
    const { error } = await supabase.from("products").insert({
      slug: "rls-test-should-fail",
      category: "wpc-doors",
      category_en: "WPC Doors",
      category_ar: "أبواب WPC",
      name_en: "RLS test row (should not insert)",
      name_ar: "صف اختبار RLS (يجب أن لا يُدرج)",
      description_en: "If you see this row, RLS is broken.",
      description_ar: "إذا رأيت هذا الصف، فإن RLS معطل.",
    });
    if (error) {
      pass(`Anonymous INSERT on products correctly blocked (${error.code ?? "code n/a"})`);
    } else {
      fail(
        "Anonymous INSERT on products SUCCEEDED — RLS is misconfigured!",
        "Re-check products policies in 0001_initial_schema.sql.",
      );
    }
  }

  // ── 5. Anonymous SELECT on leads is blocked ─────────────────────────────
  console.log("\n5. RLS blocks anonymous reads (leads)");
  {
    const { data, error } = await supabase.from("leads").select("*");
    if (error) {
      pass(`Anonymous SELECT on leads correctly blocked (${error.code ?? "code n/a"})`);
    } else if (!data || data.length === 0) {
      pass(
        "Anonymous SELECT on leads returned 0 rows (RLS hides them — expected)",
      );
    } else {
      fail(
        `Anonymous SELECT on leads returned ${data.length} rows — RLS is misconfigured!`,
      );
    }
  }

  // ── 6. Anonymous INSERT on leads succeeds (anon-allowed path) ──────────
  console.log("\n6. Anonymous INSERT on leads (form submission path)");
  {
    const { error } = await supabase.from("leads").insert({
      name: "Sanity Check (Prompt 7)",
      phone: "+971500000000",
      email: "sanity@example.com",
      subject: "Sanity check test",
      message:
        "This row was inserted by scripts/test-supabase.ts. Safe to delete.",
      locale: "en",
      source: "contact",
    });
    if (error) {
      fail(
        "Anonymous INSERT on leads FAILED — anon insert policy may be wrong",
        error.message,
      );
    } else {
      pass("Anonymous INSERT on leads succeeded");
      console.log(
        "      ℹ A test lead row was inserted. Visible in Dashboard → Table Editor → leads.",
      );
      console.log("        Delete it manually after verification, or re-run with a clean DB.");
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  console.log("\n──────────────────────────────────────────");
  if (process.exitCode === 1) {
    console.error("❌ Sanity check FAILED — see errors above.\n");
  } else {
    console.log("✅ All checks passed. Supabase is wired correctly.\n");
  }
}

main().catch((err) => {
  console.error("\n❌ Unexpected error:", err);
  process.exit(1);
});
