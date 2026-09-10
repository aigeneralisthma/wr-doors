/**
 * Password hashing for the admin login.
 *
 * `bcryptjs` (pure JS, no native build step) so it runs the same on
 * Windows dev, Linux CI, and Hostinger without a compile toolchain.
 *
 * Only ever called from the Node runtime (the Credentials `authorize`
 * callback and `scripts/create-admin.ts`) — never the edge middleware.
 */

import bcrypt from "bcryptjs";

const ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
