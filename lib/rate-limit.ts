/**
 * In-memory rate limiter for server actions.
 *
 * Tracks request counts per `(ip, endpoint)` key using `lru-cache`. When the
 * count exceeds the limit within the window, subsequent requests are denied
 * until the window resets.
 *
 * Phase 1: in-memory = per-Vercel-function-instance. Acceptable for low
 * traffic — each cold instance starts with an empty counter. A determined
 * attacker can rotate IPs faster than rate limiting can react regardless.
 *
 * Phase 2 (if needed): swap the backing store for Upstash Redis. The
 * `checkRateLimit` signature stays the same; only this file changes.
 */

import { LRUCache } from "lru-cache";

interface RateLimitEntry {
  /** Number of requests in the current window */
  count: number;
  /** Timestamp (ms) when this window resets */
  resetAt: number;
}

/**
 * LRU cache of rate-limit entries. Capped at 10,000 distinct (ip+endpoint)
 * keys to bound memory; least-recently-used entries are evicted when full.
 */
const buckets = new LRUCache<string, RateLimitEntry>({
  max: 10_000,
  /** Auto-expire entries after 10 minutes (generous — longest window we use) */
  ttl: 10 * 60 * 1000,
});

export interface RateLimitResult {
  /** Whether this request is allowed */
  allowed: boolean;
  /** Remaining requests in the current window (after this one if allowed) */
  remaining: number;
  /** Timestamp (ms) when the window resets */
  resetAt: number;
}

/**
 * Check (and increment) the rate-limit counter for an `(ip, endpoint)` key.
 *
 * @param ip - Client IP address (or any identifier — falls back to "unknown" if missing)
 * @param endpoint - Logical action name, e.g. `"submitContactLead"`
 * @param limit - Max requests per window (default: 5)
 * @param windowMs - Window duration in milliseconds (default: 60_000 = 1 minute)
 */
export function checkRateLimit(
  ip: string | null | undefined,
  endpoint: string,
  limit = 5,
  windowMs = 60 * 1000,
): RateLimitResult {
  const key = `${ip ?? "unknown"}:${endpoint}`;
  const now = Date.now();
  const existing = buckets.get(key);

  // Fresh window: either no entry, or the prior window has expired
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  // Existing window — check if we're over
  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  // Still in window, under limit — increment and allow
  existing.count += 1;
  buckets.set(key, existing);
  return {
    allowed: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  };
}

/**
 * Best-effort extraction of the client IP from Next.js request headers.
 *
 * Order of preference:
 *   1. `x-forwarded-for` (most common — Vercel, Cloudflare, most proxies)
 *   2. `x-real-ip`
 *   3. fallback "unknown" (rate limiter still works — just per "unknown" key)
 */
export function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();

  const xRealIp = headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();

  return "unknown";
}
