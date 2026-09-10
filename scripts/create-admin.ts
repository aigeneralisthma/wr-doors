/**
 * Create or reset the admin login account.
 *
 *   # bash
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='your-strong-password' pnpm tsx scripts/create-admin.ts
 *
 *   # PowerShell
 *   $env:ADMIN_EMAIL="you@example.com"; $env:ADMIN_PASSWORD="your-strong-password"; pnpm tsx scripts/create-admin.ts
 *
 *   # or pass flags
 *   pnpm tsx scripts/create-admin.ts --email you@example.com --password 'your-strong-password'
 *
 * Upserts one row in `admin_users` (email is the key). Re-run any time to
 * change the password — this is the "forgot password" flow now.
 *
 * The plain password is only read from the environment / argv and never
 * written anywhere except as a bcrypt hash in the database.
 *
 * Uses the DIRECT (unpooled) connection.
 */

import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { hashPassword } from "../lib/auth/password";
import * as schema from "../lib/db/schema";

config({ path: ".env.local" });

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

const email = (arg("email") ?? process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
const password = arg("password") ?? process.env.ADMIN_PASSWORD ?? "";
const name = arg("name") ?? process.env.ADMIN_NAME ?? null;

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

function bail(msg: string): never {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

if (!url) bail("Set DATABASE_URL_UNPOOLED (or DATABASE_URL) in .env.local");
if (!email || !email.includes("@")) {
  bail("Provide a valid admin email via ADMIN_EMAIL env var or --email flag");
}
if (password.length < 10) {
  bail("Password must be at least 10 characters (ADMIN_PASSWORD env var or --password flag)");
}

const client = postgres(url, { max: 1 });
const db = drizzle(client, { schema });

async function main() {
  const password_hash = await hashPassword(password);

  const existing = await db
    .select({ id: schema.adminUsers.id })
    .from(schema.adminUsers)
    .where(eq(schema.adminUsers.email, email))
    .limit(1);

  if (existing[0]) {
    await db
      .update(schema.adminUsers)
      .set({ password_hash, name })
      .where(eq(schema.adminUsers.email, email));
    console.log(`\n✅ Updated admin password for ${email}\n`);
  } else {
    await db.insert(schema.adminUsers).values({ email, password_hash, name });
    console.log(`\n✅ Created admin account: ${email}\n`);
  }

  await client.end();
}

main().catch(async (err) => {
  console.error("\n❌ Failed:", err);
  await client.end();
  process.exit(1);
});
