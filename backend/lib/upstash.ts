import "server-only";
import { Redis } from "@upstash/redis";

/**
 * Singleton Upstash Redis REST client.
 * Used for: DNA mutation edge cache, chip balance cache,
 * Oracle rate limiting, materialisation job status, deploy pending state.
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ─── Redis Key Patterns ────────────────────────────────────────
// From Section 18.9:
//   dna:cache:{project_id}         TTL 0 (persistent until DNA patch)
//   chip:balance:cache:{user_id}   TTL 30s
//   oracle:ratelimit:{user_id}:{session_id}  TTL 60s
//   materialise:job:{job_id}:status  TTL 3600s
//   materialise:job:{job_id}:progress  TTL 3600s
//   deploy:pending:{project_id}:phase1_at  TTL 900s
//   ghost:presence:{project_id}    TTL 120s
//   geo:currency:{country_code}    TTL 86400s
//   seo:snapshot:{project_id}      TTL 3600s
//   agent:dreamer:last_run         TTL 0 (persistent)

export const REDIS_KEYS = {
  dnaCache: (projectId: string) => `dna:cache:${projectId}`,
  chipBalanceCache: (userId: string) => `chip:balance:cache:${userId}`,
  oracleRateLimit: (userId: string, sessionId: string) =>
    `oracle:ratelimit:${userId}:${sessionId}`,
  oracleSession: (sessionId: string) =>
    `oracle:session:${sessionId}`,
  materialisationStatus: (jobId: string) =>
    `materialise:job:${jobId}:status`,
  materialisationProgress: (jobId: string) =>
    `materialise:job:${jobId}:progress`,
  materializeJob: (jobId: string) =>
    `materialise:job:${jobId}:status`,
  deployPending: (projectId: string) =>
    `deploy:pending:${projectId}:phase1_at`,
  deployStatus: (projectId: string) =>
    `deploy:status:${projectId}`,
  ghostPresence: (projectId: string) => `ghost:presence:${projectId}`,
  geoCurrency: (countryCode: string) => `geo:currency:${countryCode}`,
  seoSnapshot: (projectId: string) => `seo:snapshot:${projectId}`,
  dreamerLastRun: () => `agent:dreamer:last_run`,
  deviceOtp: (userId: string) => `device-otp:${userId}`,
  deviceReset: (userId: string) => `device:reset:${userId}`,
  bazaarSubmit: (userId: string) => `bazaar:submit:${userId}`,
  oracleDaily: (userId: string) => `oracle:daily:${userId}`,
  materializeRate: (userId: string) => `materialize:rate:${userId}`,
  sessionLastActive: (userId: string) => `session:last_active:${userId}`,
  geoIp: (ipHash: string) => `geo:ip:${ipHash}`,
  blockUpdate: (blockId: string) => `block:update:${blockId}`,
} as const;

export const REDIS_TTL = {
  chipBalanceCache: 30,
  oracleRateLimit: 60,
  oracleSession: 3600,
  materialisationJob: 3600,
  deployPending: 900,
  deployStatus: 900,
  ghostPresence: 120,
  geoCurrency: 86400,
  seoSnapshot: 3600,
  DNA_CACHE: 0,
  ORACLE_SESSION: 3600,
  MATERIALIZE_JOB: 3600,
  DEPLOY_STATUS: 900,
  deviceOtp: 300,
  deviceReset: 86400,
  bazaarSubmit: 86400,
} as const;

/**
 * Oracle rate limiter using raw INCR (Override 4 — not sliding-window lib).
 * Per session, TTL=60s.
 *
 * @returns { success: boolean, remaining: number, limit: number }
 */
export async function oracleRateLimit(
  userId: string,
  sessionId: string,
  limit: number = 20
): Promise<{ success: boolean; remaining: number; limit: number }> {
  const key = REDIS_KEYS.oracleRateLimit(userId, sessionId);
  const current = await redis.incr(key);

  // Set TTL only on first call (when INCR returns 1)
  if (current === 1) {
    await redis.expire(key, REDIS_TTL.oracleRateLimit);
  }

  const remaining = Math.max(0, limit - current);
  return {
    success: current <= limit,
    remaining,
    limit,
  };
}
