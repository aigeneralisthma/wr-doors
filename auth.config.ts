import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config.
 *
 * This file is imported by `middleware.ts`, which runs in the edge runtime.
 * It MUST NOT import anything Node-only (the DB client, bcrypt, `server-only`).
 * The Credentials provider and its `authorize()` (which do use those) are
 * added in `auth.ts`, which only the Node runtime imports.
 *
 * Session strategy is JWT so the middleware can check auth from the cookie
 * without a database round-trip.
 */
export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  // A wrong email/password is an expected outcome, not a server error —
  // log it terse (no stack trace) and let everything else through.
  logger: {
    error(error: Error) {
      if (error.name === "CredentialsSignin" || error.cause) {
        const cause = (error.cause as { err?: Error })?.err ?? error;
        if (cause.name === "CredentialsSignin") {
          console.warn("[auth] failed login attempt");
          return;
        }
      }
      console.error("[auth]", error);
    },
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (typeof token.id === "string") session.user.id = token.id;
      if (typeof token.role === "string") session.user.role = token.role;
      return session;
    },
  },
} satisfies NextAuthConfig;
