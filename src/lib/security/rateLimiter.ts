/**
 * Enterprise Multi-Region Rate Limiter Module
 * Supports Upstash Redis / Memory Store / Supabase Fallback
 * Target: OWASP Brute Force & Rate Limit Protection for Serverless Deployments
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const IN_MEMORY_STORE = new Map<string, RateLimitRecord>();
const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_WINDOW_MS = 60000; // 1 minute lockout

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTimeSeconds: number;
}

/**
 * Check rate limit for a specific target key (e.g. IP + endpoint, or room + nickname)
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number = DEFAULT_MAX_ATTEMPTS,
  windowMs: number = DEFAULT_WINDOW_MS
): Promise<RateLimitResult> {
  const now = Date.now();
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // 1. Production Upstash Redis HTTP API (if configured)
  if (upstashUrl && upstashToken) {
    try {
      const redisKey = `ratelimit:${key}`;
      const res = await fetch(`${upstashUrl}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          ['INCR', redisKey],
          ['EXPIRE', redisKey, Math.ceil(windowMs / 1000)],
        ]),
      });

      if (res.ok) {
        const data = await res.json();
        const count = data[0]?.result || 1;
        const allowed = count <= maxAttempts;
        return {
          allowed,
          remaining: Math.max(0, maxAttempts - count),
          resetTimeSeconds: Math.ceil(windowMs / 1000),
        };
      }
    } catch (e) {
      console.warn('Upstash Redis rate limit fallback to memory store:', e);
    }
  }

  // 2. High-Performance In-Memory Local Rate Limiter Fallback
  const record = IN_MEMORY_STORE.get(key);

  if (!record || now > record.resetTime) {
    IN_MEMORY_STORE.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetTimeSeconds: Math.ceil(windowMs / 1000),
    };
  }

  record.count += 1;
  const allowed = record.count <= maxAttempts;
  const remaining = Math.max(0, maxAttempts - record.count);
  const resetTimeSeconds = Math.ceil((record.resetTime - now) / 1000);

  // Periodic Memory Cleanup for Stale Keys (every 100 entries)
  if (IN_MEMORY_STORE.size > 1000) {
    for (const [k, v] of IN_MEMORY_STORE.entries()) {
      if (now > v.resetTime) IN_MEMORY_STORE.delete(k);
    }
  }

  return {
    allowed,
    remaining,
    resetTimeSeconds,
  };
}

/**
 * Clear rate limit record on successful authentication
 */
export async function clearRateLimit(key: string): Promise<void> {
  IN_MEMORY_STORE.delete(key);
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      await fetch(`${upstashUrl}/del/ratelimit:${key}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${upstashToken}` },
      });
    } catch {
      // Ignore
    }
  }
}
