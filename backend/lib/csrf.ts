// ═══════════════════════════════════════════════════════════════
// SVARNEX — CSRF Token Utilities
// S5-S-01: CSRF protection for state-changing routes
// ═══════════════════════════════════════════════════════════════

import { redis } from "@/lib/upstash";

const CSRF_TTL = 3600; // 1 hour
const CSRF_PREFIX = "csrf:";

/**
 * Generate a CSRF token, store in Redis, return it.
 */
export async function generateCsrfToken(sessionId: string): Promise<string> {
  const token = crypto.randomUUID();
  await redis.set(`${CSRF_PREFIX}${sessionId}`, token, { ex: CSRF_TTL });
  return token;
}

/**
 * Validate CSRF token from request header against Redis.
 */
export async function validateCsrfToken(
  sessionId: string,
  token: string | null
): Promise<boolean> {
  if (!token) return false;
  const stored = await redis.get<string>(`${CSRF_PREFIX}${sessionId}`);
  return stored === token;
}
