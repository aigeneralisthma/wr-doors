import "server-only";

/**
 * Password reset tokens.
 *
 * The token mailed to the admin is a 256-bit random hex string — only its
 * SHA-256 hash is ever stored, so reading the `password_reset_tokens` table
 * doesn't hand out a usable credential. SHA-256 (not bcrypt) is correct here:
 * the token has far more entropy than a human password, so a fast hash is
 * fine and bcrypt would just slow down every lookup for no security gain.
 */

import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { passwordResetTokens } from "@/lib/db/schema";

const TOKEN_BYTES = 32;
const EXPIRY_MS = 60 * 60 * 1000; // 1 hour

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Mint a new reset token for an admin user. Returns the PLAIN token — only
 * this call site ever sees it; put it straight into the email link.
 */
export async function createPasswordResetToken(
  adminUserId: string,
): Promise<string> {
  const token = randomBytes(TOKEN_BYTES).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRY_MS).toISOString();

  await db.insert(passwordResetTokens).values({
    admin_user_id: adminUserId,
    token_hash: hashToken(token),
    expires_at: expiresAt,
  });

  return token;
}

/**
 * Validate + consume a reset token (single use). Returns the admin_user_id
 * on success, or null if the token is missing/expired/already used.
 */
export async function consumePasswordResetToken(
  token: string,
): Promise<string | null> {
  const nowIso = new Date().toISOString();
  const rows = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.token_hash, hashToken(token)),
        isNull(passwordResetTokens.used_at),
        gt(passwordResetTokens.expires_at, nowIso),
      ),
    )
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  await db
    .update(passwordResetTokens)
    .set({ used_at: nowIso })
    .where(eq(passwordResetTokens.id, row.id));

  return row.admin_user_id;
}
