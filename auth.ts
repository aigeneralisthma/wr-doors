import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { authConfig } from "./auth.config";
import { verifyPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";

/**
 * Full Auth.js config — the edge-safe base (`authConfig`) plus the
 * Credentials provider, which needs the DB + bcrypt and therefore only
 * runs in the Node runtime (route handler, server actions, RSC).
 *
 * The single admin account lives in the `admin_users` table. Create or
 * reset it with `pnpm tsx scripts/create-admin.ts`.
 */

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const email = parsed.data.email.trim().toLowerCase();
        const rows = await db
          .select()
          .from(adminUsers)
          .where(eq(adminUsers.email, email))
          .limit(1);

        const admin = rows[0];
        if (!admin) return null;

        const ok = await verifyPassword(parsed.data.password, admin.password_hash);
        if (!ok) return null;

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name ?? null,
          role: admin.role,
        };
      },
    }),
  ],
});
