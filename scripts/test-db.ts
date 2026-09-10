/**
 * Database sanity check — Neon + Drizzle.
 *
 *   pnpm test:db
 *
 * Verifies:
 *   1. Connection works
 *   2. `products` has the 8 seeded rows
 *   3. `projects` has the 6 seeded rows
 *   4. `site_settings` has the 10 seeded rows
 *   5. `technicians` has the 3 seeded rows
 *   6. A lead insert + delete round-trips (the public form path)
 *   7. At least one `admin_users` row exists (login won't work otherwise)
 *
 * Uses the DIRECT (unpooled) connection. Leaves no test data behind.
 */

import { config } from "dotenv";
import { count, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import type { PgTable } from "drizzle-orm/pg-core";
import postgres from "postgres";

import * as schema from "../lib/db/schema";

config({ path: ".env.local" });

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  console.error("❌ Set DATABASE_URL_UNPOOLED (or DATABASE_URL) in .env.local");
  process.exit(1);
}

const client = postgres(url, { max: 1 });
const db = drizzle(client, { schema });

let failed = false;
const pass = (m: string) => console.log(`  ✓ ${m}`);
const fail = (m: string) => {
  failed = true;
  console.error(`  ✗ ${m}`);
};

async function rowCount(table: PgTable): Promise<number> {
  const [r] = await db.select({ n: count() }).from(table);
  return Number(r?.n ?? 0);
}

async function main() {
  console.log("\n🔍 Neon database sanity check\n");

  try {
    await db.execute("select 1");
    pass("connected");
  } catch (err) {
    fail(`could not connect: ${(err as Error).message}`);
    await client.end();
    process.exit(1);
  }

  const checks: Array<[string, number, number]> = [
    ["products", await rowCount(schema.products), 8],
    ["projects", await rowCount(schema.projects), 6],
    ["site_settings", await rowCount(schema.siteSettings), 10],
    ["technicians", await rowCount(schema.technicians), 3],
  ];
  for (const [name, got, want] of checks) {
    if (got >= want) pass(`${name}: ${got} rows (expected ≥ ${want})`);
    else fail(`${name}: ${got} rows (expected ${want}) — did you run 'pnpm db:seed'?`);
  }

  // Lead insert round-trip
  try {
    const id = crypto.randomUUID();
    await db.insert(schema.leads).values({
      id,
      name: "Sanity Check",
      phone: "+971500000000",
      message: "test-db.ts round-trip — safe to ignore",
      locale: "en",
      source: "contact",
      status: "new",
    });
    await db.delete(schema.leads).where(eq(schema.leads.id, id));
    pass("lead insert + delete round-trip");
  } catch (err) {
    fail(`lead insert failed: ${(err as Error).message}`);
  }

  // Admin user present
  const admins = await rowCount(schema.adminUsers);
  if (admins >= 1) pass(`admin_users: ${admins} row(s)`);
  else fail("admin_users: 0 rows — run 'pnpm tsx scripts/create-admin.ts' before Phase 2");

  console.log("\n" + "─".repeat(42));
  console.log(failed ? "❌ Some checks FAILED.\n" : "✅ All checks passed.\n");
  await client.end();
  process.exit(failed ? 1 : 0);
}

main().catch(async (err) => {
  console.error("\n❌ Unexpected error:", err);
  await client.end();
  process.exit(1);
});
