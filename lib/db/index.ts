/**
 * The database client — Drizzle over the Neon serverless (HTTP) driver.
 *
 * Why HTTP and not a TCP pool (`postgres` / `pg`):
 *   - No connection pool to exhaust or leak — every query is a stateless
 *     HTTPS request to Neon's SQL endpoint (port 443). `next build` fires
 *     hundreds of parallel queries across prerender workers; a TCP pool
 *     against Neon's PgBouncer drops connections (ECONNRESET) under that.
 *   - Port 443 only — works on any host, including Hostinger shared hosting
 *     where outbound 5432 may be blocked.
 *
 * Trade-off: no interactive transactions (`db.transaction()`). This app
 * doesn't use them — every mutation is a single statement.
 *
 * Uses `DATABASE_URL` (either the pooled or direct Neon string works with
 * the HTTP endpoint). Migrations/scripts use `DATABASE_URL_UNPOOLED` over
 * TCP and build their own connection.
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set — add the Neon connection string to .env.local",
  );
}

export const db = drizzle(neon(connectionString), { schema });

export { schema };
